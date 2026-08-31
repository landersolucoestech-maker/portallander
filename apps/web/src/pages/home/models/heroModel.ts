import { heroPersistence } from './heroPersistence'
import { getRuntimeDataProvider } from '../../../shared/data/runtimeDataProvider'
import type { HeroBreakpoint } from './heroAppearanceModel'

export type HeroTitleSegmentVisual = {
  fontSize?: number
  fontWeight?: number
}

export type HeroTitleSegment = {
  text: string
  emphasis: boolean
  color?: string
  visible?: boolean
  fontSize?: number
  fontWeight?: number
  responsive?: {
    tablet?: HeroTitleSegmentVisual
    mobile?: HeroTitleSegmentVisual
  }
}

export type HeroTicker = {
  active: boolean
  label: string
  text: string
  url: string
  tag?: string
  tagVisible?: boolean
  external?: boolean
  showArrow?: boolean
  background?: string
  textColor?: string
  tagBackground?: string
  tagTextColor?: string
}

export type HeroSlideResponsiveVisual = {
  imagePositionX?: number
  imagePositionY?: number
  imageScale?: number
  imageOffsetX?: number
  imageOffsetY?: number
}

export type HeroSlideStatus = 'active' | 'inactive'
export type HeroCtaVariant = 'primary' | 'secondary'
export type HeroNavigation = 'arrows-dots' | 'dots' | 'arrows' | 'none'

export type HeroCta = {
  id: string
  active: boolean
  label: string
  url: string
  external: boolean
  order: number
  variant: HeroCtaVariant
}

export type HeroSlide = {
  id: string
  status: HeroSlideStatus
  order: number
  eyebrow: string
  eyebrowVisible?: boolean
  category: string
  title: HeroTitleSegment[]
  description: string
  descriptionVisible?: boolean
  mediaCaption: string
  mediaCaptionVisible?: boolean
  image: string
  imageVisible?: boolean
  imageAlt: string
  imagePositionX: number
  imagePositionY: number
  imageScale: number
  imageOffsetX: number
  imageOffsetY: number
  responsive?: {
    tablet?: HeroSlideResponsiveVisual
    mobile?: HeroSlideResponsiveVisual
  }
  primaryCtaLabel: string
  primaryCtaUrl: string
  secondaryCtaLabel: string
  secondaryCtaUrl: string
  ctas?: HeroCta[]
  articleId: string
  publishedAt: string
  scheduledAt: string
}

export type HeroCarouselConfig = {
  autoplay: boolean
  intervalMs: number
  ticker: HeroTicker
  slides: HeroSlide[]
  navigation?: HeroNavigation
  loop?: boolean
}

export type HeroArticleSource = {
  id: string
  title: string
  slug: string
  category: string
  summary: string
  image: string
  imageAlt: string
  url: string
}

type LegacyHero = Partial<HeroSlide> & { ticker?: Partial<HeroTicker> }

export const HERO_STORAGE_KEY = 'portal-lander:home:hero:slides:v2'
const LEGACY_HERO_STORAGE_KEY = 'portal-lander:home:hero'

export const heroArticles: HeroArticleSource[] = getRuntimeDataProvider().home.heroArticles()
export const defaultHeroSlide: HeroSlide = getRuntimeDataProvider().home.defaultHeroSlide()
export const defaultHeroConfig: HeroCarouselConfig = getRuntimeDataProvider().home.defaultHeroConfig()

export const AUTO_HERO_IMAGE_VISUAL: Required<HeroSlideResponsiveVisual> = {
  imagePositionX: 50,
  imagePositionY: 100,
  imageScale: 1,
  imageOffsetX: 0,
  imageOffsetY: 0,
}

function defaultCtas(slide: HeroSlide): HeroCta[] {
  return [
    { id: 'primary', active: Boolean(slide.primaryCtaLabel), label: slide.primaryCtaLabel, url: slide.primaryCtaUrl, external: false, order: 1, variant: 'primary' },
    { id: 'secondary', active: Boolean(slide.secondaryCtaLabel), label: slide.secondaryCtaLabel, url: slide.secondaryCtaUrl, external: false, order: 2, variant: 'secondary' },
  ]
}

function normalizeCtas(raw: HeroCta[] | undefined, base: HeroSlide): HeroCta[] {
  const source: HeroCta[] = Array.isArray(raw) && raw.length ? raw : defaultCtas(base)
  return source.map<HeroCta>((cta, index) => {
    const variant: HeroCtaVariant = cta.variant === 'secondary' ? 'secondary' : 'primary'
    return {
      id: String(cta.id || `cta-${index + 1}`),
      active: cta.active !== false,
      label: String(cta.label || ''),
      url: String(cta.url || ''),
      external: Boolean(cta.external),
      order: Number(cta.order) || index + 1,
      variant,
    }
  }).sort((a, b) => a.order - b.order)
}

function normalizeSlide(raw: Partial<HeroSlide> | null | undefined, index = 0): HeroSlide {
  const base: HeroSlide = {
    ...defaultHeroSlide,
    id: index === 0 ? defaultHeroSlide.id : `hero-slide-${Date.now()}-${index}`,
    order: index + 1,
  }
  if (!raw) return { ...base, ctas: normalizeCtas(base.ctas, base), responsive: {} }

  const merged: HeroSlide = {
    ...base,
    ...raw,
    image: raw.image ?? base.image,
    mediaCaption: String(raw.mediaCaption ?? base.mediaCaption),
    eyebrowVisible: raw.eyebrowVisible !== false,
    descriptionVisible: raw.descriptionVisible !== false,
    mediaCaptionVisible: raw.mediaCaptionVisible !== false,
    imageVisible: raw.imageVisible !== false,
    responsive: {
      tablet: { ...(raw.responsive?.tablet || {}) },
      mobile: { ...(raw.responsive?.mobile || {}) },
    },
    title: Array.isArray(raw.title) && raw.title.length
      ? raw.title.map(segment => ({
          text: String(segment?.text ?? ''),
          emphasis: Boolean(segment?.emphasis),
          color: segment?.color,
          visible: segment?.visible !== false,
          fontSize: segment?.fontSize,
          fontWeight: segment?.fontWeight,
          responsive: {
            tablet: { ...(segment?.responsive?.tablet || {}) },
            mobile: { ...(segment?.responsive?.mobile || {}) },
          },
        }))
      : base.title.map(segment => ({ ...segment, visible: segment.visible !== false, responsive: { tablet: {}, mobile: {} } })),
  }

  return { ...merged, ctas: normalizeCtas(raw.ctas, merged) }
}

function normalizeNavigation(value: HeroCarouselConfig['navigation']): HeroNavigation {
  if (value === 'dots' || value === 'arrows' || value === 'none' || value === 'arrows-dots') return value
  return 'arrows-dots'
}

function normalizeTicker(raw: Partial<HeroTicker> | undefined): HeroTicker {
  const base = defaultHeroConfig.ticker
  return {
    ...base,
    ...(raw || {}),
    active: raw?.active ?? base.active,
    label: String(raw?.label ?? base.label ?? 'AGORA'),
    text: String(raw?.text ?? base.text ?? ''),
    url: String(raw?.url ?? base.url ?? '/'),
    tag: String(raw?.tag ?? 'NOVO'),
    tagVisible: raw?.tagVisible !== false,
    external: Boolean(raw?.external),
    showArrow: raw?.showArrow !== false,
    background: String(raw?.background ?? '#ef0011'),
    textColor: String(raw?.textColor ?? '#ffffff'),
    tagBackground: String(raw?.tagBackground ?? '#111111'),
    tagTextColor: String(raw?.tagTextColor ?? '#ffffff'),
  }
}

function normalizeConfig(raw: Partial<HeroCarouselConfig> | null | undefined): HeroCarouselConfig {
  const source = raw ?? defaultHeroConfig
  const slides = Array.isArray(source.slides) && source.slides.length
    ? source.slides.map((slide, index) => normalizeSlide(slide, index))
    : defaultHeroConfig.slides.map((slide, index) => normalizeSlide(slide, index))

  return {
    ...defaultHeroConfig,
    ...source,
    navigation: normalizeNavigation(source.navigation ?? defaultHeroConfig.navigation),
    intervalMs: Math.max(3000, Number(source.intervalMs) || defaultHeroConfig.intervalMs),
    loop: source.loop !== false,
    ticker: normalizeTicker(source.ticker),
    slides,
  }
}

function legacyToConfig(raw: unknown): HeroCarouselConfig {
  if (!raw || typeof raw !== 'object') return normalizeConfig(defaultHeroConfig)
  const legacy = raw as LegacyHero
  return normalizeConfig({
    slides: [normalizeSlide({ ...legacy, order: 1, scheduledAt: '' }, 0)],
    ticker: { ...defaultHeroConfig.ticker, ...(legacy.ticker || {}) },
  })
}

export function readHeroConfig(): HeroCarouselConfig {
  try {
    const value = heroPersistence.read(HERO_STORAGE_KEY)
    if (value) return normalizeConfig(JSON.parse(value))
    const legacy = heroPersistence.read(LEGACY_HERO_STORAGE_KEY)
    if (legacy) return legacyToConfig(JSON.parse(legacy))
  } catch {
    return normalizeConfig(structuredClone(defaultHeroConfig))
  }
  return normalizeConfig(structuredClone(defaultHeroConfig))
}

export function writeHeroConfig(config: HeroCarouselConfig) {
  heroPersistence.write(HERO_STORAGE_KEY, JSON.stringify(normalizeConfig(config)))
  heroPersistence.notify()
}

export function resetHeroConfig() {
  heroPersistence.remove(HERO_STORAGE_KEY)
  heroPersistence.remove(LEGACY_HERO_STORAGE_KEY)
  heroPersistence.notify()
}

export function getRenderableHeroSlides(config = readHeroConfig()): HeroSlide[] {
  const now = Date.now()
  const active = config.slides.filter(slide => {
    if (slide.status !== 'active') return false
    const when = slide.scheduledAt || slide.publishedAt
    return !when || new Date(when).getTime() <= now
  }).sort((a, b) => a.order - b.order)
  return active.length ? active : [normalizeSlide(structuredClone(defaultHeroSlide))]
}

export function getAutomaticTitleSegmentVisual(segment: HeroTitleSegment, breakpoint: HeroBreakpoint): HeroTitleSegmentVisual {
  if (breakpoint === 'desktop') return { fontSize: segment.fontSize, fontWeight: segment.fontWeight }
  const factor = breakpoint === 'tablet' ? .78 : .55
  return {
    fontSize: segment.fontSize ? Math.max(28, Math.round(segment.fontSize * factor)) : undefined,
    fontWeight: segment.fontWeight,
  }
}

export function resolveTitleSegmentVisual(segment: HeroTitleSegment, breakpoint: HeroBreakpoint): HeroTitleSegmentVisual {
  const automatic = getAutomaticTitleSegmentVisual(segment, breakpoint)
  if (breakpoint === 'desktop') return automatic
  return { ...automatic, ...(segment.responsive?.[breakpoint] || {}) }
}

export function getAutomaticSlideVisual(slide: HeroSlide, breakpoint: HeroBreakpoint): Required<HeroSlideResponsiveVisual> {
  if (breakpoint === 'desktop') {
    return {
      imagePositionX: Number.isFinite(slide.imagePositionX) ? slide.imagePositionX : AUTO_HERO_IMAGE_VISUAL.imagePositionX,
      imagePositionY: Number.isFinite(slide.imagePositionY) ? slide.imagePositionY : AUTO_HERO_IMAGE_VISUAL.imagePositionY,
      imageScale: Number.isFinite(slide.imageScale) && slide.imageScale > 0 ? slide.imageScale : AUTO_HERO_IMAGE_VISUAL.imageScale,
      imageOffsetX: Number.isFinite(slide.imageOffsetX) ? slide.imageOffsetX : AUTO_HERO_IMAGE_VISUAL.imageOffsetX,
      imageOffsetY: Number.isFinite(slide.imageOffsetY) ? slide.imageOffsetY : AUTO_HERO_IMAGE_VISUAL.imageOffsetY,
    }
  }
  return { ...AUTO_HERO_IMAGE_VISUAL }
}

export function resolveSlideVisual(slide: HeroSlide, breakpoint: HeroBreakpoint): Required<HeroSlideResponsiveVisual> {
  const automatic = getAutomaticSlideVisual(slide, breakpoint)
  if (breakpoint === 'desktop') return automatic
  return { ...automatic, ...(slide.responsive?.[breakpoint] || {}) }
}

export function hasSlideVisualOverride(slide: HeroSlide, breakpoint: HeroBreakpoint, key?: keyof HeroSlideResponsiveVisual) {
  if (breakpoint === 'desktop') return false
  const values = slide.responsive?.[breakpoint]
  if (!values) return false
  return key ? values[key] !== undefined : Object.keys(values).length > 0
}

export function setSlideVisualOverride<K extends keyof HeroSlideResponsiveVisual>(slide: HeroSlide, breakpoint: HeroBreakpoint, key: K, value: HeroSlideResponsiveVisual[K]): HeroSlide {
  if (breakpoint === 'desktop') return { ...slide, [key]: value }
  return { ...slide, responsive: { ...(slide.responsive || {}), [breakpoint]: { ...(slide.responsive?.[breakpoint] || {}), [key]: value } } }
}

export function clearSlideVisualOverrides(slide: HeroSlide, breakpoint: HeroBreakpoint): HeroSlide {
  if (breakpoint === 'desktop') return slide
  return { ...slide, responsive: { ...(slide.responsive || {}), [breakpoint]: {} } }
}

export function applyArticleToSlide(slide: HeroSlide, article: HeroArticleSource): HeroSlide {
  return {
    ...slide,
    articleId: article.id,
    category: article.category,
    description: article.summary,
    image: article.image || slide.image,
    imageAlt: article.imageAlt || slide.imageAlt,
    primaryCtaUrl: article.url,
    ctas: (slide.ctas || defaultCtas(slide)).map<HeroCta>(cta => cta.variant === 'primary' ? { ...cta, url: article.url } : cta),
  }
}
