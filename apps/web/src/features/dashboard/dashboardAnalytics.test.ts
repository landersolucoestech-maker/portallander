import {describe,expect,it} from 'vitest'
import type {AnalyticsMetric} from '../analytics/domain'
import type {MetricsResponse} from '../analytics/metricsClient'
import {lastSevenDayRange,lastThirtyDayRange,resolveDashboardPageviews,resolveMultichannelPulses,resolveProviderPulse,resolveWebsitePulse} from './dashboardAnalytics'

const metric=(patch:Partial<AnalyticsMetric>):AnalyticsMetric=>({id:'m1',metricKey:'pageviews',value:120,unit:'count',provider:'google-analytics',providerAccountId:'a1',providerPropertyId:'p1',scopeType:'portal',scopeId:'portal',periodStart:'2026-09-01T00:00:00.000Z',periodEnd:'2026-09-02T00:00:00.000Z',granularity:'day',timezone:'America/Sao_Paulo',dimensions:{},filters:{},sourceType:'provider',sourceReference:'ga4',collectedAt:'2026-09-02T03:00:00.000Z',providerUpdatedAt:null,normalizedAt:'2026-09-02T03:00:00.000Z',freshnessStatus:'FRESH',dataStatus:'LIVE',syncId:'s1',provenance:{},isEstimated:false,isManual:false,...patch})

const overview=(pageviews:number|null):MetricsResponse=>({
 range:{preset:'30d',startDate:'2026-08-08',endDate:'2026-09-06',days:30,timezone:'America/Sao_Paulo'},
 ga4:{status:'available',provider:'google-analytics',propertyId:'ga4:portal',overview:{pageviews:{value:pageviews,status:pageviews===null?'empty':'available'}},returningUsers:null,acquisition:[],pages:[]},
 editorial:{status:'available',counts:{published:1,drafts:0,archived:0,publishedInPeriod:1},latest:[]},
 conversions:{status:'available',total:0,leadsCreated:0,collaborationsCreated:0,contexts:{contato:0,colabore:0,anuncie:0},forms:[]},
 generatedAt:'2026-09-06T12:00:00.000Z',
})

describe('dashboard analytics',()=>{
 it('builds deterministic seven- and thirty-day UTC windows from the current clock',()=>{
  expect(lastSevenDayRange(new Date('2026-09-04T15:00:00.000Z'))).toEqual({periodStart:'2026-08-29T00:00:00.000Z',periodEnd:'2026-09-05T00:00:00.000Z'})
  expect(lastThirtyDayRange(new Date('2026-09-06T15:00:00.000Z'))).toEqual({periodStart:'2026-08-08T00:00:00.000Z',periodEnd:'2026-09-07T00:00:00.000Z'})
 })

 it('returns unavailable rather than zero or an invented series when Analytics has no usable data',()=>{
  expect(resolveDashboardPageviews([])).toEqual({points:[],source:'UNAVAILABLE',updatedAt:null})
  expect(resolveDashboardPageviews([metric({value:999,dataStatus:'MOCK'})])).toEqual({points:[],source:'UNAVAILABLE',updatedAt:null})
  expect(resolveWebsitePulse(overview(null))).toMatchObject({key:'site',value:null,source:'UNAVAILABLE'})
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

 it('isolates each social provider and never borrows a value from another channel',()=>{
  const rows=[
   metric({id:'ig',metricKey:'followers',provider:'Instagram',providerAccountId:'ig',value:100}),
   metric({id:'tt',metricKey:'followers',provider:'TikTok',providerAccountId:'tt',value:250}),
   metric({id:'yt',metricKey:'followers',provider:'YouTube',providerAccountId:'yt',value:400}),
  ]
  expect(resolveProviderPulse(rows,'Instagram').value).toBe(100)
  expect(resolveProviderPulse(rows,'TikTok').value).toBe(250)
  expect(resolveProviderPulse(rows,'YouTube').value).toBe(400)
 })

 it('uses the latest same-provider snapshot instead of summing follower observations',()=>{
  const rows=[
   metric({id:'old',metricKey:'followers',provider:'Instagram',providerAccountId:'ig',periodEnd:'2026-08-01T00:00:00.000Z',value:80}),
   metric({id:'new',metricKey:'followers',provider:'Instagram',providerAccountId:'ig',periodEnd:'2026-09-01T00:00:00.000Z',value:100}),
  ]
  expect(resolveProviderPulse(rows,'Instagram').value).toBe(100)
 })

 it('respects YouTube subscribers when that canonical metric exists',()=>{
  const rows=[
   metric({id:'followers',metricKey:'followers',provider:'YouTube',value:300}),
   metric({id:'subscribers',metricKey:'subscribers',provider:'YouTube',value:450}),
  ]
  expect(resolveProviderPulse(rows,'YouTube')).toMatchObject({metricKey:'subscribers',metricLabel:'Inscritos',value:450})
 })

 it('builds one four-channel summary and keeps missing providers fail-closed',()=>{
  const rows=[metric({id:'ig',metricKey:'followers',provider:'Instagram',value:100})]
  const channels=resolveMultichannelPulses(overview(5000),rows)
  expect(channels.map(channel=>channel.label)).toEqual(['Website','Instagram','TikTok','YouTube'])
  expect(channels[0]?.value).toBe(5000)
  expect(channels[1]?.value).toBe(100)
  expect(channels[2]?.value).toBeNull()
  expect(channels[3]?.value).toBeNull()
 })

 it('never promotes MOCK social rows as real data',()=>{
  const pulse=resolveProviderPulse([metric({metricKey:'followers',provider:'Instagram',value:999,dataStatus:'MOCK'})],'Instagram')
  expect(pulse).toMatchObject({value:null,source:'UNAVAILABLE'})
 })
})
