import { Activity, Briefcase, Newspaper } from 'lucide-react'
import { AdminShell } from '../../shared/internal/AdminUi'
import { CRM_WORKSPACE_NAV } from '../../shared/internal/adminNavigation'
import { useActivityHistory } from './hooks/useActivityHistory'
import { useMetrics } from './hooks/useMetrics'

function formatDate(raw:string|undefined){
  if(!raw)return '—'
  const date=new Date(raw)
  return Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'—'
}

function UnavailableState({label}:{label:string}){
  return <div className="dashboard-compact-empty"><strong>—</strong><span>{label}</span></div>
}

export default function DashboardPage(){
  const {metrics,dashboard,isLoading}=useMetrics()
  const activity=useActivityHistory(8)

  return <AdminShell area="crm" items={CRM_WORKSPACE_NAV} header={{title:'Dashboard',description:'Visão geral.'}}>
    <section className="dashboard-reference-page" aria-busy={isLoading}>
      <div className="dashboard-reference-split">
        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Atividades Recentes</h2><p>Atividades operacionais disponíveis no sistema</p></div><Activity size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body dashboard-activity-list">{activity.isLoading?<div className="dashboard-skeleton-list"><span/><span/><span/></div>:activity.data?.length?activity.data.map(item=><article key={item.id}><span className="dashboard-activity-icon"><Newspaper size={14}/></span><div><strong>{item.action==='published'?'Conteúdo publicado':'Conteúdo atualizado'}</strong><p>{item.title} · {item.category}</p></div><time>{formatDate(item.occurred_at)}</time></article>):<div className="dashboard-empty"><Activity size={24}/><strong>Nenhuma atividade registrada</strong><p>As atividades disponíveis aparecerão aqui conforme o sistema for utilizado.</p></div>}</div>
        </section>

        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Pipeline Comercial</h2><p>Resumo das oportunidades comerciais</p></div><Briefcase size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body"><UnavailableState label="Os estágios comerciais aparecerão aqui quando houver dados operacionais disponíveis no CRM."/></div>
        </section>
      </div>

      <section className="dashboard-reference-panel">
        <div className="dashboard-section-heading"><div><h2>Operação Editorial</h2><p>Visão compacta da operação de conteúdo</p></div><Newspaper size={18} aria-hidden="true"/></div>
        <div className="dashboard-panel-body dashboard-operational-list">
          <div><span>Rascunhos</span><strong>{metrics.drafts??'—'}</strong></div>
          <div><span>Publicadas no mês</span><strong>{metrics.publishedThisMonth??'—'}</strong></div>
          <div><span>Total publicadas</span><strong>{metrics.published??'—'}</strong></div>
          <div><span>Arquivadas</span><strong>{dashboard?.archived_count??'—'}</strong></div>
        </div>
      </section>
    </section>
  </AdminShell>
}
