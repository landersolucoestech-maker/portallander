export type SitePageDraft={id:string;title:string;slug:string}
export type SitePageSectionDraft={id:string;name:string;slug:string}
export type SitePageSections=Record<string,SitePageSectionDraft[]>

const PAGES_KEY='portal-lander:cms:pages:local:v2'
const SECTIONS_KEY='portal-lander:cms:page-sections:v2'
const LEGACY_PAGE_KEYS=['portal-lander:cms:pages:local:v1','portal-lander:cms:page-sections:v1']
const LEGACY_SECTION_KEYS=[
  'portal-lander:cms:section-config:grid:v4','portal-lander:cms:section-config:ranking:v4','portal-lander:cms:section-config:most-read:v4','portal-lander:cms:section-config:secondary:v4','portal-lander:cms:section-config:trending:v4','portal-lander:cms:section-config:banner:v4','portal-lander:cms:section-config:videos:v4','portal-lander:cms:section-config:newsletter:v4','portal-lander:cms:section-config:grid:v1','portal-lander:cms:section-config:em-destaque:v1','portal-lander:cms:section-config:mais-lidas:v1','portal-lander:cms:section-config:ultimas-noticias:v1','portal-lander:cms:section-config:em-alta:v1','portal-lander:cms:section-config:horizontal-ad:v1','portal-lander:cms:section-config:secao-anuncie-aqui:v1','portal-lander:cms:section-config:releases:v1','portal-lander:cms:section-config:lancamentos:v1','portal-lander:cms:section-config:agenda:v1','portal-lander:cms:section-config:footer:v1','portal-lander:cms:section-config:rodape:v1',
]

const parse=<T>(key:string,fallback:T):T=>{try{const raw=localStorage.getItem(key);if(!raw)return fallback;return JSON.parse(raw) as T}catch{return fallback}}
const emit=()=>window.dispatchEvent(new CustomEvent('portal-lander:site-pages:changed'))

export const normalizeSiteSlug=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')

export const sitePageRepository={
  eventName:'portal-lander:site-pages:changed',
  listDraftPages:():SitePageDraft[]=>parse<SitePageDraft[]>(PAGES_KEY,[]),
  listSections:():SitePageSections=>parse<SitePageSections>(SECTIONS_KEY,{}),
  saveDraftPages(pages:SitePageDraft[]){localStorage.setItem(PAGES_KEY,JSON.stringify(pages));emit()},
  saveSections(sections:SitePageSections){localStorage.setItem(SECTIONS_KEY,JSON.stringify(sections));emit()},
  purgeLegacy(){for(const key of [...LEGACY_PAGE_KEYS,...LEGACY_SECTION_KEYS])localStorage.removeItem(key)},
}
