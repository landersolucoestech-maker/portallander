import {describe,expect,it} from 'vitest'
import {MARKETING_CONTENT_FORMATS,MARKETING_CREATION_CONTENT_TYPES,isMarketingCreationContentType,resolveCreativeFormat,validateCreativeForFormat} from './formatRegistry'
import {createNewsCreative} from './templates'

describe('marketing creative formats',()=>{
 it('exposes only the four supported creation content types',()=>{
  expect(MARKETING_CREATION_CONTENT_TYPES).toEqual(['Stories','Reels','Carrossel','Feed'])
  expect(isMarketingCreationContentType('Stories')).toBe(true)
  expect(isMarketingCreationContentType('Post')).toBe(false)
  expect(isMarketingCreationContentType('Shorts')).toBe(false)
 })
 it('shares exactly one vertical geometry definition between Stories and Reels',()=>{
  expect(MARKETING_CONTENT_FORMATS.Stories.geometry).toBe(MARKETING_CONTENT_FORMATS.Reels.geometry)
  expect(MARKETING_CONTENT_FORMATS.Stories.geometry).toMatchObject({width:1080,height:1920,aspectRatio:9/16})
  expect(resolveCreativeFormat('Instagram','Stories')).toMatchObject({id:'instagram:story:9x16',width:1080,height:1920,staticTemplateSupported:true})
  expect(resolveCreativeFormat('Instagram','Reels')).toMatchObject({id:'instagram:reel:9x16',width:1080,height:1920,staticTemplateSupported:true})
 })
 it('makes creation geometry a consequence of content type instead of platform chrome',()=>{
  expect(resolveCreativeFormat('YouTube','Feed')).toMatchObject({id:'youtube:feed:1x1',width:1080,height:1080})
  expect(resolveCreativeFormat('TikTok','Stories')).toMatchObject({id:'tiktok:story:9x16',width:1080,height:1920})
  expect(resolveCreativeFormat('Instagram','Carrossel')).toMatchObject({id:'instagram:carousel:1x1',width:1080,height:1080,staticTemplateSupported:false})
 })
 it('keeps historical formats readable without exposing them for new creation',()=>{
  expect(resolveCreativeFormat('YouTube','Post')).toMatchObject({id:'youtube:video:16x9',width:1920,height:1080})
  expect(resolveCreativeFormat('YouTube','Shorts')).toMatchObject({id:'youtube:short:9x16',staticTemplateSupported:false})
 })
 it('requires independent secondary media for split',()=>{const creative=createNewsCreative('Headline');creative.primarySlot={assetId:'a',url:'https://cdn.example/a.jpg',name:'a.jpg',mimeType:'image/jpeg',kind:'image',fit:'cover',zoom:1,positionX:50,positionY:50};creative.layout='split';expect(validateCreativeForFormat(creative,resolveCreativeFormat('Instagram','Feed'))).toContain('mídia secundária')})
})
