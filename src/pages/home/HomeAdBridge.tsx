import { Bell, Building2, ChevronDown, FileText, Images, LayoutDashboard, Newspaper, Palette, Settings, Star, Tags } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { HomeAdEditor } from '../../HomeAdEditor'
import { readHomeAdConfig, type HomeAdConfig } from '../../adModel'

function ManagedAdContent({ config }: { config: HomeAdConfig }) {
  if (!config.active) return null
  const style = {
    ['--home-ad-height' as string]: `${config.height}px`,
    ['--home-ad-content-width' as string]: `${config.contentWidth}px`,
  }
  return <div className={`home-ad-portal align-${config.align}`} style={style}>
    {config.image && <img className="pl-ad-image" src={config.image} alt={config.imageAlt} />}
    <div className="pl-ad-shade" aria-hidden="true" />
    <div className="pl-ad-content">
      {config.logo && <img className="pl-ad-logo" src={config.logo} alt={config.logoAlt || 'Logo do anunciante'} style={{width:`${config.logoWidth}px`}} />}
      {config.title && <b><em>{config.title}</em></b>}
      {config.subtitle && <span>{config.subtitle}</span>}
      {config.buttonLabel && (/^https?:\/\//i.test(config.buttonUrl)
        ? <a href={config.buttonUrl} target="_blank" rel="noreferrer">{config.buttonLabel}</a>
        : <Link to={config.buttonUrl || '/'}>{config.buttonLabel}</Link>)}
    </div>
  </div>
}

const siteNav = [
  ['Visão geral', LayoutDashboard, '/app/site'],
  ['Marca & Logos', Palette, '/app/site/marca'],
  ['Home · Hero', Star, '/app/site/home/hero'],
  ['Home · Anúncio', Newspaper, '/app/site/home/anuncio'],
  ['Conteúdos', FileText, '/app/site/conteudos'],
  ['Mídia', Images, '/app/site/midia'],
  ['Categorias', Tags, '/app/site/categorias'],
  ['Mídia Kit', Newspaper, '/app/site/midia-kit'],
  ['Configurações', Settings, '/app/site/configuracoes'],
] as const

function HomeAdManagerPage() {
  return <div className="app-shell home-ad-manager-overlay">
    <aside className="sidebar">
      <div className="sidebar-head"><Link to="/" className="brand"><span className="brand-mark">L</span></Link><span>SITE</span></div>
      <nav>{siteNav.map(([label, Icon, to]) => <NavLink key={to} end={to === '/app/site'} to={to}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><NavLink to="/app"><Building2 size={18}/><span>Trocar workspace</span></NavLink></div>
    </aside>
    <div className="workspace">
      <header className="workspace-top"><div><span className="workspace-name">Portal Lander</span><span className="workspace-context">Gerenciador do Site</span></div><div className="workspace-actions"><button className="icon-button"><Bell size={18}/></button><button className="account-button"><span>DL</span><div><b>Deyvisson</b><small>Administrador</small></div><ChevronDown size={15}/></button></div></header>
      <main className="workspace-main hero-manager-main"><HomeAdEditor/></main>
    </div>
  </div>
}

export function HomeAdBridge() {
  const location = useLocation()
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [config, setConfig] = useState<HomeAdConfig>(() => readHomeAdConfig())

  useEffect(() => {
    const sync = () => setConfig(readHomeAdConfig())
    window.addEventListener('portal-lander:home-ad-updated', sync)
    return () => window.removeEventListener('portal-lander:home-ad-updated', sync)
  }, [])

  useEffect(() => {
    if (location.pathname !== '/') return
    const frame = window.requestAnimationFrame(() => {
      const element = document.querySelector<HTMLElement>('.pl-ad')
      if (element) {
        element.classList.add('pl-ad-managed')
        setTarget(element)
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname])

  if (location.pathname === '/app/site/home/anuncio') return <HomeAdManagerPage/>

  return <>
    {location.pathname === '/' && target && createPortal(<ManagedAdContent config={config}/>, target)}
    {location.pathname.startsWith('/app/site') && !['/app/site/home/anuncio','/app/site/marca'].includes(location.pathname) && <Link className="site-ad-shortcut" to="/app/site/home/anuncio"><Newspaper size={16}/> Conteúdo · Home · Anúncio</Link>}
  </>
}
