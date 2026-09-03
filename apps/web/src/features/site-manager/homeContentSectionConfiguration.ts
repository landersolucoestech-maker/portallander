import type {CSSProperties} from 'react'
import type {SectionConfiguration,SectionHeroViewport} from './sectionConfiguration'

export type HomeContentSectionId='em-destaque'|'ultimas-noticias'|'lancamentos'|'agenda'|'em-alta'
export type HomeSelectionMode='automatic'|'manual'
export type HomeSortMode='provider'|'reverse'|'title-asc'|'title-desc'
export type HomeAgendaWindow='all'|'future'|'past'

export type HomeContentSectionLayout={
  homeLayoutVersion:number
  homeSelectionMode:HomeSelectionMode
  homeSortMode:HomeSortMode
  homeManualSelection:string[]
  homeResponsiveProfile:HomeContentSectionId
  homeAgendaWindow:HomeAgendaWindow
}

export type HomeContentSectionConfiguration=SectionConfiguration&HomeContentSectionLayout

const VERSION=3
export const HOME_CONTENT_MAX_ITEMS:Record<HomeContentSectionId,number>={
  'em-destaque':3,
  'ultimas-noticias':8,
  'lancamentos':8,
  'agenda':8,
  'em-alta':5,
}

type CanonicalLayout={columns:number;gap:number;marginY:number;paddingX:number;paddingY:number}
const canonical:Record<HomeContentSectionId,Record<SectionHeroViewport,CanonicalLayout>>={
  'em-destaque':{
    desktop:{columns:3,gap:12,marginY:0,paddingX:0,paddingY:0},
    tablet:{columns:2,gap:12,marginY:0,paddingX:0,paddingY:0},
    mobile:{columns:1,gap:10,marginY:0,paddingX:0,paddingY:0},
  },
  'ultimas-noticias':{
    desktop:{columns:3,gap:12,marginY:0,paddingX:0,paddingY:0},
    tablet:{columns:2,gap:12,marginY:0,paddingX:0,paddingY:0},
    mobile:{columns:1,gap:10,marginY:0,paddingX:0,paddingY:0},
  },
  lancamentos:{
    desktop:{columns:4,gap:12,marginY:0,paddingX:0,paddingY:0},
    tablet:{columns:2,gap:12,marginY:0,paddingX:0,paddingY:0},
    mobile:{columns:1,gap:10,marginY:0,paddingX:0,paddingY:0},
  },
  agenda:{
    desktop:{columns:1,gap:12,marginY:0,paddingX:0,paddingY:0},
    tablet:{columns:1,gap:12,marginY:0,paddingX:0,paddingY:0},
    mobile:{columns:1,gap:10,marginY:0,paddingX:0,paddingY:0},
  },
  'em-alta':{
    desktop:{columns:1,gap:12,marginY:0,paddingX:0,paddingY:0},
    tablet:{columns:1,gap:12,marginY:0,paddingX:0,paddingY:0},
    mobile:{columns:1,gap:10,marginY:0,paddingX:0,paddingY:0},
  },
}

export function withHomeContentSectionConfiguration(config:SectionConfiguration,sectionId:HomeContentSectionId):HomeContentSectionConfiguration{
  const raw=config as SectionConfiguration&Partial<HomeContentSectionLayout>
  return {
    ...config,
    homeLayoutVersion:VERSION,
    homeSelectionMode:raw.homeSelectionMode==='manual'?'manual':'automatic',
    homeSortMode:['provider','reverse','title-asc','title-desc'].includes(raw.homeSortMode||'')?raw.homeSortMode as HomeSortMode:'provider',
    homeManualSelection:Array.isArray(raw.homeManualSelection)?raw.homeManualSelection.filter(Boolean):[],
    homeResponsiveProfile:sectionId,
    homeAgendaWindow:['all','future','past'].includes(raw.homeAgendaWindow||'')?raw.homeAgendaWindow as HomeAgendaWindow:'all',
    itemLimit:Math.max(0,Math.min(HOME_CONTENT_MAX_ITEMS[sectionId],Number(config.itemLimit)||0)),
  }
}

export function homeContentViewportLayout(config:HomeContentSectionConfiguration,viewport:SectionHeroViewport){
  return canonical[config.homeResponsiveProfile]?.[viewport]||canonical['em-destaque'][viewport]
}

export function homeContentResponsiveCssVariables(config:HomeContentSectionConfiguration):CSSProperties{
  const desktop=homeContentViewportLayout(config,'desktop')
  const tablet=homeContentViewportLayout(config,'tablet')
  const mobile=homeContentViewportLayout(config,'mobile')
  return {
    '--pl-home-columns-desktop':String(desktop.columns),
    '--pl-home-columns-tablet':String(tablet.columns),
    '--pl-home-columns-mobile':String(mobile.columns),
    '--pl-home-gap-desktop':`${desktop.gap}px`,
    '--pl-home-gap-tablet':`${tablet.gap}px`,
    '--pl-home-gap-mobile':`${mobile.gap}px`,
    '--pl-home-margin-y-desktop':`${desktop.marginY}px`,
    '--pl-home-margin-y-tablet':`${tablet.marginY}px`,
    '--pl-home-margin-y-mobile':`${mobile.marginY}px`,
    '--pl-home-padding-x-desktop':`${desktop.paddingX}px`,
    '--pl-home-padding-x-tablet':`${tablet.paddingX}px`,
    '--pl-home-padding-x-mobile':`${mobile.paddingX}px`,
    '--pl-home-padding-y-desktop':`${desktop.paddingY}px`,
    '--pl-home-padding-y-tablet':`${tablet.paddingY}px`,
    '--pl-home-padding-y-mobile':`${mobile.paddingY}px`,
  } as CSSProperties
}

function sortByLabel<T>(items:T[],label:(item:T)=>string,mode:HomeSortMode){
  const copy=[...items]
  if(mode==='reverse')return copy.reverse()
  if(mode==='title-asc')return copy.sort((a,b)=>label(a).localeCompare(label(b),'pt-BR'))
  if(mode==='title-desc')return copy.sort((a,b)=>label(b).localeCompare(label(a),'pt-BR'))
  return copy
}

export function selectConfiguredItems<T>(items:T[],config:HomeContentSectionConfiguration,label:(item:T)=>string){
  const ordered=sortByLabel(items,label,config.homeSortMode)
  if(config.homeSelectionMode!=='manual')return ordered.slice(0,config.itemLimit)
  const byLabel=new Map(ordered.map(item=>[label(item),item]))
  return config.homeManualSelection.map(key=>byLabel.get(key)).filter((item):item is T=>Boolean(item)).slice(0,config.itemLimit)
}

const MONTHS:Record<string,number>={jan:0,janeiro:0,fev:1,fevereiro:1,mar:2,'março':2,abr:3,abril:3,mai:4,maio:4,jun:5,junho:5,jul:6,julho:6,ago:7,agosto:7,set:8,setembro:8,out:9,outubro:9,nov:10,novembro:10,dez:11,dezembro:11}
export function filterAgendaByWindow<T extends {day:string;month:string}>(items:T[],windowMode:HomeAgendaWindow,now=new Date()){
  if(windowMode==='all')return items
  return items.filter(item=>{
    const month=MONTHS[item.month.trim().toLocaleLowerCase('pt-BR').replace('.','')]
    const day=Number.parseInt(item.day,10)
    if(month==null||!Number.isFinite(day))return true
    const eventDate=new Date(now.getFullYear(),month,day,23,59,59,999)
    return windowMode==='future'?eventDate.getTime()>=now.getTime():eventDate.getTime()<now.getTime()
  })
}
