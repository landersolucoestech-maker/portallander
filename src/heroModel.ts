import heroDjStay from './hero-djstay.jpg'

export type HeroTitleSegment = { text: string; emphasis: boolean }
export type HeroTicker = { active: boolean; label: string; text: string; url: string }
export type HeroSlideStatus = 'active' | 'inactive'
export type HeroSlide = {
  id: string; status: HeroSlideStatus; order: number; eyebrow: string; category: string; title: HeroTitleSegment[]; description: string;
  image: string; imageAlt: string; imagePositionX: number; imagePositionY: number; imageScale: number; imageOffsetX: number; imageOffsetY: number;
  primaryCtaLabel: string; primaryCtaUrl: string; secondaryCtaLabel: string; secondaryCtaUrl: string; articleId: string; publishedAt: string; scheduledAt: string;
}
export type HeroCarouselConfig = { autoplay: boolean; intervalMs: number; ticker: HeroTicker; slides: HeroSlide[] }
export type HeroArticleSource = { id: string; title: string; slug: string; category: string; summary: string; image: string; imageAlt: string; url: string }

type LegacyHero = Partial<HeroSlide> & { ticker?: Partial<HeroTicker> }

export const HERO_STORAGE_KEY='portal-lander:home:hero:slides:v2'
const LEGACY_HERO_STORAGE_KEY='portal-lander:home:hero'

export const heroArticles:HeroArticleSource[]=[
  {id:'dj-stay-setembro',title:'DJ Stay anuncia novo projeto para setembro',slug:'dj-stay-novo-projeto-setembro',category:'Destaques',summary:'Notícias, polêmicas, lançamentos, bastidores e tudo que acontece no funk, na cultura urbana e no entretenimento.',image:heroDjStay,imageAlt:'DJ Stay em destaque no Portal Lander',url:'/destaques'},
  {id:'radar-lancamentos-agosto',title:'Radar de lançamentos: os sons que chegaram fortes nesta semana',slug:'radar-lancamentos-agosto',category:'Lançamentos',summary:'Singles, clipes e projetos que acabaram de chegar no funk e na cultura urbana.',image:'',imageAlt:'Destaque editorial de lançamentos do Portal Lander',url:'/lancamentos'},
]

export const defaultHeroSlide:HeroSlide={
  id:'dj-stay-main',status:'active',order:1,eyebrow:'PORTAL LANDER • EM DESTAQUE',category:'Destaques',
  title:[{text:'O QUE ESTÁ',emphasis:false},{text:'PEGANDO',emphasis:true},{text:'AGORA.',emphasis:true}],
  description:'Notícias, polêmicas, lançamentos, bastidores e tudo que acontece no funk, na cultura urbana e no entretenimento.',
  image:heroDjStay,imageAlt:'DJ Stay em destaque no Portal Lander',imagePositionX:50,imagePositionY:18,imageScale:1.04,imageOffsetX:0,imageOffsetY:18,
  primaryCtaLabel:'VER AGORA',primaryCtaUrl:'/noticias',secondaryCtaLabel:'EXPLORAR DESTAQUES',secondaryCtaUrl:'/destaques',articleId:'dj-stay-setembro',publishedAt:'2026-08-27T18:00',scheduledAt:'',
}

export const defaultHeroConfig:HeroCarouselConfig={
  autoplay:true,intervalMs:7000,
  ticker:{active:true,label:'AGORA',text:'Novos lançamentos, bastidores e assuntos que estão dominando a conversa.',url:'/noticias'},
  slides:[defaultHeroSlide],
}

function normalizeSlide(raw:Partial<HeroSlide>|null|undefined,index=0):HeroSlide{
  const base={...defaultHeroSlide,id:index===0?defaultHeroSlide.id:`hero-slide-${Date.now()}-${index}`,order:index+1}
  if(!raw)return base
  return {...base,...raw,image:raw.image||base.image,title:Array.isArray(raw.title)&&raw.title.length?raw.title.map(segment=>({text:String(segment?.text??''),emphasis:Boolean(segment?.emphasis)})):base.title}
}
function normalizeConfig(raw:Partial<HeroCarouselConfig>|null|undefined):HeroCarouselConfig{
  if(!raw)return defaultHeroConfig
  const slides=Array.isArray(raw.slides)&&raw.slides.length?raw.slides.map((slide,index)=>normalizeSlide(slide,index)):defaultHeroConfig.slides
  return {...defaultHeroConfig,...raw,intervalMs:Math.max(3000,Number(raw.intervalMs)||7000),ticker:{...defaultHeroConfig.ticker,...(raw.ticker||{})},slides}
}
function legacyToConfig(raw:unknown):HeroCarouselConfig{
  if(!raw||typeof raw!=='object')return defaultHeroConfig
  const legacy=raw as LegacyHero
  return normalizeConfig({slides:[normalizeSlide({...legacy,order:1,scheduledAt:''},0)],ticker:{...defaultHeroConfig.ticker,...(legacy.ticker||{})}})
}

export function readHeroConfig():HeroCarouselConfig{
  if(typeof window==='undefined')return defaultHeroConfig
  try{
    const value=window.localStorage.getItem(HERO_STORAGE_KEY)
    if(value)return normalizeConfig(JSON.parse(value))
    const legacy=window.localStorage.getItem(LEGACY_HERO_STORAGE_KEY)
    if(legacy)return legacyToConfig(JSON.parse(legacy))
  }catch{return defaultHeroConfig}
  return defaultHeroConfig
}
export function writeHeroConfig(config:HeroCarouselConfig){
  if(typeof window==='undefined')return
  const normalized=normalizeConfig(config)
  window.localStorage.setItem(HERO_STORAGE_KEY,JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent('portal-lander:hero-updated'))
}
export function resetHeroConfig(){
  if(typeof window==='undefined')return
  window.localStorage.removeItem(HERO_STORAGE_KEY)
  window.localStorage.removeItem(LEGACY_HERO_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('portal-lander:hero-updated'))
}
export function getRenderableHeroSlides(config=readHeroConfig()):HeroSlide[]{
  const now=Date.now()
  const active=config.slides.filter(slide=>{
    if(slide.status!=='active')return false
    const when=slide.scheduledAt||slide.publishedAt
    return !when||new Date(when).getTime()<=now
  }).sort((a,b)=>a.order-b.order)
  return active.length?active:[defaultHeroSlide]
}
export function applyArticleToSlide(slide:HeroSlide,article:HeroArticleSource):HeroSlide{
  return {...slide,articleId:article.id,category:article.category,description:article.summary,image:article.image||slide.image,imageAlt:article.imageAlt||slide.imageAlt,primaryCtaUrl:article.url}
}
