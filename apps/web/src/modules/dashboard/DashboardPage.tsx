import {useQuery} from '@tanstack/react-query'
import {
 ArrowRight,BarChart3,BellRing,CalendarDays,CheckSquare,CircleDollarSign,Eye,FileText,
 Handshake,Heart,MoreHorizontal,Play,TrendingUp,UsersRound,WalletCards,
} from 'lucide-react'
import {useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import {AdminShell} from '../../shared/internal/AdminUi'
import {UNIFIED_ADMIN_NAV} from '../../shared/internal/adminNavigation'
import {useAdminAuth} from '../access/adminAuthState'
import {agendaAdminClient} from '../agenda/adminClient'
import {analyticsClient} from '../analytics/client'
import {loadMetrics} from '../analytics/metricsClient'
import {crmAdminClient} from '../crm/adminClient'
import {listAdminEditorialContents} from '../editorial/adminClient'
import {financeAdminClient} from '../finance/adminClient'
import {lastThirtyDayRange,resolveDashboardPageviews,resolveMultichannelPulses,type DashboardChannelPulse} from './dashboardAnalytics'
import {dashboardReadModel,deriveAgendaSummary,deriveCrmSummary,deriveEditorialSummary,deriveFeaturedContents,deriveFinanceSummary,deriveOperationalAttention,deriveProviderAttention} from './dashboardReadModel'
import {useActivityHistory} from './hooks/useActivityHistory'
import '../../styles/admin-dashboard-unified.css'

const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2})
const compact=(value:number)=>new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1}).format(value)
const monthKey=(now:Date)=>`${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`
const formatDate=(raw:string|undefined|null)=>{if(!raw)return '—';const date=new Date(raw);return Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'—'}
const formatTime=(raw:string|undefined|null)=>{if(!raw)return '—';const date=new Date(raw);return Number.isFinite(date.getTime())?date.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'—'}
const formatMonth=(raw:string)=>{const [year,month]=raw.split('-').map(Number);if(!year||!month)return raw;const label=new Date(Date.UTC(year,month-1,1)).toLocaleDateString('pt-BR',{month:'long',year:'numeric',timeZone:'UTC'});return label.charAt(0).toUpperCase()+label.slice(1)}
const pipelineLabels:Record<string,string>={novo:'Novo',contato_realizado:'Contato realizado',qualificado:'Qualificado',proposta:'Proposta',negociacao:'Negociação',fechado:'Fechado',perdido:'Perdido'}
const performanceTabLabels:Record<'overview'|DashboardChannelPulse['key'],string>={overview:'Visão Geral',instagram:'Instagram',youtube:'YouTube',tiktok:'TikTok',site:'Site'}
const developmentAnalytics=import.meta.env.DEV||import.meta.env.VITE_ENABLE_DEMO_DATA==='true'

function settledValue<T>(result:PromiseSettledResult<T>,fallback:T){return result.status==='fulfilled'?result.value:fallback}
function settledError(result:PromiseSettledResult<unknown>){return result.status==='rejected'?(result.reason instanceof Error?result.reason.message:String(result.reason)):''}
function percentageChange(current:number,previous:number){if(previous<=0)return null;return (current-previous)/previous*100}
function metricValue(metric:{value:number|null;status:string}|undefined){return metric?.status==='available'&&metric.value!==null?metric.value:null}
function formatMetric(value:number|null,formatter:(value:number)=>string=compact){return value===null?'—':formatter(value)}
function trendLabel(value:number|null){if(value===null||!Number.isFinite(value))return null;const rounded=Math.round(value);return `${rounded>=0?'+':''}${rounded}%`}

async function loadAuthenticatedDashboard(now=new Date()){
 const [leadsResult,transactionsResult,eventsResult,contentsResult]=await Promise.allSettled([
  crmAdminClient.listLeads(),
  financeAdminClient.listTransactions(),
  agendaAdminClient.list(),
  listAdminEditorialContents(),
 ])
 const leads=settledValue(leadsResult,[])
 const transactions=settledValue(transactionsResult,[])
 const events=settledValue(eventsResult,[])
 const contents=settledValue(contentsResult,[])
 const financeSummary=deriveFinanceSummary(transactions,now)
 const crmSummary=deriveCrmSummary(leads,now)
 const agendaSummary=deriveAgendaSummary(events,now)
 const editorialCounts=deriveEditorialSummary(contents,now)
 const domainErrors:Record<string,string>={}
 if(leadsResult.status==='rejected')domainErrors.crm=settledError(leadsResult)
 if(transactionsResult.status==='rejected')domainErrors.finance=settledError(transactionsResult)
 if(eventsResult.status==='rejected')domainErrors.agenda=settledError(eventsResult)
 if(contentsResult.status==='rejected')domainErrors.editorial=settledError(contentsResult)
 return {
  period:{month:monthKey(now),generatedAt:now.toISOString()},
  financeSummary,
  crmSummary,
  editorialCounts,
  featuredContents:deriveFeaturedContents(contents),
  upcoming:agendaSummary.upcoming,
  attention:deriveOperationalAttention({leads,transactions,events},now),
  availability:{finance:transactionsResult.status==='fulfilled',crm:leadsResult.status==='fulfilled',editorial:contentsResult.status==='fulfilled',agenda:eventsResult.status==='fulfilled'},
  domainErrors,
 }
}

async function loadDashboardAnalytics(){
 const range=lastThirtyDayRange()
 const [overviewResult,metricsResult,statusResult]=await Promise.allSettled([
  loadMetrics({range:'30d'}),
  analyticsClient.metrics({...range,limit:500}),
  analyticsClient.providerStatus(),
 ])
 return {
  overview:overviewResult.status==='fulfilled'?overviewResult.value:null,
  metrics:metricsResult.status==='fulfilled'?metricsResult.value.metrics:[],
  providers:statusResult.status==='fulfilled'?statusResult.value.providers:[],
  errors:{
   overview:overviewResult.status==='rejected'?settledError(overviewResult):'',
   metrics:metricsResult.status==='rejected'?settledError(metricsResult):'',
   providers:statusResult.status==='rejected'?settledError(statusResult):'',
  },
 }
}

export default function DashboardPage(){
 const {status}=useAdminAuth()
 const authenticated=status==='authenticated'
 const adminDashboard=useQuery({queryKey:['dashboard','authenticated','reference'],queryFn:()=>loadAuthenticatedDashboard(),enabled:authenticated,staleTime:10_000})
 const analytics=useQuery({queryKey:['dashboard','analytics','30d'],queryFn:loadDashboardAnalytics,staleTime:30_000,refetchOnWindowFocus:false,retry:1})
 const activity=useActivityHistory(8)
 const data=authenticated?adminDashboard.data:dashboardReadModel.snapshot()
 const [performanceTab,setPerformanceTab]=useState<'overview'|DashboardChannelPulse['key']>('overview')
 const [agendaTab,setAgendaTab]=useState<'agenda'|'tasks'>('agenda')

 const channels=useMemo(()=>resolveMultichannelPulses(analytics.data?.overview??null,analytics.data?.metrics??[],developmentAnalytics),[analytics.data])
 const websiteSeries=useMemo(()=>resolveDashboardPageviews(analytics.data?.metrics??[]),[analytics.data?.metrics])
 const attention=useMemo(()=>{
  const combined=[...(data?.attention??[]),...deriveProviderAttention(analytics.data?.providers??[])]
  return [...new Map(combined.map(item=>[item.id,item])).values()].sort((a,b)=>a.priority-b.priority||(a.dueAt??'9999').localeCompare(b.dueAt??'9999')||a.id.localeCompare(b.id)).slice(0,5)
 },[data?.attention,analytics.data?.providers])

 if(!data){
  return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:'Visão Geral'}}><section className="unified-dashboard">{adminDashboard.isError?<div className="dashboard-load-state" role="alert"><strong>DADOS OPERACIONAIS INDISPONÍVEIS</strong><p>{adminDashboard.error instanceof Error?adminDashboard.error.message:'A API administrativa não pôde carregar o Dashboard.'}</p><button type="button" onClick={()=>void adminDashboard.refetch()}>Tentar novamente</button></div>:<div className="dashboard-load-state" role="status">Consultando dados administrativos reais…</div>}</section></AdminShell>
 }

 const recentActivity=(activity.data??[]).slice(0,5)
 const domainErrorCount=Object.keys(data.domainErrors).length
 const chartPoints=websiteSeries.points.slice(-12)
 const maxChartValue=Math.max(1,...chartPoints.map(point=>point.value))
 const chartCoordinates=chartPoints.map((point,index)=>{
  const x=chartPoints.length<=1?50:(index/(chartPoints.length-1))*100
  const y=92-(point.value/maxChartValue)*72
  return `${x.toFixed(2)},${y.toFixed(2)}`
 }).join(' ')
 const activeChannel=performanceTab==='overview'?null:channels.find(channel=>channel.key===performanceTab)??null
 const maxChannelValue=Math.max(1,...channels.map(channel=>channel.value??0))
 const overview=analytics.data?.overview
 const reach=metricValue(overview?.ga4.overview.users)
 const views=metricValue(overview?.ga4.overview.pageviews)
 const interactions=overview?.conversions.status==='available'?overview.conversions.total:null
 const growth=chartPoints.length>=2&&chartPoints[0].value>0?(chartPoints.at(-1)!.value-chartPoints[0].value)/chartPoints[0].value*100:null
 const leadTrend=percentageChange(data.crmSummary.newLeadsThisMonth,data.crmSummary.previousMonthNewLeads)
 const revenueTrend=percentageChange(data.financeSummary.monthRevenue,data.financeSummary.previousMonthRevenue)
 const funnelStages=['novo','contato_realizado','qualificado','proposta','negociacao']
 const funnelEntries=funnelStages.map(stage=>[stage,data.crmSummary.pipeline[stage]??0] as const)
 const funnelMax=Math.max(1,...funnelEntries.map(([,value])=>value))
 const todayAgenda=data.upcoming.slice(0,3)
 const conversion=Math.round(data.crmSummary.conversionRate*10)/10
 const taskItems=attention.slice(0,3)

 return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:`Visão Geral · ${formatMonth(data.period.month)}`}}>
  <main className="unified-dashboard" aria-busy={activity.isLoading||analytics.isLoading||adminDashboard.isLoading}>
   <section className="dashboard-kpi-grid" data-testid="dashboard-kpi-region" aria-label="Indicadores principais">
    <article className="dashboard-kpi-card" data-dashboard-kpi="new-leads">
     <span className="dashboard-kpi-icon"><UsersRound size={21}/></span>
     <div className="dashboard-kpi-copy"><span data-dashboard-kpi-label>Novos Leads</span><div className="dashboard-kpi-value-line"><strong>{data.availability.crm?data.crmSummary.newLeadsThisMonth:'—'}</strong>{trendLabel(leadTrend)&&<span className={`dashboard-trend ${leadTrend!==null&&leadTrend<0?'is-negative':''}`}><TrendingUp size={11}/>{trendLabel(leadTrend)}</span>}</div><small>{data.availability.crm?'em relação ao mês anterior':'Fonte CRM indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="active-negotiations">
     <span className="dashboard-kpi-icon"><Handshake size={21}/></span>
     <div className="dashboard-kpi-copy"><span data-dashboard-kpi-label>Negociações Ativas</span><div className="dashboard-kpi-value-line"><strong>{data.availability.crm?data.crmSummary.activeOpportunities:'—'}</strong></div><small>{data.availability.crm?'oportunidades em andamento':'Fonte CRM indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="pipeline-value">
     <span className="dashboard-kpi-icon"><BarChart3 size={21}/></span>
     <div className="dashboard-kpi-copy"><span data-dashboard-kpi-label>Pipeline Comercial</span><div className="dashboard-kpi-value-line"><strong>{data.availability.crm?money(data.crmSummary.pipelineValue):'—'}</strong></div><small>{data.availability.crm?'em oportunidades':'Fonte CRM indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="receivable">
     <span className="dashboard-kpi-icon"><WalletCards size={21}/></span>
     <div className="dashboard-kpi-copy"><span data-dashboard-kpi-label>A Receber</span><div className="dashboard-kpi-value-line"><strong>{data.availability.finance?money(data.financeSummary.receivable):'—'}</strong></div><small>{data.availability.finance?'em receitas pendentes':'Fonte financeira indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="month-revenue">
     <span className="dashboard-kpi-icon"><CircleDollarSign size={21}/></span>
     <div className="dashboard-kpi-copy"><span data-dashboard-kpi-label>Faturamento do Mês</span><div className="dashboard-kpi-value-line"><strong>{data.availability.finance?money(data.financeSummary.monthRevenue):'—'}</strong>{trendLabel(revenueTrend)&&<span className={`dashboard-trend ${revenueTrend!==null&&revenueTrend<0?'is-negative':''}`}><TrendingUp size={11}/>{trendLabel(revenueTrend)}</span>}</div><small>{data.availability.finance?'em relação ao mês anterior':'Fonte financeira indisponível'}</small></div>
    </article>
   </section>

   <section className="dashboard-reference-row" aria-label="Performance e agenda">
    <section className="dashboard-reference-panel dashboard-performance-panel" data-testid="dashboard-analytics-region" aria-labelledby="dashboard-performance-title">
     <header className="dashboard-panel-heading"><div className="dashboard-title-with-icon"><span className="dashboard-section-icon"><BarChart3 size={20}/></span><div><h2 id="dashboard-performance-title">Performance Digital</h2><p>Acompanhe o desempenho dos seus canais</p></div></div><Link to="/app/metricas">Ver métricas <ArrowRight size={14}/></Link></header>
     <div className="dashboard-channel-tabs dashboard-reference-tabs" data-testid="dashboard-channel-tabs" role="tablist" aria-label="Canais de performance">
      {(['overview','instagram','youtube','tiktok','site'] as const).map(tab=><button key={tab} type="button" role="tab" aria-selected={performanceTab===tab} onClick={()=>setPerformanceTab(tab)}>{performanceTabLabels[tab]}</button>)}
     </div>
     {performanceTab==='overview'?<>
      <div className="dashboard-performance-kpis" data-testid="dashboard-performance-summary">
       <article><span className="dashboard-mini-icon"><Eye size={16}/></span><div><small>Alcance Total</small><strong>{formatMetric(reach)}</strong><em>{reach===null?'GA4 indisponível':'usuários únicos'}</em></div></article>
       <article><span className="dashboard-mini-icon"><Play size={16}/></span><div><small>Visualizações</small><strong>{formatMetric(views)}</strong><em>{views===null?'GA4 indisponível':'pageviews em 30 dias'}</em></div></article>
       <article><span className="dashboard-mini-icon"><Heart size={16}/></span><div><small>Interações</small><strong>{formatMetric(interactions)}</strong><em>{interactions===null?'Conversões indisponíveis':'conversões registradas'}</em></div></article>
       <article><span className="dashboard-mini-icon"><TrendingUp size={16}/></span><div><small>Crescimento</small><strong>{growth===null?'—':`${growth>=0?'+':''}${growth.toFixed(1).replace('.',',')}%`}</strong><em>vs. início do período</em></div></article>
      </div>
      <div className="dashboard-performance-body">
       <div className="dashboard-chart-stage" data-testid="dashboard-website-chart">
        {chartPoints.length>=2?<><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Evolução recente de pageviews"><polygon points={`0,100 ${chartCoordinates} 100,100`} className="dashboard-chart-area"/><polyline points={chartCoordinates} className="dashboard-chart-line"/></svg><div className="dashboard-chart-labels">{chartPoints.map(point=><span key={point.date}>{point.label}</span>)}</div></>:<div className="dashboard-chart-unavailable"><BarChart3 size={24}/><strong>Série temporal indisponível</strong><p>Nenhum dado fictício foi criado para preencher o gráfico.</p></div>}
       </div>
       <aside className="dashboard-channel-distribution" aria-label="Distribuição por canal"><strong>Distribuição por canal</strong>{channels.map(channel=><div className="dashboard-channel-row" key={channel.key}><div><span>{performanceTabLabels[channel.key]}</span><b>{channel.value===null?'—':compact(channel.value)}</b></div><div className="dashboard-channel-track"><i style={{width:`${channel.value===null?0:Math.max(5,(channel.value/maxChannelValue)*100)}%`}}/></div><small>{channel.metricLabel}</small></div>)}</aside>
      </div>
     </>:<div className="dashboard-channel-detail" data-testid={`dashboard-channel-detail-${performanceTab}`}><BarChart3 size={30}/><div><span>{activeChannel?.label??performanceTabLabels[performanceTab]}</span><strong>{activeChannel?.value===null||activeChannel?.value===undefined?'MÉTRICA NÃO DISPONÍVEL':compact(activeChannel.value)}</strong><small>{activeChannel?.metricLabel??'Métrica'} · atualizado em {formatDate(activeChannel?.updatedAt)}</small></div></div>}
     {(analytics.data?.errors.overview||analytics.data?.errors.metrics)&&<p className="dashboard-analytics-note">Uma ou mais fontes de Analytics não responderam. Os indicadores afetados permanecem indisponíveis.</p>}
    </section>

    <aside className="dashboard-reference-panel dashboard-agenda-panel" data-testid="dashboard-today-next" aria-labelledby="dashboard-agenda-title">
     <header className="dashboard-panel-heading"><div className="dashboard-title-with-icon"><span className="dashboard-section-icon"><CalendarDays size={20}/></span><div><h2 id="dashboard-agenda-title">Hoje & Próximos</h2><p>Seus compromissos e tarefas do dia</p></div></div><Link to="/app/agenda">Ver agenda <ArrowRight size={14}/></Link></header>
     <div className="dashboard-agenda-tabs dashboard-reference-tabs" role="tablist" aria-label="Agenda e tarefas"><button type="button" role="tab" aria-selected={agendaTab==='agenda'} onClick={()=>setAgendaTab('agenda')}>Agenda</button><button type="button" role="tab" aria-selected={agendaTab==='tasks'} onClick={()=>setAgendaTab('tasks')}>Tarefas</button></div>
     {agendaTab==='agenda'?<div className="dashboard-agenda-list">{todayAgenda.length?todayAgenda.map(event=><article key={event.id}><time dateTime={event.startsAt}><strong>{formatTime(event.startsAt)}</strong><small>{formatDate(event.startsAt)}</small></time><span className="dashboard-agenda-dot"/><div><strong>{event.title}</strong><p>{event.type||event.status}</p></div><span className="dashboard-status-pill">{event.status}</span></article>):<div className="dashboard-empty-inline"><strong>Nenhum compromisso próximo</strong><p>A agenda não possui eventos futuros nesta carga.</p></div>}</div>:<div className="dashboard-task-list">{taskItems.length?taskItems.map(item=><article key={item.id}><CheckSquare size={16}/><div><strong>{item.title}</strong><p>{item.detail}</p></div></article>):<div className="dashboard-empty-inline"><strong>Nenhuma tarefa pendente</strong><p>As fontes disponíveis não indicam ação pendente agora.</p></div>}</div>}
     <footer className="dashboard-agenda-footer"><div><CheckSquare size={18}/><span><strong>{taskItems.length} tarefas pendentes</strong><small>prioridades operacionais atuais</small></span></div><Link to="/app/agenda">Ver todas <ArrowRight size={14}/></Link></footer>
    </aside>
   </section>

   <section className="dashboard-mid-row" aria-label="Funil e prioridades">
    <section className="dashboard-reference-panel dashboard-funnel-panel" data-testid="dashboard-lead-distribution" aria-labelledby="dashboard-funnel-title">
     <header className="dashboard-panel-heading"><div className="dashboard-title-with-icon"><span className="dashboard-section-icon"><BarChart3 size={20}/></span><div><h2 id="dashboard-funnel-title">Funil Comercial</h2><p>Acompanhe suas oportunidades</p></div></div><Link to="/app/crm">Abrir CRM <ArrowRight size={14}/></Link></header>
     <div className="dashboard-funnel-body"><div className="dashboard-funnel-bars">{funnelEntries.map(([stage,total])=><div className="dashboard-funnel-row" key={stage}><span>{pipelineLabels[stage]??stage}</span><div><i style={{width:`${Math.max(total?8:0,(total/funnelMax)*100)}%`}}/></div><strong>{data.availability.crm?total:'—'}</strong></div>)}</div><aside className="dashboard-conversion-card"><BarChart3 size={24}/><span>Taxa de conversão</span><strong>{data.availability.crm?`${conversion.toFixed(1).replace(',0','').replace('.0','')}%`:'—'}</strong><small>de leads para clientes</small></aside></div>
    </section>

    <section className="dashboard-reference-panel dashboard-alerts-panel" data-testid="dashboard-pending-attention" aria-labelledby="dashboard-alerts-title">
     <header className="dashboard-panel-heading"><div className="dashboard-title-with-icon"><span className="dashboard-section-icon"><BellRing size={20}/></span><div><h2 id="dashboard-alerts-title">Alertas & Prioridades</h2><p>{attention.length} itens exigem atenção ao seu negócio</p></div></div><Link to="/app/dashboard">Ver pendências <ArrowRight size={14}/></Link></header>
     {domainErrorCount>0&&<p className="dashboard-source-warning">{domainErrorCount} fonte{domainErrorCount===1?'':'s'} operacional{domainErrorCount===1?'':'is'} indisponível{domainErrorCount===1?'':'eis'} nesta carga.</p>}
     <div className="dashboard-alert-grid">{attention.length?attention.map(item=><Link to={item.href} className="dashboard-alert-item" key={item.id} data-attention-kind={item.kind}><span className="dashboard-alert-icon"><BellRing size={15}/></span><div><strong>{item.title}</strong><p>{item.detail}</p></div><em>{item.kind==='finance'?'Financeiro':item.kind==='crm'?'CRM':item.kind==='analytics'?'Métricas':'Agenda'}</em></Link>):<div className="dashboard-empty-inline"><strong>Nenhum alerta acionável</strong><p>As fontes disponíveis não indicam condição que exija ação agora.</p></div>}</div>
    </section>
   </section>

   <section className="dashboard-bottom-row" aria-label="Atividades e conteúdo">
    <section className="dashboard-reference-panel dashboard-recent-panel" data-testid="dashboard-recent-activity" aria-labelledby="dashboard-recent-title">
     <header className="dashboard-panel-heading"><div className="dashboard-title-with-icon"><span className="dashboard-section-icon"><TrendingUp size={20}/></span><div><h2 id="dashboard-recent-title">Atividades Recentes</h2><p>Últimas ações realizadas no portal</p></div></div><Link to="/app/site/conteudos">Ver todas <ArrowRight size={14}/></Link></header>
     <div className="dashboard-recent-list">{activity.isLoading?<div className="dashboard-empty-inline">Carregando movimentações…</div>:recentActivity.length?recentActivity.map(item=><article key={item.id}><span className="dashboard-row-icon"><FileText size={15}/></span><div><strong>{item.title}</strong><p>{item.action==='published'?'Conteúdo publicado':'Conteúdo atualizado'} · {item.category}</p></div><time dateTime={item.occurred_at}>{formatDate(item.occurred_at)} <small>{formatTime(item.occurred_at)}</small></time></article>):<div className="dashboard-empty-inline"><strong>Nenhuma atividade recente</strong><p>Não há eventos editoriais legítimos para exibir nesta carga.</p></div>}</div>
    </section>

    <section className="dashboard-reference-panel dashboard-content-panel" data-testid="dashboard-featured-content" aria-labelledby="dashboard-content-title">
     <header className="dashboard-panel-heading"><div className="dashboard-title-with-icon"><span className="dashboard-section-icon"><FileText size={20}/></span><div><h2 id="dashboard-content-title">Conteúdo & Publicações</h2><p>Gerencie seus conteúdos em um só lugar</p></div></div><Link to="/app/site/conteudos">Criar conteúdo <ArrowRight size={14}/></Link></header>
     <div className="dashboard-content-stats"><div><strong>{data.availability.editorial?data.editorialCounts.publishedThisMonth:'—'}</strong><span><i className="is-green"/>publicados<small>no último mês</small></span></div><div><strong>—</strong><span><i className="is-yellow"/>agendados<small>sem fonte de agendamento editorial</small></span></div><div><strong>{data.availability.editorial?data.editorialCounts.drafts:'—'}</strong><span><i className="is-gray"/>rascunhos<small>em edição</small></span></div></div>
     <div className="dashboard-featured-list">{data.availability.editorial&&data.featuredContents.length?data.featuredContents.map(item=><article key={item.id}><div className="dashboard-featured-thumb">{item.coverImage?<img src={item.coverImage} alt=""/>:<FileText size={20}/>}</div><div><strong>{item.title}</strong><time dateTime={item.publishedAt??item.updatedAt}>{formatDate(item.publishedAt??item.updatedAt)}</time></div><span className="dashboard-channel-pill">Site</span><MoreHorizontal size={16}/></article>):<div className="dashboard-empty-inline"><strong>Nenhum conteúdo publicado</strong><p>O painel permanece vazio sem inventar destaques.</p></div>}</div>
    </section>
   </section>
  </main>
 </AdminShell>
}
