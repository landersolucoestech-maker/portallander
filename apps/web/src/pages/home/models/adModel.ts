import { homeAdPersistence } from './adPersistence'
import {getRuntimeDataProvider} from '../../../shared/data/runtimeDataProvider'

export type HomeAdAlign = 'left' | 'center' | 'right'

export type HomeAdConfig = {
  active: boolean
  title: string
  subtitle: string
  buttonLabel: string
  buttonUrl: string
  image: string
  imageAlt: string
  logo: string
  logoAlt: string
  logoWidth: number
  height: number
  contentWidth: number
  align: HomeAdAlign
}

export const HOME_AD_STORAGE_KEY = 'portal-lander:home:ad:v1'
export const defaultHomeAdConfig:HomeAdConfig=getRuntimeDataProvider().advertising.defaultHomeAdConfig()

function normalize(raw: Partial<HomeAdConfig> | null | undefined): HomeAdConfig {
  if (!raw) return structuredClone(defaultHomeAdConfig)
  return {
    ...defaultHomeAdConfig,
    ...raw,
    height: Math.min(900, Math.max(120, Number(raw.height) || defaultHomeAdConfig.height)),
    contentWidth: Math.min(1600, Math.max(320, Number(raw.contentWidth) || defaultHomeAdConfig.contentWidth)),
    logoWidth: Math.min(320, Math.max(60, Number(raw.logoWidth) || defaultHomeAdConfig.logoWidth)),
    align: raw.align === 'left' || raw.align === 'right' ? raw.align : 'center',
  }
}

export function readHomeAdConfig(): HomeAdConfig {
  try {
    const value = homeAdPersistence.read(HOME_AD_STORAGE_KEY)
    return value ? normalize(JSON.parse(value)) : structuredClone(defaultHomeAdConfig)
  } catch {
    return structuredClone(defaultHomeAdConfig)
  }
}

export function writeHomeAdConfig(config: HomeAdConfig) {
  homeAdPersistence.write(HOME_AD_STORAGE_KEY, JSON.stringify(normalize(config)))
  homeAdPersistence.notify()
}

export function resetHomeAdConfig() {
  homeAdPersistence.remove(HOME_AD_STORAGE_KEY)
  homeAdPersistence.notify()
}
