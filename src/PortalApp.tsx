import { Bell, Building2, ChevronDown, FileText, Flame, Globe2, Images, LayoutDashboard, Menu, Mic2, Music2, Newspaper, Play, Search, Settings, Star, Tags, Video, X, Zap } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import LegacyApp from './App'
import { portalLogo } from './brandAsset'
import { HeroSection } from './HeroSection'
import { HeroEditor } from './HeroEditor'

type Story = {
  category: string
  title: string
  meta: string
  views: string
  image: string
}

const IMG = {
  stage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85',
  dj: 'https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=900&q=85',
  crowd: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
  concert: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=900&q=85',
  decks: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=85',
  live: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=85',
  festival: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85',
  singer: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=85',
}

const publicCategories = [
  ['Notícias', Zap, '/noticias'],
  ['Polêmicas', Flame, '/polemicas'],
  ['Bastidores', Mic2, '/bastidores'],
  ['Lançamentos', Music2, '/lancamentos'],
  ['Destaques', Star, '/destaques'],
  ['Vídeos', Video, '/videos'],
] as const

const stories: Story[] = [
  { category:'Lançamentos', title:'MC Cabelinho lança “Melhor Só” e faz voô à loucura', meta:'Há 2 horas', views:'12.4K', image: IMG.stage },
  { category:'Bastidores', title:'Bastidores do clipe de Orochi viralizam na web', meta:'Há 5 horas', views:'8.7K', image: IMG.dj },
  { category:'Polêmica', title:'Treta! MC Poze alfineta Oruam nas redes sociais', meta:'Há 7 horas', views:'15.2K', image: IMG.crowd },
  { category:'Cultura', title:'A arte do funk: artistas que transformam a quebrada', meta:'Há 9 horas', views:'6.1K', image: IMG.concert },
  { category:'Notícias', title:'Djonga anuncia pausa na carreira para cuidar da saúde mental', meta:'Há 2 horas', views:'3.1K', image: IMG.singer },
  { category:'Notícias', title:'Tribo da Periferia lança documentário sobre sua trajetória', meta:'Há 2 horas', views:'2.7K', image: IMG.live },
  { category:'Destaques', title:'Filipe Ret solta prévia de faixa inédita e anima fãs', meta:'Há 3 horas', views:'4.6K', image: IMG.decks },
  { category:'Cultura', title:'MC Dricka fala sobre novos projetos e empoderamento', meta:'Há 4 horas', views:'3.8K', image: IMG.festival },
]

const ranked = [
  'Veigh bate recorde com novo álbum “Dos Prédios Deluxe”',
  'MC Ryan SP cancela show de última hora e web reage',
  'Festival de Trap 2025 anuncia line-up pesado',
  'Ludmilla confirma nova turnê “Numanice 4”',
  'Entenda a treta entre Mainstreet e Pineapple',
]

const releases = [
  {title:'Oruam — Liberado', image: IMG.stage},
  {title:'Veigh — Dos Prédios Deluxe', image: IMG.dj},
  {title:'MC Cabelinho — Melhor Só', image: IMG.concert},
  {title:'Ludmilla — Numanice #4', image: IMG.live},
  {title:'WIU — Manual de Cria', image: IMG.festival},
]

const agenda = [
  ['24','MAI','Festival de Trap 2025','São Paulo, SP'],
  ['31','MAI','Show do Orochi','Rio de Janeiro, RJ'],
  ['07','JUN','Ludmilla · Numanice #4','Belo Horizonte, MG'],
  ['14','JUN','MC Cabelinho','Curitiba, PR'],
]

function PublicBrand(){return <Link to="/" className="public-brand" aria-label="Portal Lander"><img src={portalLogo} alt="Portal Lander"/></Link>}

function PublicHeader(){
  const [open,setOpen]=useState(false)
  return <header className="public-header"><div className="public-nav">
    <PublicBrand/>
    <nav className={open?'public-links open':'public-links'}>
      {publicCategories.map(([label,Icon,to])=><NavLink key={to} to={to}><Icon size={15}/>{label}</NavLink>)}
      <NavLink to="/colabore">Colabore</NavLink>
    </nav>
    <div className="nav-actions"><button className="public-search" aria-label="Buscar"><Search size={18}/></button><Link className="public-internal" to="/app">Área interna</Link><button className="public-menu" onClick={()=>setOpen(!open)} aria-label="Abrir menu">{open?<X/>:<Menu/>}</button></div>
  </div></header>
}

function SectionHead({title,link}:{title:string,link?:string}){return <div className="pl-section-head"><h2>{title}</h2>{link&&<Link to={link}>VER TODOS</Link>}</div>}

function ImageThumb({src, badge, className=''}:{src:string;badge?:string;className?:string}){
  return <div className={`pl-thumb has-image ${className}`} style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${src})`}}>{badge&&<span className="pl-badge">{badge}</span>}</div>
}

function Card({item}:{item:Story}){return <article className="pl-card"><ImageThumb src={item.image} badge={item.category}/><div className="pl-card-body"><h3>{item.title}</h3><div className="pl-meta"><span>{item.meta}</span><span>◉ {item.views}</span></div></div></article>}

function PublicFooter(){return <>
  <section className="pl-newsletter"><div className="public-shell"><div className="pl-newsletter-brand"><img src={portalLogo} alt=""/><strong>RECEBA AS PRINCIPAIS NOTÍCIAS<br/>DIRETO NO SEU E-MAIL!</strong></div><form onSubmit={e=>e.preventDefault()}><input type="email" placeholder="Seu melhor e-mail"/><button>INSCREVER-SE</button></form><div className="pl-social"><b>SIGA O PORTAL LANDER</b>{['IG','TK','YT','X','SP'].map(x=><span key={x}>{x}</span>)}</div></div></section>
  <footer className="public-footer"><div className="public-shell"><div className="pl-footer-grid">
    <div className="pl-footer-about"><img src={portalLogo} alt="Portal Lander"/><p>O maior portal de notícias sobre funk, cultura urbana e entretenimento. Conteúdo real, direto e sem filtro.</p></div>
    <div className="pl-footer-col"><h4>NAVEGAÇÃO</h4>{publicCategories.map(([l,,to])=><Link key={to} to={to}>{l}</Link>)}</div>
    <div className="pl-footer-col"><h4>INSTITUCIONAL</h4><Link to="/sobre">Sobre o Portal</Link><Link to="/contato">Fale Conosco</Link><Link to="/colabore">Colabore</Link><Link to="/politica">Política de Privacidade</Link></div>
    <div className="pl-footer-col"><h4>AJUDA</h4><Link to="/faq">Perguntas Frequentes</Link><Link to="/anuncie">Como Anunciar</Link><Link to="/regras">Regras de Publicação</Link></div>
    <div className="pl-footer-col"><h4>COLABORE</h4><Link to="/colabore">Envie sua notícia</Link><Link to="/colabore">Envie seu vídeo</Link><Link to="/parcerias">Parcerias</Link></div>
  </div><div className="pl-copyright">© 2026 Portal Lander. Todos os direitos reservados.</div></div></footer>
</>}

function HomeContent(){return <div className="pl-main public-shell">
  <div className="pl-grid-main">
    <section className="pl-section"><SectionHead title="EM DESTAQUE"/><div className="pl-card-grid">{stories.slice(0,6).map(s=><Card key={s.title} item={s}/>)}</div><div className="pl-center-link"><Link to="/destaques">EXPLORAR DESTAQUES</Link></div></section>
    <aside className="pl-most"><SectionHead title="MAIS LIDAS"/>{ranked.map((r,i)=><div className="pl-ranked" key={r}><strong>{String(i+1).padStart(2,'0')}</strong><div><h4>{r}</h4><small>Há {i+3} horas</small></div></div>)}<Link className="pl-outline-button" to="/noticias">VER TODOS</Link></aside>
  </div>

  <div className="pl-ad"><b><em>PORTAL LANDER</em></b><span>ANUNCIE AQUI · SUA MARCA NO RITMO CERTO!</span><Link to="/anuncie">SAIBA MAIS →</Link></div>

  <div className="pl-latest-wrap">
    <section className="pl-section"><SectionHead title="ÚLTIMAS NOTÍCIAS" link="/noticias"/><div className="pl-latest-grid">{stories.slice(4,8).map(s=><Card key={s.title} item={s}/>)}</div><div className="pl-center-link"><Link to="/noticias">VER TODAS AS NOTÍCIAS</Link></div></section>
    <aside className="pl-whatsapp"><div className="pl-phone-visual"><span>WHATSAPP</span></div><h3>PORTAL LANDER<br/>NO SEU WHATSAPP!</h3><p>Receba as principais notícias em primeira mão.</p><Link to="/whatsapp">QUERO RECEBER →</Link></aside>
  </div>

  <section className="pl-section"><SectionHead title="NAVEGUE POR CATEGORIAS"/><div className="pl-categories">{publicCategories.map(([label,Icon,to])=><Link className="pl-category" to={to} key={to}><Icon/><h3>{label}</h3><p>{label==='Notícias'?'Fique por dentro de tudo o que acontece no cenário.':label==='Polêmicas'?'As tretas e assuntos mais quentes do momento.':label==='Bastidores'?'O que rola por trás das câmeras e dos palcos.':label==='Lançamentos'?'Músicas, clipes e álbuns fresquinhos pra você.':label==='Destaques'?'Histórias, estilo, arte e potência da quebrada.':'Conteúdo exclusivo em vídeo pra você assistir.'}</p></Link>)}</div></section>

  <div className="pl-release-agenda">
    <section className="pl-section"><SectionHead title="LANÇAMENTOS" link="/lancamentos"/><div className="pl-release-row">{releases.map(r=><article className="pl-release" key={r.title}><ImageThumb src={r.image} badge="▶"/><div className="pl-card-body"><h3>{r.title}</h3><div className="pl-meta"><span>2026</span></div></div></article>)}</div></section>
    <aside><SectionHead title="AGENDA"/>{agenda.map(a=><div className="pl-agenda-item" key={a[0]}><div className="pl-date"><strong>{a[0]}</strong><small>{a[1]}</small></div><div><h4>{a[2]}</h4><p>{a[3]}</p></div></div>)}</aside>
  </div>

  <section className="pl-bottom-grid">
    <div><SectionHead title="BASTIDORES" link="/bastidores"/><article className="pl-feature"><ImageThumb src={IMG.stage}/><h3>Como foi a gravação do clipe “Malvadão 3” de Xamã</h3></article><div className="pl-mini-list">{stories.slice(1,3).map(s=><div className="pl-mini" key={s.title}><ImageThumb src={s.image}/><div><h4>{s.title}</h4><div className="pl-meta"><span>{s.meta}</span></div></div></div>)}</div></div>
    <div><SectionHead title="FOTOGALERIA"/><div className="pl-gallery">{[IMG.festival,IMG.live,IMG.crowd,IMG.concert].map(x=><ImageThumb src={x} key={x}/>)}</div></div>
    <div><SectionHead title="PODCASTS" link="/videos"/>{['O futuro do funk e os novos caminhos','MC Hariel fala sobre autenticidade','Mulheres no funk: conquistas e desafios'].map((p,i)=><div className="pl-podcast" key={p}><ImageThumb src={[IMG.dj,IMG.singer,IMG.stage][i]}/><div><span>PODCAST #{29-i}</span><h4>{p}</h4></div><button aria-label="Reproduzir"><Play size={10}/></button></div>)}</div>
  </section>
</div>}

function PublicHome(){return <div className="public-page"><PublicHeader/><main><HeroSection/><HomeContent/></main><PublicFooter/></div>}

const pageIntros:Record<string,{title:string;eyebrow:string;intro:string}> = {
  '/noticias':{title:'NOTÍCIAS',eyebrow:'AGORA NO PORTAL',intro:'As principais notícias do funk, cultura urbana e entretenimento em uma cobertura direta e atualizada.'},
  '/polemicas':{title:'POLÊMICAS',eyebrow:'SEM FILTRO',intro:'As discussões, declarações e histórias que colocaram a cena no centro da conversa.'},
  '/bastidores':{title:'BASTIDORES',eyebrow:'POR TRÁS DA CENA',intro:'O que acontece antes, durante e depois do que aparece para o público.'},
  '/lancamentos':{title:'LANÇAMENTOS',eyebrow:'MÚSICA NOVA',intro:'Singles, clipes e projetos que acabaram de chegar no funk e na cultura urbana.'},
  '/destaques':{title:'DESTAQUES',eyebrow:'NO RADAR',intro:'O conteúdo mais forte do Portal Lander reunido em uma seleção editorial.'},
  '/videos':{title:'VÍDEOS',eyebrow:'ASSISTA',intro:'Entrevistas, bastidores, coberturas e conteúdos em vídeo do Portal Lander.'},
}

function PublicListing({path}:{path:string}){
  const info=pageIntros[path] || pageIntros['/noticias']
  const filtered=path==='/noticias'?stories:stories.filter((_,i)=>i%2===0).concat(stories.filter((_,i)=>i%2!==0))
  return <div className="public-page"><PublicHeader/><main>
    <section className="pl-page-hero"><div className="public-shell"><span>{info.eyebrow}</span><h1>{info.title}</h1><p>{info.intro}</p></div></section>
    <div className="public-shell pl-listing-layout">
      <section><SectionHead title={info.title}/><div className="pl-listing-grid">{filtered.map(s=><Card key={`${path}-${s.title}`} item={s}/>)}</div><div className="pl-pagination"><button>01</button><button>02</button><button>03</button><button>→</button></div></section>
      <aside className="pl-most"><SectionHead title="MAIS LIDAS"/>{ranked.map((r,i)=><div className="pl-ranked" key={r}><strong>{String(i+1).padStart(2,'0')}</strong><div><h4>{r}</h4><small>Há {i+3} horas</small></div></div>)}</aside>
    </div>
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

function HeroManagerPage(){
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-head"><Link to="/" className="brand"><span className="brand-mark">L</span></Link><span>SITE</span></div>
      <nav>{cmsNav.map(([label,Icon,to])=><NavLink key={to} end={to==='/app/site'} to={to}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><NavLink to="/app"><Building2 size={18}/><span>Trocar workspace</span></NavLink></div>
    </aside>
    <div className="workspace">
      <header className="workspace-top"><div><span className="workspace-name">Portal Lander</span><span className="workspace-context">Gerenciador do Site</span></div><div className="workspace-actions"><button className="icon-button"><Bell size={18}/></button><button className="account-button"><span>DL</span><div><b>Deyvisson</b><small>Administrador</small></div><ChevronDown size={15}/></button></div></header>
      <main className="workspace-main hero-manager-main"><HeroEditor/></main>
    </div>
  </div>
}

export default function PortalApp(){
  const location=useLocation()
  if(location.pathname==='/') return <PublicHome/>
  if(pageIntros[location.pathname]) return <PublicListing path={location.pathname}/>
  if(location.pathname==='/app/site/home/hero') return <HeroManagerPage/>
  if(location.pathname.startsWith('/app/site')) return <><LegacyApp/><Link className="site-hero-shortcut" to="/app/site/home/hero"><Star size={16}/> Conteúdo · Home · Hero</Link></>
  return <LegacyApp/>
}