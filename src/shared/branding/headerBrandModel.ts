import { portalLogo } from './brandAsset'

export type HeaderBrandAlignment='left'|'center'|'right'
export type HeaderBrandConfig={
  active:boolean
  deleted:boolean
  image:string
  imageAlt:string
  width:number
  height:number
  link:string
  alignment:HeaderBrandAlignment
}

export const HEADER_BRAND_STORAGE_KEY='portal-lander:header:brand:v1'

export const defaultHeaderBrandConfig:HeaderBrandConfig={
  active:true,
  deleted:false,
  image:portalLogo,
  imageAlt:'Portal Lander',
  width:150,
  height:58,
  link:'/',
  alignment:'left',
}

export function readHeaderBrandConfig():HeaderBrandConfig{
  if(typeof window==='undefined')return defaultHeaderBrandConfig
  try{
    const raw=window.localStorage.getItem(HEADER_BRAND_STORAGE_KEY)
    if(!raw)return defaultHeaderBrandConfig
    return {...defaultHeaderBrandConfig,...JSON.parse(raw)}
  }catch{return defaultHeaderBrandConfig}
}

export function writeHeaderBrandConfig(config:HeaderBrandConfig){
  if(typeof window==='undefined')return
  window.localStorage.setItem(HEADER_BRAND_STORAGE_KEY,JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('portal-lander:header-brand-updated'))
}

export function resetHeaderBrandConfig(){
  if(typeof window==='undefined')return
  window.localStorage.removeItem(HEADER_BRAND_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('portal-lander:header-brand-updated'))
}
