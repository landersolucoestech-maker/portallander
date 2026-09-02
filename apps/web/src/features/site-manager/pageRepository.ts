export type SitePageTemplate='editorial'
export type SitePageDraft={id:string;title:string;slug:string;template:SitePageTemplate;createdAt:string;updatedAt:string}
export type SitePageSectionDraft={id:string;name:string;slug:string}
export type SitePageSections=Record<string,SitePageSectionDraft[]>

const PAGES_KEY='portal-lander:cms:pages:local:v4'
const SECTIONS_KEY='portal-lander:cms:page-sections:v2'
const LEGACY_PAGE_KEYS=['portal-lander:cms:pages:local:v1','portal-lander:cms:pages:local:v2','portal-lander:cms:pages:local:v3','portal-lander:cms:page-sections:v1']
const LEGACY_SECTION_KEYS=[
  'portal-lander:cms:section-config:grid:v4','portal-lander:cms:section-config:ranking:v4','portal-lander:cms:section-config:most-read:v4','portal-lander:cms:section-config:secondary:v4','portal-lander:cms:section-config:trending:v4','portal-lander:cms:section-config:banner:v4','portal-lander:cms:section-config:videos:v4','portal-lander:cms:section-config:newsletter:v4','portal-lander:cms:section-config:grid:v1','portal-lander:cms:section-config:em-destaque:v1','portal-lander:cms:section-config:mais-lidas:v1','portal-lander:cms:section-config:ultimas-noticias:v1','portal-lander:cms:section-config:em-alta:v1','portal-lander:cms:section-config:horizontal-ad:v1','portal-lander:cms:section-config:secao-anuncie-aqui:v1','portal-lander:cms:section-config:releases:v1','portal-lander:cms:section-config:lancamentos:v1','portal-lander:cms:section-config:agenda:v1','portal-lander:cms:section-config:footer:v1','portal-lander:cms:section-config:rodape:v1',
]

const parse=<T>(key:string,fallback:T):T=>{try{const raw=localStorage.getItem(key);if(!raw)return fallback;return JSON.parse(raw) as T}catch{return fallback}}
const emit=()=>window.dispatchEvent(new CustomEvent('portal-lander:site-pages:changed'))
const unknownDate='1970-01-01T00:00:00.000Z'

export const normalizeSiteSlug=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')

const normalizeDraft=(value:unknown):SitePageDraft|null=>{
  if(!value||typeof value!=='object')return null
  const item=value as Partial<SitePageDraft>
  if(typeof item.id!=='string'||typeof item.title!=='string'||typeof item.slug!=='string')return null
  return {id:item.id,title:item.title,slug:item.slug,template:'editorial',createdAt:typeof item.createdAt==='string'?item.createdAt:unknownDate,updatedAt:typeof item.updatedAt==='string'?item.updatedAt:unknownDate}
}
const migrate=()=>{
  for(const key of ['portal-lander:cms:pages:local:v3','portal-lander:cms:pages:local:v2','portal-lander:cms:pages:local:v1']){
    const legacy=parse<unknown[]>(key,[]).map(normalizeDraft).filter((page):page is SitePageDraft=>Boolean(page))
    if(legacy.length){localStorage.setItem(PAGES_KEY,JSON.stringify(legacy));return legacy}
  }
  return []
}

export const sitePageRepository={
  eventName:'portal-lander:site-pages:changed',
  listDraftPages:():SitePageDraft[]=>{
    const current=parse<unknown[]>(PAGES_KEY,[]).map(normalizeDraft).filter((page):page is SitePageDraft=>Boolean(page))
    return current.length?current:migrate()
  },
  listSections:():SitePageSections=>parse<SitePageSections>(SECTIONS_KEY,{}),
  saveDraftPages(pages:SitePageDraft[]){localStorage.setItem(PAGES_KEY,JSON.stringify(pages));emit()},
  saveSections(sections:SitePageSections){localStorage.setItem(SECTIONS_KEY,JSON.stringify(sections));emit()},
  purgeLegacy(){for(const key of [...LEGACY_PAGE_KEYS,...LEGACY_SECTION_KEYS])if(key!==PAGES_KEY&&key!==SECTIONS_KEY)localStorage.removeItem(key)},
}
