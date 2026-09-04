import {describe,expect,it} from 'vitest'
import type {AnalyticsMetric} from '../analytics/domain'
import {lastSevenDayRange,resolveDashboardPageviews} from './dashboardAnalytics'

const metric=(patch:Partial<AnalyticsMetric>):AnalyticsMetric=>({id:'m1',metricKey:'pageviews',value:120,unit:'count',provider:'google-analytics',providerAccountId:'a1',providerPropertyId:'p1',scopeType:'portal',scopeId:'portal',periodStart:'2026-09-01T00:00:00.000Z',periodEnd:'2026-09-02T00:00:00.000Z',granularity:'day',timezone:'America/Sao_Paulo',dimensions:{},filters:{},sourceType:'provider',sourceReference:'ga4',collectedAt:'2026-09-02T03:00:00.000Z',providerUpdatedAt:null,normalizedAt:'2026-09-02T03:00:00.000Z',freshnessStatus:'FRESH',dataStatus:'LIVE',syncId:'s1',provenance:{},isEstimated:false,isManual:false,...patch})

describe('dashboard analytics',()=>{
 it('builds a rolling seven-day UTC range from the current clock',()=>{
  expect(lastSevenDayRange(new Date('2026-09-04T15:00:00.000Z'))).toEqual({periodStart:'2026-08-29T00:00:00.000Z',periodEnd:'2026-09-05T00:00:00.000Z'})
  expect(lastSevenDayRange(new Date('2027-01-02T12:00:00.000Z'))).toEqual({periodStart:'2026-12-27T00:00:00.000Z',periodEnd:'2027-01-03T00:00:00.000Z'})
 })

 it('returns unavailable rather than zero or an invented series when Analytics has no usable data',()=>{
  expect(resolveDashboardPageviews([])).toEqual({points:[],source:'UNAVAILABLE',updatedAt:null})
  expect(resolveDashboardPageviews([metric({value:999,dataStatus:'MOCK'})])).toEqual({points:[],source:'UNAVAILABLE',updatedAt:null})
 })

 it('uses provider data and explicitly identifies manual observations',()=>{
  const real=resolveDashboardPageviews([metric({id:'day-1'}),metric({id:'day-2',periodStart:'2026-09-02T00:00:00.000Z',periodEnd:'2026-09-03T00:00:00.000Z',value:180})])
  expect(real.source).toBe('REAL')
  expect(real.points.map(point=>point.value)).toEqual([120,180])
  const manual=resolveDashboardPageviews([metric({sourceType:'manual',provider:null,providerPropertyId:null,dataStatus:'MANUAL',isManual:true,value:44})])
  expect(manual.source).toBe('MANUAL_IDENTIFIED')
  expect(manual.points[0]?.value).toBe(44)
 })

 it('does not sum incompatible providers into one fake daily point',()=>{
  const series=resolveDashboardPageviews([metric({id:'ga'}),metric({id:'other',provider:'another-provider',providerPropertyId:'p2',value:300})])
  expect(series).toEqual({points:[],source:'UNAVAILABLE',updatedAt:null})
 })
})
