import {getPool,withTransaction} from './db.js'
import {HttpError} from './editorialService.js'
import {marketingService} from './marketingService.js'
import {buildInstagramPublicationPayload,createInstagramImageContainer,getInstagramPublishedMedia,publishInstagramMediaContainer,waitInstagramMediaContainer} from './instagramMarketingProvider.js'

const PUBLISHING_LEASE_MS=2*60*1000
const clean=value=>String(value??'').trim()
const list=value=>Array.isArray(value)?value.map(item=>clean(item)).filter(Boolean):[]
const providerName=value=>{const provider=clean(value).toLowerCase()||'instagram';if(provider!=='instagram')throw new HttpError(400,'Provedor de publicação não suportado.','MARKETING_PROVIDER_UNSUPPORTED',{provider});return provider}
const mapPublication=row=>row?{id:row.id,contentId:row.content_id,provider:row.provider,status:row.status,externalCreationId:row.external_creation_id||'',externalMediaId:row.external_media_id||'',permalink:row.permalink||'',attemptCount:Number(row.attempt_count)||0,startedAt:row.started_at?new Date(row.started_at).toISOString():null,publishedAt:row.published_at?new Date(row.published_at).toISOString():null,lastError:row.last_error||'',createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString()}:null

function assertInstagramContent(row){
  const channels=list(row.channels)
  if(!channels.some(channel=>channel.toLowerCase().includes('instagram')))throw new HttpError(409,'Este conteúdo não está configurado para publicação no Instagram.','MARKETING_INSTAGRAM_CHANNEL_REQUIRED')
  if(row.approval!=='aprovado')throw new HttpError(409,'A publicação no Instagram exige conteúdo aprovado.','MARKETING_PUBLICATION_APPROVAL_REQUIRED')
  const creative=row.creative_config&&typeof row.creative_config==='object'?row.creative_config:null
  if(!creative||creative.mode!=='template'||creative.renderState?.status!=='ready'||!creative.output?.url)throw new HttpError(409,'Gere e salve a arte final antes de publicar no Instagram.','MARKETING_PUBLICATION_CREATIVE_NOT_READY')
  if(!['image/png','image/jpeg'].includes(clean(creative.output?.mimeType)))throw new HttpError(409,'A publicação automática atual do Instagram aceita a arte final em PNG ou JPEG.','MARKETING_INSTAGRAM_MEDIA_UNSUPPORTED',{mimeType:creative.output?.mimeType||null})
  const payload=buildInstagramPublicationPayload({copy:row.copy,hashtags:row.hashtags})
  return {channels,creative,payload,imageUrl:creative.output.url}
}

async function selectPublication(client,contentId,provider,{lock=false}={}){
  const {rows}=await client.query(`select * from marketing_publications where content_id=$1 and provider=$2${lock?' for update':''}`,[contentId,provider])
  return rows[0]||null
}

async function claim(contentId,provider,userId){
  return withTransaction(async client=>{
    const contentResult=await client.query('select * from marketing_contents where id=$1 for update',[contentId]),content=contentResult.rows[0]
    if(!content)throw new HttpError(404,'Conteúdo de Marketing não encontrado.','MARKETING_CONTENT_NOT_FOUND')
    const prepared=assertInstagramContent(content)
    let row=await selectPublication(client,contentId,provider,{lock:true})
    if(row?.status==='published'||row?.external_media_id){
      if(row.status!=='published'){
        const recovered=await client.query("update marketing_publications set status='published',published_at=coalesce(published_at,now()),last_error=null,updated_by=$3 where content_id=$1 and provider=$2 returning *",[contentId,provider,userId])
        row=recovered.rows[0]
      }
      return {alreadyPublished:true,content,prepared,publication:row}
    }
    if(row?.status==='publishing'&&row.started_at&&Date.now()-new Date(row.started_at).getTime()<PUBLISHING_LEASE_MS)throw new HttpError(409,'Já existe uma publicação do Instagram em andamento para este conteúdo.','MARKETING_PUBLICATION_IN_PROGRESS')
    if(row){
      const updated=await client.query("update marketing_publications set status='publishing',attempt_count=attempt_count+1,started_at=now(),last_error=null,updated_by=$3 where content_id=$1 and provider=$2 returning *",[contentId,provider,userId])
      row=updated.rows[0]
    }else{
      const inserted=await client.query("insert into marketing_publications(content_id,provider,status,attempt_count,started_at,created_by,updated_by) values($1,$2,'publishing',1,now(),$3,$3) returning *",[contentId,provider,userId])
      row=inserted.rows[0]
    }
    return {alreadyPublished:false,content,prepared,publication:row}
  })
}

async function persistCreationId(contentId,provider,creationId,userId){
  const {rows}=await getPool().query('update marketing_publications set external_creation_id=$3,updated_by=$4 where content_id=$1 and provider=$2 returning *',[contentId,provider,creationId,userId])
  return rows[0]
}

async function persistMediaId(contentId,provider,mediaId,userId){
  const {rows}=await getPool().query('update marketing_publications set external_media_id=$3,updated_by=$4 where content_id=$1 and provider=$2 returning *',[contentId,provider,mediaId,userId])
  return rows[0]
}

async function markPublished(contentId,provider,{permalink,publishedAt},channels,userId){
  return withTransaction(async client=>{
    const {rows}=await client.query("update marketing_publications set status='published',permalink=$3,published_at=coalesce($4::timestamptz,now()),last_error=null,updated_by=$5 where content_id=$1 and provider=$2 returning *",[contentId,provider,permalink||'',publishedAt||null,userId])
    if(channels.length&&channels.every(channel=>channel.toLowerCase().includes('instagram')))await client.query("update marketing_contents set status='publicado',updated_by=$2 where id=$1",[contentId,userId])
    return rows[0]
  })
}

async function markFailed(contentId,provider,error,userId){
  const message=clean(error instanceof Error?error.message:error).slice(0,2000)||'Falha desconhecida na publicação.'
  await getPool().query("update marketing_publications set status='failed',last_error=$3,updated_by=$4 where content_id=$1 and provider=$2 and status<>'published'",[contentId,provider,message,userId])
}

export const marketingPublicationService={
  async getPublication(contentId,providerInput='instagram'){
    const provider=providerName(providerInput),row=await selectPublication(getPool(),contentId,provider)
    return mapPublication(row)
  },
  async getPublicationPayload(contentId,providerInput='instagram'){
    const provider=providerName(providerInput),{rows}=await getPool().query('select copy,hashtags from marketing_contents where id=$1',[contentId])
    if(!rows[0])throw new HttpError(404,'Conteúdo de Marketing não encontrado.','MARKETING_CONTENT_NOT_FOUND')
    if(provider!=='instagram')throw new HttpError(400,'Provedor de publicação não suportado.','MARKETING_PROVIDER_UNSUPPORTED')
    return buildInstagramPublicationPayload(rows[0])
  },
  async publishContent(contentId,providerInput='instagram',userId=null,providerOptions={}){
    const provider=providerName(providerInput),claimed=await claim(contentId,provider,userId)
    if(claimed.alreadyPublished)return {publication:mapPublication(claimed.publication),content:await marketingService.getContent(contentId),idempotent:true}
    try{
      let creationId=clean(claimed.publication.external_creation_id)
      if(!creationId){
        const created=await createInstagramImageContainer({imageUrl:claimed.prepared.imageUrl,caption:claimed.prepared.payload.caption},providerOptions)
        creationId=created.creationId
        await persistCreationId(contentId,provider,creationId,userId)
      }
      let mediaId=clean(claimed.publication.external_media_id)
      if(!mediaId){
        await waitInstagramMediaContainer(creationId,providerOptions)
        const published=await publishInstagramMediaContainer(creationId,providerOptions)
        mediaId=published.mediaId
        await persistMediaId(contentId,provider,mediaId,userId)
      }
      let metadata={mediaId,permalink:'',publishedAt:null,mediaType:''}
      try{metadata=await getInstagramPublishedMedia(mediaId,providerOptions)}catch(error){console.warn('Instagram publication metadata lookup failed after publish',error)}
      const publication=await markPublished(contentId,provider,metadata,claimed.prepared.channels,userId)
      return {publication:mapPublication(publication),content:await marketingService.getContent(contentId),idempotent:false}
    }catch(error){
      await markFailed(contentId,provider,error,userId)
      throw error
    }
  },
}
