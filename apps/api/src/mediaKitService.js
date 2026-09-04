import {getPool} from './db.js'
import {HttpError} from './editorialService.js'

const CANONICAL_PLACEMENTS=new Set(['home-sidebar','editorial-sidebar','advertise-here'])
const COMMERCIAL_AVAILABILITY=new Set(['AVAILABLE','UNAVAILABLE','UNKNOWN'])
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
const validDate=value=>{if(!value)return null;const date=new Date(value);return Number.isNaN(date.getTime())?null:date}
const numeric=value=>{if(value===null||value===undefined||value==='')return null;const result=Number(value);return Number.isFinite(result)?result:null}

const normalizeFormat=(value,index)=>{
  if(!value||typeof value!=='object')throw new HttpError(400,`Formato publicitário inválido na posição ${index+1}.`,'MEDIA_KIT_FORMAT_INVALID')
  return {id:text(value.id)||`format-${index+1}`,name:text(value.name),placement:text(value.placement),dimensions:text(value.dimensions),description:text(value.description)}
}

const normalizeBinding=(value,index)=>{
  if(!value||typeof value!=='object')throw new HttpError(400,`Métrica do Mídia Kit inválida na posição ${index+1}.`,'MEDIA_KIT_METRIC_INVALID')
  const sourceMode=value.sourceMode==='manual'?'manual':'analytics'
  const metricKey=text(value.metricKey)
  if(!metricKey)throw new HttpError(400,`Métrica ${index+1} sem metricKey.`,'MEDIA_KIT_METRIC_KEY_REQUIRED')
  const provider=text(value.provider),providerAccountId=text(value.providerAccountId),providerPropertyId=text(value.providerPropertyId)
  const manualValue=text(value.manualValue),manualPeriodStart=text(value.manualPeriodStart),manualPeriodEnd=text(value.manualPeriodEnd)
  if(sourceMode==='analytics'&&(!provider||!providerAccountId))throw new HttpError(400,`Métrica ${index+1} de Analytics exige provider e providerAccountId explícitos.`,'MEDIA_KIT_ANALYTICS_BOUNDARY_REQUIRED')
  if(sourceMode==='manual'){
    const parsedValue=numeric(manualValue),start=validDate(manualPeriodStart),end=validDate(manualPeriodEnd)
    if(parsedValue===null||!start||!end||end<=start)throw new HttpError(400,`Métrica manual ${index+1} exige valor numérico e período válido.`,'MEDIA_KIT_MANUAL_METRIC_INVALID')
  }
  return {
    id:text(value.id)||`metric-${index+1}`,
    label:text(value.label)||metricKey,
    metricKey,
    unit:text(value.unit)||'count',
    sourceMode,
    provider,
    providerAccountId,
    providerPropertyId,
    scopeType:text(value.scopeType)||'portal',
    scopeId:text(value.scopeId)||'portal',
    manualValue,
    manualPeriodStart,
    manualPeriodEnd,
  }
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
    audience:{monthlyUsers:text(audience.monthlyUsers),monthlyViews:text(audience.monthlyViews),socialReach:text(audience.socialReach),notes:text(audience.notes),metrics:list(audience.metrics).map(normalizeBinding),snapshot:[],snapshotResolvedAt:null},
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

function unavailableSnapshot(binding,resolvedAt){return {id:binding.id,label:binding.label,metricKey:binding.metricKey,value:null,unit:binding.unit,provider:binding.provider||null,providerAccountId:binding.providerAccountId||null,providerPropertyId:binding.providerPropertyId||null,periodStart:null,periodEnd:null,granularity:null,sourceType:'unavailable',sourceReference:null,collectedAt:null,providerUpdatedAt:null,normalizedAt:resolvedAt,freshnessStatus:'UNKNOWN',dataStatus:'UNAVAILABLE',syncId:null,provenance:{reason:'NO_MATCHING_METRIC'},isEstimated:false,isManual:false}}

async function resolveMetricBinding(client,binding,resolvedAt){
  if(binding.sourceMode==='manual'){
    const value=numeric(binding.manualValue),periodStart=validDate(binding.manualPeriodStart),periodEnd=validDate(binding.manualPeriodEnd)
    if(value===null||!periodStart||!periodEnd||periodEnd<=periodStart)throw new HttpError(400,'Métrica manual inválida no momento da publicação.','MEDIA_KIT_MANUAL_METRIC_INVALID')
    return {id:binding.id,label:binding.label,metricKey:binding.metricKey,value,unit:binding.unit,provider:null,providerAccountId:null,providerPropertyId:null,periodStart:periodStart.toISOString(),periodEnd:periodEnd.toISOString(),granularity:'custom',sourceType:'manual',sourceReference:`media-kit:${binding.id}:v-manual`,collectedAt:resolvedAt,providerUpdatedAt:null,normalizedAt:resolvedAt,freshnessStatus:'UNKNOWN',dataStatus:'MANUAL',syncId:null,provenance:{collectionMethod:'manual',resolvedForMediaKit:true},isEstimated:false,isManual:true}
  }
  const where=['metric_key=$1','scope_type=$2','scope_id=$3',`data_status<>'MOCK'`,'provider=$4','provider_account_id=$5'],params=[binding.metricKey,binding.scopeType,binding.scopeId,binding.provider,binding.providerAccountId]
  if(binding.providerPropertyId){params.push(binding.providerPropertyId);where.push(`provider_property_id=$${params.length}`)}
  const {rows}=await client.query(`select * from analytics_metrics where ${where.join(' and ')} order by period_end desc,normalized_at desc limit 1`,params)
  const row=rows[0]
  if(!row)return unavailableSnapshot(binding,resolvedAt)
  return {id:binding.id,label:binding.label,metricKey:row.metric_key,value:row.value===null?null:Number(row.value),unit:row.unit,provider:row.provider||null,providerAccountId:row.provider_account_id||null,providerPropertyId:row.provider_property_id||null,periodStart:row.period_start?.toISOString?.()??row.period_start,periodEnd:row.period_end?.toISOString?.()??row.period_end,granularity:row.granularity,sourceType:row.source_type,sourceReference:row.source_reference,collectedAt:row.collected_at?.toISOString?.()??row.collected_at??null,providerUpdatedAt:row.provider_updated_at?.toISOString?.()??row.provider_updated_at??null,normalizedAt:row.normalized_at?.toISOString?.()??row.normalized_at??resolvedAt,freshnessStatus:row.freshness_status,dataStatus:row.data_status==='MOCK'?'UNAVAILABLE':row.data_status,syncId:row.sync_id||null,provenance:{...(row.provenance||{}),resolvedForMediaKit:true},isEstimated:Boolean(row.is_estimated),isManual:Boolean(row.is_manual)}
}

async function resolveAudienceSnapshot(client,payload){
  const resolvedAt=new Date().toISOString(),snapshot=[]
  for(const binding of payload.audience.metrics)snapshot.push(await resolveMetricBinding(client,binding,resolvedAt))
  return {...payload,audience:{...payload.audience,snapshot,snapshotResolvedAt:resolvedAt}}
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
      const normalized=normalizePayload(draft.payload),resolvedPayload=await resolveAudienceSnapshot(client,normalized)
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
