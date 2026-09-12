import {useEffect,useState,type CSSProperties} from 'react'
import {readSiteAppearanceConfig,SITE_APPEARANCE_UPDATED_EVENT,type SiteAppearanceConfig} from './models/siteAppearanceModel'

export function useSiteAppearance(){
  const [appearance,setAppearance]=useState<SiteAppearanceConfig>(()=>readSiteAppearanceConfig())
  useEffect(()=>{
    const refresh=()=>setAppearance(readSiteAppearanceConfig())
    window.addEventListener(SITE_APPEARANCE_UPDATED_EVENT,refresh)
    window.addEventListener('storage',refresh)
    return()=>{
      window.removeEventListener(SITE_APPEARANCE_UPDATED_EVENT,refresh)
      window.removeEventListener('storage',refresh)
    }
  },[])
  return appearance
}

export function siteAppearanceStyle(config:SiteAppearanceConfig){
  return {
    '--pl-site-background':config.backgroundColor,
    backgroundColor:config.backgroundColor,
  } as CSSProperties & {'--pl-site-background':string}
}
