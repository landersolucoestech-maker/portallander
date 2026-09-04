import type {AnalyticsMetric} from './domain'

export type MetricAggregation='SUM'|'LATEST'|'NON_ADDITIVE'
export type MetricDefinition={metricKey:string;label:string;unit:string;aggregation:MetricAggregation;crossProviderAggregation:boolean}

const definitions:MetricDefinition[]=[
 {metricKey:'impressions',label:'Impressões',unit:'count',aggregation:'SUM',crossProviderAggregation:true},
 {metricKey:'clicks',label:'Cliques',unit:'count',aggregation:'SUM',crossProviderAggregation:true},
 {metricKey:'engagement',label:'Interações',unit:'count',aggregation:'SUM',crossProviderAggregation:true},
 {metricKey:'conversions',label:'Conversões',unit:'count',aggregation:'SUM',crossProviderAggregation:true},
 {metricKey:'spend',label:'Investimento',unit:'currency',aggregation:'SUM',crossProviderAggregation:true},
 {metricKey:'sessions',label:'Sessões',unit:'count',aggregation:'SUM',crossProviderAggregation:false},
 {metricKey:'pageviews',label:'Visualizações de página',unit:'count',aggregation:'SUM',crossProviderAggregation:false},
 {metricKey:'engaged_sessions',label:'Sessões engajadas',unit:'count',aggregation:'SUM',crossProviderAggregation:false},
 {metricKey:'active_users',label:'Usuários ativos',unit:'count',aggregation:'NON_ADDITIVE',crossProviderAggregation:false},
 {metricKey:'new_users',label:'Novos usuários',unit:'count',aggregation:'NON_ADDITIVE',crossProviderAggregation:false},
 {metricKey:'engagement_rate',label:'Taxa de engajamento',unit:'ratio',aggregation:'NON_ADDITIVE',crossProviderAggregation:false},
 {metricKey:'reach',label:'Alcance',unit:'count',aggregation:'NON_ADDITIVE',crossProviderAggregation:false},
 {metricKey:'followers',label:'Seguidores',unit:'count',aggregation:'LATEST',crossProviderAggregation:false},
]

export const METRIC_CATALOG=Object.freeze(Object.fromEntries(definitions.map(definition=>[definition.metricKey,definition])) as Record<string,MetricDefinition>)
export const metricDefinition=(metricKey:string)=>METRIC_CATALOG[metricKey]??{metricKey,label:metricKey,unit:'unknown',aggregation:'NON_ADDITIVE' as const,crossProviderAggregation:false}

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
