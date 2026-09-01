import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Fragment, useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties } from 'react'
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
  resolveTickerViewport,
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
  const tickerViewport = resolveTickerViewport(ticker, breakpoint)
  const tickerItems = (ticker.items || []).filter(item => item.active && item.text).sort((a, b) => a.order - b.order)
  const repeatCount = Math.max(4, Math.ceil(12 / Math.max(1, tickerItems.length)))
  const tickerSequence = Array.from({ length: repeatCount }, () => tickerItems).flat()
  const hasTicker = ticker.active && !tickerViewport.hidden && tickerItems.length > 0
  const tickerDuration = Math.max(6, 62 - Math.min(100, Math.max(1, tickerViewport.speed)) * .48)
  const radius = runtimeAppearance.radius

  const mediaStyle = {
    '--hero-image-x': `${visual.imagePositionX}%`,
    '--hero-image-y': `${visual.imagePositionY}%`,
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
    '--hero-content-media-gap': `${runtimeAppearance.contentMediaGap}px`,
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
    paddingBottom: 0,
    alignItems: runtimeAppearance.verticalAlign === 'start' ? 'start' : runtimeAppearance.verticalAlign === 'end' ? 'end' : 'center',
  }

  const contentStyle: CSSProperties = {
    textAlign: runtimeAppearance.contentAlign,
    maxWidth: runtimeAppearance.titleMaxWidth,
    paddingBottom: runtimeAppearance.contentPaddingBottom + runtimeAppearance.paddingY,
  }

  const tickerStyle = {
    marginTop: 0,
    background: ticker.background,
    color: ticker.textColor,
    minHeight: tickerViewport.height,
    height: tickerViewport.height,
    borderRadius: `0 0 ${radius}px ${radius}px`,
    overflow: 'hidden',
    borderStyle: ticker.borderEnabled ? 'solid' : 'none',
    borderWidth: ticker.borderEnabled ? ticker.borderWidth : 0,
    borderColor: ticker.borderColor,
    fontFamily: ticker.fontFamily || 'inherit',
    fontSize: tickerViewport.fontSize,
    fontWeight: ticker.fontWeight,
    textTransform: ticker.textTransform,
    '--ticker-gap': `${tickerViewport.gap}px`,
    '--ticker-duration': `${tickerDuration}s`,
    '--ticker-text-color': ticker.textColor,
    '--ticker-label-color': ticker.labelColor,
    '--ticker-separator-color': ticker.separatorColor,
    '--ticker-hover-color': ticker.hoverColor,
  } as CSSProperties

  const imageStyle: CSSProperties = {
    left: `${visual.imagePositionX}%`,
    top: 'auto',
    bottom: 0,
    width: `min(${runtimeAppearance.mediaWidthPercent}%, 100%)`,
    height: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    objectPosition: `${visual.imagePositionX}% ${visual.imagePositionY}%`,
    transform: `translate(calc(-50% + ${visual.imageOffsetX}px), ${visual.imageOffsetY}px) scale(${visual.imageScale})`,
    transformOrigin: 'center bottom',
    display: 'block',
    visibility: 'visible',
    opacity: 1,
  }

  const tickerAlign: CSSProperties['alignItems'] = ticker.verticalAlign === 'start' ? 'flex-start' : ticker.verticalAlign === 'end' ? 'flex-end' : 'center'

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
          {hero.imageVisible !== false && hero.image && <img className="editorial-featured-image" src={hero.image} alt={hero.imageAlt || ''} fetchPriority="high" decoding="async" style={imageStyle} onError={event => { if (defaultHeroSlide.image && event.currentTarget.src !== defaultHeroSlide.image) event.currentTarget.src = defaultHeroSlide.image }} />}
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

    {hasTicker && <section className={`portal-breaking editorial-ticker hero-breakpoint-${breakpoint}`} style={tickerStyle} aria-label="Agora">
      <div className="editorial-ticker-shell" style={{ alignItems: tickerAlign }}>
        <strong className="editorial-ticker-label">{ticker.label}</strong>
        <div className="editorial-ticker-viewport">
          <div className={`editorial-ticker-track ${ticker.direction === 'ltr' ? 'direction-ltr' : 'direction-rtl'} ${ticker.loop ? 'is-running' : 'is-static'} ${ticker.pauseOnHover ? 'pause-on-hover' : ''}`}>
            {(ticker.loop ? [0, 1] : [0]).map(group => <div className="editorial-ticker-group" aria-hidden={group === 1 ? true : undefined} key={group}>
              {tickerSequence.map((item, index) => <Fragment key={`${group}-${item.id}-${index}`}>
                <SmartLink to={item.url || '/'} external={item.external} className="editorial-ticker-item">{item.text}</SmartLink>
                <span className="editorial-ticker-separator" aria-hidden="true">{ticker.separator}</span>
              </Fragment>)}
            </div>)}
          </div>
        </div>
      </div>
    </section>}
  </>
}
