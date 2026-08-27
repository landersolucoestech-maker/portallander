import { ArrowRight, Bell, Building2, ChevronDown, FileText, Flame, Globe2, Images, LayoutDashboard, Menu, Mic2, Music2, Newspaper, Play, Search, Settings, Star, Tags, Video, X, Zap } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import LegacyApp from './App'
import { portalLogo } from './brandAsset'
import { HeroSection } from './HeroSection'
import { HeroEditor } from './HeroEditor'

const publicStories = [
  { category: 'Polêmicas', title: 'Treta no Rio: bastidores de uma discussão que tomou conta das redes', excerpt: 'Entenda o que aconteceu, quem se pronunciou e por que o assunto virou um dos mais comentados da cena.', meta: 'Há 18 min', tone: 'red' },
  { category: 'Bastidores', title: 'De olho no corre: o que acontece antes do artista subir ao palco', excerpt: 'Produção, equipe, repertório e tensão nos minutos que antecedem um grande show.', meta: 'Há 42 min', tone: 'dark' },
  { category: 'Lançamentos', title: 'Música nova: os sons que chegaram fortes nesta semana', excerpt: 'Funk, trap e pop urbano em uma seleção direta do que merece entrar no radar.', meta: 'Há 1 h', tone: 'silver' },
  { category: 'Destaques', title: 'Os nomes que estão movimentando a cultura urbana agora', excerpt: 'Artistas, produtores e criadores que puxam conversa, audiência e tendência.', meta: 'Há 2 h', tone: 'black' },
]

const publicCategories = [
  ['Notícias', Zap, '/noticias'],
  ['Polêmicas', Flame, '/polemicas'],
  ['Bastidores', Mic2, '/bastidores'],
  ['Lançamentos', Music2, '/lancamentos'],
  ['Destaques', Star, '/destaques'],
  ['Vídeos', Video, '/videos'],
] as const

function PublicBrand() {
  return <Link to="/" className="public-brand" aria-label="Portal Lander"><img src={portalLogo} alt="Portal Lander" /></Link>
}

function PublicHeader() {
  const [open, setOpen] = useState(false)
  return <header className="public-header">
    <div className="public-nav shell">
      <PublicBrand />
      <nav className={open ? 'public-links open' : 'public-links'}>
        {publicCategories.map(([label, Icon, to]) => <NavLink key={to} to={to}><Icon size={15}/>{label}</NavLink>)}
        <NavLink to="/colabore">Colabore</NavLink>
      </nav>
      <div className="nav-actions">
        <button className="public-search" aria-label="Buscar"><Search size={18}/></button>
        <Link className="public-internal" to="/app">Área interna</Link>
        <button className="public-menu" onClick={() => setOpen(!open)} aria-label="Abrir menu">{open ? <X/> : <Menu/>}</button>
      </div>
    </div>
  </header>
}

function PublicFooter() {
  return <footer className="public-footer"><div className="shell portal-footer-grid"><PublicBrand/><div><b>Notícias · Funk · Cultura · Entretenimento</b><p>Conteúdo urbano, lançamentos, bastidores e tudo que movimenta a cena.</p></div><div className="footer-links"><Link to="/colabore">Colabore</Link><Link to="/app">Área interna</Link><span>© 2026 Portal Lander</span></div></div></footer>
}

function PublicHome() {
  return <div className="public-page"><PublicHeader/><main>
    <HeroSection />

    <section className="portal-section shell" id="destaques">
      <div className="portal-section-title"><div><span>EM DESTAQUE</span><h2>O QUE TODO MUNDO<br/>ESTÁ FALANDO</h2></div><Link to="/noticias">VER TUDO <ArrowRight size={16}/></Link></div>
      <div className="portal-story-grid">
        {publicStories.map((story, i) => <article className={i === 0 ? 'portal-story lead' : 'portal-story'} key={story.title}>
          <div className={`portal-story-art ${story.tone}`}><span className="portal-number">0{i + 1}</span><span className="portal-story-logo">PL</span></div>
          <div className="portal-story-copy"><span className="portal-label">{story.category}</span><h3>{story.title}</h3><p>{story.excerpt}</p><small>{story.meta}</small></div>
        </article>)}
      </div>
    </section>

    <section className="portal-dark-band"><div className="shell"><div className="portal-section-title inverse"><div><span>RADAR LANDER</span><h2>DA RUA PARA<br/>A SUA TELA.</h2></div></div><div className="portal-radar-grid">{publicCategories.map(([label, Icon, to], i) => <Link key={to} to={to} className="portal-radar-card"><Icon/><span>0{i + 1}</span><h3>{label}</h3><ArrowRight/></Link>)}</div></div></section>

    <section className="portal-video-section shell"><div className="portal-section-title"><div><span>VÍDEOS</span><h2>ASSISTA NO PORTAL</h2></div><Link to="/videos">VER VÍDEOS <ArrowRight size={16}/></Link></div><div className="portal-video-feature"><div className="video-play"><Play fill="currentColor"/></div><div><span>BASTIDORES</span><h3>O que não apareceu no palco também faz parte da história.</h3><p>Conteúdo em vídeo, entrevistas, cenas de bastidor e cobertura da cultura urbana.</p></div></div></section>
  </main><PublicFooter/></div>
}

const cmsNav = [
  ['Visão geral', LayoutDashboard, '/app/site'],
  ['Home · Hero', Star, '/app/site/home/hero'],
  ['Conteúdos', FileText, '/app/site/conteudos'],
  ['Páginas', Globe2, '/app/site/paginas'],
  ['Mídia', Images, '/app/site/midia'],
  ['Categorias', Tags, '/app/site/categorias'],
  ['Mídia Kit', Newspaper, '/app/site/midia-kit'],
  ['Configurações', Settings, '/app/site/configuracoes'],
] as const

function HeroManagerPage() {
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-head"><Link to="/" className="brand"><span className="brand-mark">L</span></Link><span>SITE</span></div>
      <nav>{cmsNav.map(([label, Icon, to]) => <NavLink key={to} end={to === '/app/site'} to={to}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><NavLink to="/app"><Building2 size={18}/><span>Trocar workspace</span></NavLink></div>
    </aside>
    <div className="workspace">
      <header className="workspace-top"><div><span className="workspace-name">Portal Lander</span><span className="workspace-context">Gerenciador do Site</span></div><div className="workspace-actions"><button className="icon-button"><Bell size={18}/></button><button className="account-button"><span>DL</span><div><b>Deyvisson</b><small>Administrador</small></div><ChevronDown size={15}/></button></div></header>
      <main className="workspace-main hero-manager-main"><HeroEditor/></main>
    </div>
  </div>
}

export default function PortalApp() {
  const location = useLocation()
  if (location.pathname === '/') return <PublicHome/>
  if (location.pathname === '/app/site/home/hero') return <HeroManagerPage/>
  return <LegacyApp/>
}
