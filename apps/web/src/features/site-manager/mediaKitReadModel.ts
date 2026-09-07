import {analyticsClient} from '../analytics/client'
import {MEDIA_KIT_AUTOMATIC_METRIC_KEYS,metricDefinition} from '../analytics/metricCatalog'
import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import type {AnalyticsMetric} from '../analytics/domain'
import type {MediaKitDraft,MediaKitResolvedMetric} from './mediaKitDomain'
import {siteManagerReadModel} from './readModel'

const clone=<T>(value:T):T=>structuredClone(value)
const automaticKeys=new Set<string>(MEDIA_KIT_AUTOMATIC_METRIC_KEYS)
const automaticStatuses=new Set<string>(['LIVE','CACHED','STALE'])
const keyRank=new Map(MEDIA_KIT_AUTOMATIC_METRIC_KEYS.map((key,index)=>[key,index]))

const identity=(item:Pick<AnalyticsMetric,'provider'|'providerAccountId'|'providerPropertyId'|'metricKey'|'scopeType'|'scopeId'>)=>[
 item.provider??'',item.providerAccountId??'',item.providerPropertyId??'',item.metricKey,item.scopeType,item.scopeId,
].join('|')
const snapshotIdentity=(item:MediaKitResolvedMetric)=>[
 item.provider??'',item.providerAccountId??'',item.providerPropertyId??'',item.metricKey,'portal','portal',
].join('|')
const timestamp=(item:Pick<AnalyticsMetric,'periodEnd'|'normalizedAt'|'collectedAt'|'providerUpdatedAt'>)=>item.normalizedAt||item.collectedAt||item.providerUpdatedAt||item.periodEnd||''
const resolvedTimestamp=(item:MediaKitResolvedMetric)=>item.normalizedAt||item.collectedAt||item.providerUpdatedAt||item.periodEnd||''
const looksSynthetic=(sourceReference:string|null,provenance:Record<string,unknown>)=>{
 const evidence=`${sourceReference??''} ${JSON.stringify(provenance)}`.toLowerCase()
 return evidence.includes('mock')||evidence.includes('fixture')||evidence.includes('demo')
}
const isAutomaticAnalytics=(metric:AnalyticsMetric)=>Boolean(
 metric.provider&&metric.providerAccountId&&metric.value!==null&&!metric.isManual&&metric.sourceType==='provider'&&automaticKeys.has(metric.metricKey)&&automaticStatuses.has(metric.dataStatus)&&!looksSynthetic(metric.sourceReference,metric.provenance),
)
const isAutomaticSnapshot=(metric:MediaKitResolvedMetric)=>Boolean(
 metric.provider&&metric.providerAccountId&&metric.value!==null&&!metric.isManual&&metric.sourceType==='provider'&&automaticKeys.has(metric.metricKey)&&automaticStatuses.has(metric.dataStatus)&&!looksSynthetic(metric.sourceReference,metric.provenance),
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
  sourceType:'provider',
  sourceReference:metric.sourceReference,
  collectedAt:metric.collectedAt,
  providerUpdatedAt:metric.providerUpdatedAt,
  normalizedAt:metric.normalizedAt,
  freshnessStatus:metric.freshnessStatus,
  dataStatus:metric.dataStatus,
  syncId:metric.syncId,
  provenance:{...metric.provenance,source:'analyticsClient',automatic:true,canonicalMetricId:metric.id},
  isEstimated:metric.isEstimated,
  isManual:false,
 }
}

function mergeSnapshot(source:MediaKitDraft,current:AnalyticsMetric[]){
 const fresh=latestAutomatic(current).map(resolveAutomatic)
 const byIdentity=new Map(fresh.map(item=>[snapshotIdentity(item),item]))
 for(const item of source.audience.snapshot){
  if(!isAutomaticSnapshot(item))continue
  const key=snapshotIdentity(item)
  if(!byIdentity.has(key))byIdentity.set(key,clone(item))
 }
 return [...byIdentity.values()].sort((a,b)=>{
  const provider=(a.provider??'').localeCompare(b.provider??'','pt-BR')
  if(provider)return provider
  return (keyRank.get(a.metricKey)??999)-(keyRank.get(b.metricKey)??999)||a.metricKey.localeCompare(b.metricKey)
 })
}

function latestResolvedAt(snapshot:MediaKitResolvedMetric[],fallback:string|null){
 const timestamps=snapshot.map(resolvedTimestamp).filter(Boolean).sort()
 return timestamps.at(-1)||fallback
}

export const mediaKitReadModel={
 async snapshot(source:MediaKitDraft):Promise<MediaKitDraft>{
  const provider=getRuntimeDataProvider(),settings=provider.settings.seed(),social=provider.branding.socialChannels().filter(channel=>channel.active),about=siteManagerReadModel.pages.find(page=>page.slug==='sobre')
  let analytics:AnalyticsMetric[]=[]
  try{analytics=(await analyticsClient.metrics({limit:500})).metrics}catch{/* keep only previously resolved real provider snapshots; never manufacture a replacement */}
  const snapshot=mergeSnapshot(source,analytics)
  return {
   ...clone(source),
   identity:{...source.identity,title:settings.company.tradeName||source.identity.title},
   institutional:{...source.institutional,title:settings.company.tradeName||source.institutional.title,summary:about?.description||source.institutional.summary},
   audience:{...source.audience,monthlyUsers:'',monthlyViews:'',socialReach:'',metrics:[],snapshot,snapshotResolvedAt:latestResolvedAt(snapshot,source.audience.snapshotResolvedAt)},
   social:{channelIds:social.map(channel=>channel.id)},
   commercial:{...source.commercial,name:settings.company.responsible||source.commercial.name,phone:settings.company.phone||source.commercial.phone},
  }
 },
}
