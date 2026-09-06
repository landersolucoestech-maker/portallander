import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {describe,expect,it,vi} from 'vitest'
import type {AnalyticsMetric} from '../analytics/domain'
import {defaultMediaKitDraft} from './mediaKitDomain'

const state=vi.hoisted(()=>({
 tradeName:'Portal A',
 responsible:'Responsável A',
 phone:'1111-1111',
 metricValue:111,
}))

vi.mock('../../shared/data/runtimeDataProvider',()=>({
 getRuntimeDataProvider:()=>({
  settings:{seed:()=>({company:{tradeName:state.tradeName,responsible:state.responsible,phone:state.phone}})},
  branding:{socialChannels:()=>[{id:'instagram',active:true}]},
 }),
}))

vi.mock('../analytics/client',()=>({
 analyticsClient:{metrics:async()=>({metrics:[metric('reach',state.metricValue),metric('impressions',state.metricValue+1),metric('followers',state.metricValue+2)]})},
}))

vi.mock('./readModel',()=>({siteManagerReadModel:{pages:[{slug:'sobre',description:'Resumo canônico do portal'}]}}))

function metric(metricKey:string,value:number):AnalyticsMetric{
 return {id:`metric-${metricKey}`,metricKey,value,unit:'count',provider:'development',providerAccountId:null,providerPropertyId:null,scopeType:'portal',scopeId:'portal',periodStart:'2026-08-01T00:00:00.000Z',periodEnd:'2026-08-31T23:59:59.999Z',granularity:'month',timezone:'America/Sao_Paulo',dimensions:{},filters:{},sourceType:'provider',sourceReference:'test-canonical-source',collectedAt:'2026-09-05T18:00:00.000Z',providerUpdatedAt:null,normalizedAt:'2026-09-05T18:00:00.000Z',freshnessStatus:'FRESH',dataStatus:'CACHED',syncId:null,provenance:{automatic:true},isEstimated:false,isManual:false}
}

import {mediaKitReadModel} from './mediaKitReadModel'
import {MediaKitDocument} from './pages/MediaKitDocument'

describe('mediaKitReadModel automatic canonical data',()=>{
 it('re-reads canonical sources and renders A then B without template changes',async()=>{
  const a=await mediaKitReadModel.snapshot(structuredClone(defaultMediaKitDraft))
  const htmlA=renderToStaticMarkup(createElement(MediaKitDocument,{kit:a}))
  expect(a.identity.title).toBe('Portal A')
  expect(a.commercial.name).toBe('Responsável A')
  expect(a.commercial.phone).toBe('1111-1111')
  expect(a.audience.snapshot.find(item=>item.metricKey==='reach')?.value).toBe(111)
  expect(htmlA).toContain('Portal A')
  expect(htmlA).toContain('Responsável A')
  expect(htmlA).toContain('1111-1111')
  expect(htmlA).toContain('111')

  state.tradeName='Portal B'
  state.responsible='Responsável B'
  state.phone='2222-2222'
  state.metricValue=222

  const b=await mediaKitReadModel.snapshot(structuredClone(defaultMediaKitDraft))
  const htmlB=renderToStaticMarkup(createElement(MediaKitDocument,{kit:b}))
  expect(b.identity.title).toBe('Portal B')
  expect(b.commercial.name).toBe('Responsável B')
  expect(b.commercial.phone).toBe('2222-2222')
  expect(b.audience.snapshot.find(item=>item.metricKey==='reach')?.value).toBe(222)
  expect(htmlB).toContain('Portal B')
  expect(htmlB).toContain('Responsável B')
  expect(htmlB).toContain('2222-2222')
  expect(htmlB).toContain('222')
 })
})
