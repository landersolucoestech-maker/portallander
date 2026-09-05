import {adminApiBase} from '../access/authClient'
import type {AnalyticsMetric,AnalyticsMetricQuery,AnalyticsMetricsResponse,AnalyticsProviderStatusResponse} from './domain'

type ApiErrorBody={message?:string}
const demoDataEnabled=import.meta.env.DEV||import.meta.env.VITE_ENABLE_DEMO_DATA==='true'
const mockupScenario=()=>String(import.meta.env.VITE_MOCKUP_SCENARIO||'full')

function queryString(input:AnalyticsMetricQuery={}){
  const params=new URLSearchParams()
  for(const [key,value] of Object.entries(input)){
    if(value===undefined||value===null||value==='')continue
    params.set(key,String(value))
  }
  const value=params.toString()
  return value?`?${value}`:''
}

async function request<T>(path:string):Promise<T>{
  const base=adminApiBase()
  if(!base)throw new Error('A API administrativa de Analytics não está configurada.')
  const response=await fetch(`${base}${path}`,{credentials:'include',headers:{Accept:'application/json'}})
  const body=await response.json().catch(()=>({})) as ApiErrorBody&T
  if(!response.ok)throw new Error(body.message||`A API de Analytics respondeu ${response.status}.`)
  return body
}

async function mockMetrics(query:AnalyticsMetricQuery={}):Promise<AnalyticsMetricsResponse>{
  const {getMockupScenario}=await import('@portallander/mockup')
  const scenario=getMockupScenario(mockupScenario())
  if('errors' in scenario&&scenario.errors.analytics)throw new Error(scenario.errors.analytics)
  const wantsPrevious=Boolean(query.periodStart?.startsWith('2026-08'))
  const selected=scenario.analytics.metrics.filter(row=>wantsPrevious?row.id.endsWith(':prev'):!row.id.endsWith(':prev'))
  const metrics:AnalyticsMetric[]=selected.map(row=>({...row,periodStart:query.periodStart||row.periodStart,periodEnd:query.periodEnd||row.periodEnd}))
  return {metrics}
}

export const analyticsClient={
  metrics(query:AnalyticsMetricQuery={}){return demoDataEnabled?mockMetrics(query):request<AnalyticsMetricsResponse>(`/api/analytics/metrics${queryString(query)}`)},
  async providerStatus(){
    if(!demoDataEnabled)return request<AnalyticsProviderStatusResponse>('/api/analytics/providers/status')
    const {getMockupScenario}=await import('@portallander/mockup')
    const scenario=getMockupScenario(mockupScenario())
    if('errors' in scenario&&scenario.errors.analytics)throw new Error(scenario.errors.analytics)
    return {providers:[{provider:'mockup/full',providerAccountId:null,providerPropertyId:null,lastSyncAt:'2026-09-05T18:00:00.000Z',lastSuccessAt:'2026-09-05T18:00:00.000Z',lastStatus:'development',lastError:null,freshnessStatus:'FRESH'}]} as AnalyticsProviderStatusResponse
  },
}
