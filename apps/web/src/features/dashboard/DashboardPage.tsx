import { Activity, Briefcase, Calendar, ClipboardList, DollarSign, FileText, Newspaper, PieChart, Wallet } from 'lucide-react'
import { AdminShell } from '../../shared/internal/AdminUi'
import { UNIFIED_ADMIN_NAV } from '../../shared/internal/adminNavigation'
import { useActivityHistory } from './hooks/useActivityHistory'
import {dashboardReadModel} from './dashboardReadModel'

const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
function formatDate(raw:string|undefined){
  if(!raw)return '—'
  const date=new Date(raw)
  return Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'—'
}

const pipelineLabels:Record<string,string>={novo:'Novos',contato_realizado:'Contato realizado',qualificado:'Qualificados',proposta:'Propostas',negociacao:'Negociação',fechado:'Fechados',perdido:'Perdidos'}

export default function DashboardPage(){
  const activity=useActivityHistory(8)
  const data=dashboardReadModel.snapshot()

  return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:'Visão executiva e operacional do Portal Lander'}}>
    <section className="dashboard-reference-page" aria-busy={activity.isLoading}>
      <div className="dashboard-reference-kpis">
        <article className="dashboard-stat-card"><div><span>Faturamento do Mês</span><strong>{money(data.monthRevenue)}</strong><small>receitas pagas no período</small></div><DollarSign size={17} aria-hidden="true"/></article>
        <article className="dashboard-stat-card"><div><span>A Receber</span><strong>{money(data.receivable)}</strong><small>receitas pendentes ou vencidas</small></div><Wallet size={17} aria-hidden="true"/></article>
        <article className="dashboard-stat-card"><div><span>Contratos Ativos</span><strong>{data.activeContracts}</strong><small>vigentes ou em processo de assinatura</small></div><FileText size={17} aria-hidden="true"/></article>
        <article className="dashboard-stat-card"><div><span>Publicações Contratadas Pendentes</span><strong>{data.pendingCommercialPublications}</strong><small>obrigações comerciais de conteúdo em aberto</small></div><ClipboardList size={17} aria-hidden="true"/></article>
      </div>

      <div className="dashboard-reference-split">
        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Atividades Recentes</h2><p>Atividades operacionais disponíveis no sistema</p></div><Activity size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body dashboard-activity-list">{activity.isLoading?<div className="dashboard-skeleton-list"><span/><span/><span/></div>:activity.data?.length?activity.data.map(item=><article key={item.id}><span className="dashboard-activity-icon"><Newspaper size={14}/></span><div><strong>{item.action==='published'?'Conteúdo publicado':'Conteúdo atualizado'}</strong><p>{item.title} · {item.category}</p></div><time>{formatDate(item.occurred_at)}</time></article>):<div className="dashboard-empty"><Activity size={24}/><strong>Nenhuma atividade registrada</strong><p>As atividades disponíveis aparecerão aqui conforme o sistema for utilizado.</p></div>}</div>
        </section>

        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Próximos Compromissos</h2><p>Agenda operacional do Portal Lander</p></div><Calendar size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body dashboard-operational-list">{data.upcoming.length?data.upcoming.map(item=><div key={item.id}><span>{item.title}</span><strong>{formatDate(item.startsAt)}</strong></div>):<div className="dashboard-compact-empty"><strong>—</strong><span>Nenhum compromisso próximo.</span></div>}</div>
        </section>
      </div>

      <div className="dashboard-management-grid">
        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Pipeline Comercial</h2><p>Resumo das oportunidades comerciais</p></div><Briefcase size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body dashboard-operational-list">{Object.entries(data.pipeline).map(([status,total])=><div key={status}><span>{pipelineLabels[status]??status}</span><strong>{total}</strong></div>)}</div>
        </section>

        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Operação Editorial</h2><p>Visão compacta da operação de conteúdo</p></div><Newspaper size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body dashboard-operational-list">
            <div><span>Rascunhos</span><strong>{data.editorialCounts.drafts}</strong></div>
            <div><span>Publicadas no mês</span><strong>{data.editorialCounts.publishedThisMonth}</strong></div>
            <div><span>Total publicadas</span><strong>{data.editorialCounts.published}</strong></div>
            <div><span>Arquivadas</span><strong>{data.editorialCounts.archived}</strong></div>
          </div>
        </section>

        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Receita por Origem</h2><p>Composição das receitas do Portal Lander</p></div><PieChart size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body dashboard-operational-list">{data.revenueByCategory.slice(0,5).map(([category,value])=><div key={category}><span>{category}</span><strong>{money(value)}</strong></div>)}</div>
        </section>
      </div>
    </section>
  </AdminShell>
}
