import type { HomeAdConfig } from './adModel'

export type NewsAdConfig = HomeAdConfig

export const NEWS_AD_STORAGE_KEY = 'portal-lander:news:ad:v1'

export const defaultNewsAdConfig: NewsAdConfig = {
  active: true,
  title: 'ANUNCIE AQUI',
  subtitle: 'SUA MARCA NO RITMO CERTO!',
  buttonLabel: 'SAIBA MAIS →',
  buttonUrl: '/anuncie',
  image: '',
  imageAlt: 'Anúncio da página Notícias do Portal Lander',
  height: 92,
  contentWidth: 1170,
  align: 'center',
}

function normalize(raw: Partial<NewsAdConfig> | null | undefined): NewsAdConfig {
  if (!raw) return defaultNewsAdConfig
  return {
    ...defaultNewsAdConfig,
    ...raw,
    height: Math.min(900, Math.max(70, Number(raw.height) || defaultNewsAdConfig.height)),
    contentWidth: Math.min(1600, Math.max(320, Number(raw.contentWidth) || defaultNewsAdConfig.contentWidth)),
    align: raw.align === 'left' || raw.align === 'right' ? raw.align : 'center',
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
