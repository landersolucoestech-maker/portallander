import { CalendarDays, ClipboardList, Eye, FileClock, FileText, Newspaper, PencilLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import { agendaRepository } from '../../agenda/repository'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { siteFormRegistry } from '../forms/catalog'
import { siteManagerReadModel } from '../readModel'
import '../../../styles/admin-site-manager-dashboard.css'

const dateTime=(value:string)=>new Date(value).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})
const day=(value:string)=>new Date(value).toLocaleDateString('pt-BR',{day:'2-digit'})
const month=(value:string)=>new Date(value).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')
const statusLabel:Record<string,string>={draft:'Rascunho',published:'Publicado',archived:'Arquivado'}

function Kpi({label,value,detail,icon}:{label:string;value:string;detail:string;icon:React.ReactNode}){
  return <article className="site-dashboard-kpi"><span className="site-dashboard-kpi-icon" aria-hidden="true">{icon}</span><div className="site-dashboard-kpi-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></article>
}

export function SiteManagerDashboardPage(){
  const pages=siteManagerReadModel.pages
  const contents=siteManagerReadModel.contents
  const totalPublications=contents.length
  const pendingPublications=contents.filter(content=>content.status==='draft').length
  const activePublications=contents.filter(content=>content.status==='published'&&content.active).length
  const activeForms=siteFormRegistry.filter(form=>form.status==='active').length
  const recentContents=[...contents].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5)
  const recentActivity=[
    ...contents.map(content=>({id:`content-${content.id}`,title:content.title,detail:`Conteúdo · ${statusLabel[content.status]??content.status}`,updatedAt:content.updatedAt})),
    ...pages.map(page=>({id:`page-${page.id}`,title:page.title,detail:'Página atualizada',updatedAt:page.updatedAt})),
  ].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5)
  const agenda=agendaRepository.list().filter(item=>item.status!=='cancelado'&&item.status!=='concluido').sort((a,b)=>a.startsAt.localeCompare(b.startsAt)).slice(0,5)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Dashboard',description:'Visão geral do site, conteúdo, páginas e captação.'}} headerAction={{label:'Ver Site',variant:'secondary',onClick:()=>window.open(`${window.location.origin}${window.location.pathname}#/`,'_blank','noopener,noreferrer')}}>
    <section className="site-manager-dashboard">
      <div className="site-dashboard-kpis" aria-label="Indicadores do site">
        <Kpi label="Total de Publicações" value={String(totalPublications)} detail="Conteúdos cadastrados" icon={<FileText size={17}/>}/>
        <Kpi label="Publicações Pendentes" value={String(pendingPublications)} detail="Conteúdos em rascunho" icon={<FileClock size={17}/>}/>
        <Kpi label="Publicações Ativas" value={String(activePublications)} detail="Publicadas e visíveis no site" icon={<Newspaper size={17}/>}/>
        <Kpi label="Páginas" value={String(pages.length)} detail="Páginas editoriais registradas" icon={<Eye size={17}/>}/>
        <Kpi label="Formulários Ativos" value={String(activeForms)} detail="Pontos de captura publicados" icon={<ClipboardList size={17}/>}/>
      </div>

      <div className="site-dashboard-primary-grid">
        <section className="site-dashboard-panel">
          <header className="site-dashboard-panel-head"><div className="site-dashboard-panel-title"><PencilLine size={15}/><h2>Atividade recente</h2></div></header>
          {recentActivity.length?<div className="site-dashboard-list">{recentActivity.map(item=><article className="site-dashboard-row" key={item.id}><div className="site-dashboard-row-main"><span className="site-activity-icon"><PencilLine size={14}/></span><div><b>{item.title}</b><small>{item.detail}</small></div></div><time>{dateTime(item.updatedAt)}</time></article>)}</div>:<div className="site-dashboard-empty"><strong>Nenhuma atividade recente</strong>As alterações do gerenciador aparecerão aqui.</div>}
        </section>

        <section className="site-dashboard-panel">
          <header className="site-dashboard-panel-head"><div className="site-dashboard-panel-title"><CalendarDays size={15}/><h2>Agenda</h2></div><Link className="site-dashboard-panel-link" to="/app/agenda">VER AGENDA COMPLETA</Link></header>
          {agenda.length?<div className="site-dashboard-list">{agenda.map(item=><article className="site-dashboard-row" key={item.id}><div className="site-dashboard-row-main"><span className="site-agenda-date"><strong>{day(item.startsAt)}</strong><small>{month(item.startsAt)}</small></span><div><b>{item.title}</b><small>{item.type} · {item.status}</small></div></div><time>{new Date(item.startsAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</time></article>)}</div>:<div className="site-dashboard-empty"><strong>Nenhum compromisso próximo</strong>Novos eventos da Agenda aparecerão automaticamente aqui.</div>}
        </section>
      </div>

      <div className="site-dashboard-secondary-grid">
        <section className="site-dashboard-panel">
          <header className="site-dashboard-panel-head"><div className="site-dashboard-panel-title"><Newspaper size={15}/><h2>Conteúdos recentes</h2></div><Link className="site-dashboard-panel-link" to="/app/site/conteudos">VER TODOS</Link></header>
          {recentContents.length?<div className="site-dashboard-list">{recentContents.map(content=><article className="site-dashboard-row" key={content.id}><div className="site-dashboard-row-main">{content.coverImage?<img className="site-content-thumb" src={content.coverImage} alt=""/>:<span className="site-content-thumb-placeholder"><Newspaper size={14}/></span>}<div><b>{content.title}</b><span className="site-content-meta"><small>{siteManagerReadModel.getPageById(content.pageId)?.navigationLabel||'Editorial'}</small><span className={`status ${content.status}`}>{statusLabel[content.status]??content.status}</span></span></div></div><time>{dateTime(content.updatedAt)}</time></article>)}</div>:<div className="site-dashboard-empty"><strong>Nenhum conteúdo cadastrado</strong>Os conteúdos mais recentes aparecerão aqui.</div>}
        </section>

        <section className="site-dashboard-panel site-pages-ranking">
          <header className="site-dashboard-panel-head"><div className="site-dashboard-panel-title"><Eye size={15}/><h2>Desempenho das páginas</h2></div><Link className="site-dashboard-panel-link" to="/app/site/paginas">GERENCIAR PÁGINAS</Link></header>
          <div className="site-dashboard-empty"><strong>Analytics por página ainda não conectado</strong>Quando a fonte de analytics estiver disponível, este card exibirá dados reais de desempenho sem criar métricas fictícias.</div>
        </section>
      </div>
    </section>
  </AdminShell>
}
