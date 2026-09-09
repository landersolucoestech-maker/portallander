import {
  isSectionConfigurationApiConfigured,
  listPublicSectionConfigurations,
  readAdminSectionConfiguration,
  saveAdminSectionConfiguration,
} from '../../shared/data/sectionConfigurationClient'
import {
  defaultSectionConfiguration,
  readSectionConfiguration,
  writeSectionConfiguration,
  type SectionConfiguration,
} from './sectionConfiguration'

export const HOME_CONFIGURABLE_SECTION_IDS=[
  'em-destaque',
  'mais-lidas',
  'ultimas-noticias',
  'publicidade-lateral',
  'em-alta',
  'anuncie-aqui',
  'lancamentos',
  'agenda',
  'newsletter',
] as const

export type HomeConfigurableSectionId=typeof HOME_CONFIGURABLE_SECTION_IDS[number]
export type HomeSectionConfigurationMap=Record<HomeConfigurableSectionId,SectionConfiguration>

const names:Record<HomeConfigurableSectionId,string>={
  'em-destaque':'Em Destaque',
  'mais-lidas':'Mais Lidas',
  'ultimas-noticias':'Últimas Notícias',
  'publicidade-lateral':'Publicidade Lateral',
  'em-alta':'Em Alta',
  'anuncie-aqui':'Anuncie Aqui',
  lancamentos:'Lançamentos',
  agenda:'Agenda',
  newsletter:'Newsletter',
}

function normalize(sectionId:HomeConfigurableSectionId,name:string,value:Record<string,unknown>|null|undefined):SectionConfiguration{
  return {...defaultSectionConfiguration(sectionId,name),...(value||{})} as SectionConfiguration
}

function normalizeTyped<T extends SectionConfiguration>(sectionId:HomeConfigurableSectionId,name:string,value:T|Record<string,unknown>|null|undefined):T{
  return normalize(sectionId,name,value as Record<string,unknown>|null|undefined) as T
}

function defaults():HomeSectionConfigurationMap{
  return Object.fromEntries(HOME_CONFIGURABLE_SECTION_IDS.map(sectionId=>[sectionId,defaultSectionConfiguration(sectionId,names[sectionId])])) as HomeSectionConfigurationMap
}

function developmentFallback():HomeSectionConfigurationMap{
  return Object.fromEntries(HOME_CONFIGURABLE_SECTION_IDS.map(sectionId=>[sectionId,readSectionConfiguration('home',sectionId,names[sectionId])])) as HomeSectionConfigurationMap
}

export function readInitialHomeSections():HomeSectionConfigurationMap{
  return isSectionConfigurationApiConfigured()?defaults():developmentFallback()
}

export async function loadAdminHomeSection(sectionId:HomeConfigurableSectionId,name=names[sectionId]){
  if(!isSectionConfigurationApiConfigured())return readSectionConfiguration('home',sectionId,name)
  const value=await readAdminSectionConfiguration('home',sectionId)
  return normalize(sectionId,name,value)
}

export async function saveHomeSection<T extends SectionConfiguration>(sectionId:HomeConfigurableSectionId,name:string,configuration:T):Promise<T>{
  const normalized=normalizeTyped<T>(sectionId,name,configuration)
  if(!isSectionConfigurationApiConfigured()){
    writeSectionConfiguration('home',sectionId,normalized)
    return normalized
  }
  const persisted=await saveAdminSectionConfiguration('home',sectionId,normalized as unknown as Record<string,unknown>)
  return normalizeTyped<T>(sectionId,name,persisted)
}

export async function loadPublicHomeSections():Promise<HomeSectionConfigurationMap>{
  if(!isSectionConfigurationApiConfigured())return developmentFallback()
  const configurations=await listPublicSectionConfigurations('home')
  const base=defaults()
  for(const sectionId of HOME_CONFIGURABLE_SECTION_IDS){
    const value=configurations[sectionId]
    if(value&&typeof value==='object'&&!Array.isArray(value))base[sectionId]=normalize(sectionId,names[sectionId],value)
  }
  return base
}