export type HeroBreakpoint = 'desktop' | 'tablet' | 'mobile'

export type HeroResponsiveAppearance = {
  height: number
  paddingX: number
  paddingY: number
  radius: number
  contentAlign: 'left' | 'center' | 'right'
  verticalAlign: 'start' | 'center' | 'end'
  eyebrowSize: number
  eyebrowWeight: number
  eyebrowPaddingX: number
  eyebrowPaddingY: number
  descriptionSize: number
  descriptionWeight: number
  descriptionPaddingX: number
  descriptionPaddingY: number
  titlePaddingX: number
  titlePaddingY: number
  ctaSize: number
  ctaWeight: number
  titleLineHeight: number
  titleMaxWidth: number
  descriptionMaxWidth: number
  contentGap: number
  contentMediaGap: number
  ctaGap: number
  ctaHeight: number
  ctaPaddingX: number
  contentPaddingTop: number
  contentPaddingBottom: number
  mediaWidthPercent: number
  mediaMinHeight: number
}

export type HeroResponsiveOverrides = {
  tablet?: Partial<HeroResponsiveAppearance>
  mobile?: Partial<HeroResponsiveAppearance>
}

export type HeroAppearanceConfig = HeroResponsiveAppearance & {
  active: boolean
  width: number
  imageMaxWidth: number
  imageMaxHeight: number
  background: string
  textColor: string
  titleColor: string
  accentColor: string
  borderColor: string
  eyebrowColor: string
  responsive?: HeroResponsiveOverrides
}

export const HERO_APPEARANCE_STORAGE_KEY = 'portal-lander:cms:section-config:hero:v5'
export const HERO_APPEARANCE_EVENT = 'portal-lander:hero-appearance-updated'

export const defaultHeroAppearance: HeroAppearanceConfig = {
  active: true,
  width: 100,
  height: 560,
  paddingX: 0,
  paddingY: 0,
  radius: 0,
  imageMaxWidth: 3000,
  imageMaxHeight: 3000,
  background: '#090909',
  textColor: '#ffffff',
  titleColor: '#ffffff',
  accentColor: '#ff151f',
  borderColor: '#090909',
  contentAlign: 'left',
  verticalAlign: 'center',
  eyebrowColor: '#ff151f',
  eyebrowSize: 13,
  eyebrowWeight: 800,
  eyebrowPaddingX: 0,
  eyebrowPaddingY: 0,
  descriptionSize: 16,
  descriptionWeight: 400,
  descriptionPaddingX: 0,
  descriptionPaddingY: 0,
  titlePaddingX: 0,
  titlePaddingY: 0,
  ctaSize: 14,
  ctaWeight: 800,
  titleLineHeight: .82,
  titleMaxWidth: 630,
  descriptionMaxWidth: 570,
  contentGap: 18,
  contentMediaGap: 32,
  ctaGap: 14,
  ctaHeight: 52,
  ctaPaddingX: 22,
  contentPaddingTop: 44,
  contentPaddingBottom: 48,
  mediaWidthPercent: 75,
  mediaMinHeight: 570,
  responsive: {},
}

const responsiveKeys: (keyof HeroResponsiveAppearance)[] = [
  'height', 'paddingX', 'paddingY', 'radius', 'contentAlign', 'verticalAlign',
  'eyebrowSize', 'eyebrowWeight', 'eyebrowPaddingX', 'eyebrowPaddingY',
  'descriptionSize', 'descriptionWeight', 'descriptionPaddingX', 'descriptionPaddingY',
  'titlePaddingX', 'titlePaddingY', 'ctaSize', 'ctaWeight',
  'titleLineHeight', 'titleMaxWidth', 'descriptionMaxWidth', 'contentGap', 'contentMediaGap', 'ctaGap', 'ctaHeight',
  'ctaPaddingX', 'contentPaddingTop', 'contentPaddingBottom', 'mediaWidthPercent', 'mediaMinHeight',
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeLimit(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) return fallback
  return clamp(Math.round(Number(value)), 256, 6000)
}

function automaticResponsive(base: HeroAppearanceConfig, breakpoint: Exclude<HeroBreakpoint, 'desktop'>): HeroResponsiveAppearance {
  const tablet = breakpoint === 'tablet'
  return {
    height: tablet ? Math.max(440, Math.round(base.height * .82)) : Math.max(360, Math.round(base.height * .68)),
    paddingX: Math.round(base.paddingX * (tablet ? .72 : .48)),
    paddingY: Math.round(base.paddingY * (tablet ? .78 : .58)),
    radius: base.radius,
    contentAlign: base.contentAlign,
    verticalAlign: base.verticalAlign,
    eyebrowSize: clamp(Math.round(base.eyebrowSize * (tablet ? .92 : .82)), 9, 28),
    eyebrowWeight: base.eyebrowWeight,
    eyebrowPaddingX: base.eyebrowPaddingX,
    eyebrowPaddingY: base.eyebrowPaddingY,
    descriptionSize: clamp(Math.round(base.descriptionSize * (tablet ? .94 : .88)), 11, 32),
    descriptionWeight: base.descriptionWeight,
    descriptionPaddingX: base.descriptionPaddingX,
    descriptionPaddingY: base.descriptionPaddingY,
    titlePaddingX: base.titlePaddingX,
    titlePaddingY: base.titlePaddingY,
    ctaSize: clamp(Math.round(base.ctaSize * (tablet ? .95 : .9)), 10, 24),
    ctaWeight: base.ctaWeight,
    titleLineHeight: tablet ? Math.max(.78, base.titleLineHeight) : Math.max(.82, base.titleLineHeight),
    titleMaxWidth: tablet ? Math.min(base.titleMaxWidth, 540) : Math.min(base.titleMaxWidth, 360),
    descriptionMaxWidth: tablet ? Math.min(base.descriptionMaxWidth, 520) : Math.min(base.descriptionMaxWidth, 360),
    contentGap: Math.round(base.contentGap * (tablet ? .86 : .72)),
    contentMediaGap: Math.max(8, Math.round(base.contentMediaGap * (tablet ? .72 : .5))),
    ctaGap: Math.round(base.ctaGap * (tablet ? .86 : .72)),
    ctaHeight: Math.round(base.ctaHeight * (tablet ? .96 : .92)),
    ctaPaddingX: Math.round(base.ctaPaddingX * (tablet ? .9 : .76)),
    contentPaddingTop: Math.round(base.contentPaddingTop * (tablet ? .92 : .8)),
    contentPaddingBottom: Math.round(base.contentPaddingBottom * (tablet ? .78 : .58)),
    mediaWidthPercent: tablet ? Math.min(88, Math.max(base.mediaWidthPercent, 76)) : Math.min(100, Math.max(base.mediaWidthPercent, 90)),
    mediaMinHeight: tablet ? Math.max(360, Math.round(base.mediaMinHeight * .72)) : Math.max(300, Math.round(base.mediaMinHeight * .58)),
  }
}

export function resolveHeroAppearance(config: HeroAppearanceConfig, breakpoint: HeroBreakpoint): HeroAppearanceConfig {
  if (breakpoint === 'desktop') return config
  const automatic = automaticResponsive(config, breakpoint)
  const override = config.responsive?.[breakpoint] || {}
  return { ...config, ...automatic, ...override }
}

export function hasHeroAppearanceOverride(config: HeroAppearanceConfig, breakpoint: HeroBreakpoint, key?: keyof HeroResponsiveAppearance) {
  if (breakpoint === 'desktop') return false
  const values = config.responsive?.[breakpoint]
  if (!values) return false
  return key ? values[key] !== undefined : Object.keys(values).length > 0
}

export function setHeroAppearanceOverride<K extends keyof HeroResponsiveAppearance>(config: HeroAppearanceConfig, breakpoint: HeroBreakpoint, key: K, value: HeroResponsiveAppearance[K]): HeroAppearanceConfig {
  if (breakpoint === 'desktop') return { ...config, [key]: value }
  return {
    ...config,
    responsive: {
      ...(config.responsive || {}),
      [breakpoint]: { ...(config.responsive?.[breakpoint] || {}), [key]: value },
    },
  }
}

export function clearHeroAppearanceOverride(config: HeroAppearanceConfig, breakpoint: HeroBreakpoint, key?: keyof HeroResponsiveAppearance): HeroAppearanceConfig {
  if (breakpoint === 'desktop') return config
  const current = { ...(config.responsive?.[breakpoint] || {}) }
  if (key) delete current[key]
  else responsiveKeys.forEach(item => delete current[item])
  return { ...config, responsive: { ...(config.responsive || {}), [breakpoint]: current } }
}

function normalizeAppearance(raw: Partial<HeroAppearanceConfig> | undefined): HeroAppearanceConfig {
  return {
    ...defaultHeroAppearance,
    ...(raw || {}),
    imageMaxWidth: normalizeLimit(raw?.imageMaxWidth, defaultHeroAppearance.imageMaxWidth),
    imageMaxHeight: normalizeLimit(raw?.imageMaxHeight, defaultHeroAppearance.imageMaxHeight),
    responsive: {
      tablet: { ...(raw?.responsive?.tablet || {}) },
      mobile: { ...(raw?.responsive?.mobile || {}) },
    },
  }
}

export function readHeroAppearance(): HeroAppearanceConfig {
  try {
    const raw = localStorage.getItem(HERO_APPEARANCE_STORAGE_KEY)
    return raw ? normalizeAppearance(JSON.parse(raw)) : normalizeAppearance(undefined)
  } catch {
    return normalizeAppearance(undefined)
  }
}

export function writeHeroAppearance(config: HeroAppearanceConfig) {
  localStorage.setItem(HERO_APPEARANCE_STORAGE_KEY, JSON.stringify(normalizeAppearance(config)))
  window.dispatchEvent(new CustomEvent(HERO_APPEARANCE_EVENT))
}

export function resetHeroAppearance() {
  localStorage.removeItem(HERO_APPEARANCE_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(HERO_APPEARANCE_EVENT))
}
