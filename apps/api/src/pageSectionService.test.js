import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizePageSections} from './pageSectionService.js'

test('normaliza composição preservando ordem',()=>{
  const sections=normalizePageSections([
    {id:'hero-copy',name:'Destaques',slug:'Destaques do Dia'},
    {id:'commercial',name:'Área Comercial',slug:'area comercial'},
  ])
  assert.deepEqual(sections.map(section=>section.slug),['destaques-do-dia','area-comercial'])
  assert.deepEqual(sections.map(section=>section.order),[0,1])
})

test('gera identificador quando ausente',()=>{
  const [section]=normalizePageSections([{name:'Agenda',slug:'agenda'}])
  assert.match(section.id,/^section-/)
})

test('rejeita identificadores duplicados',()=>{
  assert.throws(
    ()=>normalizePageSections([{name:'A',slug:'mesma'},{name:'B',slug:'mesma'}]),
    error=>error?.code==='PAGE_SECTION_SLUG_DUPLICATE',
  )
})
