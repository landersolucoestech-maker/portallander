import type {AnalyticsDataStatus,AnalyticsMetric} from '../analytics/domain'
import type {MetricsResponse} from '../analytics/metricsClient'

const DISPLAYABLE=new Set<AnalyticsDataStatus>(['LIVE','CACHED','MANUAL','STALE'])
const dayKey=(value:string)=>value.slice(0,10)
const label=(iso:string)=>new Date(`${iso}T12:00:00.000Z`).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',timeZone:'UTC'}).replace('.','')

export type DashboardAnalyticsSource='REAL'|'MANUAL_IDENTIFIED'|'DEVELOPMENT'|'UNAVAILABLE'
export type DashboardVisitPoint={date:string;label:string;value:number;dataStatus:AnalyticsDataStatus;source:DashboardAnalyticsSource}
export type DashboardVisitSeries={points:DashboardVisitPoint[];source:DashboardAnalyticsSource;updatedAt:string|null}
export type DashboardChannelPulse={key:'site'|'instagram'|'tiktok'|'youtube';label:string;metricKey:string;metricLabel:string;value:number|null;source:DashboardAnalyticsSource;provider:string;accountId:string|null;href:string;updatedAt:string|null}

export function lastSevenDayRange(now=new Date()){
 const endDay=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1))
 const startDay=new Date(endDay);startDay.setUTCDate(startDay.getUTCDate()-7)
 return {periodStart:startDay.toISOString(),periodEnd:endDay.toISOString()}
}

export function lastThirtyDayRange(now=new Date()){
 const endDay=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1))
 const startDay=new Date(endDay);startDay.setUTCDate(startDay.getUTCDate()-30)
 return {periodStart:startDay.toISOString(),periodEnd:endDay.toISOString()}
}

function metricSource(metric:AnalyticsMetric):DashboardAnalyticsSource{
 if(metric.provenance?.environment==='development'||metric.provenance?.scenario)return 'DEVELOPMENT'
 if(metric.isManual||metric.dataStatus==='MANUAL')return 'MANUAL_IDENTIFIED'
 return 'REAL'
}
function observationTimestamp(metric:AnalyticsMetric){return metric.normalizedAt||metric.collectedAt||metric.periodEnd}
function latest(metrics:readonly AnalyticsMetric[],provider:string,key:string){
 return metrics.filter(metric=>metric.provider===provider&&metric.metricKey===key&&metric.value!==null&&metric.dataStatus!=='MOCK'&&DISPLAYABLE.has(metric.dataStatus)).sort((a,b)=>b.periodEnd.localeCompare(a.periodEnd)||observationTimestamp(b).localeCompare(observationTimestamp(a))||b.periodStart.localeCompare(a.periodStart)||b.id.localeCompare(a.id))[0]??null
}
function unavailable(key:DashboardChannelPulse['key'],label:string,metricKey:string,metricLabel:string,provider:string,href:string):DashboardChannelPulse{
 return {key,label,metricKey,metricLabel,value:null,source:'UNAVAILABLE',provider,accountId:null,href,updatedAt:null}
}

export function resolveWebsitePulse(response:MetricsResponse|null,isDevelopment=false):DashboardChannelPulse{
 const fallback=unavailable('site','Website','pageviews','Pageviews','Google Analytics','/app/metricas?tab=site')
 const metric=response?.ga4.overview.pageviews
 if(!response||response.ga4.status!=='available'||!metric||metric.status!=='available'||metric.value===null)return fallback
 return {...fallback,value:metric.value,source:isDevelopment?'DEVELOPMENT':'REAL',accountId:response.ga4.propertyId??null,updatedAt:response.generatedAt}
}

export function resolveProviderPulse(metrics:readonly AnalyticsMetric[],provider:'Instagram'|'TikTok'|'YouTube'):DashboardChannelPulse{
 const key=provider==='Instagram'?'instagram':provider==='TikTok'?'tiktok':'youtube'
 const href=`/app/metricas?tab=${key}`
 const preferred=provider==='YouTube'?['subscribers','followers']:['followers']
 const chosen=preferred.map(metricKey=>latest(metrics,provider,metricKey)).find(Boolean)??null
 const metricKey=chosen?.metricKey??preferred[0]
 const metricLabel=metricKey==='subscribers'?'Inscritos':'Seguidores'
 const fallback=unavailable(key,provider,metricKey,metricLabel,provider,href)
 if(!chosen||chosen.value===null)return fallback
 return {...fallback,value:chosen.value,source:metricSource(chosen),accountId:chosen.providerAccountId??chosen.providerPropertyId,updatedAt:chosen.normalizedAt||chosen.collectedAt}
}

export function resolveMultichannelPulses(response:MetricsResponse|null,metrics:readonly AnalyticsMetric[],isDevelopment=false):DashboardChannelPulse[]{
 return [resolveWebsitePulse(response,isDevelopment),resolveProviderPulse(metrics,'Instagram'),resolveProviderPulse(metrics,'TikTok'),resolveProviderPulse(metrics,'YouTube')]
}

export function resolveDashboardPageviews(metrics:readonly AnalyticsMetric[]):DashboardVisitSeries{
 const candidates=metrics.filter(metric=>metric.metricKey==='pageviews'&&metric.value!==null&&metric.dataStatus!=='MOCK'&&DISPLAYABLE.has(metric.dataStatus))
 if(!candidates.length)return {points:[],source:'UNAVAILABLE',updatedAt:null}
 const grouped=new Map<string,AnalyticsMetric[]>()
 for(const metric of candidates){const key=dayKey(metric.periodStart);grouped.set(key,[...(grouped.get(key)??[]),metric])}
 const points:DashboardVisitPoint[]=[]
 for(const [date,items] of [...grouped.entries()].sort(([a],[b])=>a.localeCompare(b))){
  const providerKeys=new Set(items.map(item=>`${item.provider||item.sourceType}:${item.providerPropertyId||''}`))
  if(providerKeys.size>1)continue
  const metric=[...items].sort((a,b)=>(b.normalizedAt||b.collectedAt||b.periodEnd).localeCompare(a.normalizedAt||a.collectedAt||a.periodEnd))[0]
  if(metric?.value===null||metric?.value===undefined)continue
  points.push({date,label:label(date),value:metric.value,dataStatus:metric.dataStatus,source:metricSource(metric)})
 }
 if(!points.length)return {points:[],source:'UNAVAILABLE',updatedAt:null}
 const source=points.some(point=>point.source==='MANUAL_IDENTIFIED')?'MANUAL_IDENTIFIED':points.some(point=>point.source==='DEVELOPMENT')?'DEVELOPMENT':'REAL'
 const updatedAt=candidates.map(metric=>metric.normalizedAt||metric.collectedAt).filter((value):value is string=>Boolean(value)).sort().at(-1)??null
 return {points,source,updatedAt}
}
