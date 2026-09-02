import {
  isSectionConfigurationApiConfigured,
  listPublicSectionConfigurations,
  readAdminSectionConfiguration,
  saveAdminSectionConfiguration,
} from '../../shared/data/sectionConfigurationClient'
import {
  defaultSectionConfiguration,
  readSectionConfiguration,
  SECTION_CONFIGURATION_EVENT,
  type SectionConfiguration,
} from './sectionConfiguration'

const STORAGE_KEY='portal-lander:cms:section-configurations:v1'
const storageId=(sectionId:string)=>`home:${sectionId}`

function readAll():Record<string,SectionConfiguration>{
  if(typeof window==='undefined')return {}
  try{return JSON.parse(window.localStorage.getItem(STORAGE_KEY)||'{}') as Record<string,SectionConfiguration>}
  catch{return {}}
}

function cache(sectionId:string,configuration:SectionConfiguration){
  if(typeof window==='undefined')return configuration
  const all=readAll()
  all[storageId(sectionId)]={...configuration}
  window.localStorage.setItem(STORAGE_KEY,JSON.stringify(all))
  window.dispatchEvent(new CustomEvent(SECTION_CONFIGURATION_EVENT,{detail:{pageId:'home',sectionId}}))
  return configuration
}

function normalize(sectionId:string,name:string,value:Record<string,unknown>|null|undefined){
  return {...defaultSectionConfiguration(sectionId,name),...(value||{})} as SectionConfiguration
}

export function readCachedHomeSection(sectionId:string,name:string){
  return readSectionConfiguration('home',sectionId,name)
}

export async function loadAdminHomeSection(sectionId:string,name:string){
  if(!isSectionConfigurationApiConfigured())return readCachedHomeSection(sectionId,name)
  const value=await readAdminSectionConfiguration('home',sectionId)
  if(!value)return readCachedHomeSection(sectionId,name)
  return cache(sectionId,normalize(sectionId,name,value))
}

export async function saveHomeSection(sectionId:string,name:string,configuration:SectionConfiguration){
  const normalized=normalize(sectionId,name,configuration as unknown as Record<string,unknown>)
  if(!isSectionConfigurationApiConfigured())return cache(sectionId,normalized)
  const persisted=await saveAdminSectionConfiguration('home',sectionId,normalized as unknown as Record<string,unknown>)
  return cache(sectionId,normalize(sectionId,name,persisted))
}

export async function hydratePublicHomeSections(){
  if(!isSectionConfigurationApiConfigured())return
  const configurations=await listPublicSectionConfigurations('home')
  for(const [sectionId,value] of Object.entries(configurations)){
    if(sectionId==='hero'||!value||typeof value!=='object'||Array.isArray(value))continue
    const cached=readCachedHomeSection(sectionId,sectionId)
    cache(sectionId,{...cached,...value} as SectionConfiguration)
  }
}
