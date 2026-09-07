import {MEDIA_KIT_AUTOMATIC_METRIC_KEYS,metricDefinition} from '@portallander/shared/analyticsMetricCatalog.js'
import {getPool} from './db.js'
import {HttpError} from './editorialService.js'

const CANONICAL_PLACEMENTS=new Set(['home-sidebar','editorial-sidebar','advertise-here'])
const COMMERCIAL_AVAILABILITY=new Set(['AVAILABLE','UNAVAILABLE','UNKNOWN'])
const REAL_METRIC_STATUSES=new Set(['LIVE','CACHED','STALE'])
const DEFAULT_INVENTORY=[
  {placementId:'home-sidebar',commercialAvailability:'UNKNOWN',notes:''},
  {placementId:'editorial-sidebar',commercialAvailability:'UNKNOWN',notes:''},
  {placementId:'advertise-here',commercialAvailability:'UNKNOWN',notes:''},
]
const DEFAULT_PAYLOAD={
  identity:{title:'Portal Lander',subtitle:'Mídia Kit',versionLabel:'2026'},
  institutional:{title:'Portal Lander',summary:'',positioning:''},
  audience:{monthlyUsers:'',monthlyViews:'',socialReach:'',notes:'',metrics:[],snapshot:[],snapshotResolvedAt:null},
  inventory:{placements:DEFAULT_INVENTORY},
  newsletter:{enabled:true,description:''},
  social:{channelIds:[]},
  adFormats:[],
  commercial:{name:'',email:'',phone:'',cta:'Fale com nosso time comercial'},
  roadmap:{currentCapabilities:[],futureOpportunities:[]},
  generationMetadata:{lastGeneratedAt:null},
}

const text=value=>typeof value==='string'?value.trim():''
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{}
const list=value=>Array.isArray(value)?value:[]
const nullableText=value=>text(value)||null
const iso=value=>value?.toISOString?.()??value??null
const automaticMetricKeySet=new Set(MEDIA_KIT_AUTOMATIC_METRIC_KEYS)
const looksSynthetic=(sourceReference,provenance)=>{
  const evidence=`${sourceReference??''} ${JSON.stringify(provenance??{})}`.toLowerCase()
  return evidence.includes('mock')||evidence.includes('fixture')||evidence.includes('demo')
}

const normalizeFormat=(value,index)=>{
  if(!value||typeof value!=='object')throw new HttpError(400,`Formato publicitário inválido na posição ${index+1}.`,'MEDIA_KIT_FORMAT_INVALID')
  return {id:text(value.id)||`format-${index+1}`,name:text(value.name),placement:text(value.placement),dimensions:text(value.dimensions),description:text(value.description)}
}

const normalizeInventoryItem=(value,index)=>{
  if(!value||typeof value!=='object')throw new HttpError(400,`Placement inválido na posição ${index+1}.`,'MEDIA_KIT_PLACEMENT_INVALID')
  const placementId=text(value.placementId)
  if(!CANONICAL_PLACEMENTS.has(placementId))throw new HttpError(400,`Placement não pertence ao inventário canônico: ${placementId||index+1}.`,'MEDIA_KIT_PLACEMENT_NOT_CANONICAL')
  const commercialAvailability=COMMERCIAL_AVAILABILITY.has(value.commercialAvailability)?value.commercialAvailability:'UNKNOWN'
  return {placementId,commercialAvailability,notes:text(value.notes)}
}

export const normalizePayload=value=>{
  if(!value||typeof value!=='object')throw new HttpError(400,'Mídia Kit inválido.','MEDIA_KIT_INVALID')
  const identity=object(value.identity),institutional=object(value.institutional),audience=object(value.audience),inventory=object(value.inventory),newsletter=object(value.newsletter),social=object(value.social),commercial=object(value.commercial),roadmap=object(value.roadmap),generationMetadata=object(value.generationMetadata)
  const placements=list(inventory.placements).length?list(inventory.placements).map(normalizeInventoryItem):structuredClone(DEFAULT_INVENTORY)
  return {
    identity:{title:text(identity.title)||DEFAULT_PAYLOAD.identity.title,subtitle:text(identity.subtitle)||DEFAULT_PAYLOAD.identity.subtitle,versionLabel:text(identity.versionLabel)||DEFAULT_PAYLOAD.identity.versionLabel},
    institutional:{title:text(institutional.title)||DEFAULT_PAYLOAD.institutional.title,summary:text(institutional.summary),positioning:text(institutional.positioning)},
    audience:{monthlyUsers:'',monthlyViews:'',socialReach:'',notes:text(audience.notes),metrics:[],snapshot:[],snapshotResolvedAt:null},
    inventory:{placements},
    newsletter:{enabled:newsletter.enabled!==false,description:text(newsletter.description)},
    social:{channelIds:list(social.channelIds).map(text).filter(Boolean)},
    adFormats:list(value.adFormats).map(normalizeFormat),
    commercial:{name:text(commercial.name),email:text(commercial.email),phone:text(commercial.phone),cta:text(commercial.cta)||DEFAULT_PAYLOAD.commercial.cta},
    roadmap:{currentCapabilities:list(roadmap.currentCapabilities).map(text).filter(Boolean),futureOpportunities:list(roadmap.futureOpportunities).map(text).filter(Boolean)},
    generationMetadata:{lastGeneratedAt:nullableText(generationMetadata.lastGeneratedAt)},
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

function metricRowSnapshot(row,{id=`media-kit:auto:${row.id}`,label=metricDefinition(row.metric_key).label}={}){
  return {id,label,metricKey:row.metric_key,value:row.value===null?null:Number(row.value),unit:row.unit,provider:row.provider||null,providerAccountId:row.provider_account_id||null,providerPropertyId:row.provider_property_id||null,periodStart:iso(row.period_start),periodEnd:iso(row.period_end),granularity:row.granularity,sourceType:'provider',sourceReference:row.source_reference,collectedAt:iso(row.collected_at),providerUpdatedAt:iso(row.provider_updated_at),normalizedAt:iso(row.normalized_at),freshnessStatus:row.freshness_status,dataStatus:row.data_status,syncId:row.sync_id||null,provenance:{...(row.provenance||{}),resolvedForMediaKit:true,automatic:true,canonicalMetricId:String(row.id)},isEstimated:Boolean(row.is_estimated),isManual:false}
}

async function automaticAudienceSnapshot(client){
  const {rows}=await client.query(`
    select distinct on (provider,provider_account_id,coalesce(provider_property_id,''),metric_key)
      *
    from analytics_metrics
    where metric_key=any($1::text[])
      and source_type='provider'
      and is_manual=false
      and value is not null
      and provider is not null and btrim(provider)<>''
      and provider_account_id is not null and btrim(provider_account_id)<>''
      and scope_type='portal' and scope_id='portal'
      and data_status in ('LIVE','CACHED','STALE')
    order by provider,provider_account_id,coalesce(provider_property_id,''),metric_key,period_end desc,normalized_at desc,collected_at desc nulls last,created_at desc
  `,[MEDIA_KIT_AUTOMATIC_METRIC_KEYS])
  return rows.filter(row=>!looksSynthetic(row.source_reference,row.provenance)).map(row=>metricRowSnapshot(row))
}

const snapshotIdentity=item=>[item.provider||'',item.providerAccountId||'',item.providerPropertyId||'',item.metricKey].join('|')
const isAutomaticPublishedSnapshot=item=>Boolean(
  item&&item.provider&&item.providerAccountId&&item.value!==null&&!item.isManual&&item.sourceType==='provider'&&automaticMetricKeySet.has(item.metricKey)&&REAL_METRIC_STATUSES.has(item.dataStatus)&&!looksSynthetic(item.sourceReference,item.provenance),
)

export async function resolveAudienceSnapshot(client,payload,{previousSnapshot=[]}={}){
  const resolvedAt=new Date().toISOString()
  const automatic=await automaticAudienceSnapshot(client)
  const byIdentity=new Map(automatic.map(item=>[snapshotIdentity(item),item]))
  for(const previous of list(previousSnapshot)){
    if(!isAutomaticPublishedSnapshot(previous))continue
    const key=snapshotIdentity(previous)
    if(!byIdentity.has(key))byIdentity.set(key,structuredClone(previous))
  }
  const snapshot=[...byIdentity.values()].sort((a,b)=>(a.provider||'').localeCompare(b.provider||'','pt-BR')||MEDIA_KIT_AUTOMATIC_METRIC_KEYS.indexOf(a.metricKey)-MEDIA_KIT_AUTOMATIC_METRIC_KEYS.indexOf(b.metricKey)||a.metricKey.localeCompare(b.metricKey))
  return {...payload,audience:{...payload.audience,monthlyUsers:'',monthlyViews:'',socialReach:'',metrics:[],snapshot,snapshotResolvedAt:resolvedAt}}
}

export const mediaKitService={
  async readAdmin(){const pool=getPool(),draft=await getLatest(pool,{status:'draft'});if(draft)return mapRow(draft);const published=await getLatest(pool,{status:'published'});if(published)return mapRow(published);return defaultDraft()},
  async readPublished(){const row=await getLatest(getPool(),{status:'published'});return row?mapRow(row):null},

  async saveDraft(input,userId=null){
    const pool=getPool(),payload=normalizePayload(input),client=await pool.connect()
    try{
      await client.query('begin');await client.query('select pg_advisory_xact_lock($1)',[90421011])
      const currentDraft=await getLatest(client,{status:'draft'});let row
      if(currentDraft){const result=await client.query(`update media_kit_versions set payload=$1::jsonb,updated_by=$2,updated_at=now() where version=$3 returning version,status,payload,created_at,updated_at,published_at`,[JSON.stringify(payload),userId,currentDraft.version]);row=result.rows[0]}
      else{const latest=await getLatest(client),version=(latest?Number(latest.version):0)+1;const result=await client.query(`insert into media_kit_versions(version,status,payload,created_by,updated_by) values($1,'draft',$2::jsonb,$3,$3) returning version,status,payload,created_at,updated_at,published_at`,[version,JSON.stringify(payload),userId]);row=result.rows[0]}
      await client.query('commit');return mapRow(row)
    }catch(error){await client.query('rollback').catch(()=>undefined);throw error}finally{client.release()}
  },

  async publish(userId=null){
    const pool=getPool(),client=await pool.connect()
    try{
      await client.query('begin');await client.query('select pg_advisory_xact_lock($1)',[90421011])
      const draft=await getLatest(client,{status:'draft'});if(!draft)throw new HttpError(409,'Não existe rascunho do Mídia Kit para publicar.','MEDIA_KIT_DRAFT_REQUIRED')
      const previousPublished=await getLatest(client,{status:'published'})
      const normalized=normalizePayload(draft.payload),resolvedPayload=await resolveAudienceSnapshot(client,normalized,{previousSnapshot:previousPublished?.payload?.audience?.snapshot??[]})
      await client.query(`update media_kit_versions set status='inactive',updated_by=$1,updated_at=now() where status='published'`,[userId])
      const {rows}=await client.query(`update media_kit_versions set status='published',payload=$1::jsonb,updated_by=$2,updated_at=now(),published_at=now() where version=$3 returning version,status,payload,created_at,updated_at,published_at`,[JSON.stringify(resolvedPayload),userId,draft.version])
      await client.query('commit');return mapRow(rows[0])
    }catch(error){await client.query('rollback').catch(()=>undefined);throw error}finally{client.release()}
  },

  async discardDraft(){
    const pool=getPool(),client=await pool.connect()
    try{await client.query('begin');await client.query('select pg_advisory_xact_lock($1)',[90421011]);await client.query(`delete from media_kit_versions where status='draft'`);const published=await getLatest(client,{status:'published'});await client.query('commit');return published?mapRow(published):defaultDraft()}
    catch(error){await client.query('rollback').catch(()=>undefined);throw error}finally{client.release()}
  },
}
