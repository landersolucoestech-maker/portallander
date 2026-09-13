import assert from 'node:assert/strict'
import test from 'node:test'
import {normalizeCreativeConfig} from './marketingService.js'

const imageSlot={assetId:'media_1',url:'https://cdn.example/image.jpg',name:'image.jpg',mimeType:'image/jpeg',kind:'image',fit:'cover',zoom:1,positionX:50,positionY:50}
const readyOutput={assetId:'media_output',url:'https://cdn.example/output.png',mimeType:'image/png',width:1080,height:1920,createdAt:'2026-09-13T12:00:00.000Z'}
const template=(overrides={})=>({version:1,mode:'template',templateKey:'news-portal-lander',category:'news',layout:'full',primarySlot:imageSlot,headline:{text:'Headline'},subtitle:{text:'Subtitle'},logo:{source:'global'},watermark:{source:'global',opacity:.16},background:'#050505',renderState:{status:'ready'},output:readyOutput,...overrides})

test('legacy content without creative config remains valid simple behavior',()=>{
  assert.equal(normalizeCreativeConfig(undefined),undefined)
  assert.deepEqual(normalizeCreativeConfig({version:1,mode:'simple',renderState:{status:'clean'}}),{version:1,mode:'simple',renderState:{status:'clean'}})
})

test('scheduled full template requires a persisted ready output',()=>{
  const value=normalizeCreativeConfig(template(),{contentStatus:'agendado'})
  assert.equal(value.mode,'template')
  assert.equal(value.layout,'full')
  assert.equal(value.output.url,readyOutput.url)
  assert.throws(()=>normalizeCreativeConfig(template({renderState:{status:'dirty'}}),{contentStatus:'agendado'}),error=>error?.code==='MARKETING_CREATIVE_RENDER_REQUIRED')
})

test('scheduled split requires an independent secondary slot',()=>{
  assert.throws(()=>normalizeCreativeConfig(template({layout:'split'}),{contentStatus:'agendado'}),error=>error?.code==='MARKETING_CREATIVE_SECONDARY_REQUIRED')
  const value=normalizeCreativeConfig(template({layout:'split',secondarySlot:{...imageSlot,assetId:'media_2',url:'https://cdn.example/right.jpg'}}),{contentStatus:'agendado'})
  assert.equal(value.secondarySlot.assetId,'media_2')
})

test('draft template may remain dirty while work is in progress',()=>{
  const value=normalizeCreativeConfig(template({renderState:{status:'dirty'},output:undefined}),{contentStatus:'producao'})
  assert.equal(value.renderState.status,'dirty')
  assert.equal(value.output,undefined)
})

test('creative persistence rejects ephemeral blob and data image sources',()=>{
  assert.throws(()=>normalizeCreativeConfig(template({primarySlot:{...imageSlot,url:'blob:https://portal.test/123'}}),{contentStatus:'producao'}),error=>error?.code==='MARKETING_CREATIVE_EPHEMERAL_URL')
  assert.throws(()=>normalizeCreativeConfig(template({primarySlot:{...imageSlot,url:'data:image/png;base64,AAAA'}}),{contentStatus:'producao'}),error=>error?.code==='MARKETING_CREATIVE_EPHEMERAL_URL')
})

test('global brand layers do not persist a duplicate logo asset',()=>{
  const value=normalizeCreativeConfig(template(),{contentStatus:'agendado'})
  assert.equal(value.logo.source,'global')
  assert.equal('url' in value.logo,false)
  assert.equal(value.watermark.source,'global')
})
