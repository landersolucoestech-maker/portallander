import {getPool} from './db.js'
import {HttpError} from './editorialService.js'

const DEFAULT_PAYLOAD={
  institutional:{title:'Portal Lander',summary:'',positioning:''},
  audience:{monthlyUsers:'',monthlyViews:'',socialReach:'',notes:''},
  adFormats:[],
  commercial:{name:'',email:'',phone:'',cta:'Fale com nosso time comercial'},
}

const text=value=>typeof value==='string'?value.trim():''
const normalizeFormat=(value,index)=>{
  if(!value||typeof value!=='object')throw new HttpError(400,`Formato publicitário inválido na posição ${index+1}.`,'MEDIA_KIT_FORMAT_INVALID')
  return {
    id:text(value.id)||`format-${index+1}`,
    name:text(value.name),
    placement:text(value.placement),
    dimensions:text(value.dimensions),
    description:text(value.description),
  }
}
export const normalizePayload=value=>{
  if(!value||typeof value!=='object')throw new HttpError(400,'Mídia Kit inválido.','MEDIA_KIT_INVALID')
  const institutional=value.institutional&&typeof value.institutional==='object'?value.institutional:{}
  const audience=value.audience&&typeof value.audience==='object'?value.audience:{}
  const commercial=value.commercial&&typeof value.commercial==='object'?value.commercial:{}
  const adFormats=Array.isArray(value.adFormats)?value.adFormats.map(normalizeFormat):[]
  return {
    institutional:{
      title:text(institutional.title)||DEFAULT_PAYLOAD.institutional.title,
      summary:text(institutional.summary),
      positioning:text(institutional.positioning),
    },
    audience:{
      monthlyUsers:text(audience.monthlyUsers),
      monthlyViews:text(audience.monthlyViews),
      socialReach:text(audience.socialReach),
      notes:text(audience.notes),
    },
    adFormats,
    commercial:{
      name:text(commercial.name),
      email:text(commercial.email),
      phone:text(commercial.phone),
      cta:text(commercial.cta)||DEFAULT_PAYLOAD.commercial.cta,
    },
  }
}
const mapRow=row=>({version:Number(row.version),status:row.status,...row.payload})
const defaultDraft=()=>({version:1,status:'draft',...structuredClone(DEFAULT_PAYLOAD)})

async function getLatest(pool,{status}={}){
  const params=[],where=[]
  if(status){params.push(status);where.push(`status=$${params.length}`)}
  const {rows}=await pool.query(`select version,status,payload,created_at,updated_at,published_at from media_kit_versions ${where.length?`where ${where.join(' and ')}`:''} order by version desc limit 1`,params)
  return rows[0]??null
}

export const mediaKitService={
  async readAdmin(){
    const pool=getPool()
    const draft=await getLatest(pool,{status:'draft'})
    if(draft)return mapRow(draft)
    const published=await getLatest(pool,{status:'published'})
    if(published)return mapRow(published)
    return defaultDraft()
  },

  async readPublished(){
    const row=await getLatest(getPool(),{status:'published'})
    return row?mapRow(row):null
  },

  async saveDraft(input,userId=null){
    const pool=getPool(),payload=normalizePayload(input)
    const client=await pool.connect()
    try{
      await client.query('begin')
      await client.query('select pg_advisory_xact_lock($1)',[90421011])
      const currentDraft=await getLatest(client,{status:'draft'})
      let row
      if(currentDraft){
        const result=await client.query(
          `update media_kit_versions set payload=$1::jsonb,updated_by=$2,updated_at=now() where version=$3 returning version,status,payload,created_at,updated_at,published_at`,
          [JSON.stringify(payload),userId,currentDraft.version],
        )
        row=result.rows[0]
      }else{
        const latest=await getLatest(client)
        const version=(latest?Number(latest.version):0)+1
        const result=await client.query(
          `insert into media_kit_versions(version,status,payload,created_by,updated_by) values($1,'draft',$2::jsonb,$3,$3) returning version,status,payload,created_at,updated_at,published_at`,
          [version,JSON.stringify(payload),userId],
        )
        row=result.rows[0]
      }
      await client.query('commit')
      return mapRow(row)
    }catch(error){await client.query('rollback').catch(()=>undefined);throw error}
    finally{client.release()}
  },

  async publish(userId=null){
    const pool=getPool(),client=await pool.connect()
    try{
      await client.query('begin')
      await client.query('select pg_advisory_xact_lock($1)',[90421011])
      const draft=await getLatest(client,{status:'draft'})
      if(!draft)throw new HttpError(409,'Não existe rascunho do Mídia Kit para publicar.','MEDIA_KIT_DRAFT_REQUIRED')
      await client.query(`update media_kit_versions set status='inactive',updated_by=$1,updated_at=now() where status='published'`,[userId])
      const {rows}=await client.query(
        `update media_kit_versions set status='published',updated_by=$1,updated_at=now(),published_at=now() where version=$2 returning version,status,payload,created_at,updated_at,published_at`,
        [userId,draft.version],
      )
      await client.query('commit')
      return mapRow(rows[0])
    }catch(error){await client.query('rollback').catch(()=>undefined);throw error}
    finally{client.release()}
  },

  async discardDraft(){
    const pool=getPool(),client=await pool.connect()
    try{
      await client.query('begin')
      await client.query('select pg_advisory_xact_lock($1)',[90421011])
      await client.query(`delete from media_kit_versions where status='draft'`)
      const published=await getLatest(client,{status:'published'})
      await client.query('commit')
      return published?mapRow(published):defaultDraft()
    }catch(error){await client.query('rollback').catch(()=>undefined);throw error}
    finally{client.release()}
  },
}
