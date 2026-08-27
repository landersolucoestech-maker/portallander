import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { portalLogo } from './brandAsset'
import { readRenderableHero, type HeroHighlight } from './heroModel'

function SmartLink({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  const external = /^https?:\/\//i.test(to)
  if (external) return <a className={className} href={to} target="_blank" rel="noreferrer">{children}</a>
  return <Link className={className} to={to || '/'}>{children}</Link>
}

export function HeroSection({ hero = readRenderableHero() }: { hero?: HeroHighlight }) {
  return <>
    <section className="portal-hero editorial-hero" aria-label="Destaque principal">
      <div className="editorial-hero-background" aria-hidden="true" />
      <div className="editorial-hero-overlay" aria-hidden="true" />
      <div className="shell editorial-hero-grid">
        <div className="editorial-hero-content">
          <div className="editorial-eyebrow"><span aria-hidden="true" />{hero.eyebrow}</div>
          <h1 className="editorial-title">
            {hero.title.map((segment, index) => <span className={segment.emphasis ? 'emphasis' : ''} key={`${segment.text}-${index}`}>{segment.text}</span>)}
          </h1>
          <p>{hero.description}</p>
          <div className="editorial-actions">
            <SmartLink to={hero.primaryCtaUrl} className="portal-button">{hero.primaryCtaLabel}<ArrowRight size={20}/></SmartLink>
            <SmartLink to={hero.secondaryCtaUrl} className="editorial-secondary">{hero.secondaryCtaLabel}</SmartLink>
          </div>
        </div>

        <div className="editorial-hero-media">
          <div className="editorial-brand-graphic" aria-hidden="true"><img src={portalLogo} alt="" /></div>
          {hero.image ? <img
            className="editorial-featured-image"
            src={hero.image}
            alt={hero.imageAlt}
            fetchPriority="high"
            decoding="async"
          /> : <div className="editorial-image-missing" role="img" aria-label={hero.imageAlt}><span>IMAGEM PRINCIPAL</span><small>Defina o asset real no Gerenciador do Site</small></div>}
          <span className="editorial-media-caption" aria-hidden="true">NOTÍCIAS · FUNK · CULTURA · ENTRETENIMENTO</span>
        </div>
      </div>
      <div className="hero-noise" aria-hidden="true" />
    </section>

    {hero.ticker.active && <section className="portal-breaking editorial-ticker" aria-label="Agora">
      <SmartLink to={hero.ticker.url || '/'} className="shell">
        <strong>{hero.ticker.label}</strong><i aria-hidden="true" />
        <p>{hero.ticker.text}</p><ArrowRight size={20}/>
      </SmartLink>
    </section>}
  </>
}
