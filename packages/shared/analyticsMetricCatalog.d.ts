export type MetricAggregation='SUM'|'LATEST'|'NON_ADDITIVE'
export type MetricDefinition={metricKey:string;label:string;unit:string;aggregation:MetricAggregation;crossProviderAggregation:boolean}
export const METRIC_DEFINITIONS:readonly Readonly<MetricDefinition>[]
export const METRIC_CATALOG:Readonly<Record<string,Readonly<MetricDefinition>>>
export function metricDefinition(metricKey:string):Readonly<MetricDefinition>
export const MEDIA_KIT_AUTOMATIC_METRIC_KEYS:readonly string[]
