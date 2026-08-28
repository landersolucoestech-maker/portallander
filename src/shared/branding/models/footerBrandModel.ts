import { portalLogo } from './brandAsset'

export type FooterBrandConfig={
  active:boolean
  image:string
  imageAlt:string
  width:number
}

export const FOOTER_BRAND_STORAGE_KEY='portal-lander:footer:brand:v1'

export const defaultFooterBrandConfig:FooterBrandConfig={
  active:true,
  image:portalLogo,
  imageAlt:'Portal Lander',
  width:112,
}

export function readFooterBrandConfig():FooterBrandConfig{
  if(typeof window==='undefined')return defaultFooterBrandConfig
  try{
    const raw=window.localStorage.getItem(FOOTER_BRAND_STORAGE_KEY)
    return raw?{...defaultFooterBrandConfig,...JSON.parse(raw)}:defaultFooterBrandConfig
  }catch{return defaultFooterBrandConfig}
}

export function writeFooterBrandConfig(config:FooterBrandConfig){
  if(typeof window==='undefined')return
  window.localStorage.setItem(FOOTER_BRAND_STORAGE_KEY,JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('portal-lander:footer-brand-updated'))
}

export function resetFooterBrandConfig(){
  if(typeof window==='undefined')return
  window.localStorage.removeItem(FOOTER_BRAND_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('portal-lander:footer-brand-updated'))
}
