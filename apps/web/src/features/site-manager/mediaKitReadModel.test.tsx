import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {beforeEach,describe,expect,it,vi} from 'vitest'
import type {AnalyticsMetric} from '../analytics/domain'
import {aggregateMetric} from '../analytics/metricCatalog'
import {defaultMediaKitDraft,type MediaKitResolvedMetric} from './mediaKitDomain'

const state=vi.hoisted(()=>({
 tradeName:'Portal A',
 responsible:'Responsável A',
 phone:'1111-1111',
 analytics:[] as unknown[],
}))

vi.mock('../../shared/data/runtimeDataProvider',()=>({
 getRuntimeDataProvider:()=>({
  settings:{seed:()=>({company:{tradeName:state.tradeName,responsible:state.responsible,phone:state.phone}})},
  branding:{socialChannels:()=>[{id:'instagram',active:true},{id:'youtube',active:true},{id:'tiktok',active:true}]},
 }),
}))

vi.mock('../analytics/client',()=>({
 analyticsClient:{metrics:async()=>({metrics:state.analytics})},
}))

vi.mock('./readModel',()=>({siteManagerReadModel:{pages:[{slug:'sobre',description:'Resumo canônico do portal'}]}}))

function metric(provider:string,accountId:string,metricKey:string,value:number,{id=`${provider}-${metricKey}`,periodStart='2026-08-01T00:00:00.000Z',periodEnd='2026-09-01T00:00:00.000Z'}={}):AnalyticsMetric{
 return {id,metricKey,value,unit:'count',provider,providerAccountId:accountId,providerPropertyId:null,scopeType:'portal',scopeId:'portal',periodStart,periodEnd,granularity:'month',timezone:'America/Sao_Paulo',dimensions:{},filters:{},sourceType:'provider',sourceReference:`test:${provider}:${metricKey}`,collectedAt:periodEnd,providerUpdatedAt:null,normalizedAt:periodEnd,freshnessStatus:'FRESH',dataStatus:'CACHED',syncId:null,provenance:{automatic:true},isEstimated:false,isManual:false}
}
function manualSnapshot(metricKey:string,value:number):MediaKitResolvedMetric{
 return {id:`legacy-${metricKey}`,label:`Legacy ${metricKey}`,metricKey,value,unit:'count',provider:null,providerAccountId:null,providerPropertyId:null,periodStart:'2026-08-01',periodEnd:'2026-09-01',granularity:'custom',sourceType:'manual',sourceReference:'legacy',collectedAt:null,providerUpdatedAt:null,normalizedAt:null,freshnessStatus:'UNKNOWN',dataStatus:'MANUAL',syncId:null,provenance:{legacy:true},isEstimated:false,isManual:true}
}

import {mediaKitReadModel} from './mediaKitReadModel'
import {MediaKitDocument} from './pages/MediaKitDocument'

beforeEach(()=>{
 state.tradeName='Portal A'
 state.responsible='Responsável A'
 state.phone='1111-1111'
 state.analytics=[]
})

describe('mediaKitReadModel automatic canonical integration snapshots',()=>{
 it('renders Instagram followers automatically and updates A to B without editing the Media Kit',async()=>{
  state.analytics=[metric('Instagram','ig-portal','followers',128400)]
  const a=await mediaKitReadModel.snapshot(structuredClone(defaultMediaKitDraft))
  const htmlA=renderToStaticMarkup(createElement(MediaKitDocument,{kit:a}))
  const followerA=a.audience.snapshot.find(item=>item.provider==='Instagram'&&item.metricKey==='followers')
  expect(followerA?.value).toBe(128400)
  expect(followerA?.providerAccountId).toBe('ig-portal')
  expect(followerA?.provenance.automatic).toBe(true)
  expect(htmlA).toContain('Seguidores')
  expect(htmlA).toContain('128.400')
  expect(htmlA).toContain('Instagram')

  state.analytics=[metric('Instagram','ig-portal','followers',130250)]
  const b=await mediaKitReadModel.snapshot(structuredClone(defaultMediaKitDraft))
  const htmlB=renderToStaticMarkup(createElement(MediaKitDocument,{kit:b}))
  expect(b.audience.snapshot.find(item=>item.provider==='Instagram'&&item.metricKey==='followers')?.value).toBe(130250)
  expect(htmlB).toContain('130.250')
  expect(htmlB).not.toContain('128.400')
 })

 it('preserves provider-specific values and never aggregates incompatible followers across providers',async()=>{
  state.analytics=[
   metric('Instagram','ig-portal','followers',128400),
   metric('YouTube','yt-channel','followers',22400),
   metric('TikTok','tt-portal','reach',312000),
  ]
  const kit=await mediaKitReadModel.snapshot(structuredClone(defaultMediaKitDraft))
  const followers=kit.audience.snapshot.filter(item=>item.metricKey==='followers')
  expect(followers).toHaveLength(2)
  expect(followers.map(item=>[item.provider,item.value])).toEqual([['Instagram',128400],['YouTube',22400]])
  expect(followers.some(item=>item.value===150800)).toBe(false)
 })

 it('uses only the newest canonical snapshot for the same provider account and metric',async()=>{
  state.analytics=[
   metric('Instagram','ig-portal','followers',120000,{id:'older',periodStart:'2026-07-01T00:00:00.000Z',periodEnd:'2026-08-01T00:00:00.000Z'}),
   metric('Instagram','ig-portal','followers',128400,{id:'current'}),
  ]
  const kit=await mediaKitReadModel.snapshot(structuredClone(defaultMediaKitDraft))
  const followers=kit.audience.snapshot.filter(item=>item.provider==='Instagram'&&item.metricKey==='followers')
  expect(followers).toHaveLength(1)
  expect(followers[0].value).toBe(128400)
 })

 it('keeps missing integration data unavailable instead of inventing zero',async()=>{
  const kit=await mediaKitReadModel.snapshot(structuredClone(defaultMediaKitDraft))
  expect(kit.audience.snapshot).toEqual([])
  const html=renderToStaticMarkup(createElement(MediaKitDocument,{kit}))
  expect(html).toContain('MÉTRICA NÃO DISPONÍVEL')
 })

 it('gives automatic canonical metrics precedence over legacy manual values and uses legacy only as fallback',async()=>{
  const source=structuredClone(defaultMediaKitDraft)
  source.audience.snapshot=[manualSnapshot('followers',999)]
  state.analytics=[metric('Instagram','ig-portal','followers',128400)]
  const automatic=await mediaKitReadModel.snapshot(source)
  expect(automatic.audience.snapshot.some(item=>item.metricKey==='followers'&&item.isManual)).toBe(false)
  expect(automatic.audience.snapshot.find(item=>item.metricKey==='followers')?.value).toBe(128400)

  state.analytics=[]
  const fallback=await mediaKitReadModel.snapshot(source)
  expect(fallback.audience.snapshot).toHaveLength(1)
  expect(fallback.audience.snapshot[0].value).toBe(999)
  expect(fallback.audience.snapshot[0].dataStatus).toBe('MANUAL')
 })

 it('uses the same canonical Instagram snapshot value consumed by Marketing aggregation',async()=>{
  const canonical=[metric('Instagram','ig-portal','followers',128400),metric('YouTube','yt-channel','followers',22400)]
  state.analytics=canonical
  const marketingInstagramFollowers=aggregateMetric(canonical.filter(item=>item.provider==='Instagram'),'followers')
  const kit=await mediaKitReadModel.snapshot(structuredClone(defaultMediaKitDraft))
  const mediaKitInstagramFollowers=kit.audience.snapshot.find(item=>item.provider==='Instagram'&&item.metricKey==='followers')?.value
  expect(marketingInstagramFollowers).toBe(128400)
  expect(mediaKitInstagramFollowers).toBe(marketingInstagramFollowers)
 })

 it('continues to re-read Settings and contact canonical values without template changes',async()=>{
  state.analytics=[metric('Instagram','ig-portal','reach',111)]
  const a=await mediaKitReadModel.snapshot(structuredClone(defaultMediaKitDraft))
  state.tradeName='Portal B';state.responsible='Responsável B';state.phone='2222-2222';state.analytics=[metric('Instagram','ig-portal','reach',222)]
  const b=await mediaKitReadModel.snapshot(structuredClone(defaultMediaKitDraft))
  expect(a.identity.title).toBe('Portal A')
  expect(b.identity.title).toBe('Portal B')
  expect(b.commercial.name).toBe('Responsável B')
  expect(b.commercial.phone).toBe('2222-2222')
  expect(b.audience.snapshot.find(item=>item.metricKey==='reach')?.value).toBe(222)
 })
})
