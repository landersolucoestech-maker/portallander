export type HeroAppearanceConfig={
  active:boolean
  width:number
  height:number
  paddingX:number
  paddingY:number
  radius:number
  background:string
  textColor:string
  titleColor:string
  accentColor:string
  borderColor:string
  contentAlign:'left'|'center'|'right'
  verticalAlign:'start'|'center'|'end'
  eyebrowColor:string
  eyebrowSize:number
  eyebrowWeight:number
  descriptionSize:number
  descriptionWeight:number
  ctaSize:number
  ctaWeight:number
}

export const HERO_APPEARANCE_STORAGE_KEY='portal-lander:cms:section-config:hero:v5'
export const HERO_APPEARANCE_EVENT='portal-lander:hero-appearance-updated'
export const defaultHeroAppearance:HeroAppearanceConfig={
  active:true,width:100,height:560,paddingX:0,paddingY:0,radius:0,
  background:'#090909',textColor:'#ffffff',titleColor:'#ffffff',accentColor:'#ff151f',borderColor:'#090909',
  contentAlign:'left',verticalAlign:'center',eyebrowColor:'#ff151f',eyebrowSize:13,eyebrowWeight:800,descriptionSize:16,descriptionWeight:400,ctaSize:14,ctaWeight:800,
}

export function readHeroAppearance():HeroAppearanceConfig{
  try{const raw=localStorage.getItem(HERO_APPEARANCE_STORAGE_KEY);return raw?{...defaultHeroAppearance,...JSON.parse(raw)}:{...defaultHeroAppearance}}catch{return {...defaultHeroAppearance}}
}
export function writeHeroAppearance(config:HeroAppearanceConfig){
  localStorage.setItem(HERO_APPEARANCE_STORAGE_KEY,JSON.stringify(config))
  window.dispatchEvent(new CustomEvent(HERO_APPEARANCE_EVENT))
}
export function resetHeroAppearance(){
  localStorage.removeItem(HERO_APPEARANCE_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(HERO_APPEARANCE_EVENT))
}
