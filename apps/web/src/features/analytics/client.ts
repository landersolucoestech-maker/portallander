import {adminApiBase} from '../access/authClient'
import type {AnalyticsMetricQuery,AnalyticsMetricsResponse,AnalyticsProviderStatusResponse} from './domain'

type ApiErrorBody={message?:string}

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

export const analyticsClient={
  metrics(query:AnalyticsMetricQuery={}){return request<AnalyticsMetricsResponse>(`/api/analytics/metrics${queryString(query)}`)},
  providerStatus(){return request<AnalyticsProviderStatusResponse>('/api/analytics/providers/status')},
}
