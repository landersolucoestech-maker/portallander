import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { defaultHomeAdConfig, readHomeAdConfig, type HomeAdConfig } from '../models/adModel'

function SmartAdvertiseHereLink({ to, children }: { to: string; children: React.ReactNode }) {
  if (/^https?:\/\//i.test(to)) return <a href={to} target="_blank" rel="noreferrer">{children}</a>
  return <Link to={to || '/'}>{children}</Link>
}

export function AdvertiseHereSection({ config }: { config?: HomeAdConfig }) {
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

  return <section className={`pl-ad pl-ad-dynamic official-secao-anuncie-aqui align-${ad.align}`} style={style} aria-label="Seção Anuncie Aqui">
    {ad.image && <img className="pl-ad-image" src={ad.image} alt={ad.imageAlt} />}
    <div className="pl-ad-shade" aria-hidden="true" />
    <div className="pl-ad-content">
      {ad.logo && <img className="pl-ad-logo" src={ad.logo} alt={ad.logoAlt||'Logo do anunciante'} style={{width:`${ad.logoWidth}px`}}/>}
      {ad.title && <b><em>{ad.title}</em></b>}
      {ad.subtitle && <span>{ad.subtitle}</span>}
      {ad.buttonLabel && <SmartAdvertiseHereLink to={ad.buttonUrl}>{ad.buttonLabel}</SmartAdvertiseHereLink>}
    </div>
  </section>
}
