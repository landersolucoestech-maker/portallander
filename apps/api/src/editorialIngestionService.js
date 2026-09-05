import {getPool,withTransaction} from './db.js'
import {editorialService,HttpError} from './editorialService.js'
import {collectSourceItems,assertSafeExternalUrl} from './externalSourceProviders.js'
import {classifyCandidate,normalizeExternalUrl,normalizeTitle,relevanceScore,suggestedTags,titleHash,titleSimilarity} from './editorialSignals.js'

const PROVIDERS=new Set(['rss','gdelt','youtube','official_source'])
const SOURCE_TYPES=new Set(['news','official','video','trend'])
const STATUSES=new Set(['new','reviewing','approved','converted','rejected','ignored'])
const clean=value=>String(value??'').trim()
const int=(value,min,max,fallback)=>{const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.trunc(n))):fallback}
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{}
const iso=value=>value instanceof Date?value.toISOString():value?new Date(value).toISOString():null
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))

function sourceFromRow(row){return {id:row.id,provider:row.provider,name:row.name,sourceType:row.source_type,category:row.category,country:row.country,language:row.language,url:row.url||'',feedUrl:row.feed_url||'',enabled:row.enabled,configuration:row.configuration||{},syncFrequencyMinutes:row.sync_frequency_minutes,lastSyncAt:iso(row.last_sync_at),nextSyncAt:iso(row.next_sync_at),lastStatus:row.last_status,lastImportedCount:row.last_imported_count,lastDuplicateCount:row.last_duplicate_count,lastError:row.last_error||'',createdAt:iso(row.created_at),updatedAt:iso(row.updated_at)}}
function candidateFromRow(row){return {id:row.id,sourceId:row.source_id,provider:row.provider,sourceExternalId:row.source_external_id||'',sourceName:row.source_name,externalId:row.external_id||'',canonicalUrl:row.canonical_url||'',title:row.title,description:row.description,imageUrl:row.image_url||'',author:row.author,publishedAt:iso(row.published_at),discoveredAt:iso(row.discovered_at),language:row.language,country:row.country,sourceType:row.source_type,suggestedCategory:row.suggested_category,suggestedTags:row.suggested_tags||[],detectedEntities:row.detected_entities||{},relevanceScore:row.relevance_score,status:row.status,reviewedAt:iso(row.reviewed_at),reviewedBy:row.reviewed_by,editorialContentId:row.editorial_content_id,provenance:row.provenance||[],rawMetadata:row.raw_metadata||{},createdAt:iso(row.created_at),updatedAt:iso(row.updated_at)}}
function ensure(condition,status,message,code,details){if(!condition)throw new HttpError(status,message,code,details)}

async function normalizeSourceInput(input,existing={}){
  const value={...existing,...input},provider=clean(value.provider).toLowerCase(),sourceType=clean(value.sourceType||'news').toLowerCase()
  ensure(PROVIDERS.has(provider),400,'Provider editorial inválido.','EDITORIAL_SOURCE_PROVIDER_INVALID')
  ensure(SOURCE_TYPES.has(sourceType),400,'Tipo de fonte inválido.','EDITORIAL_SOURCE_TYPE_INVALID')
  const name=clean(value.name);ensure(name&&name.length<=200,400,'Nome da fonte é obrigatório.','EDITORIAL_SOURCE_NAME_INVALID')
  const url=clean(value.url),feedUrl=clean(value.feedUrl)
  if(url)await assertSafeExternalUrl(url,{allowedHosts:provider==='gdelt'?['api.gdeltproject.org']:provider==='youtube'?['www.googleapis.com']:[]})
  if(feedUrl)await assertSafeExternalUrl(feedUrl)
  if((provider==='rss'||provider==='official_source')&&Boolean(value.enabled))ensure(feedUrl,400,'Fonte RSS/official_source habilitada precisa de feed URL.','EDITORIAL_SOURCE_FEED_REQUIRED')
  return {provider,name,sourceType,category:clean(value.category),country:clean(value.country).toUpperCase(),language:clean(value.language).toLowerCase(),url:url||null,feedUrl:feedUrl||null,enabled:Boolean(value.enabled),configuration:object(value.configuration),syncFrequencyMinutes:int(value.syncFrequencyMinutes,15,10080,60)}
}

async function findDuplicate(client,item,source){
  const normalizedUrl=normalizeExternalUrl(item.url),normalizedTitle=normalizeTitle(item.title),duplicateKey=titleHash(item.title),externalId=clean(item.externalId)||null
  if(externalId){const exact=await client.query('select * from content_import_candidates where provider=$1 and external_id=$2 limit 1',[source.provider,externalId]);if(exact.rows[0])return {row:exact.rows[0],reason:'external_id'}}
  if(normalizedUrl){const exact=await client.query('select * from content_import_candidates where normalized_url=$1 limit 1',[normalizedUrl]);if(exact.rows[0])return {row:exact.rows[0],reason:'url'}}
  const exactTitle=await client.query(`select * from content_import_candidates where duplicate_key=$1 and coalesce(published_at,discovered_at)>=now()-interval '7 days' order by discovered_at desc limit 1`,[duplicateKey])
  if(exactTitle.rows[0])return {row:exactTitle.rows[0],reason:'title_hash'}
  const recent=await client.query(`select * from content_import_candidates where coalesce(published_at,discovered_at)>=now()-interval '72 hours' order by discovered_at desc limit 120`)
  for(const row of recent.rows){const similarity=titleSimilarity(normalizedTitle,row.normalized_title);if(similarity>=0.84)return {row,reason:'title_similarity',similarity}}
  return null
}

async function ingestOne(client,item,source){
  const normalizedUrl=normalizeExternalUrl(item.url),normalizedTitle=normalizeTitle(item.title)
  if(!normalizedTitle||!normalizedUrl)return {ignored:true,reason:'invalid'}
  const duplicate=await findDuplicate(client,item,source)
  const provenance={provider:source.provider,sourceId:source.id,sourceName:source.name,externalId:clean(item.externalId)||null,url:clean(item.url)||null,discoveredAt:new Date().toISOString(),metadata:object(item.metadata)}
  if(duplicate){
    const existing=duplicate.row,items=Array.isArray(existing.provenance)?existing.provenance:[]
    const already=items.some(entry=>entry?.provider===provenance.provider&&entry?.externalId===provenance.externalId&&entry?.url===provenance.url)
    if(!already)await client.query('update content_import_candidates set provenance=provenance||$2::jsonb,relevance_score=least(100,relevance_score+3) where id=$1',[existing.id,JSON.stringify([provenance])])
    return {duplicate:true,id:existing.id,reason:duplicate.reason}
  }
  const category=classifyCandidate(item,source),score=relevanceScore(item,source),tags=suggestedTags(item,source)
  const values=[source.id,source.provider,clean(item.sourceExternalId)||null,source.name,clean(item.externalId)||null,clean(item.url)||null,normalizedUrl,clean(item.title),normalizedTitle,clean(item.description).slice(0,4000),clean(item.imageUrl)||null,clean(item.author),item.publishedAt||null,clean(item.language||source.language),clean(item.country||source.country),source.sourceType,category,tags,score,titleHash(item.title),JSON.stringify([provenance]),JSON.stringify(object(item.metadata))]
  const {rows}=await client.query(`insert into content_import_candidates(source_id,provider,source_external_id,source_name,external_id,canonical_url,normalized_url,title,normalized_title,description,image_url,author,published_at,language,country,source_type,suggested_category,suggested_tags,relevance_score,duplicate_key,provenance,raw_metadata) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21::jsonb,$22::jsonb) returning *`,values)
  return {created:true,candidate:candidateFromRow(rows[0])}
}

async function collectWithRetry(source){
  let lastError
  for(let attempt=1;attempt<=2;attempt+=1){
    try{return await collectSourceItems(source)}catch(error){lastError=error;if(!(error instanceof HttpError)||error.status<500||attempt===2)throw error;await sleep(250)}
  }
  throw lastError
}

export const editorialIngestionService={
  async listSources(){const {rows}=await getPool().query('select * from integration_sources order by provider,name');return rows.map(sourceFromRow)},
  async getSource(id){const {rows}=await getPool().query('select * from integration_sources where id=$1 limit 1',[id]);return rows[0]?sourceFromRow(rows[0]):null},
  async createSource(input,actorId){
    const value=await normalizeSourceInput(input)
    const {rows}=await getPool().query(`insert into integration_sources(provider,name,source_type,category,country,language,url,feed_url,enabled,configuration,sync_frequency_minutes,last_status,created_by) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13) returning *`,[value.provider,value.name,value.sourceType,value.category,value.country,value.language,value.url,value.feedUrl,value.enabled,JSON.stringify(value.configuration),value.syncFrequencyMinutes,value.enabled?'idle':'disabled',actorId||null])
    return sourceFromRow(rows[0])
  },
  async updateSource(id,input){
    const existing=await this.getSource(id);ensure(existing,404,'Fonte não encontrada.','EDITORIAL_SOURCE_NOT_FOUND')
    const value=await normalizeSourceInput(input,existing)
    const {rows}=await getPool().query(`update integration_sources set provider=$2,name=$3,source_type=$4,category=$5,country=$6,language=$7,url=$8,feed_url=$9,enabled=$10,configuration=$11::jsonb,sync_frequency_minutes=$12,last_status=case when $10 then case when last_status in ('disabled','unconfigured') then 'idle' else last_status end else 'disabled' end where id=$1 returning *`,[id,value.provider,value.name,value.sourceType,value.category,value.country,value.language,value.url,value.feedUrl,value.enabled,JSON.stringify(value.configuration),value.syncFrequencyMinutes])
    return sourceFromRow(rows[0])
  },
  async syncSource(id){
    const source=await this.getSource(id);ensure(source,404,'Fonte não encontrada.','EDITORIAL_SOURCE_NOT_FOUND');ensure(source.enabled,409,'Fonte desabilitada.','EDITORIAL_SOURCE_DISABLED')
    const {rows:runRows}=await getPool().query(`insert into editorial_ingestion_sync_runs(source_id,provider,status) values($1,$2,'running') returning *`,[source.id,source.provider]),run=runRows[0]
    await getPool().query(`update integration_sources set last_status='syncing',last_error=null where id=$1`,[source.id])
    try{
      const items=await collectWithRetry(source);let created=0,duplicates=0,ignored=0,errors=0
      for(const item of items){
        try{const result=await withTransaction(client=>ingestOne(client,item,source));if(result.created)created+=1;else if(result.duplicate)duplicates+=1;else ignored+=1}catch(error){if(error?.code==='23505')duplicates+=1;else{errors+=1;console.error('editorial ingestion item failed',source.id,error)}}
      }
      const finished=await getPool().query(`update editorial_ingestion_sync_runs set status='succeeded',finished_at=now(),received_count=$2,created_count=$3,duplicate_count=$4,ignored_count=$5,error_count=$6 where id=$1 returning *`,[run.id,items.length,created,duplicates,ignored,errors])
      await getPool().query(`update integration_sources set last_sync_at=now(),next_sync_at=now()+(sync_frequency_minutes||' minutes')::interval,last_status='succeeded',last_imported_count=$2,last_duplicate_count=$3,last_error=null where id=$1`,[source.id,created,duplicates])
      return {run:finished.rows[0],received:items.length,created,duplicates,ignored,errors}
    }catch(error){
      const message=clean(error?.message).slice(0,2000)||'Falha de sincronização editorial.'
      await getPool().query(`update editorial_ingestion_sync_runs set status='failed',finished_at=now(),error_count=1,error_summary=$2 where id=$1`,[run.id,message]).catch(()=>undefined)
      await getPool().query(`update integration_sources set last_sync_at=now(),next_sync_at=now()+(sync_frequency_minutes||' minutes')::interval,last_status='failed',last_error=$2 where id=$1`,[source.id,message]).catch(()=>undefined)
      throw error
    }
  },
  async listCandidates({status,provider,limit=50,offset=0}={}){
    const clauses=[],values=[]
    if(status){ensure(STATUSES.has(status),400,'Status de candidato inválido.','EDITORIAL_CANDIDATE_STATUS_INVALID');values.push(status);clauses.push(`status=$${values.length}`)}
    if(provider){ensure(PROVIDERS.has(provider),400,'Provider inválido.','EDITORIAL_SOURCE_PROVIDER_INVALID');values.push(provider);clauses.push(`provider=$${values.length}`)}
    values.push(int(limit,1,100,50));const limitIndex=values.length;values.push(Math.max(0,Number(offset)||0));const offsetIndex=values.length
    const where=clauses.length?`where ${clauses.join(' and ')}`:''
    const {rows}=await getPool().query(`select * from content_import_candidates ${where} order by relevance_score desc,coalesce(published_at,discovered_at) desc limit $${limitIndex} offset $${offsetIndex}`,values)
    return rows.map(candidateFromRow)
  },
  async getCandidate(id){const {rows}=await getPool().query('select * from content_import_candidates where id=$1 limit 1',[id]);return rows[0]?candidateFromRow(rows[0]):null},
  async reviewCandidate(id,status,actorId){
    ensure(['reviewing','approved','rejected','ignored'].includes(status),400,'Transição de curadoria inválida.','EDITORIAL_CANDIDATE_REVIEW_STATUS_INVALID')
    const {rows}=await getPool().query(`update content_import_candidates set status=$2,reviewed_at=now(),reviewed_by=$3 where id=$1 and status<>'converted' returning *`,[id,status,actorId])
    ensure(rows[0],409,'Candidato inexistente ou já convertido.','EDITORIAL_CANDIDATE_REVIEW_CONFLICT')
    return candidateFromRow(rows[0])
  },
  async convertCandidate(id,{pageId,author}={},actor){
    const candidate=await this.getCandidate(id)
    ensure(candidate,404,'Candidato não encontrado.','EDITORIAL_CANDIDATE_NOT_FOUND');ensure(candidate.status==='approved',409,'Somente candidato aprovado pode ser convertido.','EDITORIAL_CANDIDATE_NOT_APPROVED');ensure(!candidate.editorialContentId,409,'Candidato já foi convertido.','EDITORIAL_CANDIDATE_ALREADY_CONVERTED')
    const content=await editorialService.createContent({pageId,title:candidate.title,summary:candidate.description,body:[],author:clean(author)||clean(actor?.user?.name)||'',status:'draft',active:false,tags:candidate.suggestedTags,media:[],seo:{importProvenance:{candidateId:candidate.id,provider:candidate.provider,sourceName:candidate.sourceName,canonicalUrl:candidate.canonicalUrl,publishedAt:candidate.publishedAt,externalImageUrl:candidate.imageUrl||undefined}}})
    try{
      const {rows}=await getPool().query(`update content_import_candidates set status='converted',reviewed_at=coalesce(reviewed_at,now()),reviewed_by=coalesce(reviewed_by,$2),editorial_content_id=$3 where id=$1 and status='approved' and editorial_content_id is null returning *`,[id,actor?.user?.id||null,content.id])
      ensure(rows[0],409,'Candidato mudou de estado durante a conversão.','EDITORIAL_CANDIDATE_CONVERSION_CONFLICT')
      return {candidate:candidateFromRow(rows[0]),content}
    }catch(error){await editorialService.deleteContent(content.id).catch(()=>undefined);throw error}
  }
}
