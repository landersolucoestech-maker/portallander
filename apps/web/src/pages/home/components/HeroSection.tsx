import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { defaultHeroConfig, defaultHeroSlide, getRenderableHeroSlides, readHeroConfig, type HeroCarouselConfig, type HeroSlide } from '../models/heroModel'

function SmartLink({ to, className, children, external:forcedExternal }: { to: string; className?: string; children: React.ReactNode; external?:boolean }) {
  const external = forcedExternal ?? /^https?:\/\//i.test(to)
  if (external) return <a className={className} href={to || '#'} target="_blank" rel="noreferrer">{children}</a>
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
  const ctas=(hero.ctas||[]).filter(item=>item.active&&item.label).sort((a,b)=>a.order-b.order)
  const navigation=runtimeConfig.navigation||'arrows-dots'

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
          {hero.eyebrowVisible!==false&&hero.eyebrow&&<div className="editorial-eyebrow"><span aria-hidden="true" />{hero.eyebrow}</div>}
          <h1 className="editorial-title">{hero.title.filter(segment=>segment.visible!==false).map((segment, index) => <span className={segment.emphasis ? 'emphasis' : ''} style={{color:segment.color||undefined,fontSize:segment.fontSize?`${segment.fontSize}px`:undefined,fontWeight:segment.fontWeight||undefined}} key={`${segment.text}-${index}`}>{segment.text}</span>)}</h1>
          {hero.descriptionVisible!==false&&hero.description&&<p>{hero.description}</p>}
          {ctas.length>0&&<div className="editorial-actions">{ctas.map(cta=><SmartLink key={cta.id} to={cta.url} external={cta.external} className={cta.variant==='secondary'?'editorial-secondary':'portal-button'}>{cta.label}{cta.variant==='primary'&&<ArrowRight size={20}/>}</SmartLink>)}</div>}
        </div>

        <div className="editorial-hero-media" style={mediaStyle}>
          {hero.imageVisible!==false&&hero.image&&<img className="editorial-featured-image" src={hero.image} alt={hero.imageAlt || ''} fetchPriority="high" decoding="async" style={{ objectPosition: `${hero.imagePositionX}% ${hero.imagePositionY}%` }} onError={event => { if (defaultHeroSlide.image&&event.currentTarget.src !== defaultHeroSlide.image) event.currentTarget.src = defaultHeroSlide.image }} />}
          {hero.mediaCaptionVisible!==false&&hero.mediaCaption&&<span className="editorial-media-caption">{hero.mediaCaption}</span>}
        </div>
      </div>

      {slides.length > 1&&navigation!=='none'&&<div className="hero-carousel-controls shell" aria-label="Navegação dos destaques">
        {(navigation==='arrows'||navigation==='arrows-dots')&&<div className="hero-carousel-arrows"><button type="button" aria-label="Destaque anterior" onClick={() => go(-1)}><ArrowLeft size={17} /></button><button type="button" aria-label="Próximo destaque" onClick={() => go(1)}><ArrowRight size={17} /></button></div>}
        {(navigation==='dots'||navigation==='arrows-dots')&&<div className="hero-carousel-dots">{slides.map((slide, index) => <button type="button" aria-label={`Ir para destaque ${index + 1}`} className={index === safeIndex ? 'active' : ''} onClick={() => setActiveIndex(index)} key={slide.id} />)}</div>}
        <span>{String(safeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
      </div>}
      <div className="hero-noise" aria-hidden="true" />
    </section>

    {runtimeConfig.ticker.active && <section className="portal-breaking editorial-ticker" aria-label="Agora"><SmartLink to={runtimeConfig.ticker.url || '/'} className="shell"><strong>{runtimeConfig.ticker.label}</strong><i aria-hidden="true" /><p>{runtimeConfig.ticker.text}</p><ArrowRight size={20} /></SmartLink></section>}
  </>
}
