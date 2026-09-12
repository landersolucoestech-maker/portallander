import {useQuery} from '@tanstack/react-query'
import {
 ArrowRight,BarChart3,CheckSquare,CircleDollarSign,Eye,FileText,
 Handshake,Heart,MoreHorizontal,Play,TrendingUp,UsersRound,
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
const performanceTabLabels:Record<DashboardChannelPulse['key'],string>={site:'Website',instagram:'Instagram',tiktok:'TikTok',youtube:'YouTube'}
const leadStageLabels:Record<string,string>={novo:'Novos',contato:'Contato',proposta:'Proposta',negociacao:'Negociação',fechado:'Fechados',perdido:'Perdidos'}
const leadStageOrder=['novo','contato','proposta','negociacao','fechado','perdido']
const developmentAnalytics=import.meta.env.DEV||import.meta.env.VITE_ENABLE_DEMO_DATA==='true'

function settledValue<T>(result:PromiseSettledResult<T>,fallback:T){return result.status==='fulfilled'?result.value:fallback}
function settledError(result:PromiseSettledResult<unknown>){return result.status==='rejected'?(result.reason instanceof Error?result.reason.message:String(result.reason)):''}
function percentageChange(current:number,previous:number){if(previous<=0)return null;return (current-previous)/previous*100}
function metricValue(metric:{value:number|null;status:string}|undefined){return metric?.status==='available'&&metric.value!==null?metric.value:null}
function formatMetric(value:number|null,formatter:(value:number)=>string=compact){return value===null?'—':formatter(value)}
function trendLabel(value:number|null){if(value===null||!Number.isFinite(value))return null;const rounded=Math.round(value);return `${rounded>=0?'+':''}${rounded}%`}
function humanizeStage(stage:string){return leadStageLabels[stage]??stage.replaceAll('_',' ').replace(/(^|\s)\S/g,letter=>letter.toUpperCase())}

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
 const [performanceTab,setPerformanceTab]=useState<DashboardChannelPulse['key']>('site')

 const channels=useMemo(()=>resolveMultichannelPulses(analytics.data?.overview??null,analytics.data?.metrics??[],developmentAnalytics),[analytics.data])
 const websiteSeries=useMemo(()=>resolveDashboardPageviews(analytics.data?.metrics??[]),[analytics.data?.metrics])
 const attention=useMemo(()=>{
  const combined=[...(data?.attention??[]),...deriveProviderAttention(analytics.data?.providers??[])]
  return [...new Map(combined.map(item=>[item.id,item])).values()].sort((a,b)=>a.priority-b.priority||(a.dueAt??'9999').localeCompare(b.dueAt??'9999')||a.id.localeCompare(b.id)).slice(0,4)
 },[data?.attention,analytics.data?.providers])

 if(!data){
  return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:'Visão Geral'}}><section className="unified-dashboard">{adminDashboard.isError?<div className="dashboard-load-state" role="alert"><strong>DADOS OPERACIONAIS INDISPONÍVEIS</strong><p>{adminDashboard.error instanceof Error?adminDashboard.error.message:'A API administrativa não pôde carregar o Dashboard.'}</p><button type="button" onClick={()=>void adminDashboard.refetch()}>Tentar novamente</button></div>:<div className="dashboard-load-state" role="status">Consultando dados administrativos reais…</div>}</section></AdminShell>
 }

 const recentActivity=(activity.data??[]).slice(0,6)
 const chartPoints=websiteSeries.points.slice(-12)
 const maxChartValue=Math.max(1,...chartPoints.map(point=>point.value))
 const chartCoordinates=chartPoints.map((point,index)=>{
  const x=chartPoints.length<=1?50:(index/(chartPoints.length-1))*100
  const y=92-(point.value/maxChartValue)*72
  return `${x.toFixed(2)},${y.toFixed(2)}`
 }).join(' ')
 const activeChannel=channels.find(channel=>channel.key===performanceTab)??null
 const maxChannelValue=Math.max(1,...channels.map(channel=>channel.value??0))
 const overview=analytics.data?.overview
 const reach=metricValue(overview?.ga4.overview.users)
 const views=metricValue(overview?.ga4.overview.pageviews)
 const interactions=overview?.conversions.status==='available'?overview.conversions.total:null
 const growth=chartPoints.length>=2&&chartPoints[0].value>0?(chartPoints.at(-1)!.value-chartPoints[0].value)/chartPoints[0].value*100:null
 const leadTrend=percentageChange(data.crmSummary.newLeadsThisMonth,data.crmSummary.previousMonthNewLeads)
 const revenueTrend=percentageChange(data.financeSummary.monthRevenue,data.financeSummary.previousMonthRevenue)
 const leadStages=Object.entries(data.crmSummary.pipeline)
  .map(([stage,count])=>({stage,count,label:humanizeStage(stage)}))
  .sort((a,b)=>{
   const ai=leadStageOrder.indexOf(a.stage),bi=leadStageOrder.indexOf(b.stage)
   if(ai===-1&&bi===-1)return a.label.localeCompare(b.label)
   if(ai===-1)return 1
   if(bi===-1)return -1
   return ai-bi
  })
 const maxLeadStage=Math.max(1,...leadStages.map(item=>item.count))

 return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:`Visão Geral · ${formatMonth(data.period.month)}`}}>
  <main className="unified-dashboard" aria-busy={activity.isLoading||analytics.isLoading||adminDashboard.isLoading}>
   <section className="dashboard-kpi-grid" data-testid="dashboard-kpi-region" aria-label="Indicadores principais">
    <article className="dashboard-kpi-card" data-dashboard-kpi="new-leads">
     <span className="dashboard-kpi-icon"><UsersRound size={21}/></span>
     <div className="dashboard-kpi-copy"><span data-dashboard-kpi-label>Novos Leads</span><div className="dashboard-kpi-value-line"><strong>{data.availability.crm?data.crmSummary.newLeadsThisMonth:'—'}</strong>{trendLabel(leadTrend)&&<span className={`dashboard-trend ${leadTrend!==null&&leadTrend<0?'is-negative':''}`}><TrendingUp size={11}/>{trendLabel(leadTrend)}</span>}</div><small>{data.availability.crm?'neste mês':'Fonte CRM indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="negotiations">
     <span className="dashboard-kpi-icon"><Handshake size={21}/></span>
     <div className="dashboard-kpi-copy"><span data-dashboard-kpi-label>Negociações</span><div className="dashboard-kpi-value-line"><strong>{data.availability.crm?data.crmSummary.negotiations:'—'}</strong></div><small>{data.availability.crm?'em negociação':'Fonte CRM indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="month-revenue">
     <span className="dashboard-kpi-icon"><CircleDollarSign size={21}/></span>
     <div className="dashboard-kpi-copy"><span data-dashboard-kpi-label>Faturamento (mês)</span><div className="dashboard-kpi-value-line"><strong>{data.availability.finance?money(data.financeSummary.monthRevenue):'—'}</strong>{trendLabel(revenueTrend)&&<span className={`dashboard-trend ${revenueTrend!==null&&revenueTrend<0?'is-negative':''}`}><TrendingUp size={11}/>{trendLabel(revenueTrend)}</span>}</div><small>{data.availability.finance?'receita paga no mês':'Fonte financeira indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="published-content">
     <span className="dashboard-kpi-icon"><FileText size={21}/></span>
     <div className="dashboard-kpi-copy"><span data-dashboard-kpi-label>Conteúdos Publicados</span><div className="dashboard-kpi-value-line"><strong>{data.availability.editorial?data.editorialCounts.publishedThisMonth:'—'}</strong></div><small>{data.availability.editorial?'publicados neste mês':'Fonte editorial indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="site-visits">
     <span className="dashboard-kpi-icon"><Eye size={21}/></span>
     <div className="dashboard-kpi-copy"><span data-dashboard-kpi-label>Visitas no Site (mês)</span><div className="dashboard-kpi-value-line"><strong>{formatMetric(views)}</strong></div><small>{views===null?'Google Analytics indisponível':'últimos 30 dias'}</small></div>
    </article>
   </section>

   <section className="dashboard-primary-row" aria-label="Performance e atividades recentes">
    <section className="dashboard-reference-panel dashboard-performance-panel" data-testid="dashboard-analytics-region" aria-labelledby="dashboard-performance-title">
     <header className="dashboard-panel-heading"><div className="dashboard-title-with-icon"><span className="dashboard-section-icon"><BarChart3 size={20}/></span><div><h2 id="dashboard-performance-title">Performance / Analytics</h2><p>Website e canais sociais em uma única visão</p></div></div><Link to="/app/metricas">Ver métricas <ArrowRight size={14}/></Link></header>
     <div className="dashboard-channel-tabs dashboard-reference-tabs" data-testid="dashboard-channel-tabs" role="tablist" aria-label="Canais de performance">
      {(['site','instagram','tiktok','youtube'] as const).map(tab=><button key={tab} type="button" role="tab" aria-selected={performanceTab===tab} onClick={()=>setPerformanceTab(tab)}>{performanceTabLabels[tab]}</button>)}
     </div>
     {performanceTab==='site'?<>
      <div className="dashboard-performance-kpis" data-testid="dashboard-performance-summary">
       <article><span className="dashboard-mini-icon"><Eye size={16}/></span><div><small>Alcance</small><strong>{formatMetric(reach)}</strong><em>{reach===null?'GA4 indisponível':'usuários únicos'}</em></div></article>
       <article><span className="dashboard-mini-icon"><Play size={16}/></span><div><small>Visualizações</small><strong>{formatMetric(views)}</strong><em>{views===null?'GA4 indisponível':'pageviews'}</em></div></article>
       <article><span className="dashboard-mini-icon"><Heart size={16}/></span><div><small>Interações</small><strong>{formatMetric(interactions)}</strong><em>{interactions===null?'Conversões indisponíveis':'conversões'}</em></div></article>
       <article><span className="dashboard-mini-icon"><TrendingUp size={16}/></span><div><small>Crescimento</small><strong>{growth===null?'—':`${growth>=0?'+':''}${growth.toFixed(1).replace('.',',')}%`}</strong><em>no período</em></div></article>
      </div>
      <div className="dashboard-performance-body">
       <div className="dashboard-chart-stage" data-testid="dashboard-website-chart">
        {chartPoints.length>=2?<><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Evolução recente de pageviews"><polygon points={`0,100 ${chartCoordinates} 100,100`} className="dashboard-chart-area"/><polyline points={chartCoordinates} className="dashboard-chart-line"/></svg><div className="dashboard-chart-labels">{chartPoints.map(point=><span key={point.date}>{point.label}</span>)}</div></>:<div className="dashboard-chart-unavailable"><BarChart3 size={24}/><strong>Série temporal indisponível</strong><p>O painel permanece sem dado fictício quando a fonte não responde.</p></div>}
       </div>
       <aside className="dashboard-channel-distribution" aria-label="Resumo dos canais"><strong>Resumo dos canais</strong>{channels.map(channel=><div className="dashboard-channel-row" key={channel.key}><div><span>{performanceTabLabels[channel.key]}</span><b>{channel.value===null?'—':compact(channel.value)}</b></div><div className="dashboard-channel-track"><i style={{width:`${channel.value===null?0:Math.max(5,(channel.value/maxChannelValue)*100)}%`}}/></div><small>{channel.metricLabel}</small></div>)}</aside>
      </div>
     </>:<div className="dashboard-channel-detail" data-testid={`dashboard-channel-detail-${performanceTab}`}><BarChart3 size={30}/><div><span>{activeChannel?.label??performanceTabLabels[performanceTab]}</span><strong>{activeChannel?.value===null||activeChannel?.value===undefined?'MÉTRICA NÃO DISPONÍVEL':compact(activeChannel.value)}</strong><small>{activeChannel?.metricLabel??'Métrica'} · atualizado em {formatDate(activeChannel?.updatedAt)}</small></div></div>}
     {(analytics.data?.errors.overview||analytics.data?.errors.metrics)&&<p className="dashboard-analytics-note">Uma ou mais fontes de Analytics não responderam. Os indicadores afetados permanecem indisponíveis.</p>}
    </section>

    <aside className="dashboard-reference-panel dashboard-recent-panel" data-testid="dashboard-recent-activity" aria-labelledby="dashboard-recent-title">
     <header className="dashboard-panel-heading"><div className="dashboard-title-with-icon"><span className="dashboard-section-icon"><TrendingUp size={20}/></span><div><h2 id="dashboard-recent-title">Atividades Recentes</h2><p>Últimas ações realizadas no portal</p></div></div><Link to="/app/site/conteudos">Ver todas <ArrowRight size={14}/></Link></header>
     <div className="dashboard-recent-list">{activity.isLoading?<div className="dashboard-empty-inline">Carregando movimentações…</div>:recentActivity.length?recentActivity.map(item=><article key={item.id}><span className="dashboard-row-icon"><FileText size={15}/></span><div><strong>{item.title}</strong><p>{item.action==='published'?'Conteúdo publicado':'Conteúdo atualizado'} · {item.category}</p></div><time dateTime={item.occurred_at}>{formatDate(item.occurred_at)} <small>{formatTime(item.occurred_at)}</small></time></article>):<div className="dashboard-empty-inline"><strong>Nenhuma atividade recente</strong><p>Não há eventos editoriais legítimos para exibir nesta carga.</p></div>}</div>
    </aside>
   </section>

   <section className="dashboard-secondary-row" aria-label="Distribuição de leads, conteúdos e pendências">
    <section className="dashboard-reference-panel dashboard-leads-panel" data-testid="dashboard-lead-distribution" aria-labelledby="dashboard-leads-title">
     <header className="dashboard-panel-heading"><div className="dashboard-title-with-icon"><span className="dashboard-section-icon"><UsersRound size={20}/></span><div><h2 id="dashboard-leads-title">Distribuição de Leads</h2><p>Leads por etapa comercial</p></div></div><Link to="/app/crm">Abrir CRM <ArrowRight size={14}/></Link></header>
     {data.availability.crm&&leadStages.length?<div className="dashboard-lead-distribution-list">{leadStages.map(item=><div className="dashboard-lead-stage" key={item.stage}><div><span>{item.label}</span><strong>{item.count}</strong></div><div className="dashboard-lead-track"><i style={{width:`${Math.max(4,(item.count/maxLeadStage)*100)}%`}}/></div></div>)}</div>:<div className="dashboard-empty-inline"><strong>Distribuição indisponível</strong><p>A fonte CRM não retornou etapas válidas.</p></div>}
    </section>

    <section className="dashboard-reference-panel dashboard-featured-panel" data-testid="dashboard-featured-content" aria-labelledby="dashboard-content-title">
     <header className="dashboard-panel-heading"><div className="dashboard-title-with-icon"><span className="dashboard-section-icon"><FileText size={20}/></span><div><h2 id="dashboard-content-title">Conteúdos em Destaque</h2><p>Publicações recentes do site</p></div></div><Link to="/app/site/conteudos">Ver conteúdos <ArrowRight size={14}/></Link></header>
     <div className="dashboard-featured-list">{data.availability.editorial&&data.featuredContents.length?data.featuredContents.map(item=><article key={item.id}><div className="dashboard-featured-thumb">{item.coverImage?<img src={item.coverImage} alt=""/>:<FileText size={20}/>}</div><div><strong>{item.title}</strong><time dateTime={item.publishedAt??item.updatedAt}>{formatDate(item.publishedAt??item.updatedAt)}</time></div><span className="dashboard-channel-pill">Site</span><MoreHorizontal size={16}/></article>):<div className="dashboard-empty-inline"><strong>Nenhum conteúdo publicado</strong><p>O painel permanece vazio sem inventar destaques.</p></div>}</div>
    </section>

    <section className="dashboard-reference-panel dashboard-pending-panel" data-testid="dashboard-pending-attention" aria-labelledby="dashboard-pending-title">
     <header className="dashboard-panel-heading"><div className="dashboard-title-with-icon"><span className="dashboard-section-icon"><CheckSquare size={20}/></span><div><h2 id="dashboard-pending-title">Pendências & Atenção</h2><p>Itens que exigem ação</p></div></div></header>
     {attention.length?<div className="dashboard-pending-list">{attention.map(item=><Link className="dashboard-alert-item" data-attention-kind={item.kind} key={item.id} to={item.href}><span className="dashboard-alert-icon"><CheckSquare size={14}/></span><div><strong>{item.title}</strong><p>{item.detail}</p></div><ArrowRight size={14}/></Link>)}</div>:<div className="dashboard-empty-inline"><strong>Nenhuma pendência crítica</strong><p>As fontes disponíveis não indicam ação pendente agora.</p></div>}
    </section>
   </section>
  </main>
 </AdminShell>
}
