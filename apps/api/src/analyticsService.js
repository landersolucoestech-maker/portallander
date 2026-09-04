import {getPool} from './db.js'
import {HttpError} from './editorialService.js'

const DATA_STATUSES=new Set(['LIVE','CACHED','MANUAL','STALE','UNAVAILABLE','SYNC_ERROR','MOCK'])
const FRESHNESS_STATUSES=new Set(['FRESH','STALE','UNKNOWN'])
const SYNC_STATUSES=new Set(['running','succeeded','partial','failed'])
const SOURCE_TYPES=new Set(['provider','manual','derived'])
const MAX_RANGE_MS=366*24*60*60*1000
const clean=value=>String(value??'').trim()
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{}
const finiteNumber=value=>value===null||value===undefined||value===''?null:Number.isFinite(Number(value))?Number(value):null

function dateOrNull(value,label){
  if(value===undefined||value===null||value==='')return null
  const date=new Date(value)
  if(Number.isNaN(date.getTime()))throw new HttpError(400,`${label} inválido.`,'ANALYTICS_DATE_INVALID',{field:label})
  return date
}

function normalizeRange({periodStart,periodEnd}={}){
  const start=dateOrNull(periodStart,'periodStart'),end=dateOrNull(periodEnd,'periodEnd')
  if(start&&end&&end<=start)throw new HttpError(400,'periodEnd deve ser posterior a periodStart.','ANALYTICS_PERIOD_INVALID')
  if(start&&end&&end-start>MAX_RANGE_MS)throw new HttpError(400,'O período máximo por consulta é de 366 dias.','ANALYTICS_PERIOD_TOO_LARGE')
  return {start,end}
}

function mapMetric(row){return {
  id:row.id,
  metricKey:row.metric_key,
  value:row.value===null?null:Number(row.value),
  unit:row.unit,
  provider:row.provider||null,
  providerAccountId:row.provider_account_id||null,
  providerPropertyId:row.provider_property_id||null,
  scopeType:row.scope_type,
  scopeId:row.scope_id,
  periodStart:row.period_start?.toISOString?.()??row.period_start,
  periodEnd:row.period_end?.toISOString?.()??row.period_end,
  granularity:row.granularity,
  timezone:row.timezone,
  dimensions:row.dimensions||{},
  filters:row.filters||{},
  sourceType:row.source_type,
  sourceReference:row.source_reference,
  collectedAt:row.collected_at?.toISOString?.()??row.collected_at??null,
  providerUpdatedAt:row.provider_updated_at?.toISOString?.()??row.provider_updated_at??null,
  normalizedAt:row.normalized_at?.toISOString?.()??row.normalized_at??null,
  freshnessStatus:row.freshness_status,
  dataStatus:row.data_status,
  syncId:row.sync_id||null,
  provenance:row.provenance||{},
  isEstimated:Boolean(row.is_estimated),
  isManual:Boolean(row.is_manual),
}}

function normalizeMetricInput(input={}){
  const sourceType=clean(input.sourceType)||'provider'
  if(!SOURCE_TYPES.has(sourceType))throw new HttpError(400,'sourceType inválido.','ANALYTICS_SOURCE_TYPE_INVALID')
  const dataStatus=clean(input.dataStatus)||'LIVE'
  if(!DATA_STATUSES.has(dataStatus))throw new HttpError(400,'dataStatus inválido.','ANALYTICS_DATA_STATUS_INVALID')
  const freshnessStatus=clean(input.freshnessStatus)||'UNKNOWN'
  if(!FRESHNESS_STATUSES.has(freshnessStatus))throw new HttpError(400,'freshnessStatus inválido.','ANALYTICS_FRESHNESS_STATUS_INVALID')
  const provider=clean(input.provider)||null,providerAccountId=clean(input.providerAccountId)||null
  if(sourceType==='provider'&&(!provider||!providerAccountId))throw new HttpError(400,'Métrica de provider exige provider e providerAccountId.','ANALYTICS_PROVIDER_BOUNDARY_REQUIRED')
  const periodStart=dateOrNull(input.periodStart,'periodStart'),periodEnd=dateOrNull(input.periodEnd,'periodEnd')
  if(!periodStart||!periodEnd||periodEnd<=periodStart)throw new HttpError(400,'Período da métrica inválido.','ANALYTICS_METRIC_PERIOD_INVALID')
  const metricKey=clean(input.metricKey),sourceReference=clean(input.sourceReference),scopeType=clean(input.scopeType)||'portal',scopeId=clean(input.scopeId)||'portal'
  if(!metricKey||!sourceReference)throw new HttpError(400,'metricKey e sourceReference são obrigatórios.','ANALYTICS_METRIC_IDENTITY_REQUIRED')
  return {
    rawMetricId:clean(input.rawMetricId)||null,syncId:clean(input.syncId)||null,metricKey,value:finiteNumber(input.value),unit:clean(input.unit)||'count',provider,providerAccountId,providerPropertyId:clean(input.providerPropertyId)||null,scopeType,scopeId,periodStart,periodEnd,granularity:clean(input.granularity)||'custom',timezone:clean(input.timezone)||'UTC',dimensions:object(input.dimensions),filters:object(input.filters),sourceType,sourceReference,collectedAt:dateOrNull(input.collectedAt,'collectedAt'),providerUpdatedAt:dateOrNull(input.providerUpdatedAt,'providerUpdatedAt'),freshnessStatus,dataStatus,provenance:object(input.provenance),isEstimated:Boolean(input.isEstimated),isManual:sourceType==='manual'||Boolean(input.isManual),
  }
}

export const analyticsService={
  async listMetrics(query={}){
    const {start,end}=normalizeRange(query)
    const where=[],values=[]
    const add=(sql,value)=>{values.push(value);where.push(`${sql}$${values.length}`)}
    if(clean(query.metricKey))add('metric_key=',clean(query.metricKey))
    if(clean(query.provider))add('provider=',clean(query.provider))
    if(clean(query.providerAccountId))add('provider_account_id=',clean(query.providerAccountId))
    if(clean(query.providerPropertyId))add('provider_property_id=',clean(query.providerPropertyId))
    if(clean(query.scopeType))add('scope_type=',clean(query.scopeType))
    if(clean(query.scopeId))add('scope_id=',clean(query.scopeId))
    if(clean(query.granularity))add('granularity=',clean(query.granularity))
    if(start){values.push(start);where.push(`period_end>$${values.length}`)}
    if(end){values.push(end);where.push(`period_start<$${values.length}`)}
    const limit=Math.max(1,Math.min(1000,Number(query.limit)||250));values.push(limit)
    const {rows}=await getPool().query(`select * from analytics_metrics ${where.length?`where ${where.join(' and ')}`:''} order by period_start asc,metric_key asc limit $${values.length}`,values)
    return rows.map(mapMetric)
  },

  async providerStatus(){
    const {rows}=await getPool().query(`select distinct on(provider,provider_account_id,provider_property_id) provider,provider_account_id,provider_property_id,status,error,started_at,finished_at from analytics_sync_runs order by provider,provider_account_id,provider_property_id,started_at desc`)
    return rows.map(row=>({provider:row.provider,providerAccountId:row.provider_account_id||null,providerPropertyId:row.provider_property_id||null,lastSyncAt:(row.finished_at||row.started_at)?.toISOString?.()??row.finished_at??row.started_at??null,lastSuccessAt:row.status==='succeeded'?(row.finished_at||row.started_at)?.toISOString?.()??row.finished_at??row.started_at??null:null,lastStatus:row.status||null,lastError:row.error||null,freshnessStatus:row.status==='failed'?'STALE':'UNKNOWN'}))
  },

  async listSyncs({provider,providerAccountId,limit=50}={}){
    const where=[],values=[]
    if(clean(provider)){values.push(clean(provider));where.push(`provider=$${values.length}`)}
    if(clean(providerAccountId)){values.push(clean(providerAccountId));where.push(`provider_account_id=$${values.length}`)}
    values.push(Math.max(1,Math.min(200,Number(limit)||50)))
    const {rows}=await getPool().query(`select id,provider,provider_account_id,provider_property_id,scope_type,scope_id,started_at,finished_at,status,records_imported,records_updated,cursor,checkpoint,retry_count,error,metadata from analytics_sync_runs ${where.length?`where ${where.join(' and ')}`:''} order by started_at desc limit $${values.length}`,values)
    return rows
  },

  async beginSync(input={}){
    const provider=clean(input.provider),providerAccountId=clean(input.providerAccountId)
    if(!provider||!providerAccountId)throw new HttpError(400,'Sync exige provider e providerAccountId.','ANALYTICS_SYNC_BOUNDARY_REQUIRED')
    const {rows}=await getPool().query(`insert into analytics_sync_runs(provider,provider_account_id,provider_property_id,scope_type,scope_id,status,cursor,checkpoint,retry_count,metadata) values($1,$2,$3,$4,$5,'running',$6::jsonb,$7::jsonb,$8,$9::jsonb) returning *`,[provider,providerAccountId,clean(input.providerPropertyId)||null,clean(input.scopeType)||'portal',clean(input.scopeId)||'portal',JSON.stringify(object(input.cursor)),JSON.stringify(object(input.checkpoint)),Math.max(0,Number(input.retryCount)||0),JSON.stringify(object(input.metadata))])
    return rows[0]
  },

  async finishSync(id,input={}){
    const status=clean(input.status)||'succeeded'
    if(!SYNC_STATUSES.has(status)||status==='running')throw new HttpError(400,'Status final de sync inválido.','ANALYTICS_SYNC_STATUS_INVALID')
    const {rows}=await getPool().query(`update analytics_sync_runs set finished_at=now(),status=$2,records_imported=$3,records_updated=$4,cursor=$5::jsonb,checkpoint=$6::jsonb,error=$7,updated_at=now() where id=$1 returning *`,[id,status,Math.max(0,Number(input.recordsImported)||0),Math.max(0,Number(input.recordsUpdated)||0),JSON.stringify(object(input.cursor)),JSON.stringify(object(input.checkpoint)),clean(input.error)||null])
    if(!rows[0])throw new HttpError(404,'Sync não encontrado.','ANALYTICS_SYNC_NOT_FOUND')
    return rows[0]
  },

  async upsertRawMetric(input={}){
    const provider=clean(input.provider),providerAccountId=clean(input.providerAccountId),providerMetric=clean(input.providerMetric),sourceReference=clean(input.sourceReference)
    const periodStart=dateOrNull(input.periodStart,'periodStart'),periodEnd=dateOrNull(input.periodEnd,'periodEnd')
    if(!provider||!providerAccountId||!providerMetric||!sourceReference||!periodStart||!periodEnd||periodEnd<=periodStart)throw new HttpError(400,'Métrica bruta inválida.','ANALYTICS_RAW_METRIC_INVALID')
    const params=[clean(input.syncId)||null,provider,providerAccountId,clean(input.providerPropertyId)||null,clean(input.scopeType)||'portal',clean(input.scopeId)||'portal',providerMetric,finiteNumber(input.value),clean(input.unit)||'count',periodStart,periodEnd,clean(input.granularity)||'custom',clean(input.timezone)||'UTC',JSON.stringify(object(input.dimensions)),JSON.stringify(object(input.filters)),sourceReference,dateOrNull(input.collectedAt,'collectedAt')||new Date(),dateOrNull(input.providerUpdatedAt,'providerUpdatedAt'),JSON.stringify(object(input.providerPayload))]
    const {rows}=await getPool().query(`insert into analytics_raw_metrics(sync_id,provider,provider_account_id,provider_property_id,scope_type,scope_id,provider_metric,value,unit,period_start,period_end,granularity,timezone,dimensions,filters,source_reference,collected_at,provider_updated_at,provider_payload) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15::jsonb,$16,$17,$18,$19::jsonb) on conflict(provider,provider_account_id,source_reference) do update set sync_id=excluded.sync_id,provider_property_id=excluded.provider_property_id,scope_type=excluded.scope_type,scope_id=excluded.scope_id,provider_metric=excluded.provider_metric,value=excluded.value,unit=excluded.unit,period_start=excluded.period_start,period_end=excluded.period_end,granularity=excluded.granularity,timezone=excluded.timezone,dimensions=excluded.dimensions,filters=excluded.filters,collected_at=excluded.collected_at,provider_updated_at=excluded.provider_updated_at,provider_payload=excluded.provider_payload,updated_at=now() returning *`,params)
    return rows[0]
  },

  async upsertMetric(input={}){
    const metric=normalizeMetricInput(input)
    const params=[metric.rawMetricId,metric.syncId,metric.metricKey,metric.value,metric.unit,metric.provider,metric.providerAccountId,metric.providerPropertyId,metric.scopeType,metric.scopeId,metric.periodStart,metric.periodEnd,metric.granularity,metric.timezone,JSON.stringify(metric.dimensions),JSON.stringify(metric.filters),metric.sourceType,metric.sourceReference,metric.collectedAt,metric.providerUpdatedAt,metric.freshnessStatus,metric.dataStatus,JSON.stringify(metric.provenance),metric.isEstimated,metric.isManual]
    const {rows}=await getPool().query(`insert into analytics_metrics(raw_metric_id,sync_id,metric_key,value,unit,provider,provider_account_id,provider_property_id,scope_type,scope_id,period_start,period_end,granularity,timezone,dimensions,filters,source_type,source_reference,collected_at,provider_updated_at,freshness_status,data_status,provenance,is_estimated,is_manual) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16::jsonb,$17,$18,$19,$20,$21,$22,$23::jsonb,$24,$25) on conflict(source_type,source_reference,metric_key,period_start,period_end,scope_type,scope_id) do update set raw_metric_id=excluded.raw_metric_id,sync_id=excluded.sync_id,value=excluded.value,unit=excluded.unit,provider=excluded.provider,provider_account_id=excluded.provider_account_id,provider_property_id=excluded.provider_property_id,granularity=excluded.granularity,timezone=excluded.timezone,dimensions=excluded.dimensions,filters=excluded.filters,collected_at=excluded.collected_at,provider_updated_at=excluded.provider_updated_at,normalized_at=now(),freshness_status=excluded.freshness_status,data_status=excluded.data_status,provenance=excluded.provenance,is_estimated=excluded.is_estimated,is_manual=excluded.is_manual,updated_at=now() returning *`,params)
    return mapMetric(rows[0])
  },
}
