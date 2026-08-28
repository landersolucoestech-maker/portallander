import { Flame, Link as LinkIcon, Menu, Mic2, Music2, Search, Star, Video, X, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
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

const images=[
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1500&q=88',
  'https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=1500&q=88',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1500&q=88',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1500&q=88',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1500&q=88',
]

const articles=[
  {slug:'mc-cabelinho-lanca-melhor-so-e-fas-vao-a-loucura',category:'LANÇAMENTO',title:'MC Cabelinho lança “Melhor Só” e fãs vão à loucura',dek:'Novo álbum do MC Cabelinho já está disponível em todas as plataformas e promete ser um dos maiores do ano.',image:images[0]},
  {slug:'bastidores-do-clipe-de-orochi-viralizam-na-web',category:'BASTIDORES',title:'Bastidores do clipe de Orochi viralizam na web',dek:'Imagens de gravação e detalhes da produção movimentaram as redes e chamaram atenção dos fãs.',image:images[1]},
  {slug:'treta-mc-poze-alfineta-oruam-nas-redes-sociais',category:'POLÊMICA',title:'Treta! MC Poze alfineta Oruam nas redes sociais',dek:'Troca de indiretas colocou os artistas no centro das conversas nas redes.',image:images[2]},
  {slug:'a-arte-do-funk-artistas-que-transformam-a-quebrada',category:'CULTURA',title:'A arte do funk: artistas que transformam a quebrada',dek:'Música, estética e território se encontram em uma geração que amplia a força cultural das periferias.',image:images[3]},
  {slug:'djonga-anuncia-pausa-na-carreira-para-cuidar-da-saude-mental',category:'NOTÍCIAS',title:'Djonga anuncia pausa na carreira para cuidar da saúde mental',dek:'Artista comunicou uma pausa temporária e recebeu apoio imediato de fãs e colegas de cena.',image:images[4]},
  {slug:'tribo-da-periferia-lanca-documentario-sobre-sua-trajetoria',category:'NOTÍCIAS',title:'Tribo da Periferia lança documentário sobre sua trajetória',dek:'Produção revisita momentos importantes da carreira e os caminhos que marcaram o grupo.',image:images[2]},
  {slug:'filipe-ret-solta-previa-de-faixa-inedita-e-anima-fas',category:'DESTAQUES',title:'Filipe Ret solta prévia de faixa inédita e anima fãs',dek:'Trecho publicado nas redes aumentou a expectativa para o próximo lançamento do artista.',image:images[3]},
  {slug:'mc-dricka-fala-sobre-novos-projetos-e-empoderamento',category:'CULTURA',title:'MC Dricka fala sobre novos projetos e empoderamento',dek:'Cantora comenta nova fase artística e a importância de ampliar vozes femininas na cena.',image:images[0]},
  {slug:'veigh-bate-recorde-com-novo-album-dos-predios-deluxe',category:'LANÇAMENTO',title:'Veigh bate recorde com novo álbum “Dos Prédios Deluxe”',dek:'Projeto alcança números expressivos e reforça o momento de alta do artista.',image:images[1]},
  {slug:'mc-ryan-sp-cancela-show-de-ultima-hora-e-web-reage',category:'NOTÍCIAS',title:'MC Ryan SP cancela show de última hora e web reage',dek:'Cancelamento inesperado gerou reação imediata do público e comentários nas redes.',image:images[0]},
  {slug:'festival-de-trap-2025-anuncia-line-up-pesado',category:'DESTAQUES',title:'Festival de Trap 2025 anuncia line-up pesado',dek:'Evento confirma nomes de destaque e movimenta a expectativa do público.',image:images[2]},
  {slug:'ludmilla-confirma-nova-turne-numanice-4',category:'LANÇAMENTO',title:'Ludmilla confirma nova turnê “Numanice #4”',dek:'Nova etapa do projeto chega com agenda ampliada e estrutura renovada.',image:images[3]},
  {slug:'entenda-a-treta-entre-mainstreet-e-pineapple',category:'POLÊMICA',title:'Entenda a treta entre Mainstreet e Pineapple',dek:'Relembre os principais pontos da disputa que movimentou artistas, fãs e produtores.',image:images[4]},
  {slug:'como-foi-a-gravacao-do-clipe-malvadao-3-de-xama',category:'BASTIDORES',title:'Como foi a gravação do clipe “Malvadão 3” de Xamã',dek:'Equipe e artistas mostram detalhes de uma produção que levou estética urbana para outra escala.',image:images[1]},
]

type Article = typeof articles[number]

function fallbackFromSlug(slug:string):Article{
  const title=slug.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')
  return {slug,category:'NOTÍCIAS',title,dek:'Confira os principais detalhes e repercussões deste assunto no Portal Lander.',image:images[0]}
}

const ranked=articles.slice(8,13)

function ArticleHeader(){
  const [open,setOpen]=useState(false)
  return <header className="article-header"><div className="article-header-inner">
    <Link to="/" className="article-logo"><img src={portalLogo} alt="Portal Lander"/></Link>
    <nav className={open?'article-nav open':'article-nav'}>{categories.map(([label,Icon,to])=><NavLink key={to} to={to}><Icon size={14}/>{label}</NavLink>)}<NavLink to="/colabore">Colabore</NavLink></nav>
    <div className="article-header-actions"><button aria-label="Buscar"><Search size={17}/></button><Link to="/app">Área interna</Link><button className="article-menu" onClick={()=>setOpen(v=>!v)}>{open?<X size={18}/>:<Menu size={18}/>}</button></div>
  </div></header>
}

function ShareButtons(){return <div className="article-share-buttons"><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="X">𝕏</a><a href="#" aria-label="WhatsApp">◉</a><a href="#" aria-label="Copiar link"><LinkIcon size={16}/></a></div>}

function Sidebar(){return <aside className="article-sidebar">
  <section className="article-most"><div className="article-side-title"><h2>MAIS LIDAS</h2><span/></div>{ranked.map((item,i)=><Link className="article-ranked" key={item.slug} to={`/noticia/${item.slug}`}><b>{String(i+1).padStart(2,'0')}</b><img src={item.image} alt=""/><div><h3>{item.title}</h3><small>Há {i*2+3} horas</small></div></Link>)}</section>
  <section className="article-newsletter-box"><h2>RECEBA AS PRINCIPAIS<br/>NOTÍCIAS</h2><p>Inscreva-se e receba as notícias mais quentes do funk e da cultura urbana em primeira mão.</p><input type="email" placeholder="Seu melhor e-mail"/><button>INSCREVER-SE</button></section>
  <section className="article-ad-box"><img src={portalLogo} alt="Portal Lander"/><h2>ANUNCIE AQUI</h2><p>SUA MARCA NO<br/>RITMO CERTO!</p><Link to="/anuncie">SAIBA MAIS →</Link></section>
</aside>}

function ArticleFooter(){return <footer className="article-footer"><div className="article-footer-grid">
  <div><img src={portalLogo} alt="Portal Lander"/><p>O maior portal de notícias sobre funk, cultura urbana e entretenimento. Conteúdo real, direto e sem filtro.</p></div>
  <div><h4>NAVEGAÇÃO</h4>{categories.map(([label,,to])=><Link key={to} to={to}>{label}</Link>)}<Link to="/colabore">Colabore</Link></div>
  <div><h4>INSTITUCIONAL</h4><Link to="/sobre">Sobre o Portal</Link><Link to="/contato">Fale Conosco</Link><Link to="/politica">Política de Privacidade</Link><Link to="/termos">Termos de Uso</Link></div>
  <div><h4>AJUDA</h4><Link to="/faq">Perguntas Frequentes</Link><Link to="/anuncie">Como Anunciar</Link><Link to="/regras">Regras de Publicação</Link></div>
  <div><h4>SIGA O PORTAL LANDER</h4><div className="article-social"><span>◎</span><span>♪</span><span>▶</span><span>𝕏</span><span>◉</span></div></div>
</div><div className="article-copyright">© 2026 Portal Lander. Todos os direitos reservados.</div></footer>}

function ArticlePage({article}:{article:Article}){
  const index=Math.max(0,articles.findIndex(item=>item.slug===article.slug))
  const previous=articles[(index-1+articles.length)%articles.length]
  const next=articles[(index+1)%articles.length]
  const tags=[article.category, ...article.title.replace(/[“”]/g,'').split(' ').filter(w=>w.length>4).slice(0,4)].map(t=>t.toUpperCase())
  return <div className="article-page"><ArticleHeader/><main className="article-shell">
    <div className="article-breadcrumb"><Link to="/">Início</Link><span>›</span><Link to="/noticias">Notícias</Link><span>›</span><span>{article.title}</span></div>
    <div className="article-category">{article.category}</div>
    <h1>{article.title}</h1>
    <p className="article-dek">{article.dek}</p>
    <div className="article-author-row"><div className="article-author"><span className="article-author-avatar">PL</span><span>Por Portal Lander <b>●</b></span><i/> <span>28 de agosto de 2026</span><i/> <span>Há 2 horas</span></div><div className="article-share"><span>Compartilhe:</span><ShareButtons/></div></div>
    <div className="article-layout"><article className="article-content">
      <figure><img src={article.image} alt={article.title}/><figcaption>{article.title} — Foto: Divulgação</figcaption></figure>
      <p><strong>{article.title.split(' ').slice(0,3).join(' ')}</strong> está entre os assuntos que mais movimentam a cena nesta semana. A repercussão cresceu nas redes sociais e colocou o tema no centro das conversas entre fãs, artistas e profissionais do mercado.</p>
      <p>O assunto ganhou força pela combinação entre música, comportamento e cultura urbana. Comentários, vídeos e recortes publicados nas plataformas ampliaram o alcance e fizeram o conteúdo circular rapidamente.</p>
      <p>Para além dos números, o episódio mostra como o público acompanha cada movimento da cena em tempo real e transforma lançamentos, bastidores e declarações em conversas nacionais.</p>
      <blockquote><span>❞</span><p>“A cena muda rápido, mas o que permanece é a conexão com o público e a força de cada história.”</p><cite>— Portal Lander</cite></blockquote>
      <p>O Portal Lander continuará acompanhando os próximos desdobramentos, atualizações e possíveis novidades relacionadas ao tema.</p>
      <div className="article-tags"><b>TAGS:</b>{tags.map(t=><span key={t}>{t}</span>)}</div>
      <div className="article-share-bottom"><span>Compartilhe:</span><ShareButtons/></div>
      <div className="article-prev-next"><Link to={`/noticia/${previous.slug}`}><span>ANTERIOR</span><b>{previous.title}</b></Link><Link to={`/noticia/${next.slug}`}><span>PRÓXIMA</span><b>{next.title}</b><strong>›</strong></Link></div>
    </article><Sidebar/></div>
  </main><ArticleFooter/></div>
}

export function ArticlePageBridge(){
  const location=useLocation()
  const slug=location.pathname.startsWith('/noticia/')?decodeURIComponent(location.pathname.slice('/noticia/'.length)):''
  const article=useMemo(()=>articles.find(item=>item.slug===slug)||fallbackFromSlug(slug),[slug])
  if(!slug) return null
  return <div className="article-route-overlay"><ArticlePage article={article}/></div>
}
