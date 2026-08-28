import { Bell, Building2, ChevronDown, FileText, Images, LayoutDashboard, Newspaper, Settings, Star, Tags } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NewsAdEditor } from './NewsAdEditor'
import { isNewsAdValid, readNewsAdConfig, type NewsAdConfig } from './newsAdModel'

function ManagedNewsAdContent({ config }: { config: NewsAdConfig }) {
  const valid=isNewsAdValid(config)
  if(!valid) return null
  const backgroundStyle=config.background
    ? { backgroundImage:`linear-gradient(180deg,rgba(0,0,0,.28),rgba(0,0,0,.72)),url(${config.background})` }
    : undefined
  const external=/^https?:\/\//i.test(config.buttonUrl)
  const target=config.openInNewTab?'_blank':undefined
  const rel=config.openInNewTab?'noreferrer':undefined
  return <div className={`news-sidebar-ad-content align-${config.align}`} style={backgroundStyle}>
    {config.image && <img className="news-sidebar-ad-image" src={config.image} alt={config.imageAlt}/>} 
    <div className="news-sidebar-ad-copy">
      {config.label && <span className="news-sidebar-ad-label">{config.label}</span>}
      {config.title && <strong>{config.title}</strong>}
      {config.subtitle && <p>{config.subtitle}</p>}
      {config.buttonLabel && (external || config.openInNewTab
        ? <a href={config.buttonUrl || '#/anuncie'} target={target} rel={rel}>{config.buttonLabel}</a>
        : <Link to={config.buttonUrl || '/anuncie'}>{config.buttonLabel}</Link>)}
      {(config.advertiser || config.campaign) && <small>{[config.advertiser,config.campaign].filter(Boolean).join(' · ')}</small>}
    </div>
  </div>
}

const siteNav = [
  ['Visão geral', LayoutDashboard, '/app/site'],
  ['Home · Hero', Star, '/app/site/home/hero'],
  ['Home · Anúncio', Newspaper, '/app/site/home/anuncio'],
  ['Notícias · Anúncio', Newspaper, '/app/site/noticias/anuncio'],
  ['Conteúdos', FileText, '/app/site/conteudos'],
  ['Mídia', Images, '/app/site/midia'],
  ['Categorias', Tags, '/app/site/categorias'],
  ['Mídia Kit', Newspaper, '/app/site/midia-kit'],
  ['Configurações', Settings, '/app/site/configuracoes'],
] as const

function NewsAdManagerPage() {
  return <div className="app-shell home-ad-manager-overlay">
    <aside className="sidebar">
      <div className="sidebar-head"><Link to="/" className="brand"><span className="brand-mark">L</span></Link><span>SITE</span></div>
      <nav>{siteNav.map(([label, Icon, to]) => <NavLink key={to} end={to === '/app/site'} to={to}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><NavLink to="/app"><Building2 size={18}/><span>Trocar workspace</span></NavLink></div>
    </aside>
    <div className="workspace">
      <header className="workspace-top"><div><span className="workspace-name">Portal Lander</span><span className="workspace-context">Gerenciador do Site</span></div><div className="workspace-actions"><button className="icon-button"><Bell size={18}/></button><button className="account-button"><span>DL</span><div><b>Deyvisson</b><small>Administrador</small></div><ChevronDown size={15}/></button></div></header>
      <main className="workspace-main hero-manager-main"><NewsAdEditor/></main>
    </div>
  </div>
}

export function NewsAdBridge() {
  const location = useLocation()
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [config, setConfig] = useState<NewsAdConfig>(() => readNewsAdConfig())

  useEffect(() => {
    const sync = () => setConfig(readNewsAdConfig())
    window.addEventListener('portal-lander:news-ad-updated', sync)
    return () => window.removeEventListener('portal-lander:news-ad-updated', sync)
  }, [])

  useEffect(() => {
    if (location.pathname !== '/noticias') {
      setTarget(null)
      return
    }
    const frame = window.requestAnimationFrame(() => {
      const element = document.querySelector<HTMLElement>('.news-reference-sidebar-ad')
      if (element) setTarget(element)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname !== '/noticias') return
    const valid=isNewsAdValid(config)
    const element=document.querySelector<HTMLElement>('.news-reference-sidebar-ad')
    const grid=document.querySelector<HTMLElement>('.news-reference-grid')
    if(element) element.style.display=valid?'':'none'
    if(grid) grid.classList.toggle('has-news-ad',valid)
  }, [location.pathname, config])

  if (location.pathname === '/app/site/noticias/anuncio') return <NewsAdManagerPage/>

  return <>
    {location.pathname === '/noticias' && target && createPortal(<ManagedNewsAdContent config={config}/>, target)}
    {location.pathname.startsWith('/app/site') && location.pathname !== '/app/site/noticias/anuncio' && <Link className="site-ad-shortcut news-ad-shortcut" to="/app/site/noticias/anuncio"><Newspaper size={16}/> Conteúdo · Notícias · Anúncio</Link>}
  </>
}
