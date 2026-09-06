import {analyticsClient} from '../analytics/client'
import {MEDIA_KIT_AUTOMATIC_METRIC_KEYS,metricDefinition} from '../analytics/metricCatalog'
import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import type {AnalyticsMetric} from '../analytics/domain'
import type {MediaKitDraft,MediaKitMetricBinding,MediaKitResolvedMetric} from './mediaKitDomain'
import {siteManagerReadModel} from './readModel'

const clone=<T>(value:T):T=>structuredClone(value)
const automaticKeys=new Set<string>(MEDIA_KIT_AUTOMATIC_METRIC_KEYS)
const automaticStatuses=new Set(['LIVE','CACHED','STALE','MOCK'])
const keyRank=new Map(MEDIA_KIT_AUTOMATIC_METRIC_KEYS.map((key,index)=>[key,index]))

const identity=(item:Pick<AnalyticsMetric,'provider'|'providerAccountId'|'providerPropertyId'|'metricKey'|'scopeType'|'scopeId'>)=>[
 item.provider??'',item.providerAccountId??'',item.providerPropertyId??'',item.metricKey,item.scopeType,item.scopeId,
].join('|')
const snapshotIdentity=(item:MediaKitResolvedMetric)=>[
 item.provider??'',item.providerAccountId??'',item.providerPropertyId??'',item.metricKey,'portal','portal',
].join('|')
const timestamp=(item:Pick<AnalyticsMetric,'periodEnd'|'normalizedAt'|'collectedAt'|'providerUpdatedAt'>)=>item.normalizedAt||item.collectedAt||item.providerUpdatedAt||item.periodEnd||''
const resolvedTimestamp=(item:MediaKitResolvedMetric)=>item.normalizedAt||item.collectedAt||item.providerUpdatedAt||item.periodEnd||''
const isAutomaticAnalytics=(metric:AnalyticsMetric)=>Boolean(
 metric.provider&&metric.value!==null&&!metric.isManual&&metric.sourceType!=='manual'&&automaticKeys.has(metric.metricKey)&&automaticStatuses.has(metric.dataStatus),
)
const isAutomaticSnapshot=(metric:MediaKitResolvedMetric)=>Boolean(
 metric.provider&&metric.value!==null&&!metric.isManual&&metric.sourceType!=='manual'&&automaticKeys.has(metric.metricKey),
)

function latestAutomatic(metrics:AnalyticsMetric[]){
 const selected=new Map<string,AnalyticsMetric>()
 for(const metric of metrics){
  if(!isAutomaticAnalytics(metric))continue
  const key=identity(metric),current=selected.get(key)
  if(!current||timestamp(metric)>timestamp(current)||timestamp(metric)===timestamp(current)&&metric.periodEnd>current.periodEnd)selected.set(key,metric)
 }
 return [...selected.values()].sort((a,b)=>{
  const provider=(a.provider??'').localeCompare(b.provider??'','pt-BR')
  if(provider)return provider
  return (keyRank.get(a.metricKey)??999)-(keyRank.get(b.metricKey)??999)||a.metricKey.localeCompare(b.metricKey)
 })
}

function resolveAutomatic(metric:AnalyticsMetric):MediaKitResolvedMetric{
 const definition=metricDefinition(metric.metricKey)
 return {
  id:`media-kit:auto:${metric.id}`,
  label:definition.label,
  metricKey:metric.metricKey,
  value:metric.value,
  unit:metric.unit||definition.unit,
  provider:metric.provider,
  providerAccountId:metric.providerAccountId,
  providerPropertyId:metric.providerPropertyId,
  periodStart:metric.periodStart,
  periodEnd:metric.periodEnd,
  granularity:metric.granularity,
  sourceType:metric.sourceType==='derived'?'derived':'provider',
  sourceReference:metric.sourceReference,
  collectedAt:metric.collectedAt,
  providerUpdatedAt:metric.providerUpdatedAt,
  normalizedAt:metric.normalizedAt,
  freshnessStatus:metric.freshnessStatus,
  dataStatus:metric.dataStatus==='MOCK'?'CACHED':metric.dataStatus,
  syncId:metric.syncId,
  provenance:{...metric.provenance,source:'analyticsClient',automatic:true,canonicalMetricId:metric.id},
  isEstimated:metric.isEstimated,
  isManual:false,
 }
}

function resolveLegacyBinding(binding:MediaKitMetricBinding):MediaKitResolvedMetric|null{
 if(binding.sourceMode!=='manual')return null
 const value=Number(binding.manualValue)
 if(!Number.isFinite(value)||!binding.manualPeriodStart||!binding.manualPeriodEnd)return null
 return {id:binding.id,label:binding.label||binding.metricKey,metricKey:binding.metricKey,value,unit:binding.unit,provider:null,providerAccountId:null,providerPropertyId:null,periodStart:binding.manualPeriodStart,periodEnd:binding.manualPeriodEnd,granularity:'custom',sourceType:'manual',sourceReference:`media-kit:${binding.id}:legacy`,collectedAt:null,providerUpdatedAt:null,normalizedAt:null,freshnessStatus:'UNKNOWN',dataStatus:'MANUAL',syncId:null,provenance:{collectionMethod:'manual',legacyCompatibility:true},isEstimated:false,isManual:true}
}

function mergeSnapshot(source:MediaKitDraft,current:AnalyticsMetric[]){
 const fresh=latestAutomatic(current).map(resolveAutomatic)
 const byIdentity=new Map(fresh.map(item=>[snapshotIdentity(item),item]))
 for(const item of source.audience.snapshot){
  if(!isAutomaticSnapshot(item))continue
  const key=snapshotIdentity(item)
  if(!byIdentity.has(key))byIdentity.set(key,clone(item))
 }
 const automatic=[...byIdentity.values()].sort((a,b)=>{
  const provider=(a.provider??'').localeCompare(b.provider??'','pt-BR')
  if(provider)return provider
  return (keyRank.get(a.metricKey)??999)-(keyRank.get(b.metricKey)??999)||a.metricKey.localeCompare(b.metricKey)
 })
 const automaticKeysPresent=new Set(automatic.map(item=>item.metricKey))
 const manualPublished=source.audience.snapshot.filter(item=>(item.isManual||item.sourceType==='manual'||item.dataStatus==='MANUAL')&&!automaticKeysPresent.has(item.metricKey)).map(clone)
 const publishedManualKeys=new Set(manualPublished.map(item=>item.metricKey))
 const manualBindings=source.audience.metrics.map(resolveLegacyBinding).filter((item):item is MediaKitResolvedMetric=>Boolean(item)).filter(item=>!automaticKeysPresent.has(item.metricKey)&&!publishedManualKeys.has(item.metricKey))
 return [...automatic,...manualPublished,...manualBindings]
}

function latestResolvedAt(snapshot:MediaKitResolvedMetric[],fallback:string|null){
 const timestamps=snapshot.map(resolvedTimestamp).filter(Boolean).sort()
 return timestamps.at(-1)||fallback
}

export const mediaKitReadModel={
 async snapshot(source:MediaKitDraft):Promise<MediaKitDraft>{
  const provider=getRuntimeDataProvider(),settings=provider.settings.seed(),social=provider.branding.socialChannels().filter(channel=>channel.active),about=siteManagerReadModel.pages.find(page=>page.slug==='sobre')
  let analytics:AnalyticsMetric[]=[]
  try{analytics=(await analyticsClient.metrics({limit:500})).metrics}catch{/* canonical published snapshot below remains available when Analytics cannot be refreshed */}
  const snapshot=mergeSnapshot(source,analytics)
  return {
   ...clone(source),
   identity:{...source.identity,title:settings.company.tradeName||source.identity.title},
   institutional:{...source.institutional,title:settings.company.tradeName||source.institutional.title,summary:about?.description||source.institutional.summary},
   audience:{...source.audience,metrics:clone(source.audience.metrics),snapshot,snapshotResolvedAt:latestResolvedAt(snapshot,source.audience.snapshotResolvedAt)},
   social:{channelIds:social.map(channel=>channel.id)},
   commercial:{...source.commercial,name:settings.company.responsible||source.commercial.name,phone:settings.company.phone||source.commercial.phone},
  }
 },
}
