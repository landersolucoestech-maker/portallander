import heroDjStay from './hero-djstay.jpg'

export type HeroTitleSegment = { text: string; emphasis: boolean }
export type HeroTicker = { active: boolean; label: string; text: string; url: string }
export type HeroHighlight = {
  id: string; status: 'active' | 'inactive'; eyebrow: string; category: string; title: HeroTitleSegment[]; description: string;
  image: string; imageAlt: string; imagePositionX: number; imagePositionY: number; imageScale: number; imageOffsetX: number; imageOffsetY: number;
  primaryCtaLabel: string; primaryCtaUrl: string; secondaryCtaLabel: string; secondaryCtaUrl: string; articleId: string; backgroundImage: string;
  overlay: number; publishedAt: string; ticker: HeroTicker
}
export type HeroArticleSource = { id: string; title: string; slug: string; category: string; summary: string; image: string; imageAlt: string; url: string }

export const HERO_STORAGE_KEY='portal-lander:home:hero'
export const HERO_LAST_PUBLISHED_KEY='portal-lander:home:hero:last-published'

export const heroArticles:HeroArticleSource[]=[
  {id:'dj-stay-setembro',title:'DJ Stay anuncia novo projeto para setembro',slug:'dj-stay-novo-projeto-setembro',category:'Destaques',summary:'Notícias, polêmicas, lançamentos, bastidores e tudo que acontece no funk, na cultura urbana e no entretenimento.',image:heroDjStay,imageAlt:'DJ Stay em destaque no Portal Lander',url:'/destaques'},
  {id:'radar-lancamentos-agosto',title:'Radar de lançamentos: os sons que chegaram fortes nesta semana',slug:'radar-lancamentos-agosto',category:'Lançamentos',summary:'Singles, clipes e projetos que acabaram de chegar no funk e na cultura urbana.',image:'',imageAlt:'Destaque editorial de lançamentos do Portal Lander',url:'/lancamentos'},
]

export const defaultHeroHighlight:HeroHighlight={
  id:'home-main-hero',status:'active',eyebrow:'PORTAL LANDER • EM DESTAQUE',category:'Destaques',
  title:[{text:'O QUE ESTÁ',emphasis:false},{text:'PEGANDO',emphasis:true},{text:'AGORA.',emphasis:true}],
  description:'Notícias, polêmicas, lançamentos, bastidores e tudo que acontece no funk, na cultura urbana e no entretenimento.',
  image:heroDjStay,imageAlt:'DJ Stay em destaque no Portal Lander',imagePositionX:50,imagePositionY:18,imageScale:1.04,imageOffsetX:0,imageOffsetY:18,
  primaryCtaLabel:'VER AGORA',primaryCtaUrl:'/noticias',secondaryCtaLabel:'EXPLORAR DESTAQUES',secondaryCtaUrl:'/destaques',articleId:'dj-stay-setembro',backgroundImage:'',overlay:.46,publishedAt:'2026-08-27T18:00',
  ticker:{active:true,label:'AGORA',text:'Novos lançamentos, bastidores e assuntos que estão dominando a conversa.',url:'/noticias'},
}

function normalize(raw:Partial<HeroHighlight>|null|undefined):HeroHighlight{
  if(!raw)return defaultHeroHighlight
  return {...defaultHeroHighlight,...raw,image:raw.image||defaultHeroHighlight.image,title:Array.isArray(raw.title)&&raw.title.length?raw.title.map(segment=>({text:String(segment?.text??''),emphasis:Boolean(segment?.emphasis)})):defaultHeroHighlight.title,ticker:{...defaultHeroHighlight.ticker,...(raw.ticker||{})}}
}
export function readHeroHighlight():HeroHighlight{if(typeof window==='undefined')return defaultHeroHighlight;try{const value=window.localStorage.getItem(HERO_STORAGE_KEY);return value?normalize(JSON.parse(value)):defaultHeroHighlight}catch{return defaultHeroHighlight}}
export function readRenderableHero():HeroHighlight{const configured=readHeroHighlight();const publishTime=configured.publishedAt?new Date(configured.publishedAt).getTime():0;const due=!publishTime||publishTime<=Date.now();if(configured.status==='active'&&due)return configured;if(typeof window!=='undefined'){try{const fallback=window.localStorage.getItem(HERO_LAST_PUBLISHED_KEY);if(fallback)return normalize(JSON.parse(fallback))}catch{}}return defaultHeroHighlight}
export function writeHeroHighlight(hero:HeroHighlight){if(typeof window==='undefined')return;const normalized=normalize(hero);window.localStorage.setItem(HERO_STORAGE_KEY,JSON.stringify(normalized));const publishTime=normalized.publishedAt?new Date(normalized.publishedAt).getTime():0;if(normalized.status==='active'&&(!publishTime||publishTime<=Date.now()))window.localStorage.setItem(HERO_LAST_PUBLISHED_KEY,JSON.stringify(normalized));window.dispatchEvent(new CustomEvent('portal-lander:hero-updated'))}
export function resetHeroHighlight(){if(typeof window==='undefined')return;window.localStorage.removeItem(HERO_STORAGE_KEY);window.localStorage.removeItem(HERO_LAST_PUBLISHED_KEY);window.dispatchEvent(new CustomEvent('portal-lander:hero-updated'))}
export function applyArticleToHero(hero:HeroHighlight,article:HeroArticleSource):HeroHighlight{return {...hero,articleId:article.id,category:article.category,description:article.summary,image:article.image||hero.image,imageAlt:article.imageAlt||hero.imageAlt,primaryCtaUrl:article.url}}
