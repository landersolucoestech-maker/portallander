import { portalLogo } from '../assets/brandAsset'
import { headerBrandPersistence } from './headerBrandPersistence'

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
  try{
    const raw=headerBrandPersistence.read(HEADER_BRAND_STORAGE_KEY)
    if(!raw)return defaultHeaderBrandConfig
    return {...defaultHeaderBrandConfig,...JSON.parse(raw)}
  }catch{return defaultHeaderBrandConfig}
}

export function writeHeaderBrandConfig(config:HeaderBrandConfig){
  headerBrandPersistence.write(HEADER_BRAND_STORAGE_KEY,JSON.stringify(config))
  headerBrandPersistence.notify()
}

export function resetHeaderBrandConfig(){
  headerBrandPersistence.remove(HEADER_BRAND_STORAGE_KEY)
  headerBrandPersistence.notify()
}
