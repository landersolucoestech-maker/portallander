export type AnalyticsDataStatus='LIVE'|'CACHED'|'MANUAL'|'STALE'|'UNAVAILABLE'|'SYNC_ERROR'|'MOCK'
export type AnalyticsFreshnessStatus='FRESH'|'STALE'|'UNKNOWN'
export type AnalyticsGranularity='realtime'|'hour'|'day'|'week'|'month'|'quarter'|'year'|'custom'

export type AnalyticsMetric={
  id:string
  metricKey:string
  value:number|null
  unit:string
  provider:string|null
  providerAccountId:string|null
  providerPropertyId:string|null
  scopeType:string
  scopeId:string
  periodStart:string
  periodEnd:string
  granularity:AnalyticsGranularity|string
  timezone:string
  dimensions:Record<string,string|number|boolean|null>
  filters:Record<string,string|number|boolean|null>
  sourceType:'provider'|'manual'|'derived'
  sourceReference:string
  collectedAt:string|null
  providerUpdatedAt:string|null
  normalizedAt:string|null
  freshnessStatus:AnalyticsFreshnessStatus
  dataStatus:AnalyticsDataStatus
  syncId:string|null
  provenance:Record<string,unknown>
  isEstimated:boolean
  isManual:boolean
}

export type AnalyticsMetricQuery={
  metricKey?:string
  provider?:string
  providerAccountId?:string
  providerPropertyId?:string
  scopeType?:string
  scopeId?:string
  periodStart?:string
  periodEnd?:string
  granularity?:string
  limit?:number
}

export type AnalyticsProviderStatus={
  provider:string
  providerAccountId:string|null
  providerPropertyId:string|null
  lastSyncAt:string|null
  lastSuccessAt:string|null
  lastStatus:string|null
  lastError:string|null
  freshnessStatus:AnalyticsFreshnessStatus
}

export type AnalyticsMetricsResponse={metrics:AnalyticsMetric[]}
export type AnalyticsProviderStatusResponse={providers:AnalyticsProviderStatus[]}
