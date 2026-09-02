import {
  isSectionConfigurationApiConfigured,
  listPublicSectionConfigurations,
  readAdminSectionConfiguration,
  saveAdminSectionConfiguration,
} from '../../../shared/data/sectionConfigurationClient'
import {readHeroAppearance,writeHeroAppearance,type HeroAppearanceConfig} from './heroAppearanceModel'
import {readHeroBackground,writeHeroBackground,type HeroBackgroundConfig} from './heroBackgroundModel'
import {readHeroConfig,writeHeroConfig,type HeroCarouselConfig} from './heroModel'

export type HeroCmsState={
  carousel:HeroCarouselConfig
  appearance:HeroAppearanceConfig
  background:HeroBackgroundConfig
}

type PersistedHeroEnvelope={
  version:number
  carousel?:HeroCarouselConfig
  appearance?:HeroAppearanceConfig
  background?:HeroBackgroundConfig
}

const isRecord=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value)

export function readCachedHeroCmsState():HeroCmsState{
  return {carousel:readHeroConfig(),appearance:readHeroAppearance(),background:readHeroBackground()}
}

function cacheEnvelope(value:Record<string,unknown>|null|undefined):HeroCmsState{
  if(!value)return readCachedHeroCmsState()
  const envelope=value as PersistedHeroEnvelope
  if(envelope.carousel)writeHeroConfig(envelope.carousel)
  if(envelope.appearance)writeHeroAppearance(envelope.appearance)
  if(envelope.background)writeHeroBackground(envelope.background)
  return readCachedHeroCmsState()
}

export async function loadAdminHeroCmsState():Promise<HeroCmsState>{
  if(!isSectionConfigurationApiConfigured())return readCachedHeroCmsState()
  const persisted=await readAdminSectionConfiguration('home','hero')
  return cacheEnvelope(persisted)
}

export async function loadPublicHeroCmsState():Promise<HeroCmsState>{
  if(!isSectionConfigurationApiConfigured())return readCachedHeroCmsState()
  const configurations=await listPublicSectionConfigurations('home')
  const persisted=isRecord(configurations.hero)?configurations.hero:null
  return cacheEnvelope(persisted)
}

export async function saveHeroCmsState(state:HeroCmsState):Promise<HeroCmsState>{
  const envelope:Record<string,unknown>={
    version:1,
    carousel:state.carousel,
    appearance:state.appearance,
    background:state.background,
  }
  if(isSectionConfigurationApiConfigured()){
    const persisted=await saveAdminSectionConfiguration('home','hero',envelope)
    return cacheEnvelope(persisted)
  }
  writeHeroConfig(state.carousel)
  writeHeroAppearance(state.appearance)
  writeHeroBackground(state.background)
  return readCachedHeroCmsState()
}
