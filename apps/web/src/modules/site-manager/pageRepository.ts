export type SitePageTemplate='editorial'
export type SitePageDraft={id:string;title:string;slug:string;template:SitePageTemplate;createdAt?:string;updatedAt?:string;overridesSystem?:boolean}
export type SitePageSectionDraft={id:string;name:string;slug:string}
export type SitePageSections=Record<string,SitePageSectionDraft[]>

const PAGES_KEY='portal-lander:cms:pages:local:v5'
const SECTIONS_KEY='portal-lander:cms:page-sections:v2'
const HIDDEN_PAGES_KEY='portal-lander:cms:pages:hidden:v1'
const HOME_SECTIONS_INITIALIZED_KEY='portal-lander:cms:home-sections:initialized:v1'
const LEGACY_PAGE_KEYS=['portal-lander:cms:pages:local:v1','portal-lander:cms:pages:local:v2','portal-lander:cms:pages:local:v3','portal-lander:cms:pages:local:v4','portal-lander:cms:page-sections:v1']
const LEGACY_SECTION_KEYS=[
  'portal-lander:cms:section-config:grid:v4','portal-lander:cms:section-config:ranking:v4','portal-lander:cms:section-config:most-read:v4','portal-lander:cms:section-config:secondary:v4','portal-lander:cms:section-config:trending:v4','portal-lander:cms:section-config:banner:v4','portal-lander:cms:section-config:videos:v4','portal-lander:cms:section-config:newsletter:v4','portal-lander:cms:section-config:grid:v1','portal-lander:cms:section-config:em-destaque:v1','portal-lander:cms:section-config:mais-lidas:v1','portal-lander:cms:section-config:ultimas-noticias:v1','portal-lander:cms:section-config:em-alta:v1','portal-lander:cms:section-config:horizontal-ad:v1','portal-lander:cms:section-config:secao-anuncie-aqui:v1','portal-lander:cms:section-config:releases:v1','portal-lander:cms:section-config:lancamentos:v1','portal-lander:cms:section-config:agenda:v1','portal-lander:cms:section-config:footer:v1','portal-lander:cms:section-config:rodape:v1',
]

const CANONICAL_HOME_SECTION_SLUGS=new Set([
  'em-destaque','mais-lidas','ultimas-noticias','publicidade-lateral','em-alta','anuncie-aqui','lancamentos','agenda',
])
const CANONICAL_HOME_SECTION_IDS=new Set([
  'home-em-destaque','home-mais-lidas','home-ultimas-noticias','home-publicidade-lateral','home-em-alta','home-anuncie-aqui','home-lancamentos','home-agenda',
])

const parse=<T>(key:string,fallback:T):T=>{try{const raw=localStorage.getItem(key);if(!raw)return fallback;return JSON.parse(raw) as T}catch{return fallback}}
const emit=()=>window.dispatchEvent(new CustomEvent('portal-lander:site-pages:changed'))

export const normalizeSiteSlug=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')

const normalizeDraft=(value:unknown):SitePageDraft|null=>{
  if(!value||typeof value!=='object')return null
  const item=value as Partial<SitePageDraft>
  if(typeof item.id!=='string'||typeof item.title!=='string'||typeof item.slug!=='string')return null
  return {id:item.id,title:item.title,slug:item.slug,template:'editorial',createdAt:typeof item.createdAt==='string'?item.createdAt:undefined,updatedAt:typeof item.updatedAt==='string'?item.updatedAt:undefined,overridesSystem:item.overridesSystem===true}
}
const currentPages=()=>parse<unknown[]>(PAGES_KEY,[]).map(normalizeDraft).filter((page):page is SitePageDraft=>Boolean(page))
const migrate=()=>{
  for(const key of ['portal-lander:cms:pages:local:v4','portal-lander:cms:pages:local:v3','portal-lander:cms:pages:local:v2','portal-lander:cms:pages:local:v1']){
    const legacy=parse<unknown[]>(key,[]).map(normalizeDraft).filter((page):page is SitePageDraft=>Boolean(page))
    if(legacy.length){localStorage.setItem(PAGES_KEY,JSON.stringify(legacy));return legacy}
  }
  return []
}
const hiddenPages=()=>new Set(parse<string[]>(HIDDEN_PAGES_KEY,[]).filter(value=>typeof value==='string'))
const saveHidden=(ids:Set<string>)=>{localStorage.setItem(HIDDEN_PAGES_KEY,JSON.stringify([...ids]));emit()}

export const isCanonicalPageSection=(pageId:string,section:Pick<SitePageSectionDraft,'id'|'slug'>)=>pageId==='home'&&(CANONICAL_HOME_SECTION_IDS.has(section.id)||CANONICAL_HOME_SECTION_SLUGS.has(section.slug))

const cleanSections=(sections:SitePageSections):SitePageSections=>{
  const home=(sections.home??[]).filter(section=>!isCanonicalPageSection('home',section))
  return {...sections,home}
}

const readSections=()=>{
  const current=parse<SitePageSections>(SECTIONS_KEY,{})
  const cleaned=cleanSections(current)
  const changed=JSON.stringify(current)!==JSON.stringify(cleaned)
  if(changed)localStorage.setItem(SECTIONS_KEY,JSON.stringify(cleaned))
  localStorage.removeItem(HOME_SECTIONS_INITIALIZED_KEY)
  return cleaned
}

export const sitePageRepository={
  eventName:'portal-lander:site-pages:changed',
  listDraftPages:():SitePageDraft[]=>{const current=currentPages();return current.length?current:migrate()},
  listSections:():SitePageSections=>readSections(),
  listHiddenPageIds:():string[]=>[...hiddenPages()],
  isPageHidden(id:string){return hiddenPages().has(id)},
  saveDraftPages(pages:SitePageDraft[]){
    const previous=currentPages(),now=new Date().toISOString()
    const next=pages.map(page=>{
      const old=previous.find(item=>item.id===page.id)
      const changed=!old||old.title!==page.title||old.slug!==page.slug||old.template!==page.template||old.overridesSystem!==page.overridesSystem
      return {...page,createdAt:page.createdAt??old?.createdAt??now,updatedAt:changed?now:(page.updatedAt??old?.updatedAt??now)}
    })
    localStorage.setItem(PAGES_KEY,JSON.stringify(next));emit()
  },
  upsertSystemOverride(input:{id:string;title:string;slug:string}){
    const pages=this.listDraftPages(),now=new Date().toISOString(),existing=pages.find(page=>page.id===input.id)
    const override:SitePageDraft={id:input.id,title:input.title,slug:input.slug,template:'editorial',createdAt:existing?.createdAt??now,updatedAt:now,overridesSystem:true}
    this.saveDraftPages(existing?pages.map(page=>page.id===input.id?override:page):[...pages,override])
    const hidden=hiddenPages();hidden.delete(input.id);saveHidden(hidden)
    return override
  },
  hideSystemPage(id:string){const hidden=hiddenPages();hidden.add(id);saveHidden(hidden)},
  restoreSystemPage(id:string){const hidden=hiddenPages();hidden.delete(id);saveHidden(hidden)},
  removeDraftPage(id:string){this.saveDraftPages(this.listDraftPages().filter(page=>page.id!==id))},
  saveSections(sections:SitePageSections){localStorage.setItem(SECTIONS_KEY,JSON.stringify(cleanSections(sections)));localStorage.removeItem(HOME_SECTIONS_INITIALIZED_KEY);emit()},
  purgeLegacy(){for(const key of [...LEGACY_PAGE_KEYS,...LEGACY_SECTION_KEYS,HOME_SECTIONS_INITIALIZED_KEY])if(key!==PAGES_KEY&&key!==SECTIONS_KEY)localStorage.removeItem(key)},
}
