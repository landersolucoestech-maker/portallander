import {adminApiBase} from '../access/authClient'

export type MetricsRange='today'|'7d'|'30d'|'90d'|'custom'
export type Availability='available'|'empty'
export type MetricValue={value:number|null;status:Availability}
export type MetricsResponse={
 range:{preset:MetricsRange;startDate:string;endDate:string;days:number;timezone:string}
 ga4:{status:'available'|'unavailable'|'error';reason?:string;message?:string;provider?:string;propertyId?:string;overview:Partial<Record<'users'|'newUsers'|'sessions'|'pageviews'|'pageviewsPerUser'|'engagementRate'|'averageSessionDuration',MetricValue>>;returningUsers:MetricValue|null;acquisition:Array<{channel:string;sessions:number|null;users:number|null}>;pages:Array<{path:string;title:string;pageviews:number|null;users:number|null}>;partial?:{acquisition:boolean;content:boolean;returning:boolean}}
 editorial:{status:'available';counts:{published:number;drafts:number;archived:number;publishedInPeriod:number};latest:Array<{id:string;title:string;slug:string;pageSlug:string;pageTitle:string;publishedAt:string|null}>}
 conversions:{status:'available';total:number;leadsCreated:number;collaborationsCreated:number;contexts:{contato:number;colabore:number;anuncie:number};forms:Array<{slug:string;name:string;purpose:string;entryContext:string;count:number;leadsCreated:number;collaborationsCreated:number}>}
 generatedAt:string
}

type ApiError={message?:string}
const demoDataEnabled=import.meta.env.DEV||import.meta.env.VITE_ENABLE_DEMO_DATA==='true'

export async function loadMetrics(input:{range:MetricsRange;startDate?:string;endDate?:string}):Promise<MetricsResponse>{
 if(demoDataEnabled){
  const {getMockupMetricsOverview}=await import('@portallander/mockup')
  return getMockupMetricsOverview(input) as MetricsResponse
 }
 const base=adminApiBase()
 if(!base)throw new Error('A API administrativa de Métricas não está configurada.')
 const params=new URLSearchParams({range:input.range})
 if(input.range==='custom'&&input.startDate)params.set('startDate',input.startDate)
 if(input.range==='custom'&&input.endDate)params.set('endDate',input.endDate)
 const response=await fetch(`${base}/api/metrics?${params}`,{credentials:'include',headers:{Accept:'application/json'}})
 const body=await response.json().catch(()=>({})) as ApiError&MetricsResponse
 if(!response.ok)throw new Error(body.message||`A API de Métricas respondeu ${response.status}.`)
 return body
}
