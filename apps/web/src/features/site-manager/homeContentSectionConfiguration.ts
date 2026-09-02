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
  homeColumnsDesktop:number
  homeColumnsTablet:number
  homeColumnsMobile:number
  homeGapDesktop:number
  homeGapTablet:number
  homeGapMobile:number
  homeMarginYDesktop:number
  homeMarginYTablet:number
  homeMarginYMobile:number
  homePaddingXDesktop:number
  homePaddingXTablet:number
  homePaddingXMobile:number
  homePaddingYDesktop:number
  homePaddingYTablet:number
  homePaddingYMobile:number
  homeAgendaWindow:HomeAgendaWindow
}

export type HomeContentSectionConfiguration=SectionConfiguration&HomeContentSectionLayout

const VERSION=2
export const HOME_CONTENT_MAX_ITEMS:Record<HomeContentSectionId,number>={
  'em-destaque':6,
  'ultimas-noticias':8,
  'lancamentos':8,
  'agenda':8,
  'em-alta':5,
}

const sectionDefaults:Record<HomeContentSectionId,Partial<HomeContentSectionLayout>>={
  'em-destaque':{homeColumnsDesktop:3,homeColumnsTablet:2,homeColumnsMobile:1},
  'ultimas-noticias':{homeColumnsDesktop:2,homeColumnsTablet:2,homeColumnsMobile:1},
  'lancamentos':{homeColumnsDesktop:4,homeColumnsTablet:2,homeColumnsMobile:1},
  'agenda':{homeColumnsDesktop:1,homeColumnsTablet:1,homeColumnsMobile:1,homeAgendaWindow:'all'},
  'em-alta':{homeColumnsDesktop:1,homeColumnsTablet:1,homeColumnsMobile:1},
}

const base:HomeContentSectionLayout={
  homeLayoutVersion:VERSION,
  homeSelectionMode:'automatic',
  homeSortMode:'provider',
  homeManualSelection:[],
  homeColumnsDesktop:1,homeColumnsTablet:1,homeColumnsMobile:1,
  homeGapDesktop:12,homeGapTablet:12,homeGapMobile:10,
  homeMarginYDesktop:0,homeMarginYTablet:0,homeMarginYMobile:0,
  homePaddingXDesktop:0,homePaddingXTablet:0,homePaddingXMobile:0,
  homePaddingYDesktop:0,homePaddingYTablet:0,homePaddingYMobile:0,
  homeAgendaWindow:'all',
}

export function withHomeContentSectionConfiguration(config:SectionConfiguration,sectionId:HomeContentSectionId):HomeContentSectionConfiguration{
  const raw=config as SectionConfiguration&Partial<HomeContentSectionLayout>
  const defaults={...base,...sectionDefaults[sectionId]}
  const legacyColumns=Math.max(1,Math.min(4,config.columns||defaults.homeColumnsDesktop||1))
  const merged={...config,...defaults,...raw} as HomeContentSectionConfiguration
  if(!raw.homeLayoutVersion){
    merged.homeColumnsDesktop=legacyColumns
  }
  merged.homeLayoutVersion=VERSION
  merged.itemLimit=Math.max(0,Math.min(HOME_CONTENT_MAX_ITEMS[sectionId],Number(config.itemLimit)||0))
  merged.homeColumnsDesktop=Math.max(1,Math.min(4,Number(merged.homeColumnsDesktop)||1))
  merged.homeColumnsTablet=Math.max(1,Math.min(4,Number(merged.homeColumnsTablet)||1))
  merged.homeColumnsMobile=Math.max(1,Math.min(2,Number(merged.homeColumnsMobile)||1))
  merged.homeManualSelection=Array.isArray(merged.homeManualSelection)?merged.homeManualSelection.filter(Boolean):[]
  return merged
}

const suffix=(viewport:SectionHeroViewport)=>viewport==='desktop'?'Desktop':viewport==='tablet'?'Tablet':'Mobile'
export function homeContentViewportLayout(config:HomeContentSectionConfiguration,viewport:SectionHeroViewport){
  const key=suffix(viewport)
  return {
    columns:config[`homeColumns${key}` as keyof HomeContentSectionConfiguration] as number,
    gap:config[`homeGap${key}` as keyof HomeContentSectionConfiguration] as number,
    marginY:config[`homeMarginY${key}` as keyof HomeContentSectionConfiguration] as number,
    paddingX:config[`homePaddingX${key}` as keyof HomeContentSectionConfiguration] as number,
    paddingY:config[`homePaddingY${key}` as keyof HomeContentSectionConfiguration] as number,
  }
}

export function homeContentResponsiveCssVariables(config:HomeContentSectionConfiguration):CSSProperties{
  return {
    '--pl-home-columns-desktop':String(config.homeColumnsDesktop),
    '--pl-home-columns-tablet':String(config.homeColumnsTablet),
    '--pl-home-columns-mobile':String(config.homeColumnsMobile),
    '--pl-home-gap-desktop':`${config.homeGapDesktop}px`,
    '--pl-home-gap-tablet':`${config.homeGapTablet}px`,
    '--pl-home-gap-mobile':`${config.homeGapMobile}px`,
    '--pl-home-margin-y-desktop':`${config.homeMarginYDesktop}px`,
    '--pl-home-margin-y-tablet':`${config.homeMarginYTablet}px`,
    '--pl-home-margin-y-mobile':`${config.homeMarginYMobile}px`,
    '--pl-home-padding-x-desktop':`${config.homePaddingXDesktop}px`,
    '--pl-home-padding-x-tablet':`${config.homePaddingXTablet}px`,
    '--pl-home-padding-x-mobile':`${config.homePaddingXMobile}px`,
    '--pl-home-padding-y-desktop':`${config.homePaddingYDesktop}px`,
    '--pl-home-padding-y-tablet':`${config.homePaddingYTablet}px`,
    '--pl-home-padding-y-mobile':`${config.homePaddingYMobile}px`,
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
