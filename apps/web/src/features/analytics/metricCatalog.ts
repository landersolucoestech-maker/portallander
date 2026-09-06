import {METRIC_CATALOG,MEDIA_KIT_AUTOMATIC_METRIC_KEYS,metricDefinition} from '@portallander/shared/analyticsMetricCatalog.js'
import type {MetricAggregation,MetricDefinition} from '@portallander/shared/analyticsMetricCatalog.js'
import type {AnalyticsMetric} from './domain'

export {METRIC_CATALOG,MEDIA_KIT_AUTOMATIC_METRIC_KEYS,metricDefinition}
export type {MetricAggregation,MetricDefinition}

export function aggregateMetric(metrics:AnalyticsMetric[],metricKey:string):number|null{
 const candidates=metrics.filter(metric=>metric.metricKey===metricKey&&metric.value!==null)
 if(!candidates.length)return null
 const definition=metricDefinition(metricKey)
 const providers=new Set(candidates.map(metric=>metric.provider||metric.sourceType))
 if(providers.size>1&&!definition.crossProviderAggregation)return null
 if(definition.aggregation==='SUM')return candidates.reduce((total,metric)=>total+(metric.value??0),0)
 if(definition.aggregation==='LATEST')return [...candidates].sort((a,b)=>b.periodEnd.localeCompare(a.periodEnd))[0]?.value??null
 return candidates.length===1?candidates[0]?.value??null:null
}
