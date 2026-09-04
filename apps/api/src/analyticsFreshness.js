const HOUR_MS=60*60*1000
const PROVIDER_MAX_INGESTION_AGE_MS=Object.freeze({
  'google-analytics':48*HOUR_MS,
})

export function deriveFreshnessStatus({provider,collectedAt,now=new Date()}={}){
  const threshold=PROVIDER_MAX_INGESTION_AGE_MS[String(provider||'').trim().toLowerCase()]
  if(!threshold||!collectedAt)return 'UNKNOWN'
  const collected=new Date(collectedAt),reference=now instanceof Date?now:new Date(now)
  if(Number.isNaN(collected.getTime())||Number.isNaN(reference.getTime()))return 'UNKNOWN'
  const age=reference.getTime()-collected.getTime()
  if(age<0)return 'UNKNOWN'
  return age<=threshold?'FRESH':'STALE'
}

export const ANALYTICS_FRESHNESS_POLICY=Object.freeze({
  'google-analytics':Object.freeze({basis:'ingestion_age',freshForHours:48}),
})
