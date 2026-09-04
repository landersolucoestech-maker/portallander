import type {AnalyticsDataStatus,AnalyticsMetric} from '../analytics/domain'

const DISPLAYABLE=new Set<AnalyticsDataStatus>(['LIVE','CACHED','MANUAL','STALE'])
const dayKey=(value:string)=>value.slice(0,10)
const label=(iso:string)=>new Date(`${iso}T12:00:00.000Z`).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',timeZone:'UTC'}).replace('.','')

export type DashboardAnalyticsSource='REAL'|'MANUAL_IDENTIFIED'|'UNAVAILABLE'
export type DashboardVisitPoint={date:string;label:string;value:number;dataStatus:AnalyticsDataStatus;source:DashboardAnalyticsSource}
export type DashboardVisitSeries={points:DashboardVisitPoint[];source:DashboardAnalyticsSource;updatedAt:string|null}

export function lastSevenDayRange(now=new Date()){
  const endDay=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1))
  const startDay=new Date(endDay);startDay.setUTCDate(startDay.getUTCDate()-7)
  return {periodStart:startDay.toISOString(),periodEnd:endDay.toISOString()}
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
    points.push({date,label:label(date),value:metric.value,dataStatus:metric.dataStatus,source:metric.isManual||metric.dataStatus==='MANUAL'?'MANUAL_IDENTIFIED':'REAL'})
  }
  if(!points.length)return {points:[],source:'UNAVAILABLE',updatedAt:null}
  const source=points.some(point=>point.source==='MANUAL_IDENTIFIED')?'MANUAL_IDENTIFIED':'REAL'
  const updatedAt=candidates.map(metric=>metric.normalizedAt||metric.collectedAt).filter((value):value is string=>Boolean(value)).sort().at(-1)??null
  return {points,source,updatedAt}
}
