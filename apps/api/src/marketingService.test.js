import assert from 'node:assert/strict'
import test from 'node:test'
import {resolveMarketingCreativeFormat} from '../../../packages/shared/marketingCreativeFormats.js'
import {normalizeCreativeConfig,normalizeMarketingContentTypeForWrite} from './marketingService.js'

const imageSlot={assetId:'media_1',url:'https://cdn.example/image.jpg',name:'image.jpg',mimeType:'image/jpeg',kind:'image',fit:'cover',zoom:1,positionX:50,positionY:50}
const readyOutput={assetId:'media_output',url:'https://cdn.example/output.png',mimeType:'image/png',width:1080,height:1920,createdAt:'2026-09-13T12:00:00.000Z'}
const template=(overrides={})=>({version:1,mode:'template',templateKey:'news-portal-lander',category:'news',layout:'full',primarySlot:imageSlot,headline:{text:'Headline'},subtitle:{text:'Subtitle'},logo:{source:'global'},watermark:{source:'global',opacity:.16},background:'#050505',renderState:{status:'ready'},output:readyOutput,...overrides})

test('new writes accept only the canonical creation content types while unchanged legacy values remain editable',()=>{
  for(const type of ['Stories','Reels','Carrossel','Feed'])assert.equal(normalizeMarketingContentTypeForWrite(type),type)
  assert.throws(()=>normalizeMarketingContentTypeForWrite('Post'),error=>error?.code==='MARKETING_CONTENT_TYPE_UNSUPPORTED')
  assert.throws(()=>normalizeMarketingContentTypeForWrite('Shorts'),error=>error?.code==='MARKETING_CONTENT_TYPE_UNSUPPORTED')
  assert.equal(normalizeMarketingContentTypeForWrite('Post','Post'),'Post')
  assert.throws(()=>normalizeMarketingContentTypeForWrite('Shorts','Post'),error=>error?.code==='MARKETING_CONTENT_TYPE_UNSUPPORTED')
})

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

test('scheduled content rejects rendered dimensions from another format',()=>{
  const format=resolveMarketingCreativeFormat('Instagram','Feed')
  assert.throws(()=>normalizeCreativeConfig(template(),{contentStatus:'agendado',format}),error=>error?.code==='MARKETING_CREATIVE_OUTPUT_FORMAT_MISMATCH')
})

test('draft content invalidates stale output instead of preserving it',()=>{
  const format=resolveMarketingCreativeFormat('Instagram','Feed')
  const value=normalizeCreativeConfig(template(),{contentStatus:'producao',format})
  assert.equal(value.formatKey,'instagram:feed:1x1')
  assert.equal(value.renderState.status,'dirty')
  assert.equal(value.output,undefined)
})

test('same-size platform changes require a new render before the output can be reused',()=>{
  const instagram=resolveMarketingCreativeFormat('Instagram','Feed'),facebook=resolveMarketingCreativeFormat('Facebook','Post')
  const squareOutput={...readyOutput,width:1080,height:1080}
  const previous=normalizeCreativeConfig(template({output:squareOutput}),{contentStatus:'producao',format:instagram})
  assert.equal(previous.formatKey,'instagram:feed:1x1')
  const stale=normalizeCreativeConfig({...previous,renderState:{status:'ready'}},{contentStatus:'producao',format:facebook,previousCreative:previous})
  assert.equal(stale.formatKey,'facebook:feed:1x1')
  assert.equal(stale.renderState.status,'dirty')
  assert.equal(stale.output,undefined)
  const rerendered=normalizeCreativeConfig({...previous,output:{...squareOutput,createdAt:'2026-09-13T12:05:00.000Z'},renderState:{status:'ready'}},{contentStatus:'agendado',format:facebook,previousCreative:previous})
  assert.equal(rerendered.formatKey,'facebook:feed:1x1')
  assert.equal(rerendered.renderState.status,'ready')
  assert.equal(rerendered.output.width,1080)
})

test('Reels and Stories templates share the same scheduled output geometry',()=>{
  const stories=resolveMarketingCreativeFormat('Instagram','Stories'),reels=resolveMarketingCreativeFormat('Instagram','Reels')
  assert.equal(stories.aspectRatio,reels.aspectRatio)
  assert.equal(stories.width,reels.width)
  assert.equal(stories.height,reels.height)
  assert.equal(reels.staticTemplateSupported,true)
  const value=normalizeCreativeConfig(template({formatKey:reels.id}),{contentStatus:'agendado',format:reels})
  assert.equal(value.output.width,1080)
  assert.equal(value.output.height,1920)
})

test('legacy video-only formats cannot be scheduled through the static template renderer',()=>{
  const format=resolveMarketingCreativeFormat('TikTok','Post')
  assert.throws(()=>normalizeCreativeConfig(template(),{contentStatus:'agendado',format}),error=>error?.code==='MARKETING_CREATIVE_FORMAT_UNSUPPORTED')
})
