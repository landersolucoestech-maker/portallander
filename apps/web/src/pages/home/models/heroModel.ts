import { heroPersistence } from './heroPersistence'
import {getRuntimeDataProvider} from '../../../shared/data/runtimeDataProvider'

export type HeroTitleSegment = {
  text: string
  emphasis: boolean
  color?: string
  visible?: boolean
  fontSize?: number
  fontWeight?: number
}
export type HeroTicker = { active: boolean; label: string; text: string; url: string }
export type HeroSlideStatus = 'active' | 'inactive'
export type HeroCta = { id:string; active:boolean; label:string; url:string; external:boolean; order:number; variant:'primary'|'secondary' }
export type HeroSlide = {
  id: string; status: HeroSlideStatus; order: number; eyebrow: string; eyebrowVisible?: boolean; category: string; title: HeroTitleSegment[]; description: string; descriptionVisible?: boolean; mediaCaption: string; mediaCaptionVisible?: boolean;
  image: string; imageVisible?: boolean; imageAlt: string; imagePositionX: number; imagePositionY: number; imageScale: number; imageOffsetX: number; imageOffsetY: number;
  primaryCtaLabel: string; primaryCtaUrl: string; secondaryCtaLabel: string; secondaryCtaUrl: string; ctas?:HeroCta[]; articleId: string; publishedAt: string; scheduledAt: string;
}
export type HeroCarouselConfig = { autoplay: boolean; intervalMs: number; ticker: HeroTicker; slides: HeroSlide[]; navigation?:'arrows-dots'|'dots'|'arrows'|'none' }
export type HeroArticleSource = { id: string; title: string; slug: string; category: string; summary: string; image: string; imageAlt: string; url: string }

type LegacyHero = Partial<HeroSlide> & { ticker?: Partial<HeroTicker> }

export const HERO_STORAGE_KEY='portal-lander:home:hero:slides:v2'
const LEGACY_HERO_STORAGE_KEY='portal-lander:home:hero'

export const heroArticles:HeroArticleSource[]=getRuntimeDataProvider().home.heroArticles()
export const defaultHeroSlide:HeroSlide=getRuntimeDataProvider().home.defaultHeroSlide()
export const defaultHeroConfig:HeroCarouselConfig=getRuntimeDataProvider().home.defaultHeroConfig()

function defaultCtas(slide:HeroSlide):HeroCta[]{
  return [
    {id:'primary',active:Boolean(slide.primaryCtaLabel),label:slide.primaryCtaLabel,url:slide.primaryCtaUrl,external:false,order:1,variant:'primary'},
    {id:'secondary',active:Boolean(slide.secondaryCtaLabel),label:slide.secondaryCtaLabel,url:slide.secondaryCtaUrl,external:false,order:2,variant:'secondary'},
  ]
}
function normalizeCtas(raw:HeroCta[]|undefined,base:HeroSlide):HeroCta[]{
  const source=Array.isArray(raw)&&raw.length?raw:defaultCtas(base)
  return source.map((cta,index)=>({id:String(cta.id||`cta-${index+1}`),active:cta.active!==false,label:String(cta.label||''),url:String(cta.url||''),external:Boolean(cta.external),order:Number(cta.order)||index+1,variant:cta.variant==='secondary'?'secondary':'primary'})).sort((a,b)=>a.order-b.order)
}
function normalizeSlide(raw:Partial<HeroSlide>|null|undefined,index=0):HeroSlide{
  const base={...defaultHeroSlide,id:index===0?defaultHeroSlide.id:`hero-slide-${Date.now()}-${index}`,order:index+1}
  if(!raw)return {...base,ctas:normalizeCtas(base.ctas,base)}
  const merged={...base,...raw,image:raw.image??base.image,mediaCaption:String(raw.mediaCaption??base.mediaCaption),eyebrowVisible:raw.eyebrowVisible!==false,descriptionVisible:raw.descriptionVisible!==false,mediaCaptionVisible:raw.mediaCaptionVisible!==false,imageVisible:raw.imageVisible!==false,title:Array.isArray(raw.title)&&raw.title.length?raw.title.map(segment=>({text:String(segment?.text??''),emphasis:Boolean(segment?.emphasis),color:segment?.color,visible:segment?.visible!==false,fontSize:segment?.fontSize,fontWeight:segment?.fontWeight})):base.title.map(segment=>({...segment,visible:segment.visible!==false}))}
  return {...merged,ctas:normalizeCtas(raw.ctas,merged)}
}
function normalizeConfig(raw:Partial<HeroCarouselConfig>|null|undefined):HeroCarouselConfig{
  if(!raw)return {...defaultHeroConfig,navigation:defaultHeroConfig.navigation||'arrows-dots',slides:defaultHeroConfig.slides.map((slide,index)=>normalizeSlide(slide,index))}
  const slides=Array.isArray(raw.slides)&&raw.slides.length?raw.slides.map((slide,index)=>normalizeSlide(slide,index)):defaultHeroConfig.slides.map((slide,index)=>normalizeSlide(slide,index))
  const navigation=raw.navigation==='dots'||raw.navigation==='arrows'||raw.navigation==='none'?'navigation' in raw?raw.navigation:'arrows-dots':'arrows-dots'
  return {...defaultHeroConfig,...raw,navigation,intervalMs:Math.max(3000,Number(raw.intervalMs)||defaultHeroConfig.intervalMs),ticker:{...defaultHeroConfig.ticker,...(raw.ticker||{})},slides}
}
function legacyToConfig(raw:unknown):HeroCarouselConfig{
  if(!raw||typeof raw!=='object')return defaultHeroConfig
  const legacy=raw as LegacyHero
  return normalizeConfig({slides:[normalizeSlide({...legacy,order:1,scheduledAt:''},0)],ticker:{...defaultHeroConfig.ticker,...(legacy.ticker||{})}})
}

export function readHeroConfig():HeroCarouselConfig{
  try{
    const value=heroPersistence.read(HERO_STORAGE_KEY)
    if(value)return normalizeConfig(JSON.parse(value))
    const legacy=heroPersistence.read(LEGACY_HERO_STORAGE_KEY)
    if(legacy)return legacyToConfig(JSON.parse(legacy))
  }catch{return normalizeConfig(structuredClone(defaultHeroConfig))}
  return normalizeConfig(structuredClone(defaultHeroConfig))
}
export function writeHeroConfig(config:HeroCarouselConfig){
  const normalized=normalizeConfig(config)
  heroPersistence.write(HERO_STORAGE_KEY,JSON.stringify(normalized))
  heroPersistence.notify()
}
export function resetHeroConfig(){
  heroPersistence.remove(HERO_STORAGE_KEY)
  heroPersistence.remove(LEGACY_HERO_STORAGE_KEY)
  heroPersistence.notify()
}
export function getRenderableHeroSlides(config=readHeroConfig()):HeroSlide[]{
  const now=Date.now()
  const active=config.slides.filter(slide=>{
    if(slide.status!=='active')return false
    const when=slide.scheduledAt||slide.publishedAt
    return !when||new Date(when).getTime()<=now
  }).sort((a,b)=>a.order-b.order)
  return active.length?active:[normalizeSlide(structuredClone(defaultHeroSlide))]
}
export function applyArticleToSlide(slide:HeroSlide,article:HeroArticleSource):HeroSlide{
  return {...slide,articleId:article.id,category:article.category,description:article.summary,image:article.image||slide.image,imageAlt:article.imageAlt||slide.imageAlt,primaryCtaUrl:article.url,ctas:(slide.ctas||defaultCtas(slide)).map(cta=>cta.variant==='primary'?{...cta,url:article.url}:cta)}
}
