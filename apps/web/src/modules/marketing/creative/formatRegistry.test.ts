import {describe,expect,it} from 'vitest'
import {resolveCreativeFormat,validateCreativeForFormat} from './formatRegistry'
import {createNewsCreative} from './templates'

describe('marketing creative formats',()=>{
 it('uses platform and content type to resolve canonical dimensions and identity',()=>{
  expect(resolveCreativeFormat('Instagram','Stories')).toMatchObject({id:'instagram:story:9x16',width:1080,height:1920,staticTemplateSupported:true})
  expect(resolveCreativeFormat('Instagram','Feed')).toMatchObject({id:'instagram:feed:1x1',width:1080,height:1080})
  expect(resolveCreativeFormat('YouTube','Post')).toMatchObject({id:'youtube:video:16x9',width:1920,height:1080})
 })
 it('does not fake static template support for video/carousel formats',()=>{
  expect(resolveCreativeFormat('TikTok','Post')).toMatchObject({id:'tiktok:video:9x16',staticTemplateSupported:false})
  expect(resolveCreativeFormat('Instagram','Reels')).toMatchObject({id:'instagram:reel:9x16',staticTemplateSupported:false})
  expect(resolveCreativeFormat('YouTube','Shorts')).toMatchObject({id:'youtube:short:9x16',staticTemplateSupported:false})
  expect(resolveCreativeFormat('Instagram','Carrossel').staticTemplateSupported).toBe(false)
 })
 it('requires independent secondary media for split',()=>{const creative=createNewsCreative('Headline');creative.primarySlot={assetId:'a',url:'https://cdn.example/a.jpg',name:'a.jpg',mimeType:'image/jpeg',kind:'image',fit:'cover',zoom:1,positionX:50,positionY:50};creative.layout='split';expect(validateCreativeForFormat(creative,resolveCreativeFormat('Instagram','Feed'))).toContain('mídia secundária')})
})
