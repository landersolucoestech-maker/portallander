import { CircleDollarSign, Eye, FileText, Handshake, Newspaper, UsersRound, Wallet } from 'lucide-react'
import { AdminShell } from '../../shared/internal/AdminUi'
import { UNIFIED_ADMIN_NAV } from '../../shared/internal/adminNavigation'
import { useActivityHistory } from './hooks/useActivityHistory'
import {dashboardReadModel} from './dashboardReadModel'
import '../../styles/admin-dashboard-unified.css'

const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
function formatDate(raw:string|undefined){if(!raw)return '—';const date=new Date(raw);return Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'—'}
const pipelineLabels:Record<string,string>={novo:'Novos',contato_realizado:'Contato realizado',qualificado:'Qualificados',proposta:'Propostas',negociacao:'Negociação',fechado:'Fechados',perdido:'Perdidos'}

export default function DashboardPage(){
 const activity=useActivityHistory(8)
 const data=dashboardReadModel.snapshot()
 const totalLeads=Object.values(data.pipeline).reduce((sum,total)=>sum+total,0)
 const newLeads=data.pipeline.novo??0
 const negotiations=data.pipeline.negociacao??0
 const leadEntries=Object.entries(data.pipeline).filter(([,total])=>total>0).slice(0,5)
 const recentContent=(activity.data??[]).slice(0,3)
 const visits=[1700,2300,2750,2500,3150,2900,4000]
 const visitMax=5000
 const points=visits.map((value,index)=>`${index*(100/(visits.length-1))},${100-(value/visitMax)*100}`).join(' ')

 return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:''}}>
  <section className="unified-dashboard" aria-busy={activity.isLoading}>
   <div className="unified-dashboard-kpis">
    <article className="unified-kpi-card"><span className="unified-kpi-icon"><UsersRound size={18}/></span><div><span>Novos Leads</span><strong>{newLeads}</strong><small>{totalLeads} leads no total</small></div></article>
    <article className="unified-kpi-card"><span className="unified-kpi-icon"><Handshake size={18}/></span><div><span>Negociações</span><strong>{negotiations}</strong><small>oportunidades em negociação</small></div></article>
    <article className="unified-kpi-card"><span className="unified-kpi-icon"><FileText size={18}/></span><div><span>Site · Publicações</span><strong>{data.editorialCounts.published}</strong><small>{data.editorialCounts.publishedThisMonth} publicadas no mês</small></div></article>
    <article className="unified-kpi-card"><span className="unified-kpi-icon"><Wallet size={18}/></span><div><span>A Receber</span><strong>{money(data.receivable)}</strong><small>receitas pendentes</small></div></article>
    <article className="unified-kpi-card"><span className="unified-kpi-icon"><CircleDollarSign size={18}/></span><div><span>Faturamento (Mês)</span><strong>{money(data.monthRevenue)}</strong><small>receitas pagas no período</small></div></article>
   </div>
   <div className="unified-dashboard-main-grid">
    <section className="unified-dashboard-card unified-visits-card"><div className="unified-card-heading"><div><h2>Visitas no Site <small>(últimos 7 dias)</small></h2></div></div><div className="unified-line-chart" aria-label="Visitas no site nos últimos sete dias"><div className="unified-chart-y"><span>5K</span><span>4K</span><span>3K</span><span>2K</span><span>1K</span><span>0</span></div><div className="unified-chart-plot"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".16"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><polygon points={`0,100 ${points} 100,100`} fill="url(#dashboardArea)"/><polyline points={points} fill="none" vectorEffect="non-scaling-stroke"/></svg><div className="unified-chart-dates"><span>26/Ago</span><span>27/Ago</span><span>28/Ago</span><span>29/Ago</span><span>30/Ago</span><span>31/Ago</span><span>01/Set</span></div></div></div></section>
    <section className="unified-dashboard-card"><div className="unified-card-heading"><div><h2>Atividades Recentes</h2></div><button type="button">Ver todas</button></div><div className="unified-activity-list">{activity.isLoading?<div className="unified-dashboard-empty">Carregando atividades...</div>:activity.data?.length?activity.data.slice(0,5).map(item=><article key={item.id}><span className="unified-row-icon"><Newspaper size={14}/></span><div><strong>{item.action==='published'?'Novo conteúdo publicado':'Conteúdo atualizado'}</strong><p>{item.title} · {item.category}</p></div><time>{formatDate(item.occurred_at)}</time><i/></article>):<div className="unified-dashboard-empty">Nenhuma atividade registrada.</div>}</div></section>
    <section className="unified-dashboard-card"><div className="unified-card-heading"><div><h2>Compromissos</h2></div></div><div className="unified-activity-list">{data.upcoming.length?data.upcoming.slice(0,5).map(item=><article key={item.id}><span className="unified-row-icon"><FileText size={14}/></span><div><strong>{item.title}</strong></div><time>{formatDate(item.startsAt)}</time><i/></article>):<div className="unified-dashboard-empty">Nenhum compromisso agendado.</div>}</div></section>
   </div>
   <div className="unified-dashboard-bottom-grid">
    <section className="unified-dashboard-card"><div className="unified-card-heading"><div><h2>Distribuição de Leads</h2><p>Por estágio</p></div></div><div className="unified-lead-summary"><div className="unified-donut"><div><span>Total</span><strong>{totalLeads}</strong></div></div><div className="unified-lead-legend">{leadEntries.map(([status,total])=><div key={status}><span>{pipelineLabels[status]??status}</span><strong>{totalLeads?Math.round((total/totalLeads)*100):0}%</strong></div>)}</div></div></section>
    <section className="unified-dashboard-card"><div className="unified-card-heading"><div><h2>Conteúdos em Destaque</h2></div><button type="button">Ver todas</button></div><div className="unified-content-list">{recentContent.length?recentContent.map(item=><article key={item.id}><span className="unified-content-thumb"><FileText size={18}/></span><div><strong>{item.title}</strong><p>{formatDate(item.occurred_at)}</p><small><Eye size={12}/> {item.category}</small></div><b>⋮</b></article>):<div className="unified-dashboard-empty">Nenhum conteúdo recente.</div>}</div></section>
    <section className="unified-dashboard-card"><div className="unified-card-heading"><div><h2>Tarefas Pendentes</h2></div><button type="button">Ver todas</button></div><div className="unified-task-progress"><div className="unified-task-ring"><strong>{data.upcoming.length}</strong></div><div><span>Agenda operacional</span><strong>{data.upcoming.length} pendente{data.upcoming.length===1?'':'s'}</strong></div></div><div className="unified-task-list">{data.upcoming.length?data.upcoming.slice(0,3).map((item,index)=><article key={item.id}><span className="unified-task-check"/><div><strong>{item.title}</strong></div><em>{index===0?'Alta':index===1?'Média':'Baixa'}</em><time>{formatDate(item.startsAt)}</time></article>):<div className="unified-dashboard-empty">Nenhuma tarefa pendente.</div>}</div></section>
   </div>
  </section>
 </AdminShell>
}
