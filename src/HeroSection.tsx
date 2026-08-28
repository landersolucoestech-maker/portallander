import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { defaultHeroConfig, defaultHeroSlide, getRenderableHeroSlides, readHeroConfig, type HeroCarouselConfig, type HeroSlide } from './heroModel'

function SmartLink({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  const external = /^https?:\/\//i.test(to)
  if (external) return <a className={className} href={to} target="_blank" rel="noreferrer">{children}</a>
  return <Link className={className} to={to || '/'}>{children}</Link>
}

export function HeroSection({ config, previewIndex = 0, disableAutoplay = false }: { config?: HeroCarouselConfig; previewIndex?: number; disableAutoplay?: boolean }) {
  const [storedConfig, setStoredConfig] = useState<HeroCarouselConfig>(() => readHeroConfig())
  const [activeIndex, setActiveIndex] = useState(previewIndex)
  const [paused, setPaused] = useState(false)
  const runtimeConfig = config ?? storedConfig

  useEffect(() => {
    if (config) return
    const sync = () => {
      setStoredConfig(readHeroConfig())
      setActiveIndex(0)
    }
    window.addEventListener('portal-lander:hero-updated', sync)
    return () => window.removeEventListener('portal-lander:hero-updated', sync)
  }, [config])

  const slides = useMemo(() => getRenderableHeroSlides(runtimeConfig), [runtimeConfig])
  const safeIndex = Math.min(activeIndex, Math.max(0, slides.length - 1))
  const hero: HeroSlide = slides[safeIndex] || defaultHeroSlide

  useEffect(() => {
    if (disableAutoplay || !runtimeConfig.autoplay || paused || slides.length <= 1) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActiveIndex(index => (index + 1) % slides.length), Math.max(3000, runtimeConfig.intervalMs || defaultHeroConfig.intervalMs))
    return () => window.clearInterval(timer)
  }, [disableAutoplay, runtimeConfig.autoplay, runtimeConfig.intervalMs, paused, slides.length])

  const go = (delta: number) => setActiveIndex(index => (index + delta + slides.length) % slides.length)
  const mediaStyle = {
    '--hero-image-scale': hero.imageScale,
    '--hero-image-offset-x': `${hero.imageOffsetX}px`,
    '--hero-image-offset-y': `${hero.imageOffsetY}px`,
  } as CSSProperties

  return <>
    <section className="portal-hero editorial-hero" aria-label="Destaque principal" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="editorial-hero-background" aria-hidden="true" />
      <div className="editorial-hero-overlay" aria-hidden="true" />
      <div className="shell editorial-hero-grid">
        <div className="editorial-hero-content">
          <div className="editorial-eyebrow"><span aria-hidden="true" />{hero.eyebrow}</div>
          <h1 className="editorial-title">{hero.title.map((segment, index) => <span className={segment.emphasis ? 'emphasis' : ''} key={`${segment.text}-${index}`}>{segment.text}</span>)}</h1>
          <p>{hero.description}</p>
          <div className="editorial-actions">
            <SmartLink to={hero.primaryCtaUrl} className="portal-button">{hero.primaryCtaLabel}<ArrowRight size={20} /></SmartLink>
            <SmartLink to={hero.secondaryCtaUrl} className="editorial-secondary">{hero.secondaryCtaLabel}</SmartLink>
          </div>
        </div>

        <div className="editorial-hero-media" style={mediaStyle}>
          <img className="editorial-featured-image" src={hero.image || defaultHeroSlide.image} alt={hero.imageAlt || defaultHeroSlide.imageAlt} fetchPriority="high" decoding="async" style={{ objectPosition: `${hero.imagePositionX}% ${hero.imagePositionY}%` }} onError={event => { if (event.currentTarget.src !== defaultHeroSlide.image) event.currentTarget.src = defaultHeroSlide.image }} />
          {hero.mediaCaption && <span className="editorial-media-caption">{hero.mediaCaption}</span>}
        </div>
      </div>

      {slides.length > 1 && <div className="hero-carousel-controls shell" aria-label="Navegação dos destaques">
        <div className="hero-carousel-arrows"><button type="button" aria-label="Destaque anterior" onClick={() => go(-1)}><ArrowLeft size={17} /></button><button type="button" aria-label="Próximo destaque" onClick={() => go(1)}><ArrowRight size={17} /></button></div>
        <div className="hero-carousel-dots">{slides.map((slide, index) => <button type="button" aria-label={`Ir para destaque ${index + 1}`} className={index === safeIndex ? 'active' : ''} onClick={() => setActiveIndex(index)} key={slide.id} />)}</div>
        <span>{String(safeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
      </div>}
      <div className="hero-noise" aria-hidden="true" />
    </section>

    {runtimeConfig.ticker.active && <section className="portal-breaking editorial-ticker" aria-label="Agora"><SmartLink to={runtimeConfig.ticker.url || '/'} className="shell"><strong>{runtimeConfig.ticker.label}</strong><i aria-hidden="true" /><p>{runtimeConfig.ticker.text}</p><ArrowRight size={20} /></SmartLink></section>}
  </>
}
