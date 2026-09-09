import {describe,expect,it} from 'vitest'
import type {AnalyticsMetric} from '../analytics/domain'
import type {MarketingContent} from './domain'
import {buildContentReachRanking} from './analyticsRanking'

const content=(id:string,title:string):MarketingContent=>({id,title,context:'Editorial',subject:'',channels:['Instagram'],type:'Post',publishDate:'2026-08-01',publishTime:'12:00',copy:'',campaign:'',hashtags:'',location:'',status:'publicado',approval:'aprovado',owner:'Equipe',createdAt:'2026-08-01T00:00:00.000Z',updatedAt:'2026-08-01T00:00:00.000Z'})
const metric=(scopeId:string,value:number):AnalyticsMetric=>({id:`metric-${scopeId}`,metricKey:'reach',value,unit:'count',provider:'meta',providerAccountId:'a',providerPropertyId:null,scopeType:'content',scopeId,periodStart:'2026-08-01T00:00:00.000Z',periodEnd:'2026-09-01T00:00:00.000Z',granularity:'month',timezone:'UTC',dimensions:{},filters:{},sourceType:'provider',sourceReference:`source-${scopeId}`,collectedAt:null,providerUpdatedAt:null,normalizedAt:null,freshnessStatus:'UNKNOWN',dataStatus:'LIVE',syncId:null,provenance:{},isEstimated:false,isManual:false})

describe('content analytics ranking',()=>{
 it('links metrics only by explicit content scope id',()=>{
   const contents=[content('content-a','A'),content('content-b','B')]
   const ranking=buildContentReachRanking(contents,[metric('content-b',200)])
   expect(ranking).toHaveLength(1)
   expect(ranking[0].content.id).toBe('content-b')
   expect(ranking[0].value).toBe(200)
 })
 it('does not invent a positional match when scope id is unknown',()=>{
   const contents=[content('content-a','A')]
   expect(buildContentReachRanking(contents,[metric('unrelated',999)])).toEqual([])
 })
 it('does not aggregate multiple non-additive reach observations into a fake total',()=>{
   const contents=[content('content-a','A')]
   const first=metric('content-a',100)
   const second={...metric('content-a',120),id:'metric-second',sourceReference:'second',periodStart:'2026-08-02T00:00:00.000Z',periodEnd:'2026-08-03T00:00:00.000Z'}
   expect(buildContentReachRanking(contents,[first,second])).toEqual([])
 })
})
