import { Routes, Route, Navigate, NavLink, Link } from 'react-router-dom'
import { ArrowRight, Bell, BriefcaseBusiness, Building2, CalendarDays, ChevronDown, CircleDollarSign, FileText, Flame, Gauge, Globe2, Images, LayoutDashboard, Menu, Mic2, Music2, Newspaper, Play, Search, Settings, Star, Tags, Users, Video, WandSparkles, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { portalLogo } from './brandAsset'

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

const contacts = [
  { name: 'Marina Costa', company: 'Norte Produções', status: 'Lead', owner: 'Comercial', value: 'R$ 18.000' },
  { name: 'Rafael Alves', company: 'Estúdio Horizonte', status: 'Cliente', owner: 'Deyvisson', value: 'R$ 32.500' },
  { name: 'Camila Rocha', company: 'Aurora Music', status: 'Negociação', owner: 'Comercial', value: 'R$ 24.000' },
  { name: 'Bruno Lima', company: 'BL Eventos', status: 'Contato', owner: 'Equipe', value: 'R$ 7.500' },
]

const contentRows = [
  { title: 'A nova fase da cena independente', type: 'Notícia', status: 'Publicado', updated: 'Hoje, 14:32' },
  { title: 'Entrevista: criação sem fórmula', type: 'Entrevista', status: 'Em revisão', updated: 'Hoje, 11:18' },
  { title: 'Radar de lançamentos — Agosto', type: 'Lançamento', status: 'Rascunho', updated: 'Ontem, 19:41' },
  { title: 'Mercado e audiência em 2026', type: 'Artigo', status: 'Agendado', updated: 'Ontem, 16:08' },
]

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link to="/" className="brand"><span className="brand-mark">L</span>{!compact && <span>PORTAL <b>LANDER</b></span>}</Link>
}

function PublicBrand({ compact = false }: { compact?: boolean }) {
  return <Link to="/" className={compact ? 'public-brand compact' : 'public-brand'} aria-label="Portal Lander"><img src={portalLogo} alt="Portal Lander" /></Link>
}

function PublicHeader() {
  const [open, setOpen] = useState(false)
  return <>
    <header className="public-header">
      <div className="public-nav shell">
        <PublicBrand />
        <nav className={open ? 'public-links open' : 'public-links'}>
          {publicCategories.map(([label, Icon, to]) => <NavLink key={to} to={to}><Icon size={15}/>{label}</NavLink>)}
          <NavLink to="/colabore">Colabore</NavLink>
        </nav>
        <div className="nav-actions">
          <button className="public-search" aria-label="Buscar"><Search size={18}/></button>
          <Link className="public-internal" to="/app">Área interna</Link>
          <button className="public-menu" onClick={()=>setOpen(!open)} aria-label="Abrir menu">{open?<X/>:<Menu/>}</button>
        </div>
      </div>
    </header>
    <div className="public-category-bar">
      <div className="shell category-track">
        {publicCategories.map(([label, Icon, to]) => <NavLink key={to} to={to}><Icon size={18}/><span>{label}</span></NavLink>)}
      </div>
    </div>
  </>
}

function PublicFooter() {
  return <footer className="public-footer"><div className="shell portal-footer-grid"><PublicBrand/><div><b>Notícias · Funk · Cultura · Entretenimento</b><p>Conteúdo urbano, lançamentos, bastidores e tudo que movimenta a cena.</p></div><div className="footer-links"><Link to="/colabore">Colabore</Link><Link to="/app">Área interna</Link><span>© 2026 Portal Lander</span></div></div></footer>
}

function Home() {
  return <div className="public-page"><PublicHeader/><main>
    <section className="portal-hero">
      <div className="shell portal-hero-grid">
        <div className="portal-hero-copy">
          <span className="portal-kicker">Portal Lander · Em destaque</span>
          <h1>O QUE ESTÁ<br/><strong>PEGANDO AGORA.</strong></h1>
          <p>Notícias, polêmicas, lançamentos, bastidores e tudo que acontece no funk, na cultura urbana e no entretenimento.</p>
          <div className="portal-actions"><Link to="/noticias" className="portal-button">VER AGORA <ArrowRight size={19}/></Link><Link to="/destaques" className="portal-link">Explorar destaques</Link></div>
        </div>
        <div className="portal-hero-brand" aria-hidden="true"><img src={portalLogo} alt=""/><span>NOTÍCIAS · FUNK · CULTURA · ENTRETENIMENTO</span></div>
      </div>
      <div className="hero-noise" />
    </section>

    <section className="portal-breaking"><div className="shell"><span>AGORA</span><p>Novos lançamentos, bastidores e assuntos que estão dominando a conversa.</p><ArrowRight size={18}/></div></section>

    <section className="portal-section shell" id="destaques">
      <div className="portal-section-title"><div><span>EM DESTAQUE</span><h2>O QUE TODO MUNDO<br/>ESTÁ FALANDO</h2></div><Link to="/noticias">VER TUDO <ArrowRight size={16}/></Link></div>
      <div className="portal-story-grid">
        {publicStories.map((story,i)=><article className={i===0?'portal-story lead':'portal-story'} key={story.title}>
          <div className={`portal-story-art ${story.tone}`}><span className="portal-number">0{i+1}</span><span className="portal-story-logo">PL</span></div>
          <div className="portal-story-copy"><span className="portal-label">{story.category}</span><h3>{story.title}</h3><p>{story.excerpt}</p><small>{story.meta}</small></div>
        </article>)}
      </div>
    </section>

    <section className="portal-dark-band"><div className="shell"><div className="portal-section-title inverse"><div><span>RADAR LANDER</span><h2>DA RUA PARA<br/>A SUA TELA.</h2></div></div><div className="portal-radar-grid">{publicCategories.map(([label,Icon,to],i)=><Link key={to} to={to} className="portal-radar-card"><Icon/><span>0{i+1}</span><h3>{label}</h3><ArrowRight/></Link>)}</div></div></section>

    <section className="portal-video-section shell"><div className="portal-section-title"><div><span>VÍDEOS</span><h2>ASSISTA NO PORTAL</h2></div><Link to="/videos">VER VÍDEOS <ArrowRight size={16}/></Link></div><div className="portal-video-feature"><div className="video-play"><Play fill="currentColor"/></div><div><span>BASTIDORES</span><h3>O que não apareceu no palco também faz parte da história.</h3><p>Conteúdo em vídeo, entrevistas, cenas de bastidor e cobertura da cultura urbana.</p></div></div></section>
  </main><PublicFooter/></div>
}

function PublicListing({title,accent='ÚLTIMAS',intro='Notícias, bastidores e histórias que movimentam a cena.'}:{title:string,accent?:string,intro?:string}) {
  return <div className="public-page"><PublicHeader/><main className="shell portal-listing"><header><span className="portal-kicker">{accent}</span><h1>{title}</h1><p>{intro}</p></header><div className="portal-filter-row">{['Todos','Agora','Mais lidos','Esta semana'].map((x,i)=><button className={i===0?'active':''} key={x}>{x}</button>)}</div><div className="portal-news-grid">{[...publicStories,...publicStories].map((s,i)=><article key={`${s.title}-${i}`}><div className={`portal-news-art ${s.tone}`}><span>{String(i+1).padStart(2,'0')}</span></div><div><span className="portal-label">{s.category}</span><h2>{s.title}</h2><p>{s.excerpt}</p><small>{s.meta}</small></div></article>)}</div></main><PublicFooter/></div>
}

function Noticias() { return <PublicListing title="NOTÍCIAS"/> }
function Polemicas() { return <PublicListing title="POLÊMICAS" accent="SEM FILTRO" intro="As histórias, discussões e declarações que colocaram a cena no centro da conversa."/> }
function Bastidores() { return <PublicListing title="BASTIDORES" accent="POR TRÁS DA CENA" intro="O que acontece antes, durante e depois do que aparece para o público."/> }
function Lancamentos() { return <PublicListing title="LANÇAMENTOS" accent="MÚSICA NOVA" intro="Singles, clipes e projetos que acabaram de chegar no funk e na cultura urbana."/> }
function Destaques() { return <PublicListing title="DESTAQUES" accent="NO RADAR" intro="O melhor do Portal Lander reunido em uma seleção direta e atualizada."/> }
function Videos() { return <PublicListing title="VÍDEOS" accent="ASSISTA" intro="Entrevistas, bastidores, coberturas e conteúdos em vídeo do Portal Lander."/> }

function Colabore() { return <div className="public-page"><PublicHeader/><main className="shell portal-collab"><div className="portal-collab-copy"><span className="portal-kicker">COLABORE COM O PORTAL</span><h1>MANDE SUA<br/><strong>PAUTA.</strong></h1><p>Tem lançamento, evento, história, denúncia, bastidor ou projeto que merece espaço? Envie para nossa equipe editorial.</p><div className="collab-rule"><span>01</span>Conte o que aconteceu</div><div className="collab-rule"><span>02</span>Inclua links e contexto</div><div className="collab-rule"><span>03</span>Nossa equipe faz a análise</div></div><form className="portal-form" onSubmit={e=>e.preventDefault()}><label>Nome<input placeholder="Seu nome"/></label><label>Email<input type="email" placeholder="voce@email.com"/></label><label>Tipo<select defaultValue=""><option value="" disabled>Selecione</option><option>Notícia</option><option>Polêmica</option><option>Bastidor</option><option>Lançamento</option><option>Evento</option><option>Outro</option></select></label><label>Título<input placeholder="Resumo da pauta"/></label><label className="full">Descrição<textarea rows={6} placeholder="Conte os detalhes..."/></label><div className="portal-form-note full">Frontend de demonstração — a persistência definitiva será conectada ao backend posteriormente.</div><button className="portal-button" type="submit">PREPARAR ENVIO <ArrowRight size={17}/></button></form></main><PublicFooter/></div> }

const crmNav = [['Visão geral',LayoutDashboard,'/app/crm'],['Contatos',Users,'/app/crm/contatos'],['Pipeline',BriefcaseBusiness,'/app/crm/pipeline'],['Atividades',CalendarDays,'/app/crm/atividades'],['Financeiro',CircleDollarSign,'/app/crm/financeiro']] as const
const cmsNav = [['Visão geral',LayoutDashboard,'/app/site'],['Conteúdos',FileText,'/app/site/conteudos'],['Páginas',Globe2,'/app/site/paginas'],['Mídia',Images,'/app/site/midia'],['Categorias',Tags,'/app/site/categorias'],['Mídia Kit',Newspaper,'/app/site/midia-kit'],['Configurações',Settings,'/app/site/configuracoes']] as const

function AppShell({area,children}:{area:'crm'|'cms',children:React.ReactNode}) { const items=area==='crm'?crmNav:cmsNav; return <div className="app-shell"><aside className="sidebar"><div className="sidebar-head"><Brand compact/><span>{area==='crm'?'CRM':'SITE'}</span></div><nav>{items.map(([label,Icon,to])=><NavLink key={to} end={to==='/app/crm'||to==='/app/site'} to={to}><Icon size={18}/><span>{label}</span></NavLink>)}</nav><div className="sidebar-bottom"><NavLink to="/app"><Building2 size={18}/><span>Trocar workspace</span></NavLink></div></aside><div className="workspace"><header className="workspace-top"><div><span className="workspace-name">Portal Lander</span><span className="workspace-context">{area==='crm'?'CRM':'Gerenciador do Site'}</span></div><div className="workspace-actions"><button className="icon-button"><Bell size={18}/></button><button className="account-button"><span>DL</span><div><b>Deyvisson</b><small>Administrador</small></div><ChevronDown size={15}/></button></div></header><main className="workspace-main">{children}</main></div></div> }

function WorkspaceHome() { return <div className="workspace-picker"><div className="picker-copy"><span className="kicker">Portal Lander</span><h1>Escolha onde trabalhar</h1><p>O frontend interno é dividido em áreas claras para evitar misturar operação comercial com gerenciamento editorial.</p></div><div className="workspace-cards"><Link to="/app/crm" className="workspace-card"><div className="workspace-icon"><BriefcaseBusiness/></div><span>Operação</span><h2>CRM</h2><p>Contatos, oportunidades, atividades e visão financeira.</p><ArrowRight/></Link><Link to="/app/site" className="workspace-card"><div className="workspace-icon"><WandSparkles/></div><span>Conteúdo</span><h2>Gerenciador do Site</h2><p>Conteúdos, páginas, mídia, SEO e configurações do portal.</p><ArrowRight/></Link></div><Link className="back-site" to="/">← Voltar ao site público</Link></div> }

function PageHeader({eyebrow,title,action}:{eyebrow:string,title:string,action?:string}) { return <div className="page-header"><div><span>{eyebrow}</span><h1>{title}</h1></div>{action&&<button className="button dark">{action}</button>}</div> }
function Metric({label,value,detail}:{label:string,value:string,detail:string}) { return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div> }

function CrmDashboard() { return <AppShell area="crm"><PageHeader eyebrow="CRM" title="Visão geral" action="Novo contato"/><div className="metrics-grid"><Metric label="Contatos" value="248" detail="+18 este mês"/><Metric label="Leads" value="42" detail="12 qualificados"/><Metric label="Clientes" value="31" detail="5 ativos agora"/><Metric label="Receitas" value="R$ 84,2k" detail="Este mês"/><Metric label="Despesas" value="R$ 26,8k" detail="Este mês"/><Metric label="Resultado" value="R$ 57,4k" detail="Margem operacional"/></div><div className="panel-grid"><section className="panel"><div className="panel-head"><div><span>Pipeline</span><h2>Oportunidades recentes</h2></div><button className="text-button">Ver pipeline</button></div>{contacts.slice(0,3).map(c=><div className="compact-row" key={c.name}><div className="avatar">{c.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div className="grow"><b>{c.company}</b><small>{c.name}</small></div><span className="status">{c.status}</span><strong>{c.value}</strong></div>)}</section><section className="panel"><div className="panel-head"><div><span>Hoje</span><h2>Próximas atividades</h2></div></div>{['Retornar proposta — Aurora Music','Reunião — Norte Produções','Follow-up — BL Eventos'].map((x,i)=><div className="activity-row" key={x}><span>{['10:30','14:00','16:15'][i]}</span><div><b>{x}</b><small>{['Ligação','Reunião','WhatsApp'][i]}</small></div></div>)}</section></div></AppShell> }

function Contacts() { return <AppShell area="crm"><PageHeader eyebrow="CRM / Contatos" title="Contatos" action="Novo contato"/><div className="toolbar"><div className="searchbox"><Search size={17}/><input placeholder="Buscar contatos..."/></div><button className="button outline">Filtros</button></div><section className="table-card"><table><thead><tr><th>Contato</th><th>Empresa</th><th>Status</th><th>Responsável</th><th>Valor relacionado</th></tr></thead><tbody>{contacts.map(c=><tr key={c.name}><td><b>{c.name}</b></td><td>{c.company}</td><td><span className="status">{c.status}</span></td><td>{c.owner}</td><td><strong>{c.value}</strong></td></tr>)}</tbody></table></section></AppShell> }

function CmsDashboard() { return <AppShell area="cms"><PageHeader eyebrow="Gerenciador do Site" title="Visão geral" action="Novo conteúdo"/><div className="metrics-grid four"><Metric label="Publicados" value="126" detail="Conteúdos ativos"/><Metric label="Rascunhos" value="14" detail="Aguardando edição"/><Metric label="Em revisão" value="7" detail="Precisam de atenção"/><Metric label="Agendados" value="5" detail="Próximas publicações"/></div><section className="panel"><div className="panel-head"><div><span>Conteúdo</span><h2>Atualizações recentes</h2></div><Link to="/app/site/conteudos" className="text-button">Ver todos</Link></div>{contentRows.map(r=><div className="content-row" key={r.title}><div className="content-icon"><FileText size={17}/></div><div className="grow"><b>{r.title}</b><small>{r.type} · {r.updated}</small></div><span className="status">{r.status}</span><button className="icon-button">•••</button></div>)}</section></AppShell> }

function Contents() { return <AppShell area="cms"><PageHeader eyebrow="Gerenciador do Site / Conteúdos" title="Conteúdos" action="Novo conteúdo"/><div className="toolbar"><div className="searchbox"><Search size={17}/><input placeholder="Buscar conteúdos..."/></div><div className="tabbar"><button className="active">Todos</button><button>Publicados</button><button>Rascunhos</button><button>Em revisão</button></div></div><section className="table-card"><table><thead><tr><th>Título</th><th>Tipo</th><th>Status</th><th>Atualizado</th></tr></thead><tbody>{contentRows.map(r=><tr key={r.title}><td><b>{r.title}</b></td><td>{r.type}</td><td><span className="status">{r.status}</span></td><td>{r.updated}</td></tr>)}</tbody></table></section></AppShell> }

function Placeholder({area,title}:{area:'crm'|'cms',title:string}) { return <AppShell area={area}><PageHeader eyebrow={area==='crm'?'CRM':'Gerenciador do Site'} title={title}/><div className="empty-state"><div><Gauge/></div><h2>Estrutura preparada</h2><p>Este módulo entra na próxima etapa de implementação do frontend. A navegação e a arquitetura já estão reservadas sem fingir funcionalidade inexistente.</p></div></AppShell> }
function NotFound() { return <div className="not-found"><Brand/><span>404</span><h1>Página não encontrada</h1><Link className="button primary" to="/">Voltar ao início</Link></div> }

export default function App() { return <Routes><Route path="/" element={<Home/>}/><Route path="/noticias" element={<Noticias/>}/><Route path="/polemicas" element={<Polemicas/>}/><Route path="/bastidores" element={<Bastidores/>}/><Route path="/lancamentos" element={<Lancamentos/>}/><Route path="/destaques" element={<Destaques/>}/><Route path="/videos" element={<Videos/>}/><Route path="/colabore" element={<Colabore/>}/><Route path="/app" element={<WorkspaceHome/>}/><Route path="/app/crm" element={<CrmDashboard/>}/><Route path="/app/crm/contatos" element={<Contacts/>}/><Route path="/app/crm/pipeline" element={<Placeholder area="crm" title="Pipeline comercial"/>}/><Route path="/app/crm/atividades" element={<Placeholder area="crm" title="Atividades"/>}/><Route path="/app/crm/financeiro" element={<Placeholder area="crm" title="Financeiro"/>}/><Route path="/app/site" element={<CmsDashboard/>}/><Route path="/app/site/conteudos" element={<Contents/>}/>{['paginas','midia','categorias','midia-kit','configuracoes'].map(p=><Route key={p} path={`/app/site/${p}`} element={<Placeholder area="cms" title={({paginas:'Páginas',midia:'Media Manager',categorias:'Categorias','midia-kit':'Mídia Kit',configuracoes:'Configurações'} as Record<string,string>)[p]}/>}/>)}<Route path="/home" element={<Navigate to="/" replace/>}/><Route path="*" element={<NotFound/>}/></Routes> }
