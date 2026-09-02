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

const CURRENT_AD_LAYOUT_VERSION=3

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
  const migrated={...(raw as Partial<AdvertisingSectionLayout>),adLayoutVersion:CURRENT_AD_LAYOUT_VERSION,adImageFit:raw.adImageFit==='cover'?'cover':'contain',adImageAlt:raw.adImageAlt||defaultAdvertisingSectionLayout(sectionId).adImageAlt} as Partial<AdvertisingSectionLayout>
  if((raw.adLayoutVersion||0)>=2)return migrated
  if(sectionId==='publicidade-lateral'){
    const matchesOldPreset=(raw.adWidthDesktop===300||raw.adWidthDesktop==null)&&(raw.adHeightDesktop===600||raw.adHeightDesktop==null)&&(raw.adHeightTablet===420||raw.adHeightTablet==null)&&(raw.adHeightMobile===360||raw.adHeightMobile==null)
    if(matchesOldPreset){migrated.adWidthDesktop=0;migrated.adWidthTablet=0;migrated.adWidthMobile=0;migrated.adHeightDesktop=0;migrated.adHeightTablet=0;migrated.adHeightMobile=0}
  }else{
    const matchesOldPreset=(raw.adHeightDesktop===360||raw.adHeightDesktop==null)&&(raw.adHeightTablet===320||raw.adHeightTablet==null)&&(raw.adHeightMobile===280||raw.adHeightMobile==null)
    if(matchesOldPreset){migrated.adWidthDesktop=0;migrated.adWidthTablet=0;migrated.adWidthMobile=0;migrated.adHeightDesktop=0;migrated.adHeightTablet=0;migrated.adHeightMobile=0}
  }
  return migrated
}

export function withAdvertisingSectionLayout(config:SectionConfiguration,sectionId:string):AdvertisingSectionConfiguration{
  return {...config,...defaultAdvertisingSectionLayout(sectionId),...migrateLegacyLayout(config,sectionId)} as AdvertisingSectionConfiguration
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
