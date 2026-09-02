import type {CSSProperties} from 'react'
import type {SectionConfiguration,SectionHeroViewport} from './sectionConfiguration'

export type AdvertisingAlignment='left'|'center'|'right'
export type AdvertisingImageFit='cover'|'contain'|'fill'
export type AdvertisingLinkTarget='same'|'new'

export type AdvertisingSectionLayout={
  adWidthDesktop:number
  adWidthTablet:number
  adWidthMobile:number
  adHeightDesktop:number
  adHeightTablet:number
  adHeightMobile:number
  adAlignDesktop:AdvertisingAlignment
  adAlignTablet:AdvertisingAlignment
  adAlignMobile:AdvertisingAlignment
  adMarginXDesktop:number
  adMarginXTablet:number
  adMarginXMobile:number
  adMarginYDesktop:number
  adMarginYTablet:number
  adMarginYMobile:number
  adPaddingXDesktop:number
  adPaddingXTablet:number
  adPaddingXMobile:number
  adPaddingYDesktop:number
  adPaddingYTablet:number
  adPaddingYMobile:number
  adOffsetXDesktop:number
  adOffsetXTablet:number
  adOffsetXMobile:number
  adOffsetYDesktop:number
  adOffsetYTablet:number
  adOffsetYMobile:number
  adImageFit:AdvertisingImageFit
  adLinkEnabled:boolean
  adLinkTarget:AdvertisingLinkTarget
}

export type AdvertisingSectionConfiguration=SectionConfiguration&AdvertisingSectionLayout

const sidebarDefaults:AdvertisingSectionLayout={
  adWidthDesktop:300,adWidthTablet:0,adWidthMobile:0,
  adHeightDesktop:600,adHeightTablet:420,adHeightMobile:360,
  adAlignDesktop:'center',adAlignTablet:'center',adAlignMobile:'center',
  adMarginXDesktop:0,adMarginXTablet:0,adMarginXMobile:0,
  adMarginYDesktop:0,adMarginYTablet:0,adMarginYMobile:0,
  adPaddingXDesktop:0,adPaddingXTablet:0,adPaddingXMobile:0,
  adPaddingYDesktop:0,adPaddingYTablet:0,adPaddingYMobile:0,
  adOffsetXDesktop:0,adOffsetXTablet:0,adOffsetXMobile:0,
  adOffsetYDesktop:0,adOffsetYTablet:0,adOffsetYMobile:0,
  adImageFit:'contain',adLinkEnabled:true,adLinkTarget:'same',
}

const bannerDefaults:AdvertisingSectionLayout={
  ...sidebarDefaults,
  adWidthDesktop:0,adWidthTablet:0,adWidthMobile:0,
  adHeightDesktop:360,adHeightTablet:320,adHeightMobile:280,
  adImageFit:'contain',
}

export function defaultAdvertisingSectionLayout(sectionId:string):AdvertisingSectionLayout{
  return structuredClone(sectionId==='publicidade-lateral'?sidebarDefaults:bannerDefaults)
}

export function withAdvertisingSectionLayout(config:SectionConfiguration,sectionId:string):AdvertisingSectionConfiguration{
  return {...defaultAdvertisingSectionLayout(sectionId),...(config as AdvertisingSectionConfiguration)}
}

const suffix=(viewport:SectionHeroViewport)=>viewport==='desktop'?'Desktop':viewport==='tablet'?'Tablet':'Mobile'
const alignmentValue=(value:AdvertisingAlignment)=>value==='left'?'start':value==='right'?'end':'center'
const sizeValue=(value:number,kind:'width'|'height')=>value>0?`${value}px`:kind==='width'?'100%':'auto'

export function advertisingViewportLayout(config:AdvertisingSectionConfiguration,viewport:SectionHeroViewport){
  const key=suffix(viewport)
  const read=(prefix:string)=>config[`${prefix}${key}` as keyof AdvertisingSectionConfiguration] as number|AdvertisingAlignment
  return {
    width:read('adWidth') as number,
    height:read('adHeight') as number,
    align:read('adAlign') as AdvertisingAlignment,
    marginX:read('adMarginX') as number,
    marginY:read('adMarginY') as number,
    paddingX:read('adPaddingX') as number,
    paddingY:read('adPaddingY') as number,
    offsetX:read('adOffsetX') as number,
    offsetY:read('adOffsetY') as number,
  }
}

export function advertisingResponsiveCssVariables(config:AdvertisingSectionConfiguration):CSSProperties{
  return {
    '--pl-ad-width-desktop':sizeValue(config.adWidthDesktop,'width'),
    '--pl-ad-width-tablet':sizeValue(config.adWidthTablet,'width'),
    '--pl-ad-width-mobile':sizeValue(config.adWidthMobile,'width'),
    '--pl-ad-height-desktop':sizeValue(config.adHeightDesktop,'height'),
    '--pl-ad-height-tablet':sizeValue(config.adHeightTablet,'height'),
    '--pl-ad-height-mobile':sizeValue(config.adHeightMobile,'height'),
    '--pl-ad-align-desktop':alignmentValue(config.adAlignDesktop),
    '--pl-ad-align-tablet':alignmentValue(config.adAlignTablet),
    '--pl-ad-align-mobile':alignmentValue(config.adAlignMobile),
    '--pl-ad-margin-x-desktop':`${config.adMarginXDesktop}px`,
    '--pl-ad-margin-x-tablet':`${config.adMarginXTablet}px`,
    '--pl-ad-margin-x-mobile':`${config.adMarginXMobile}px`,
    '--pl-ad-margin-y-desktop':`${config.adMarginYDesktop}px`,
    '--pl-ad-margin-y-tablet':`${config.adMarginYTablet}px`,
    '--pl-ad-margin-y-mobile':`${config.adMarginYMobile}px`,
    '--pl-ad-padding-x-desktop':`${config.adPaddingXDesktop}px`,
    '--pl-ad-padding-x-tablet':`${config.adPaddingXTablet}px`,
    '--pl-ad-padding-x-mobile':`${config.adPaddingXMobile}px`,
    '--pl-ad-padding-y-desktop':`${config.adPaddingYDesktop}px`,
    '--pl-ad-padding-y-tablet':`${config.adPaddingYTablet}px`,
    '--pl-ad-padding-y-mobile':`${config.adPaddingYMobile}px`,
    '--pl-ad-offset-x-desktop':`${config.adOffsetXDesktop}px`,
    '--pl-ad-offset-x-tablet':`${config.adOffsetXTablet}px`,
    '--pl-ad-offset-x-mobile':`${config.adOffsetXMobile}px`,
    '--pl-ad-offset-y-desktop':`${config.adOffsetYDesktop}px`,
    '--pl-ad-offset-y-tablet':`${config.adOffsetYTablet}px`,
    '--pl-ad-offset-y-mobile':`${config.adOffsetYMobile}px`,
  } as CSSProperties
}
