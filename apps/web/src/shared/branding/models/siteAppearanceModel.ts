export type SiteAppearanceConfig={
  backgroundColor:string
}

export const SITE_APPEARANCE_STORAGE_KEY='portal-lander:site:appearance:v1'
export const SITE_APPEARANCE_UPDATED_EVENT='portal-lander:site-appearance-updated'
export const defaultSiteAppearanceConfig:SiteAppearanceConfig={backgroundColor:'#050505'}

export function normalizeSiteBackgroundColor(value:string){
  const normalized=value.trim().toUpperCase()
  return /^#[0-9A-F]{6}$/.test(normalized)?normalized:null
}

export function readSiteAppearanceConfig():SiteAppearanceConfig{
  if(typeof window==='undefined')return defaultSiteAppearanceConfig
  try{
    const raw=window.localStorage.getItem(SITE_APPEARANCE_STORAGE_KEY)
    if(!raw)return defaultSiteAppearanceConfig
    const stored=JSON.parse(raw) as Partial<SiteAppearanceConfig>
    const backgroundColor=normalizeSiteBackgroundColor(stored.backgroundColor??'')
    return {backgroundColor:backgroundColor??defaultSiteAppearanceConfig.backgroundColor}
  }catch{return defaultSiteAppearanceConfig}
}

export function writeSiteAppearanceConfig(config:SiteAppearanceConfig){
  if(typeof window==='undefined')return
  const backgroundColor=normalizeSiteBackgroundColor(config.backgroundColor)
  if(!backgroundColor)throw new Error('Invalid site background color')
  window.localStorage.setItem(SITE_APPEARANCE_STORAGE_KEY,JSON.stringify({backgroundColor}))
  window.dispatchEvent(new CustomEvent(SITE_APPEARANCE_UPDATED_EVENT))
}

export function resetSiteAppearanceConfig(){
  if(typeof window==='undefined')return
  window.localStorage.removeItem(SITE_APPEARANCE_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(SITE_APPEARANCE_UPDATED_EVENT))
}
