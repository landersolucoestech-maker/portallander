export type HeroBackgroundConfig={
  url:string
  mediaId:string
  fileName:string
  positionX:number
  positionY:number
}

export const HERO_BACKGROUND_STORAGE_KEY='portal-lander:home:hero:background:v1'
export const HERO_BACKGROUND_EVENT='portal-lander:hero-background-updated'
export const HERO_BACKGROUND_PREVIEW_EVENT='portal-lander:hero-background-preview'

export const defaultHeroBackground:HeroBackgroundConfig={
  url:'',
  mediaId:'',
  fileName:'',
  positionX:50,
  positionY:50,
}

const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value))

export function normalizeHeroBackground(raw:Partial<HeroBackgroundConfig>|null|undefined):HeroBackgroundConfig{
  return {
    url:typeof raw?.url==='string'?raw.url.trim():'',
    mediaId:typeof raw?.mediaId==='string'?raw.mediaId.trim():'',
    fileName:typeof raw?.fileName==='string'?raw.fileName.trim():'',
    positionX:Number.isFinite(raw?.positionX)?clamp(Number(raw?.positionX),0,100):50,
    positionY:Number.isFinite(raw?.positionY)?clamp(Number(raw?.positionY),0,100):50,
  }
}

export function readHeroBackground():HeroBackgroundConfig{
  if(typeof window==='undefined')return {...defaultHeroBackground}
  try{
    const raw=window.localStorage.getItem(HERO_BACKGROUND_STORAGE_KEY)
    return raw?normalizeHeroBackground(JSON.parse(raw)):normalizeHeroBackground(undefined)
  }catch{
    return normalizeHeroBackground(undefined)
  }
}

export function writeHeroBackground(config:HeroBackgroundConfig){
  if(typeof window==='undefined')return
  window.localStorage.setItem(HERO_BACKGROUND_STORAGE_KEY,JSON.stringify(normalizeHeroBackground(config)))
  window.dispatchEvent(new CustomEvent(HERO_BACKGROUND_EVENT))
}

export function previewHeroBackground(config:HeroBackgroundConfig){
  if(typeof window==='undefined')return
  window.dispatchEvent(new CustomEvent<HeroBackgroundConfig>(HERO_BACKGROUND_PREVIEW_EVENT,{detail:normalizeHeroBackground(config)}))
}

export function resetHeroBackground(){
  if(typeof window==='undefined')return
  window.localStorage.removeItem(HERO_BACKGROUND_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(HERO_BACKGROUND_EVENT))
}
