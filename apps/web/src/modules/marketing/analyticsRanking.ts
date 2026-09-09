import type {AnalyticsMetric} from '../analytics/domain'
import {aggregateMetric} from '../analytics/metricCatalog'
import type {MarketingContent} from './domain'

const DISPLAYABLE=new Set(['LIVE','CACHED','MANUAL','STALE'])

export type MarketingContentRank={content:MarketingContent;value:number;provider:string}

export function buildContentReachRanking(contents:MarketingContent[],metrics:AnalyticsMetric[]):MarketingContentRank[]{
 return contents.map(content=>{
   const related=metrics.filter(metric=>metric.scopeType==='content'&&metric.scopeId===content.id&&metric.metricKey==='reach'&&metric.value!==null&&DISPLAYABLE.has(metric.dataStatus))
   const value=aggregateMetric(related,'reach')
   return value===null?null:{content,value,provider:Array.from(new Set(related.map(metric=>metric.provider).filter((item):item is string=>Boolean(item)))).join(', ')}
 }).filter((item):item is MarketingContentRank=>item!==null).sort((a,b)=>b.value-a.value)
}
