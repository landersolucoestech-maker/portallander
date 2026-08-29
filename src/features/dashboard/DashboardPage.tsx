import { Activity, AlertTriangle, Briefcase, Calendar, ClipboardList, DollarSign, FileText, Newspaper, PieChart, Wallet } from 'lucide-react'
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

function UnavailableState({label}:{label:string}){
  return <div className="dashboard-compact-empty"><strong>—</strong><span>{label}</span></div>
}

export default function DashboardPage(){
  const {metrics,dashboard,isLoading}=useMetrics()
  const activity=useActivityHistory(8)
  const operationalAlerts:readonly string[]=[]

  return <AdminShell area="crm" items={CRM_WORKSPACE_NAV} header={{title:'Dashboard',description:'Visão executiva e operacional do Portal Lander'}}>
    <section className="dashboard-reference-page" aria-busy={isLoading}>
      {isLoading?<DashboardSkeleton/>:<div className="dashboard-reference-kpis">
        <article className="dashboard-stat-card"><div><span>Faturamento do Mês</span><strong>—</strong><small>Fonte financeira ainda não disponível</small></div><DollarSign size={17} aria-hidden="true"/></article>
        <article className="dashboard-stat-card"><div><span>A Receber</span><strong>—</strong><small>Sem fonte financeira ativa</small></div><Wallet size={17} aria-hidden="true"/></article>
        <article className="dashboard-stat-card"><div><span>Contratos Ativos</span><strong>—</strong><small>Módulo de contratos ainda não conectado</small></div><FileText size={17} aria-hidden="true"/></article>
        <article className="dashboard-stat-card"><div><span>Publicações Contratadas Pendentes</span><strong>—</strong><small>Sem obrigação comercial modelada</small></div><ClipboardList size={17} aria-hidden="true"/></article>
      </div>}

      {operationalAlerts.length>0&&<section className="dashboard-reference-panel dashboard-attention-panel">
        <div className="dashboard-section-heading"><div><h2>Atenção Necessária</h2><p>Ocorrências operacionais que exigem ação</p></div><AlertTriangle size={18} aria-hidden="true"/></div>
        <div className="dashboard-panel-body dashboard-alert-list">{operationalAlerts.map(item=><div key={item}>{item}</div>)}</div>
      </section>}

      <div className="dashboard-reference-split">
        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Atividades Recentes</h2><p>Atividades operacionais disponíveis no sistema</p></div><Activity size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body dashboard-activity-list">{activity.isLoading?<div className="dashboard-skeleton-list"><span/><span/><span/></div>:activity.data?.length?activity.data.map(item=><article key={item.id}><span className="dashboard-activity-icon"><Newspaper size={14}/></span><div><strong>{item.action==='published'?'Conteúdo publicado':'Conteúdo atualizado'}</strong><p>{item.title} · {item.category}</p></div><time>{formatDate(item.occurred_at)}</time></article>):<div className="dashboard-empty"><Activity size={24}/><strong>Nenhuma atividade registrada</strong><p>As atividades disponíveis aparecerão aqui conforme o sistema for utilizado.</p></div>}</div>
        </section>

        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Próximos Compromissos</h2><p>Agenda operacional do Portal Lander</p></div><Calendar size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body"><UnavailableState label="A agenda será exibida aqui quando houver uma fonte operacional disponível."/></div>
        </section>
      </div>

      <div className="dashboard-management-grid">
        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Pipeline Comercial</h2><p>Resumo das oportunidades comerciais</p></div><Briefcase size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body"><UnavailableState label="Os estágios comerciais aparecerão aqui quando o CRM for reconstruído."/></div>
        </section>

        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Operação Editorial</h2><p>Visão compacta da operação de conteúdo</p></div><Newspaper size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body dashboard-operational-list">
            <div><span>Rascunhos</span><strong>{metrics.drafts??'—'}</strong></div>
            <div><span>Publicadas no mês</span><strong>{metrics.publishedThisMonth??'—'}</strong></div>
            <div><span>Total publicadas</span><strong>{metrics.published??'—'}</strong></div>
            <div><span>Arquivadas</span><strong>{dashboard?.archived_count??'—'}</strong></div>
          </div>
        </section>

        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Receita por Origem</h2><p>Composição das receitas do Portal Lander</p></div><PieChart size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body"><UnavailableState label="A distribuição de receita será exibida quando o financeiro possuir dados categorizados."/></div>
        </section>
      </div>
    </section>
  </AdminShell>
}
