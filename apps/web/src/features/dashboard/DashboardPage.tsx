import {useQuery} from '@tanstack/react-query'
import {CircleDollarSign,Eye,FileText,Handshake,Newspaper,UsersRound,Wallet} from 'lucide-react'
import {useEffect,useMemo,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {AdminShell} from '../../shared/internal/AdminUi'
import {UNIFIED_ADMIN_NAV} from '../../shared/internal/adminNavigation'
import {useAdminAuth} from '../access/adminAuthState'
import {agendaAdminClient} from '../agenda/adminClient'
import {analyticsClient} from '../analytics/client'
import {crmAdminClient} from '../crm/adminClient'
import {listAdminEditorialContents} from '../editorial/adminClient'
import {financeAdminClient} from '../finance/adminClient'
import {lastSevenDayRange,resolveDashboardPageviews,type DashboardVisitSeries} from './dashboardAnalytics'
import {dashboardReadModel} from './dashboardReadModel'
import {useActivityHistory} from './hooks/useActivityHistory'
import '../../styles/admin-dashboard-unified.css'

const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const compact=(value:number)=>new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1}).format(value)
function formatDate(raw:string|undefined){if(!raw)return '—';const date=new Date(raw);return Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'—'}
function formatTaskDate(raw:string|undefined){if(!raw)return 'Sem prazo';const date=new Date(`${raw}T12:00:00`);return Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'Sem prazo'}
const pipelineLabels:Record<string,string>={novo:'Novos',contato_realizado:'Contato realizado',qualificado:'Qualificados',proposta:'Propostas',negociacao:'Negociação',fechado:'Fechados',perdido:'Perdidos'}
const sourceLabel=(source:DashboardVisitSeries['source'])=>source==='REAL'?'DADO REAL':source==='MANUAL_IDENTIFIED'?'MANUAL IDENTIFICADO':'INDISPONÍVEL'
const monthKey=(now:Date)=>`${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`

async function loadAuthenticatedDashboard(now=new Date()){
 const [leads,transactions,events,contents]=await Promise.all([
  crmAdminClient.listLeads(),
  financeAdminClient.listTransactions(),
  agendaAdminClient.list(),
  listAdminEditorialContents(),
 ])
 const month=monthKey(now),nowIso=now.toISOString()
 const paidRevenue=transactions.filter(item=>item.type==='receita'&&item.status==='pago')
 const monthRevenue=paidRevenue.filter(item=>item.date.startsWith(month)).reduce((sum,item)=>sum+item.amount,0)
 const receivable=transactions.filter(item=>item.type==='receita'&&(item.status==='pendente'||item.status==='vencido')).reduce((sum,item)=>sum+item.amount,0)
 const pipeline=leads.reduce<Record<string,number>>((acc,item)=>{acc[item.status]=(acc[item.status]??0)+1;return acc},{})
 const upcoming=events.filter(item=>!['cancelado','concluido','realizado'].includes(item.status)&&item.startsAt>=nowIso).sort((a,b)=>a.startsAt.localeCompare(b.startsAt)).slice(0,5)
 const editorialCounts={drafts:contents.filter(item=>item.status==='draft').length,published:contents.filter(item=>item.status==='published').length,archived:contents.filter(item=>item.status==='archived').length,publishedThisMonth:contents.filter(item=>item.status==='published'&&item.publishedAt?.startsWith(month)).length}
 return {period:{month,generatedAt:nowIso},monthRevenue,receivable,pipeline,upcoming,pendingTasks:null,editorialCounts}
}

export default function DashboardPage(){
 const navigate=useNavigate()
 const {status}=useAdminAuth()
 const authenticated=status==='authenticated'
 const adminDashboard=useQuery({queryKey:['dashboard','authenticated'],queryFn:()=>loadAuthenticatedDashboard(),enabled:authenticated,staleTime:10_000})
 const activity=useActivityHistory(8)
 const data=authenticated?adminDashboard.data:dashboardReadModel.snapshot()
 const [visits,setVisits]=useState<DashboardVisitSeries>({points:[],source:'UNAVAILABLE',updatedAt:null})
 const [visitsLoading,setVisitsLoading]=useState(true)
 const [visitsError,setVisitsError]=useState('')

 useEffect(()=>{
  let active=true
  const range=lastSevenDayRange()
  analyticsClient.metrics({...range,metricKey:'pageviews',granularity:'day',limit:50}).then(response=>{if(active)setVisits(resolveDashboardPageviews(response.metrics))}).catch(caught=>{if(active){setVisits({points:[],source:'UNAVAILABLE',updatedAt:null});setVisitsError(caught instanceof Error?caught.message:'Analytics indisponível.')}}).finally(()=>{if(active)setVisitsLoading(false)})
  return()=>{active=false}
 },[])

 const chart=useMemo(()=>{
  const values=visits.points.map(point=>point.value),max=Math.max(1,...values)
  const divisor=Math.max(1,visits.points.length-1)
  const points=visits.points.map((point,index)=>`${index*(100/divisor)},${100-(point.value/max)*92}`).join(' ')
  return {max,points}
 },[visits.points])

 if(!data){
  return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:'Visão Geral'}}><section className="unified-dashboard">{adminDashboard.isError?<div className="unified-dashboard-unavailable" role="alert"><strong>DADOS OPERACIONAIS INDISPONÍVEIS</strong><p>{adminDashboard.error instanceof Error?adminDashboard.error.message:'A API administrativa não pôde carregar o Dashboard.'}</p><button type="button" onClick={()=>void adminDashboard.refetch()}>Tentar novamente</button></div>:<div className="unified-dashboard-empty" role="status">Consultando dados administrativos reais…</div>}</section></AdminShell>
 }

 const totalLeads=Object.values(data.pipeline).reduce((sum,total)=>sum+total,0)
 const newLeads=data.pipeline.novo??0
 const negotiations=data.pipeline.negociacao??0
 const leadEntries=Object.entries(data.pipeline).filter(([,total])=>total>0).slice(0,5)
 const recentContent=(activity.data??[]).slice(0,3)
 const pendingTasks=data.pendingTasks

 return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:`Visão Geral · ${data.period.month}`}}>
  <section className="unified-dashboard" aria-busy={activity.isLoading||visitsLoading||adminDashboard.isLoading}>
   <div className="unified-dashboard-kpis">
    <article className="unified-kpi-card"><span className="unified-kpi-icon"><UsersRound size={18}/></span><div><span>Novos Leads</span><strong>{newLeads}</strong><small>{totalLeads} leads no total · DERIVED FROM REAL DATA</small></div></article>
    <article className="unified-kpi-card"><span className="unified-kpi-icon"><Handshake size={18}/></span><div><span>Negociações</span><strong>{negotiations}</strong><small>oportunidades em negociação · DERIVED</small></div></article>
    <article className="unified-kpi-card"><span className="unified-kpi-icon"><FileText size={18}/></span><div><span>Site · Publicações</span><strong>{data.editorialCounts.published}</strong><small>{data.editorialCounts.publishedThisMonth} publicadas no mês atual</small></div></article>
    <article className="unified-kpi-card"><span className="unified-kpi-icon"><Wallet size={18}/></span><div><span>A Receber</span><strong>{money(data.receivable)}</strong><small>receitas pendentes · DERIVED</small></div></article>
    <article className="unified-kpi-card"><span className="unified-kpi-icon"><CircleDollarSign size={18}/></span><div><span>Faturamento (Mês)</span><strong>{money(data.monthRevenue)}</strong><small>receitas pagas em {data.period.month}</small></div></article>
   </div>
   <div className="unified-dashboard-main-grid">
    <section className="unified-dashboard-card unified-visits-card"><div className="unified-card-heading"><div><h2>Visitas no Site <small>(últimos 7 dias)</small></h2><p className={`unified-data-source ${visits.source.toLowerCase()}`}>{sourceLabel(visits.source)}{visits.updatedAt?` · atualizado ${new Date(visits.updatedAt).toLocaleString('pt-BR')}`:''}</p></div><button type="button" onClick={()=>navigate('/app/marketing/metricas')}>Ver Métricas</button></div>{visitsLoading?<div className="unified-dashboard-empty">Consultando Analytics real…</div>:visits.points.length?<div className="unified-line-chart" aria-label="Visualizações reais do site nos últimos sete dias"><div className="unified-chart-y"><span>{compact(chart.max)}</span><span>{compact(chart.max*.75)}</span><span>{compact(chart.max*.5)}</span><span>{compact(chart.max*.25)}</span><span>0</span></div><div className="unified-chart-plot"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".16"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><polygon points={`0,100 ${chart.points} 100,100`} fill="url(#dashboardArea)"/><polyline points={chart.points} fill="none" vectorEffect="non-scaling-stroke"/></svg><div className="unified-chart-dates">{visits.points.map(point=><span key={point.date}>{point.label}</span>)}</div></div></div>:<div className="unified-dashboard-unavailable"><strong>MÉTRICA NÃO DISPONÍVEL</strong><p>{visitsError||'Não existe série de pageviews mensurável e com proveniência para este período. Nenhum valor fictício ou zero de fallback foi renderizado.'}</p><button type="button" onClick={()=>navigate('/app/marketing/metricas')}>Abrir Métricas</button></div>}</section>
    <section className="unified-dashboard-card"><div className="unified-card-heading"><div><h2>Atividades Recentes</h2><p>Fonte editorial do Portal</p></div><button type="button" onClick={()=>navigate('/app/site/conteudos')}>Ver todas</button></div><div className="unified-activity-list">{activity.isLoading?<div className="unified-dashboard-empty">Carregando atividades...</div>:activity.data?.length?activity.data.slice(0,5).map(item=><article key={item.id}><span className="unified-row-icon"><Newspaper size={14}/></span><div><strong>{item.action==='published'?'Novo conteúdo publicado':'Conteúdo atualizado'}</strong><p>{item.title} · {item.category}</p></div><time>{formatDate(item.occurred_at)}</time><i/></article>):<div className="unified-dashboard-empty">Nenhuma atividade registrada.</div>}</div></section>
    <section className="unified-dashboard-card"><div className="unified-card-heading"><div><h2>Compromissos</h2><p>Agenda operacional</p></div><button type="button" onClick={()=>navigate('/app/agenda')}>Ver agenda</button></div><div className="unified-activity-list">{data.upcoming.length?data.upcoming.slice(0,5).map(item=><article key={item.id}><span className="unified-row-icon"><FileText size={14}/></span><div><strong>{item.title}</strong></div><time>{formatDate(item.startsAt)}</time><i/></article>):<div className="unified-dashboard-empty">Nenhum compromisso futuro agendado.</div>}</div></section>
   </div>
   <div className="unified-dashboard-bottom-grid">
    <section className="unified-dashboard-card"><div className="unified-card-heading"><div><h2>Distribuição de Leads</h2><p>Por estágio · dados do CRM</p></div><button type="button" onClick={()=>navigate('/app/crm')}>Abrir CRM</button></div><div className="unified-lead-summary"><div className="unified-donut"><div><span>Total</span><strong>{totalLeads}</strong></div></div><div className="unified-lead-legend">{leadEntries.length?leadEntries.map(([status,total])=><div key={status}><span>{pipelineLabels[status]??status}</span><strong>{totalLeads?Math.round((total/totalLeads)*100):0}%</strong></div>):<div><span>Sem leads</span><strong>—</strong></div>}</div></div></section>
    <section className="unified-dashboard-card"><div className="unified-card-heading"><div><h2>Conteúdos em Destaque</h2><p>Movimentações editoriais recentes</p></div><button type="button" onClick={()=>navigate('/app/site/conteudos')}>Ver todas</button></div><div className="unified-content-list">{recentContent.length?recentContent.map(item=><article key={item.id}><span className="unified-content-thumb"><FileText size={18}/></span><div><strong>{item.title}</strong><p>{formatDate(item.occurred_at)}</p><small><Eye size={12}/> {item.category}</small></div></article>):<div className="unified-dashboard-empty">Nenhum conteúdo recente.</div>}</div></section>
    <section className="unified-dashboard-card"><div className="unified-card-heading"><div><h2>Tarefas Pendentes</h2><p>Marketing operacional · sem prioridade inventada</p></div><button type="button" onClick={()=>navigate('/app/marketing/tarefas')}>Ver todas</button></div>{pendingTasks===null?<div className="unified-dashboard-unavailable"><strong>FONTE NÃO DISPONÍVEL</strong><p>As tarefas operacionais de Marketing ainda não possuem fonte persistente conectada. Nenhuma fixture demonstrativa foi promovida a dado real.</p></div>:<><div className="unified-task-progress"><div className="unified-task-ring"><strong>{pendingTasks.length}</strong></div><div><span>Demandas do runtime</span><strong>{pendingTasks.length} pendente{pendingTasks.length===1?'':'s'} na visão atual</strong></div></div><div className="unified-task-list">{pendingTasks.length?pendingTasks.map(item=><article key={item.id}><span className="unified-task-check"/><div><strong>{item.title}</strong></div><em>{item.priority}</em><time>{formatTaskDate(item.deadline)}</time></article>):<div className="unified-dashboard-empty">Nenhuma tarefa pendente com prazo atual.</div>}</div></>}</section>
   </div>
  </section>
 </AdminShell>
}
