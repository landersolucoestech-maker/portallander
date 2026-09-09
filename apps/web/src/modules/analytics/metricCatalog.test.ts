import {describe,expect,it} from 'vitest'
import type {AnalyticsMetric} from './domain'
import {aggregateMetric} from './metricCatalog'

const metric=(overrides:Partial<AnalyticsMetric>):AnalyticsMetric=>({id:'m',metricKey:'impressions',value:1,unit:'count',provider:'provider-a',providerAccountId:'account',providerPropertyId:'property',scopeType:'portal',scopeId:'portal',periodStart:'2026-08-01T00:00:00.000Z',periodEnd:'2026-08-02T00:00:00.000Z',granularity:'day',timezone:'UTC',dimensions:{},filters:{},sourceType:'provider',sourceReference:'source',collectedAt:null,providerUpdatedAt:null,normalizedAt:null,freshnessStatus:'UNKNOWN',dataStatus:'LIVE',syncId:null,provenance:{},isEstimated:false,isManual:false,...overrides})

describe('metric aggregation semantics',()=>{
 it('sums additive metrics',()=>{expect(aggregateMetric([metric({id:'a',value:10}),metric({id:'b',value:12,sourceReference:'b'})],'impressions')).toBe(22)})
 it('refuses to sum non-additive reach across periods',()=>{expect(aggregateMetric([metric({id:'a',metricKey:'reach',value:10}),metric({id:'b',metricKey:'reach',value:12,sourceReference:'b'})],'reach')).toBeNull()})
 it('refuses cross-provider aggregation when semantics do not allow it',()=>{expect(aggregateMetric([metric({id:'a',metricKey:'followers',value:10}),metric({id:'b',metricKey:'followers',value:12,provider:'provider-b',sourceReference:'b'})],'followers')).toBeNull()})
 it('returns latest compatible snapshot for followers',()=>{expect(aggregateMetric([metric({id:'a',metricKey:'followers',value:10}),metric({id:'b',metricKey:'followers',value:12,periodEnd:'2026-08-03T00:00:00.000Z',sourceReference:'b'})],'followers')).toBe(12)})
})
