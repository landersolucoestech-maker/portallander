import { Activity, FileText, FolderOpen, Newspaper, Tags } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminShell } from '../../shared/internal/AdminUi'
import { CRM_WORKSPACE_NAV } from '../../shared/internal/adminNavigation'
import { useActivityHistory } from './hooks/useActivityHistory'
import { useMetrics } from './hooks/useMetrics'

function formatDate(raw:string|undefined){
  if(!raw)return '—'
  const date=new Date(raw)
  return Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'—'
}

function DashboardSkeleton(){
  return <div className="dashboard-reference-kpis" aria-label="Carregando dashboard">{Array.from({length:4},(_,index)=><article key={index} className="dashboard-stat-card dashboard-stat-skeleton"><span/><strong/><small/></article>)}</div>
}

export default function DashboardPage(){
  const {metrics,dashboard,isLoading}=useMetrics()
  const activity=useActivityHistory(8)

  return <AdminShell area="crm" items={CRM_WORKSPACE_NAV} header={{title:'Dashboard',description:'Visão geral editorial do Portal Lander'}}>
    <section className="dashboard-reference-page" aria-busy={isLoading}>
      {isLoading?<DashboardSkeleton/>:<div className="dashboard-reference-kpis">
        <article className="dashboard-stat-card"><div><span>Conteúdos Publicados</span><strong>{metrics.published??'—'}</strong><small>Total editorial disponível</small></div><Newspaper size={17} aria-hidden="true"/></article>
        <article className="dashboard-stat-card"><div><span>Rascunhos</span><strong>{metrics.drafts??'—'}</strong><small>Conteúdos ainda não publicados</small></div><FileText size={17} aria-hidden="true"/></article>
        <article className="dashboard-stat-card"><div><span>Publicações no Mês</span><strong>{metrics.publishedThisMonth??'—'}</strong><small>Mês atual</small></div><FolderOpen size={17} aria-hidden="true"/></article>
        <article className="dashboard-stat-card"><div><span>Categorias Editoriais</span><strong>{metrics.categories??'—'}</strong><small>Categorias em uso nos conteúdos</small></div><Tags size={17} aria-hidden="true"/></article>
      </div>}

      <div className="dashboard-reference-split">
        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Atividades Recentes</h2><p>Movimentações editoriais registradas nos conteúdos</p></div><Activity size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body dashboard-activity-list">{activity.isLoading?<div className="dashboard-skeleton-list"><span/><span/><span/></div>:activity.data?.length?activity.data.map(item=><article key={item.id}><span className="dashboard-activity-icon"><Newspaper size={14}/></span><div><strong>{item.action==='published'?'Conteúdo publicado':'Conteúdo atualizado'}</strong><p>{item.title} · {item.category}</p></div><time>{formatDate(item.occurred_at)}</time></article>):<div className="dashboard-empty"><Activity size={24}/><strong>Nenhuma atividade editorial</strong><p>As movimentações editoriais aparecerão aqui conforme os conteúdos forem atualizados.</p></div>}</div>
        </section>

        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Últimas Atualizações</h2><p>Conteúdos editados mais recentemente</p></div><FileText size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body dashboard-update-list">{dashboard?.recent_updates.length?dashboard.recent_updates.map(item=><Link key={item.id} to={`/${item.pageSlug}/${item.slug}`} className="dashboard-update-row"><div><strong>{item.title}</strong><span>{item.category}</span></div><time>{formatDate(item.updatedAt)}</time></Link>):<div className="dashboard-empty"><FileText size={24}/><strong>Nenhuma atualização recente</strong><p>Os conteúdos atualizados aparecerão aqui.</p></div>}</div>
        </section>
      </div>

      <section className="dashboard-reference-panel dashboard-editorial-highlights">
        <div className="dashboard-section-heading"><div><h2>Publicações Recentes</h2><p>Conteúdos publicados mais recentemente</p></div><Newspaper size={18} aria-hidden="true"/></div>
        <div className="dashboard-panel-body">{dashboard?.recent_publications.length?<div className="dashboard-editorial-grid">{dashboard.recent_publications.map(item=><article key={item.id} className="dashboard-editorial-card">{item.coverImage&&<img src={item.coverImage} alt=""/>}<div className="dashboard-editorial-card-body"><span>{item.category}</span><h3>{item.title}</h3><p>{item.author} · {formatDate(item.publishedAt)}</p><Link to={`/${item.pageSlug}/${item.slug}`}>Ver publicação</Link></div></article>)}</div>:<div className="dashboard-empty"><Newspaper size={24}/><strong>Nenhuma publicação disponível</strong><p>As publicações recentes aparecerão aqui.</p></div>}</div>
      </section>
    </section>
  </AdminShell>
}
