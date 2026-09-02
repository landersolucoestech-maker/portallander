import assert from 'node:assert/strict'
import test from 'node:test'
import {normalizeSectionConfiguration} from './sectionConfigurationService.js'

test('section configuration accepts a plain serializable object',()=>{
  const input={active:true,hero:{backgroundImage:{url:'https://cdn.example/hero.webp',positionX:50,positionY:50}}}
  assert.deepEqual(normalizeSectionConfiguration(input),input)
})

test('section configuration rejects non-object payloads',()=>{
  assert.throws(()=>normalizeSectionConfiguration(null),error=>error?.code==='SECTION_CONFIGURATION_INVALID')
  assert.throws(()=>normalizeSectionConfiguration([]),error=>error?.code==='SECTION_CONFIGURATION_INVALID')
})

test('section configuration rejects oversized payloads',()=>{
  assert.throws(()=>normalizeSectionConfiguration({value:'x'.repeat(520*1024)}),error=>error?.code==='SECTION_CONFIGURATION_TOO_LARGE')
})
