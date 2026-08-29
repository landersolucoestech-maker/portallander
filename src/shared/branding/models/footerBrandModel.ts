import { portalLogo } from '../assets/brandAsset'
import { footerBrandPersistence } from './footerBrandPersistence'

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
  try{
    const raw=footerBrandPersistence.read(FOOTER_BRAND_STORAGE_KEY)
    return raw?{...defaultFooterBrandConfig,...JSON.parse(raw)}:defaultFooterBrandConfig
  }catch{return defaultFooterBrandConfig}
}

export function writeFooterBrandConfig(config:FooterBrandConfig){
  footerBrandPersistence.write(FOOTER_BRAND_STORAGE_KEY,JSON.stringify(config))
  footerBrandPersistence.notify()
}

export function resetFooterBrandConfig(){
  footerBrandPersistence.remove(FOOTER_BRAND_STORAGE_KEY)
  footerBrandPersistence.notify()
}
