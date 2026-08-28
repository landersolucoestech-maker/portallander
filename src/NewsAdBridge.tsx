import { Bell, Building2, ChevronDown, FileText, Images, LayoutDashboard, Newspaper, Settings, Star, Tags } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NewsAdEditor } from './NewsAdEditor'
import { readNewsAdConfig, type NewsAdConfig } from './newsAdModel'

function ManagedNewsAdContent({ config }: { config: NewsAdConfig }) {
  if (!config.active) return null
  const style = {
    ['--home-ad-height' as string]: `${config.height}px`,
    ['--home-ad-content-width' as string]: `${config.contentWidth}px`,
  }
  return <div className={`home-ad-portal align-${config.align}`} style={style}>
    {config.image && <img className="pl-ad-image" src={config.image} alt={config.imageAlt} />}
    <div className="pl-ad-content">
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
    if (location.pathname !== '/noticias') return
    const frame = window.requestAnimationFrame(() => {
      const element = document.querySelector<HTMLElement>('.news-reference-banner')
      if (element) {
        element.classList.add('pl-ad-managed')
        setTarget(element)
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname !== '/noticias') return
    const element = document.querySelector<HTMLElement>('.news-reference-banner')
    if (element) element.style.display = config.active ? '' : 'none'
  }, [location.pathname, config.active])

  if (location.pathname === '/app/site/noticias/anuncio') return <NewsAdManagerPage/>

  return <>
    {location.pathname === '/noticias' && target && createPortal(<ManagedNewsAdContent config={config}/>, target)}
    {location.pathname.startsWith('/app/site') && location.pathname !== '/app/site/noticias/anuncio' && <Link className="site-ad-shortcut news-ad-shortcut" to="/app/site/noticias/anuncio"><Newspaper size={16}/> Conteúdo · Notícias · Anúncio</Link>}
  </>
}
