export type NewsAdAlign = 'left' | 'center' | 'right'

export type NewsAdConfig = {
  active: boolean
  label: string
  title: string
  subtitle: string
  buttonLabel: string
  buttonUrl: string
  openInNewTab: boolean
  image: string
  imageAlt: string
  background: string
  advertiser: string
  campaign: string
  startDate: string
  endDate: string
  height: number
  contentWidth: number
  align: NewsAdAlign
}

export const NEWS_AD_STORAGE_KEY = 'portal-lander:news:ad:v1'

export const defaultNewsAdConfig: NewsAdConfig = {
  active: true,
  label: 'PUBLICIDADE',
  title: 'ANUNCIE AQUI',
  subtitle: 'SUA MARCA NO\nRITMO CERTO!',
  buttonLabel: 'SAIBA MAIS →',
  buttonUrl: '/anuncie',
  openInNewTab: false,
  image: '',
  imageAlt: 'Anúncio da página Notícias do Portal Lander',
  background: '',
  advertiser: '',
  campaign: '',
  startDate: '',
  endDate: '',
  height: 100,
  contentWidth: 1170,
  align: 'left',
}

function normalize(raw: Partial<NewsAdConfig> | null | undefined): NewsAdConfig {
  if (!raw) return defaultNewsAdConfig
  return {
    ...defaultNewsAdConfig,
    ...raw,
    height: Math.min(900, Math.max(70, Number(raw.height) || defaultNewsAdConfig.height)),
    contentWidth: Math.min(1600, Math.max(240, Number(raw.contentWidth) || defaultNewsAdConfig.contentWidth)),
    align: raw.align === 'center' || raw.align === 'right' ? raw.align : 'left',
    openInNewTab: Boolean(raw.openInNewTab),
  }
}

export function readNewsAdConfig(): NewsAdConfig {
  if (typeof window === 'undefined') return defaultNewsAdConfig
  try {
    const value = window.localStorage.getItem(NEWS_AD_STORAGE_KEY)
    return value ? normalize(JSON.parse(value)) : defaultNewsAdConfig
  } catch {
    return defaultNewsAdConfig
  }
}

export function isNewsAdValid(config: NewsAdConfig, now = new Date()) {
  if (!config.active) return false
  const today = now.toISOString().slice(0, 10)
  if (config.startDate && today < config.startDate) return false
  if (config.endDate && today > config.endDate) return false
  return Boolean(config.title || config.subtitle || config.image || config.background || config.buttonLabel)
}

export function writeNewsAdConfig(config: NewsAdConfig) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(NEWS_AD_STORAGE_KEY, JSON.stringify(normalize(config)))
  window.dispatchEvent(new CustomEvent('portal-lander:news-ad-updated'))
}

export function resetNewsAdConfig() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(NEWS_AD_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('portal-lander:news-ad-updated'))
}
