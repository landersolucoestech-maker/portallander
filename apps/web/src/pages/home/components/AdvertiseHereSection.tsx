import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  advertisingResponsiveCssVariables,
  type AdvertisingSectionConfiguration,
} from '../../../features/site-manager/advertisingSectionLayout'
import { defaultHomeAdConfig, readHomeAdConfig, type HomeAdConfig } from '../models/adModel'

function SmartAdvertiseHereLink({ to, target, children, className }: { to: string; target:'same'|'new'; children: ReactNode; className?:string }) {
  if (target==='same'&&!/^https?:\/\//i.test(to)) return <Link to={to || '/'} className={className}>{children}</Link>
  const href=/^https?:\/\//i.test(to)?to:`${window.location.pathname}#${to||'/'}`
  return <a href={href} target={target==='new'?'_blank':'_self'} rel={target==='new'?'noreferrer':undefined} className={className}>{children}</a>
}

export function AdvertiseHereSection({ config, layout }: { config?: HomeAdConfig; layout?: AdvertisingSectionConfiguration }) {
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
    ...(layout?advertisingResponsiveCssVariables(layout):{}),
  } as CSSProperties
  const linkEnabled=Boolean(layout?.adLinkEnabled&&layout.linkUrl)
  const target=layout?.adLinkTarget||'same'
  const imageFit=layout?.adImageFit==='cover'?'cover':'contain'

  if(layout&&ad.image){
    const creative=<img className="pl-ad-image pl-ad-image-creative" src={ad.image} alt={ad.imageAlt||'Publicidade Anuncie Aqui'}/>
    return <section className={`pl-ad pl-ad-dynamic official-secao-anuncie-aqui pl-home-configurable-ad ad-fit-${imageFit}`} style={style} aria-label="Seção Anuncie Aqui">
      {linkEnabled?<SmartAdvertiseHereLink to={layout.linkUrl} target={target} className="pl-ad-area-link">{creative}<span className="sr-only">Abrir publicidade</span></SmartAdvertiseHereLink>:creative}
    </section>
  }

  return <section className={`pl-ad pl-ad-dynamic official-secao-anuncie-aqui align-${ad.align}${layout?' pl-home-configurable-ad':''}`} style={style} aria-label="Seção Anuncie Aqui">
    <div className="pl-ad-shade" aria-hidden="true" />
    <div className="pl-ad-content">
      {ad.logo && <img className="pl-ad-logo" src={ad.logo} alt={ad.logoAlt||'Logo do anunciante'} style={{width:`${ad.logoWidth}px`}}/>}
      {ad.title && <b><em>{ad.title}</em></b>}
      {ad.subtitle && <span>{ad.subtitle}</span>}
      {ad.buttonLabel&&(linkEnabled?<span className="pl-ad-button-static">{ad.buttonLabel}</span>:<SmartAdvertiseHereLink to={ad.buttonUrl} target="same">{ad.buttonLabel}</SmartAdvertiseHereLink>)}
    </div>
  </section>
}
