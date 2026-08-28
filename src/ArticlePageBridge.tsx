import { Facebook, Flame, Link as LinkIcon, Menu, Mic2, Music2, Search, Star, Video, X, Youtube, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { portalLogo } from './brandAsset'

const categories = [
  ['Notícias', Zap, '/noticias'],
  ['Polêmicas', Flame, '/polemicas'],
  ['Bastidores', Mic2, '/bastidores'],
  ['Lançamentos', Music2, '/lancamentos'],
  ['Destaques', Star, '/destaques'],
  ['Vídeos', Video, '/videos'],
] as const

const heroImage='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1500&q=88'
const sideImages=[
  'https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=300&q=80',
]
const ranked=[
  'Veigh bate recorde com novo álbum “Dos Prédios Deluxe”',
  'MC Ryan SP cancela show de última hora e web reage',
  'Festival de Trap 2025 anuncia line-up pesado',
  'Ludmilla confirma nova turnê “Numanice #4”',
  'Entenda a treta entre Mainstreet e Pineapple',
]

function ArticleHeader(){
  const [open,setOpen]=useState(false)
  return <header className="article-header"><div className="article-header-inner">
    <Link to="/" className="article-logo"><img src={portalLogo} alt="Portal Lander"/></Link>
    <nav className={open?'article-nav open':'article-nav'}>{categories.map(([label,Icon,to])=><NavLink key={to} to={to}><Icon size={14}/>{label}</NavLink>)}<NavLink to="/colabore">Colabore</NavLink></nav>
    <div className="article-header-actions"><button aria-label="Buscar"><Search size={17}/></button><Link to="/app">Área interna</Link><button className="article-menu" onClick={()=>setOpen(v=>!v)}>{open?<X size={18}/>:<Menu size={18}/>}</button></div>
  </div></header>
}

function ShareButtons(){return <div className="article-share-buttons"><a href="#" aria-label="Facebook"><Facebook size={16}/></a><a href="#" aria-label="X">𝕏</a><a href="#" aria-label="WhatsApp">◉</a><a href="#" aria-label="Copiar link"><LinkIcon size={16}/></a></div>}

function Sidebar(){return <aside className="article-sidebar">
  <section className="article-most"><div className="article-side-title"><h2>MAIS LIDAS</h2><span/></div>{ranked.map((item,i)=><div className="article-ranked" key={item}><b>{String(i+1).padStart(2,'0')}</b><img src={sideImages[i]} alt=""/><div><h3>{item}</h3><small>Há {i*2+3} horas</small></div></div>)}</section>
  <section className="article-newsletter-box"><h2>RECEBA AS PRINCIPAIS<br/>NOTÍCIAS</h2><p>Inscreva-se e receba as notícias mais quentes do funk e da cultura urbana em primeira mão.</p><input type="email" placeholder="Seu melhor e-mail"/><button>INSCREVER-SE</button></section>
  <section className="article-ad-box"><img src={portalLogo} alt="Portal Lander"/><h2>ANUNCIE AQUI</h2><p>SUA MARCA NO<br/>RITMO CERTO!</p><Link to="/anuncie">SAIBA MAIS →</Link></section>
</aside>}

function ArticleFooter(){return <footer className="article-footer"><div className="article-footer-grid">
  <div><img src={portalLogo} alt="Portal Lander"/><p>O maior portal de notícias sobre funk, cultura urbana e entretenimento. Conteúdo real, direto e sem filtro.</p></div>
  <div><h4>NAVEGAÇÃO</h4>{categories.map(([label,,to])=><Link key={to} to={to}>{label}</Link>)}<Link to="/colabore">Colabore</Link></div>
  <div><h4>INSTITUCIONAL</h4><Link to="/sobre">Sobre o Portal</Link><Link to="/contato">Fale Conosco</Link><Link to="/politica">Política de Privacidade</Link><Link to="/termos">Termos de Uso</Link></div>
  <div><h4>AJUDA</h4><Link to="/faq">Perguntas Frequentes</Link><Link to="/anuncie">Como Anunciar</Link><Link to="/regras">Regras de Publicação</Link></div>
  <div><h4>SIGA O PORTAL LANDER</h4><div className="article-social"><span>◎</span><span>♪</span><Youtube size={15}/><span>𝕏</span><span>◉</span></div></div>
</div><div className="article-copyright">© 2026 Portal Lander. Todos os direitos reservados.</div></footer>}

function ArticlePage(){return <div className="article-page"><ArticleHeader/><main className="article-shell">
  <div className="article-breadcrumb"><Link to="/">Início</Link><span>›</span><Link to="/noticias">Notícias</Link><span>›</span><span>MC Cabelinho lança “Melhor Só” e fãs vão à loucura</span></div>
  <div className="article-category">LANÇAMENTO</div>
  <h1>MC Cabelinho lança “Melhor Só”<br/>e fãs vão à loucura</h1>
  <p className="article-dek">Novo álbum do MC Cabelinho já está disponível em todas as plataformas<br/>e promete ser um dos maiores do ano.</p>
  <div className="article-author-row"><div className="article-author"><span className="article-author-avatar">PL</span><span>Por Portal Lander <b>●</b></span><i/> <span>24 de maio de 2025</span><i/> <span>Há 2 horas</span></div><div className="article-share"><span>Compartilhe:</span><ShareButtons/></div></div>
  <div className="article-layout"><article className="article-content">
    <figure><img src={heroImage} alt="MC Cabelinho"/><figcaption>MC Cabelinho no clipe oficial de “Melhor Só” — Foto: Divulgação</figcaption></figure>
    <p><strong>MC Cabelinho</strong> acaba de lançar seu novo álbum “Melhor Só”, e o que já era grande ficou ainda maior. O projeto, que chega às plataformas digitais nesta sexta-feira (24), reúne 15 faixas inéditas e participações de peso da cena do rap e do trap nacional.</p>
    <p>Com letras afiadas e batidas envolventes, o álbum traz temas como superação, lealdade, amor-próprio e conquistas. “Esse trabalho é sobre evolução, sobre olhar pra trás e ver o quanto a caminhada valeu a pena”, comenta o artista.</p>
    <p>Nas redes sociais, os fãs não escondem a empolgação. O nome do MC Cabelinho chegou aos assuntos mais comentados do Twitter/X em poucos minutos após o anúncio do lançamento.</p>
    <blockquote><span>❞</span><p>“Melhor Só não é só um álbum, é um movimento.<br/>Obrigado a todos que sempre acreditaram.<br/>É só o início de algo muito maior.”</p><cite>— MC Cabelinho</cite></blockquote>
    <p>O destaque fica por conta da faixa-título “Melhor Só”, que já ganhou clipe oficial no YouTube e ultrapassou 1 milhão de visualizações nas primeiras horas. O vídeo traz uma produção cinematográfica e participação especial de Orochi.</p>
    <p>O álbum completo já está disponível no Spotify, Deezer, Apple Music e YouTube Music. Ouça agora e confira o novo capítulo na trajetória de MC Cabelinho.</p>
    <div className="article-tags"><b>TAGS:</b>{['MC CABELINHO','MELHOR SÓ','LANÇAMENTO','TRAP','RAP NACIONAL'].map(t=><span key={t}>{t}</span>)}</div>
    <div className="article-share-bottom"><span>Compartilhe:</span><ShareButtons/></div>
    <div className="article-prev-next"><Link to="/noticias"><span>ANTERIOR</span><b>Orochi confirma participação<br/>em novo álbum de MC Cabelinho</b></Link><Link to="/noticias"><span>PRÓXIMA</span><b>Veigh bate recorde com novo<br/>álbum “Dos Prédios Deluxe”</b><strong>›</strong></Link></div>
  </article><Sidebar/></div>
</main><ArticleFooter/></div>}

export function ArticlePageBridge(){
  const location=useLocation()
  if(!location.pathname.startsWith('/noticia/')) return null
  return <div className="article-route-overlay"><ArticlePage/></div>
}
