import type {CSSProperties} from 'react'
import type {SectionConfiguration,SectionHeroViewport} from './sectionConfiguration'

export type AdvertisingAlignment='left'|'center'|'right'
export type AdvertisingImageFit='cover'|'contain'
export type AdvertisingLinkTarget='same'|'new'

export type AdvertisingSectionLayout={
  adLayoutVersion:number
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
  adImageAlt:string
  adLinkEnabled:boolean
  adLinkTarget:AdvertisingLinkTarget
}

export type AdvertisingSectionConfiguration=SectionConfiguration&AdvertisingSectionLayout

const CURRENT_AD_LAYOUT_VERSION=4
const sharedDefaults:AdvertisingSectionLayout={
  adLayoutVersion:CURRENT_AD_LAYOUT_VERSION,
  adWidthDesktop:0,adWidthTablet:0,adWidthMobile:0,
  adHeightDesktop:0,adHeightTablet:0,adHeightMobile:0,
  adAlignDesktop:'center',adAlignTablet:'center',adAlignMobile:'center',
  adMarginXDesktop:0,adMarginXTablet:0,adMarginXMobile:0,
  adMarginYDesktop:0,adMarginYTablet:0,adMarginYMobile:0,
  adPaddingXDesktop:0,adPaddingXTablet:0,adPaddingXMobile:0,
  adPaddingYDesktop:0,adPaddingYTablet:0,adPaddingYMobile:0,
  adOffsetXDesktop:0,adOffsetXTablet:0,adOffsetXMobile:0,
  adOffsetYDesktop:0,adOffsetYTablet:0,adOffsetYMobile:0,
  adImageFit:'contain',adImageAlt:'Publicidade Portal Lander',adLinkEnabled:true,adLinkTarget:'same',
}
const sidebarDefaults:AdvertisingSectionLayout={...sharedDefaults,adImageAlt:'Publicidade lateral Portal Lander'}
const bannerDefaults:AdvertisingSectionLayout={...sharedDefaults,adImageAlt:'Publicidade Anuncie Aqui'}

export function defaultAdvertisingSectionLayout(sectionId:string):AdvertisingSectionLayout{
  return structuredClone(sectionId==='publicidade-lateral'?sidebarDefaults:bannerDefaults)
}

function migrateLegacyLayout(config:SectionConfiguration,sectionId:string):Partial<AdvertisingSectionLayout>{
  const raw=config as SectionConfiguration&Partial<AdvertisingSectionLayout>&{adImageFit?:string}
  const defaults=defaultAdvertisingSectionLayout(sectionId)
  return {
    ...defaults,
    ...raw,
    adLayoutVersion:CURRENT_AD_LAYOUT_VERSION,
    adImageFit:raw.adImageFit==='cover'?'cover':'contain',
    adImageAlt:raw.adImageAlt||defaults.adImageAlt,
    adWidthTablet:0,adWidthMobile:0,adHeightTablet:0,adHeightMobile:0,
    adAlignTablet:'center',adAlignMobile:'center',
    adMarginXTablet:0,adMarginXMobile:0,adMarginYTablet:0,adMarginYMobile:0,
    adPaddingXTablet:0,adPaddingXMobile:0,adPaddingYTablet:0,adPaddingYMobile:0,
    adOffsetXTablet:0,adOffsetXMobile:0,adOffsetYTablet:0,adOffsetYMobile:0,
  }
}

export function withAdvertisingSectionLayout(config:SectionConfiguration,sectionId:string):AdvertisingSectionConfiguration{
  return {...config,...migrateLegacyLayout(config,sectionId)} as AdvertisingSectionConfiguration
}

const alignmentValue=(value:AdvertisingAlignment)=>value==='left'?'start':value==='right'?'end':'center'
const sizeValue=(value:number,kind:'width'|'height')=>value>0?`${value}px`:kind==='width'?'100%':'auto'

export function advertisingViewportLayout(config:AdvertisingSectionConfiguration,viewport:SectionHeroViewport){
  if(viewport!=='desktop')return {width:0,height:0,align:'center' as AdvertisingAlignment,marginX:0,marginY:0,paddingX:0,paddingY:0,offsetX:0,offsetY:0}
  return {
    width:config.adWidthDesktop,
    height:config.adHeightDesktop,
    align:config.adAlignDesktop,
    marginX:config.adMarginXDesktop,
    marginY:config.adMarginYDesktop,
    paddingX:config.adPaddingXDesktop,
    paddingY:config.adPaddingYDesktop,
    offsetX:config.adOffsetXDesktop,
    offsetY:config.adOffsetYDesktop,
  }
}

export function advertisingResponsiveCssVariables(config:AdvertisingSectionConfiguration):CSSProperties{
  return {
    '--pl-ad-width-desktop':sizeValue(config.adWidthDesktop,'width'),
    '--pl-ad-width-tablet':'100%',
    '--pl-ad-width-mobile':'100%',
    '--pl-ad-height-desktop':sizeValue(config.adHeightDesktop,'height'),
    '--pl-ad-height-tablet':'auto',
    '--pl-ad-height-mobile':'auto',
    '--pl-ad-align-desktop':alignmentValue(config.adAlignDesktop),
    '--pl-ad-align-tablet':'center','--pl-ad-align-mobile':'center',
    '--pl-ad-margin-x-desktop':`${config.adMarginXDesktop}px`,'--pl-ad-margin-x-tablet':'0px','--pl-ad-margin-x-mobile':'0px',
    '--pl-ad-margin-y-desktop':`${config.adMarginYDesktop}px`,'--pl-ad-margin-y-tablet':'0px','--pl-ad-margin-y-mobile':'0px',
    '--pl-ad-padding-x-desktop':`${config.adPaddingXDesktop}px`,'--pl-ad-padding-x-tablet':'0px','--pl-ad-padding-x-mobile':'0px',
    '--pl-ad-padding-y-desktop':`${config.adPaddingYDesktop}px`,'--pl-ad-padding-y-tablet':'0px','--pl-ad-padding-y-mobile':'0px',
    '--pl-ad-offset-x-desktop':`${config.adOffsetXDesktop}px`,'--pl-ad-offset-x-tablet':'0px','--pl-ad-offset-x-mobile':'0px',
    '--pl-ad-offset-y-desktop':`${config.adOffsetYDesktop}px`,'--pl-ad-offset-y-tablet':'0px','--pl-ad-offset-y-mobile':'0px',
  } as CSSProperties
}
