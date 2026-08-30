import { heroPersistence } from './heroPersistence'
import {getRuntimeDataProvider} from '../../../shared/data/runtimeDataProvider'

export type HeroTitleSegment = { text: string; emphasis: boolean }
export type HeroTicker = { active: boolean; label: string; text: string; url: string }
export type HeroSlideStatus = 'active' | 'inactive'
export type HeroSlide = {
  id: string; status: HeroSlideStatus; order: number; eyebrow: string; category: string; title: HeroTitleSegment[]; description: string; mediaCaption: string;
  image: string; imageAlt: string; imagePositionX: number; imagePositionY: number; imageScale: number; imageOffsetX: number; imageOffsetY: number;
  primaryCtaLabel: string; primaryCtaUrl: string; secondaryCtaLabel: string; secondaryCtaUrl: string; articleId: string; publishedAt: string; scheduledAt: string;
}
export type HeroCarouselConfig = { autoplay: boolean; intervalMs: number; ticker: HeroTicker; slides: HeroSlide[] }
export type HeroArticleSource = { id: string; title: string; slug: string; category: string; summary: string; image: string; imageAlt: string; url: string }

type LegacyHero = Partial<HeroSlide> & { ticker?: Partial<HeroTicker> }

export const HERO_STORAGE_KEY='portal-lander:home:hero:slides:v2'
const LEGACY_HERO_STORAGE_KEY='portal-lander:home:hero'

export const heroArticles:HeroArticleSource[]=getRuntimeDataProvider().home.heroArticles()
export const defaultHeroSlide:HeroSlide=getRuntimeDataProvider().home.defaultHeroSlide()
export const defaultHeroConfig:HeroCarouselConfig=getRuntimeDataProvider().home.defaultHeroConfig()

function normalizeSlide(raw:Partial<HeroSlide>|null|undefined,index=0):HeroSlide{
  const base={...defaultHeroSlide,id:index===0?defaultHeroSlide.id:`hero-slide-${Date.now()}-${index}`,order:index+1}
  if(!raw)return base
  return {...base,...raw,image:raw.image||base.image,mediaCaption:String(raw.mediaCaption??base.mediaCaption),title:Array.isArray(raw.title)&&raw.title.length?raw.title.map(segment=>({text:String(segment?.text??''),emphasis:Boolean(segment?.emphasis)})):base.title}
}
function normalizeConfig(raw:Partial<HeroCarouselConfig>|null|undefined):HeroCarouselConfig{
  if(!raw)return defaultHeroConfig
  const slides=Array.isArray(raw.slides)&&raw.slides.length?raw.slides.map((slide,index)=>normalizeSlide(slide,index)):defaultHeroConfig.slides
  return {...defaultHeroConfig,...raw,intervalMs:Math.max(3000,Number(raw.intervalMs)||defaultHeroConfig.intervalMs),ticker:{...defaultHeroConfig.ticker,...(raw.ticker||{})},slides}
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
  }catch{return structuredClone(defaultHeroConfig)}
  return structuredClone(defaultHeroConfig)
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
  return active.length?active:[structuredClone(defaultHeroSlide)]
}
export function applyArticleToSlide(slide:HeroSlide,article:HeroArticleSource):HeroSlide{
  return {...slide,articleId:article.id,category:article.category,description:article.summary,image:article.image||slide.image,imageAlt:article.imageAlt||slide.imageAlt,primaryCtaUrl:article.url}
}
