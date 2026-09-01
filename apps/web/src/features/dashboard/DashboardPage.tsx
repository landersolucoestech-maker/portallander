import { Activity, Calendar, CircleDollarSign, FileText, Handshake, Newspaper, UsersRound, Wallet } from 'lucide-react'
import { AdminShell } from '../../shared/internal/AdminUi'
import { UNIFIED_ADMIN_NAV } from '../../shared/internal/adminNavigation'
import { useActivityHistory } from './hooks/useActivityHistory'
import {dashboardReadModel} from './dashboardReadModel'
import '../../styles/admin-dashboard-unified.css'

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
  const totalLeads=Object.values(data.pipeline).reduce((sum,total)=>sum+total,0)
  const newLeads=data.pipeline.novo??0
  const negotiations=data.pipeline.negociacao??0
  const published=data.editorialCounts.published
  const pipelineEntries=Object.entries(data.pipeline).filter(([,total])=>total>0)
  const pipelineMax=Math.max(1,...pipelineEntries.map(([,total])=>total))
  const recentContent=(activity.data??[]).slice(0,3)

  return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:'Visão executiva e operacional do Portal Lander'}}>
    <section className="unified-dashboard" aria-busy={activity.isLoading}>
      <div className="unified-dashboard-kpis">
        <article className="unified-kpi-card"><span className="unified-kpi-icon red"><UsersRound size={20}/></span><div><span>Novos Leads</span><strong>{newLeads}</strong><small>{totalLeads} leads no total</small></div></article>
        <article className="unified-kpi-card"><span className="unified-kpi-icon orange"><Handshake size={20}/></span><div><span>Negociações</span><strong>{negotiations}</strong><small>oportunidades em negociação</small></div></article>
        <article className="unified-kpi-card"><span className="unified-kpi-icon green"><CircleDollarSign size={20}/></span><div><span>Faturamento (Mês)</span><strong>{money(data.monthRevenue)}</strong><small>receitas pagas no período</small></div></article>
        <article className="unified-kpi-card"><span className="unified-kpi-icon purple"><Newspaper size={20}/></span><div><span>Site · Publicações</span><strong>{published}</strong><small>{data.editorialCounts.publishedThisMonth} publicadas no mês</small></div></article>
        <article className="unified-kpi-card"><span className="unified-kpi-icon blue"><Wallet size={20}/></span><div><span>A Receber</span><strong>{money(data.receivable)}</strong><small>receitas pendentes ou vencidas</small></div></article>
      </div>

      <div className="unified-dashboard-main-grid">
        <section className="unified-dashboard-card unified-dashboard-overview">
          <div className="unified-card-heading"><div><h2>Visão Comercial</h2><p>Distribuição atual das oportunidades do CRM.</p></div><Activity size={18}/></div>
          <div className="unified-pipeline-chart">
            {pipelineEntries.length?pipelineEntries.map(([status,total])=><div className="unified-pipeline-row" key={status}><span>{pipelineLabels[status]??status}</span><div><i style={{width:`${Math.max(6,(total/pipelineMax)*100)}%`}}/></div><strong>{total}</strong></div>):<div className="unified-dashboard-empty">Nenhum lead disponível.</div>}
          </div>
        </section>

        <section className="unified-dashboard-card">
          <div className="unified-card-heading"><div><h2>Atividades Recentes</h2><p>Movimentações mais recentes da operação.</p></div></div>
          <div className="unified-activity-list">{activity.isLoading?<div className="unified-dashboard-empty">Carregando atividades...</div>:activity.data?.length?activity.data.slice(0,5).map(item=><article key={item.id}><span><Newspaper size={15}/></span><div><strong>{item.action==='published'?'Novo conteúdo publicado':'Conteúdo atualizado'}</strong><p>{item.title} · {item.category}</p></div><time>{formatDate(item.occurred_at)}</time></article>):<div className="unified-dashboard-empty">Nenhuma atividade registrada.</div>}</div>
        </section>
      </div>

      <div className="unified-dashboard-bottom-grid">
        <section className="unified-dashboard-card">
          <div className="unified-card-heading"><div><h2>Distribuição de Leads</h2><p>Pipeline por estágio.</p></div></div>
          <div className="unified-lead-summary"><div className="unified-lead-total"><span>Total</span><strong>{totalLeads}</strong></div><div className="unified-lead-legend">{pipelineEntries.slice(0,5).map(([status,total])=><div key={status}><span>{pipelineLabels[status]??status}</span><strong>{totalLeads?Math.round((total/totalLeads)*100):0}%</strong></div>)}</div></div>
        </section>

        <section className="unified-dashboard-card">
          <div className="unified-card-heading"><div><h2>Conteúdos em Destaque</h2><p>Últimas movimentações editoriais.</p></div></div>
          <div className="unified-content-list">{recentContent.length?recentContent.map(item=><article key={item.id}><span className="unified-content-thumb"><FileText size={17}/></span><div><strong>{item.title}</strong><p>{item.category} · {formatDate(item.occurred_at)}</p></div></article>):<div className="unified-dashboard-empty">Nenhum conteúdo recente.</div>}</div>
        </section>

        <section className="unified-dashboard-card">
          <div className="unified-card-heading"><div><h2>Próximos Compromissos</h2><p>Agenda operacional.</p></div><Calendar size={18}/></div>
          <div className="unified-task-list">{data.upcoming.length?data.upcoming.map(item=><article key={item.id}><span/><div><strong>{item.title}</strong><p>{formatDate(item.startsAt)}</p></div></article>):<div className="unified-dashboard-empty">Nenhum compromisso próximo.</div>}</div>
        </section>
      </div>
    </section>
  </AdminShell>
}
