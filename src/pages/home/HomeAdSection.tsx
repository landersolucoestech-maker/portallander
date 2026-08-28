import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { defaultHomeAdConfig, readHomeAdConfig, type HomeAdConfig } from './adModel'

function SmartAdLink({ to, children }: { to: string; children: React.ReactNode }) {
  if (/^https?:\/\//i.test(to)) return <a href={to} target="_blank" rel="noreferrer">{children}</a>
  return <Link to={to || '/'}>{children}</Link>
}

export function HomeAdSection({ config }: { config?: HomeAdConfig }) {
  const [runtime, setRuntime] = useState<HomeAdConfig>(() => readHomeAdConfig())

  useEffect(() => {
    if (config) return
    const sync = () => setRuntime(readHomeAdConfig())
    window.addEventListener('portal-lander:home-ad-updated', sync)
    return () => window.removeEventListener('portal-lander:home-ad-updated', sync)
  }, [config])

  const ad = config || runtime || defaultHomeAdConfig
  if (!ad.active) return null

  const style = {
    ['--home-ad-height' as string]: `${ad.height}px`,
    ['--home-ad-content-width' as string]: `${ad.contentWidth}px`,
  }

  return <section className={`pl-ad pl-ad-dynamic align-${ad.align}`} style={style} aria-label="Publicidade">
    {ad.image && <img className="pl-ad-image" src={ad.image} alt={ad.imageAlt} />}
    <div className="pl-ad-shade" aria-hidden="true" />
    <div className="pl-ad-content">
      {ad.title && <b><em>{ad.title}</em></b>}
      {ad.subtitle && <span>{ad.subtitle}</span>}
      {ad.buttonLabel && <SmartAdLink to={ad.buttonUrl}>{ad.buttonLabel}</SmartAdLink>}
    </div>
  </section>
}
