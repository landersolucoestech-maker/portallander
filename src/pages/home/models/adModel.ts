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

export const defaultHomeAdConfig: HomeAdConfig = {
  active: true,
  title: 'PORTAL LANDER',
  subtitle: 'ANUNCIE AQUI · SUA MARCA NO RITMO CERTO!',
  buttonLabel: 'SAIBA MAIS →',
  buttonUrl: '/anuncie',
  image: '',
  imageAlt: 'Anúncio em destaque no Portal Lander',
  logo: '',
  logoAlt: 'Logo do anunciante',
  logoWidth: 140,
  height: 440,
  contentWidth: 1180,
  align: 'center',
}

function normalize(raw: Partial<HomeAdConfig> | null | undefined): HomeAdConfig {
  if (!raw) return defaultHomeAdConfig
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
  if (typeof window === 'undefined') return defaultHomeAdConfig
  try {
    const value = window.localStorage.getItem(HOME_AD_STORAGE_KEY)
    return value ? normalize(JSON.parse(value)) : defaultHomeAdConfig
  } catch {
    return defaultHomeAdConfig
  }
}

export function writeHomeAdConfig(config: HomeAdConfig) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(HOME_AD_STORAGE_KEY, JSON.stringify(normalize(config)))
  window.dispatchEvent(new CustomEvent('portal-lander:home-ad-updated'))
}

export function resetHomeAdConfig() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(HOME_AD_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('portal-lander:home-ad-updated'))
}
