import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  HERO_APPEARANCE_EVENT,
  readHeroAppearance,
  resolveHeroAppearance,
  type HeroAppearanceConfig,
  type HeroBreakpoint,
} from '../models/heroAppearanceModel'
import {
  defaultHeroConfig,
  defaultHeroSlide,
  getRenderableHeroSlides,
  readHeroConfig,
  resolveSlideVisual,
  resolveTitleSegmentVisual,
  type HeroCarouselConfig,
  type HeroSlide,
} from '../models/heroModel'
import '../styles/hero-responsive.css'

function SmartLink({ to, className, children, external: forcedExternal, style }: { to: string; className?: string; children: React.ReactNode; external?: boolean; style?: CSSProperties }) {
  const external = forcedExternal ?? /^https?:\/\//i.test(to)
  if (external) return <a className={className} style={style} href={to || '#'} target="_blank" rel="noreferrer">{children}</a>
  return <Link className={className} style={style} to={to || '/'}>{children}</Link>
}

function subscribeViewport(callback: () => void) {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

function getViewportSnapshot(): HeroBreakpoint {
  if (typeof window === 'undefined') return 'desktop'
  if (window.innerWidth <= 700) return 'mobile'
  if (window.innerWidth <= 900) return 'tablet'
  return 'desktop'
}

function getServerViewportSnapshot(): HeroBreakpoint {
  return 'desktop'
}

function useViewportBreakpoint(): HeroBreakpoint {
  return useSyncExternalStore<HeroBreakpoint>(subscribeViewport, getViewportSnapshot, getServerViewportSnapshot)
}

export function HeroSection({
  config,
  appearance,
  previewIndex = 0,
  disableAutoplay = false,
  previewViewport,
}: {
  config?: HeroCarouselConfig
  appearance?: HeroAppearanceConfig
  previewIndex?: number
  disableAutoplay?: boolean
  previewViewport?: HeroBreakpoint
}) {
  const [storedConfig, setStoredConfig] = useState<HeroCarouselConfig>(() => readHeroConfig())
  const [storedAppearance, setStoredAppearance] = useState<HeroAppearanceConfig>(() => readHeroAppearance())
  const [activeIndex, setActiveIndex] = useState(previewIndex)
  const [paused, setPaused] = useState(false)
  const liveBreakpoint = useViewportBreakpoint()
  const breakpoint: HeroBreakpoint = previewViewport ?? liveBreakpoint
  const runtimeConfig = config ?? storedConfig
  const baseAppearance = appearance ?? storedAppearance
  const runtimeAppearance = resolveHeroAppearance(baseAppearance, breakpoint)

  useEffect(() => {
    if (config) return
    const sync = () => { setStoredConfig(readHeroConfig()); setActiveIndex(0) }
    window.addEventListener('portal-lander:hero-updated', sync)
    return () => window.removeEventListener('portal-lander:hero-updated', sync)
  }, [config])

  useEffect(() => {
    if (appearance) return
    const sync = () => setStoredAppearance(readHeroAppearance())
    window.addEventListener(HERO_APPEARANCE_EVENT, sync)
    return () => window.removeEventListener(HERO_APPEARANCE_EVENT, sync)
  }, [appearance])

  const slides = useMemo(() => getRenderableHeroSlides(runtimeConfig), [runtimeConfig])
  const requestedIndex = previewViewport ? previewIndex : activeIndex
  const safeIndex = Math.min(requestedIndex, Math.max(0, slides.length - 1))
  const hero: HeroSlide = slides[safeIndex] || defaultHeroSlide
  const visual = resolveSlideVisual(hero, breakpoint)
  const ctas = (hero.ctas || []).filter(item => item.active && item.label).sort((a, b) => a.order - b.order)
  const navigation = runtimeConfig.navigation || 'arrows-dots'
  const loop = runtimeConfig.loop !== false

  useEffect(() => {
    if (disableAutoplay || !runtimeConfig.autoplay || paused || slides.length <= 1) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setActiveIndex(index => {
        if (index >= slides.length - 1 && !loop) return index
        return (index + 1) % slides.length
      })
    }, Math.max(3000, runtimeConfig.intervalMs || defaultHeroConfig.intervalMs))
    return () => window.clearInterval(timer)
  }, [disableAutoplay, runtimeConfig.autoplay, runtimeConfig.intervalMs, paused, slides.length, loop])

  if (!runtimeAppearance.active) return null

  const go = (delta: number) => {
    setActiveIndex(index => {
      const target = index + delta
      if (loop) return (target + slides.length) % slides.length
      return Math.min(Math.max(target, 0), slides.length - 1)
    })
  }

  const ticker = runtimeConfig.ticker
  const hasTicker = ticker.active
  const radius = runtimeAppearance.radius
  const mediaStyle = {
    '--hero-image-scale': visual.imageScale,
    '--hero-image-offset-x': `${visual.imageOffsetX}px`,
    '--hero-image-offset-y': `${visual.imageOffsetY}px`,
    '--hero-media-width': `${runtimeAppearance.mediaWidthPercent}%`,
    '--hero-media-min-height': `${runtimeAppearance.mediaMinHeight}px`,
  } as CSSProperties
  const rootStyle = {
    background: runtimeAppearance.background,
    minHeight: runtimeAppearance.height,
    borderRadius: hasTicker ? `${radius}px ${radius}px 0 0` : radius,
    borderColor: runtimeAppearance.borderColor,
    overflow: 'hidden',
    marginBottom: 0,
    '--hero-title-line-height': runtimeAppearance.titleLineHeight,
    '--hero-title-max-width': `${runtimeAppearance.titleMaxWidth}px`,
    '--hero-description-max-width': `${runtimeAppearance.descriptionMaxWidth}px`,
    '--hero-content-gap': `${runtimeAppearance.contentGap}px`,
    '--hero-cta-gap': `${runtimeAppearance.ctaGap}px`,
    '--hero-cta-height': `${runtimeAppearance.ctaHeight}px`,
    '--hero-cta-padding-x': `${runtimeAppearance.ctaPaddingX}px`,
    '--hero-content-padding-top': `${runtimeAppearance.contentPaddingTop}px`,
    '--hero-content-padding-bottom': `${runtimeAppearance.contentPaddingBottom}px`,
  } as CSSProperties
  const shellStyle: CSSProperties = {
    maxWidth: runtimeAppearance.width <= 100 ? undefined : runtimeAppearance.width,
    paddingLeft: runtimeAppearance.paddingX,
    paddingRight: runtimeAppearance.paddingX,
    paddingTop: runtimeAppearance.paddingY,
    paddingBottom: runtimeAppearance.paddingY,
    alignItems: runtimeAppearance.verticalAlign === 'start' ? 'start' : runtimeAppearance.verticalAlign === 'end' ? 'end' : 'center',
  }
  const contentStyle: CSSProperties = { textAlign: runtimeAppearance.contentAlign, maxWidth: runtimeAppearance.titleMaxWidth }
  const tickerStyle: CSSProperties = {
    marginTop: 0,
    background: ticker.background || '#ef0011',
    color: ticker.textColor || '#ffffff',
    borderRadius: `0 0 ${radius}px ${radius}px`,
    overflow: 'hidden',
  }

  return <>
    <section className={`portal-hero editorial-hero hero-breakpoint-${breakpoint}`} data-hero-breakpoint={breakpoint} style={rootStyle} aria-label="Destaque principal" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="editorial-hero-background" aria-hidden="true" />
      <div className="editorial-hero-overlay" aria-hidden="true" />
      <div className="shell editorial-hero-grid" style={shellStyle}>
        <div className="editorial-hero-content" style={contentStyle}>
          {hero.eyebrowVisible !== false && hero.eyebrow && <div className="editorial-eyebrow" style={{ color: runtimeAppearance.eyebrowColor, fontSize: runtimeAppearance.eyebrowSize, fontWeight: runtimeAppearance.eyebrowWeight }}><span aria-hidden="true" />{hero.eyebrow}</div>}
          <h1 className="editorial-title" style={{ color: runtimeAppearance.titleColor, lineHeight: runtimeAppearance.titleLineHeight, maxWidth: runtimeAppearance.titleMaxWidth }}>{hero.title.filter(segment => segment.visible !== false).map((segment, index) => {
            const segmentVisual = resolveTitleSegmentVisual(segment, breakpoint)
            return <span className={segment.emphasis ? 'emphasis' : ''} style={{ color: segment.color || runtimeAppearance.titleColor, fontSize: segmentVisual.fontSize ? `${segmentVisual.fontSize}px` : undefined, fontWeight: segmentVisual.fontWeight || undefined }} key={`${segment.text}-${index}`}>{segment.text}</span>
          })}</h1>
          {hero.descriptionVisible !== false && hero.description && <p style={{ color: runtimeAppearance.textColor, fontSize: runtimeAppearance.descriptionSize, fontWeight: runtimeAppearance.descriptionWeight, maxWidth: runtimeAppearance.descriptionMaxWidth }}>{hero.description}</p>}
          {ctas.length > 0 && <div className="editorial-actions" style={{ gap: runtimeAppearance.ctaGap }}>{ctas.map(cta => <SmartLink key={cta.id} to={cta.url} external={cta.external} className={cta.variant === 'secondary' ? 'editorial-secondary' : 'portal-button'} style={{ minHeight: runtimeAppearance.ctaHeight, paddingLeft: runtimeAppearance.ctaPaddingX, paddingRight: runtimeAppearance.ctaPaddingX, fontSize: runtimeAppearance.ctaSize, fontWeight: runtimeAppearance.ctaWeight, ...(cta.variant === 'primary' ? { background: runtimeAppearance.accentColor } : { borderColor: runtimeAppearance.accentColor, color: runtimeAppearance.textColor }) }}>{cta.label}{cta.variant === 'primary' && <ArrowRight size={20} />}</SmartLink>)}</div>}
        </div>

        <div className="editorial-hero-media" style={mediaStyle}>
          {hero.imageVisible !== false && hero.image && <img className="editorial-featured-image" src={hero.image} alt={hero.imageAlt || ''} fetchPriority="high" decoding="async" style={{ objectPosition: `${visual.imagePositionX}% ${visual.imagePositionY}%`, width: `${runtimeAppearance.mediaWidthPercent}%` }} onError={event => { if (defaultHeroSlide.image && event.currentTarget.src !== defaultHeroSlide.image) event.currentTarget.src = defaultHeroSlide.image }} />}
          {hero.mediaCaptionVisible !== false && hero.mediaCaption && <span className="editorial-media-caption" style={{ color: runtimeAppearance.textColor }}>{hero.mediaCaption}</span>}
        </div>
      </div>

      {slides.length > 1 && navigation !== 'none' && <div className="hero-carousel-controls shell" aria-label="Navegação dos destaques">
        {(navigation === 'arrows' || navigation === 'arrows-dots') && <div className="hero-carousel-arrows"><button type="button" aria-label="Destaque anterior" onClick={() => go(-1)} disabled={!loop && safeIndex === 0}><ArrowLeft size={17} /></button><button type="button" aria-label="Próximo destaque" onClick={() => go(1)} disabled={!loop && safeIndex === slides.length - 1}><ArrowRight size={17} /></button></div>}
        {(navigation === 'dots' || navigation === 'arrows-dots') && <div className="hero-carousel-dots">{slides.map((item, index) => <button type="button" aria-label={`Ir para destaque ${index + 1}`} className={index === safeIndex ? 'active' : ''} onClick={() => setActiveIndex(index)} key={item.id} />)}</div>}
        <span>{String(safeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
      </div>}
      <div className="hero-noise" aria-hidden="true" />
    </section>

    {hasTicker && <section className={`portal-breaking editorial-ticker hero-breakpoint-${breakpoint}`} style={tickerStyle} aria-label="Agora"><SmartLink to={ticker.url || '/'} external={ticker.external} className="shell" style={{ color: ticker.textColor || '#ffffff' }}><strong>{ticker.label}</strong><i aria-hidden="true" />{ticker.tagVisible !== false && ticker.tag && <span className="editorial-ticker-tag" style={{ background: ticker.tagBackground || '#111111', color: ticker.tagTextColor || '#ffffff' }}>{ticker.tag}</span>}<p>{ticker.text}</p>{ticker.showArrow !== false && <ArrowRight size={20} />}</SmartLink></section>}
  </>
}
