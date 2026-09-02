import test from 'node:test'
import assert from 'node:assert/strict'
import {contentFromRow,normalizeSlug,pageFromRow} from './editorialService.js'

test('normalizeSlug mantém slugs editoriais previsíveis',()=>{
  assert.equal(normalizeSlug('Música & Cultura — 2026'),'musica-cultura-2026')
  assert.equal(normalizeSlug('  Últimas Notícias  '),'ultimas-noticias')
})

test('pageFromRow preserva classificação e configuração sem duplicar template',()=>{
  const page=pageFromRow({
    id:'page_cultura',title:'Cultura',navigation_label:'Cultura',slug:'cultura',description:'',cover_image:null,page_type:'editorial',status:'published',active:true,visibility:'public',show_in_main_menu:true,menu_order:20,sort_order:20,parent_id:null,seo:{metaTitle:'Cultura'},created_at:new Date('2026-01-01T00:00:00Z'),updated_at:new Date('2026-01-02T00:00:00Z'),published_at:new Date('2026-01-01T00:00:00Z'),
  })
  assert.equal(page.type,'editorial')
  assert.equal(page.slug,'cultura')
  assert.equal(page.seo.metaTitle,'Cultura')
})

test('contentFromRow mantém blocos e mídia como dados do conteúdo',()=>{
  const content=contentFromRow({
    id:'content_1',page_id:'page_cultura',title:'Matéria',slug:'materia',subtitle:null,summary:'Resumo',body:[{type:'paragraph',text:'Texto'}],cover_image:null,cover_image_alt:null,author:'Portal Lander',status:'draft',active:false,tags:['CULTURA'],media:[],seo:{noIndex:true},created_at:new Date('2026-01-01T00:00:00Z'),updated_at:new Date('2026-01-02T00:00:00Z'),published_at:null,
  })
  assert.equal(content.pageId,'page_cultura')
  assert.deepEqual(content.body,[{type:'paragraph',text:'Texto'}])
  assert.equal(content.status,'draft')
})
