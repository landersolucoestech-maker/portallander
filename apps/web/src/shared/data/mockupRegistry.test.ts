import {describe,expect,it} from 'vitest'
import {getMockupScenario,mockEditorialContents,mockupRegistry} from '@portallander/mockup'

describe('@portallander/mockup scenario registry',()=>{
 it('registers only full, empty and errors',()=>{
  expect(mockupRegistry.names).toEqual(['full','empty','errors'])
  expect(getMockupScenario('empty').analytics.metrics).toEqual([])
  const errorsScenario=getMockupScenario('errors')
  expect(errorsScenario.name).toBe('errors')
  if(errorsScenario.name!=='errors')throw new Error('errors scenario registry returned the wrong variant')
  expect(errorsScenario.errors).toBeTruthy()
 })

 it('fails fast for an unknown scenario',()=>{
  expect(()=>getMockupScenario('banana')).toThrow('Unknown mockup scenario: banana')
 })

 it('is deterministic across independent reads',()=>{
  const first=getMockupScenario('full')
  const second=getMockupScenario('full')
  expect(second).toEqual(first)
  expect(second).not.toBe(first)
 })

 it('exposes canonical deterministic social metric provenance in full',()=>{
  const instagramFollowers=getMockupScenario('full').analytics.metrics.find(metric=>metric.provider==='Instagram'&&metric.metricKey==='followers')
  expect(instagramFollowers).toBeTruthy()
  expect(instagramFollowers?.value).toBe(48200)
  expect(instagramFollowers?.providerAccountId).toBe('mockup:account:instagram:portal-lander')
  expect(instagramFollowers?.dataStatus).toBe('CACHED')
  expect(instagramFollowers?.freshness).toBe('FRESH')
 })

 it('covers candidate A-F lifecycle states and keeps converted content referentially valid',()=>{
  const candidates=getMockupScenario('full').integrations.candidates
  expect(candidates.map(item=>item.id)).toEqual(['mockup:candidate:a','mockup:candidate:b','mockup:candidate:c','mockup:candidate:d','mockup:candidate:e','mockup:candidate:f'])
  expect(candidates.map(item=>item.status)).toEqual(['new','reviewing','approved','converted','rejected','ignored'])
  const converted=candidates.find(item=>item.status==='converted')
  expect(converted?.editorialContentId).toBeTruthy()
  expect(mockEditorialContents.some((content:{id:string})=>content.id===converted?.editorialContentId)).toBe(true)
 })

 it('preserves integration states that are intentionally pending',()=>{
  const sources=getMockupScenario('full').integrations.sources
  const billboard=sources.find(item=>item.name==='Billboard')
  const billboardBrasil=sources.find(item=>item.name==='Billboard Brasil')
  expect(billboard?.enabled).toBe(false)
  expect(billboard?.configuration.catalogStatus).toBe('requires_official_confirmation')
  expect(billboardBrasil?.enabled).toBe(false)
  expect(billboardBrasil?.feedUrl).toBe('')
  expect(billboardBrasil?.configuration.catalogStatus).toBe('requires_configuration')
 })
})
