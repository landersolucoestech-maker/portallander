import {describe,expect,it} from 'vitest'
import {resolveCreativeFormat,validateCreativeForFormat} from './formatRegistry'
import {createNewsCreative} from './templates'

describe('marketing creative formats',()=>{
 it('uses the primary platform/content type to resolve canonical dimensions',()=>{expect(resolveCreativeFormat('Instagram','Stories')).toMatchObject({width:1080,height:1920,staticTemplateSupported:true});expect(resolveCreativeFormat('Instagram','Feed')).toMatchObject({width:1080,height:1080})})
 it('does not fake static template support for video/carousel formats',()=>{expect(resolveCreativeFormat('TikTok','Post').staticTemplateSupported).toBe(false);expect(resolveCreativeFormat('Instagram','Reels').staticTemplateSupported).toBe(false);expect(resolveCreativeFormat('Instagram','Carrossel').staticTemplateSupported).toBe(false)})
 it('requires independent secondary media for split',()=>{const creative=createNewsCreative('Headline');creative.primarySlot={assetId:'a',url:'https://cdn.example/a.jpg',name:'a.jpg',mimeType:'image/jpeg',kind:'image',fit:'cover',zoom:1,positionX:50,positionY:50};creative.layout='split';expect(validateCreativeForFormat(creative,resolveCreativeFormat('Instagram','Feed'))).toContain('mídia secundária')})
})
