import {useQuery} from '@tanstack/react-query'
import {ArrowUpRight,BarChart3,CircleDollarSign,Eye,FileText,Handshake,Newspaper,UsersRound} from 'lucide-react'
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

const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const compact=(value:number)=>new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1}).format(value)
const monthKey=(now:Date)=>`${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`
const formatDate=(raw:string|undefined|null)=>{if(!raw)return '—';const date=new Date(raw);return Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'—'}
const pipelineLabels:Record<string,string>={novo:'Novos',contato_realizado:'Contato realizado',qualificado:'Qualificados',proposta:'Propostas',negociacao:'Negociação',fechado:'Fechados',perdido:'Perdidos'}
const pipelineColors=['#e30613','#ee6b73','#f2a1a7','#b83b43','#7f1d24']
const developmentAnalytics=import.meta.env.DEV||import.meta.env.VITE_ENABLE_DEMO_DATA==='true'

function settledValue<T>(result:PromiseSettledResult<T>,fallback:T){return result.status==='fulfilled'?result.value:fallback}
function settledError(result:PromiseSettledResult<unknown>){return result.status==='rejected'?(result.reason instanceof Error?result.reason.message:String(result.reason)):''}

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

function displayNumber(available:boolean,value:number,formatter:(value:number)=>string=compact){return available?formatter(value):'INDISPONÍVEL'}
function channelValue(channel:DashboardChannelPulse|undefined){return channel?.value===null||channel?.value===undefined?'INDISPONÍVEL':compact(channel.value)}
function pipelineGradient(entries:Array<[string,number]>,total:number){
 if(total<=0||entries.length===0)return '#f0f0f0'
 let cursor=0
 const stops=entries.map(([,value],index)=>{
  const start=cursor
  cursor+=value/total*100
  return `${pipelineColors[index%pipelineColors.length]} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`
 })
 if(cursor<100)stops.push(`#f0f0f0 ${cursor.toFixed(2)}% 100%`)
 return `conic-gradient(${stops.join(',')})`
}

export default function DashboardPage(){
 const {status}=useAdminAuth()
 const authenticated=status==='authenticated'
 const adminDashboard=useQuery({queryKey:['dashboard','authenticated','reference'],queryFn:()=>loadAuthenticatedDashboard(),enabled:authenticated,staleTime:10_000})
 const analytics=useQuery({queryKey:['dashboard','analytics','30d'],queryFn:loadDashboardAnalytics,staleTime:30_000,refetchOnWindowFocus:false,retry:1})
 const activity=useActivityHistory(8)
 const data=authenticated?adminDashboard.data:dashboardReadModel.snapshot()
 const [selectedChannel,setSelectedChannel]=useState<DashboardChannelPulse['key']>('site')

 const channels=useMemo(()=>resolveMultichannelPulses(analytics.data?.overview??null,analytics.data?.metrics??[],developmentAnalytics),[analytics.data])
 const websiteSeries=useMemo(()=>resolveDashboardPageviews(analytics.data?.metrics??[]),[analytics.data?.metrics])
 const attention=useMemo(()=>{
  const combined=[...(data?.attention??[]),...deriveProviderAttention(analytics.data?.providers??[])]
  return [...new Map(combined.map(item=>[item.id,item])).values()].sort((a,b)=>a.priority-b.priority||(a.dueAt??'9999').localeCompare(b.dueAt??'9999')||a.id.localeCompare(b.id)).slice(0,5)
 },[data?.attention,analytics.data?.providers])

 if(!data){
  return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:'Visão Geral'}}><section className="unified-dashboard">{adminDashboard.isError?<div className="dashboard-load-state" role="alert"><strong>DADOS OPERACIONAIS INDISPONÍVEIS</strong><p>{adminDashboard.error instanceof Error?adminDashboard.error.message:'A API administrativa não pôde carregar o Dashboard.'}</p><button type="button" onClick={()=>void adminDashboard.refetch()}>Tentar novamente</button></div>:<div className="dashboard-load-state" role="status">Consultando dados administrativos reais…</div>}</section></AdminShell>
 }

 const pipelineEntries=Object.entries(data.crmSummary.pipeline).filter(([,total])=>total>0).sort(([,a],[,b])=>b-a).slice(0,5)
 const recentActivity=(activity.data??[]).slice(0,5)
 const domainErrorCount=Object.keys(data.domainErrors).length
 const website=channels.find(channel=>channel.key==='site')
 const activeChannel=channels.find(channel=>channel.key===selectedChannel)??channels[0]
 const chartPoints=websiteSeries.points.slice(-7)
 const maxChartValue=Math.max(1,...chartPoints.map(point=>point.value))
 const chartCoordinates=chartPoints.map((point,index)=>{
  const x=chartPoints.length<=1?50:(index/(chartPoints.length-1))*100
  const y=92-(point.value/maxChartValue)*72
  return `${x.toFixed(2)},${y.toFixed(2)}`
 }).join(' ')
 const ringStyle={background:pipelineGradient(pipelineEntries,data.crmSummary.total)}

 return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:`Visão Geral · ${data.period.month}`}}>
  <main className="unified-dashboard" aria-busy={activity.isLoading||analytics.isLoading||adminDashboard.isLoading}>
   <section className="dashboard-kpi-grid" data-testid="dashboard-kpi-region" aria-label="Indicadores principais">
    <article className="dashboard-kpi-card" data-dashboard-kpi="new-leads">
     <span className="dashboard-kpi-icon is-crm"><UsersRound size={20}/></span>
     <div><span data-dashboard-kpi-label>Novos Leads</span><strong>{displayNumber(data.availability.crm,data.crmSummary.newLeads,value=>String(value))}</strong><small>{data.availability.crm?`${data.crmSummary.total} leads no pipeline`:'Fonte CRM indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="negotiations">
     <span className="dashboard-kpi-icon is-sales"><Handshake size={20}/></span>
     <div><span data-dashboard-kpi-label>Negociações</span><strong>{displayNumber(data.availability.crm,data.crmSummary.negotiations,value=>String(value))}</strong><small>{data.availability.crm?`${data.crmSummary.followUps.overdue} follow-up${data.crmSummary.followUps.overdue===1?'':'s'} vencido${data.crmSummary.followUps.overdue===1?'':'s'}`:'Fonte CRM indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="revenue">
     <span className="dashboard-kpi-icon is-finance"><CircleDollarSign size={20}/></span>
     <div><span data-dashboard-kpi-label>Faturamento (Mês)</span><strong>{displayNumber(data.availability.finance,data.financeSummary.monthRevenue,money)}</strong><small>{data.availability.finance?'Receitas pagas no período':'Fonte financeira indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="published-content">
     <span className="dashboard-kpi-icon is-content"><Newspaper size={20}/></span>
     <div><span data-dashboard-kpi-label>Conteúdos Publicados</span><strong>{displayNumber(data.availability.editorial,data.editorialCounts.publishedThisMonth,value=>String(value))}</strong><small>{data.availability.editorial?`${data.editorialCounts.published} publicados no total`:'Fonte editorial indisponível'}</small></div>
    </article>
    <article className="dashboard-kpi-card" data-dashboard-kpi="website">
     <span className="dashboard-kpi-icon is-analytics"><Eye size={20}/></span>
     <div><span data-dashboard-kpi-label><span>Visitas no Site</span> <span>(Mês)</span></span><strong>{channelValue(website)}</strong><small>{website?.value===null?'Métrica não disponível':`${website?.metricLabel??'Pageviews'} · 30 dias`}</small></div>
    </article>
   </section>

   <section className="dashboard-reference-row" aria-label="Performance e atividades">
    <section className="dashboard-reference-panel dashboard-analytics-panel" data-testid="dashboard-analytics-region" aria-labelledby="dashboard-performance-title">
     <header className="dashboard-panel-heading dashboard-performance-heading"><div><h2 id="dashboard-performance-title">Performance</h2></div><Link to="/app/metricas">Ver métricas <ArrowUpRight size={14}/></Link></header>
     <div className="dashboard-channel-tabs" data-testid="dashboard-channel-tabs" role="tablist" aria-label="Canais de performance">
      {channels.map(channel=><button key={channel.key} type="button" role="tab" aria-selected={selectedChannel===channel.key} onClick={()=>setSelectedChannel(channel.key)}>{channel.label}</button>)}
     </div>
     {selectedChannel==='site'?<div className="dashboard-chart-stage" data-testid="dashboard-website-chart">
      <div className="dashboard-chart-pulse"><strong>{channelValue(activeChannel)}</strong><span>{activeChannel.metricLabel}</span></div>
      {chartPoints.length>=2?<><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Evolução recente de pageviews do Website">
       <polygon points={`0,100 ${chartCoordinates} 100,100`} className="dashboard-chart-area"/>
       <polyline points={chartCoordinates} className="dashboard-chart-line"/>
      </svg><div className="dashboard-chart-labels">{chartPoints.map(point=><span key={point.date}>{point.label}</span>)}</div></>:<div className="dashboard-chart-unavailable"><BarChart3 size={24}/><strong>SÉRIE TEMPORAL INDISPONÍVEL</strong><p>Nenhum zero ou linha artificial foi criado para preencher o gráfico.</p></div>}
     </div>:<div className="dashboard-channel-detail" data-testid={`dashboard-channel-detail-${selectedChannel}`}>
      <BarChart3 size={28}/><div><span>{activeChannel.metricLabel}</span><strong>{activeChannel.value===null?'MÉTRICA NÃO DISPONÍVEL':compact(activeChannel.value)}</strong><small>Atualizado em {formatDate(activeChannel.updatedAt)}</small></div>
     </div>}
     {(analytics.data?.errors.overview||analytics.data?.errors.metrics)&&<p className="dashboard-analytics-note">Uma ou mais fontes Analytics não responderam. Os canais afetados permanecem como INDISPONÍVEL.</p>}
    </section>

    <aside className="dashboard-reference-panel dashboard-recent-panel" data-testid="dashboard-recent-activity" aria-labelledby="dashboard-recent-title">
     <header className="dashboard-panel-heading">
      <div><h2 id="dashboard-recent-title">Atividades Recentes</h2></div>
      <Link to="/app/site/conteudos">Ver todas <ArrowUpRight size={14}/></Link>
     </header>
     <div className="dashboard-recent-list">
      {activity.isLoading?<div className="dashboard-empty-inline">Carregando movimentações…</div>:recentActivity.length?recentActivity.map(item=><article key={item.id}><span className="dashboard-row-icon"><FileText size={15}/></span><div><strong>{item.title}</strong><p>{item.action==='published'?'Publicado':'Atualizado'} · {item.category}</p></div><time dateTime={item.occurred_at}>{formatDate(item.occurred_at)}</time></article>):<div className="dashboard-empty-inline"><strong>Nenhuma atividade recente</strong><p>Não há eventos editoriais legítimos para exibir nesta carga.</p></div>}
     </div>
    </aside>
   </section>

   <section className="dashboard-bottom-grid" aria-label="Detalhamento operacional">
    <section className="dashboard-reference-panel dashboard-leads-panel" data-testid="dashboard-lead-distribution" aria-labelledby="dashboard-leads-title">
     <header className="dashboard-panel-heading">
      <div><h2 id="dashboard-leads-title">Distribuição de Leads</h2><p>Por estágio</p></div>
      <Link to="/app/crm">Abrir CRM <ArrowUpRight size={14}/></Link>
     </header>
     {data.availability.crm&&pipelineEntries.length?<div className="dashboard-lead-distribution-body">
      <div className="dashboard-lead-ring" style={ringStyle} aria-label={`${data.crmSummary.total} leads no pipeline`}><div><span>Total</span><strong>{data.crmSummary.total}</strong></div></div>
      <div className="dashboard-lead-legend">{pipelineEntries.map(([stage,total],index)=><p key={stage}><i style={{backgroundColor:pipelineColors[index%pipelineColors.length]}}/><span>{pipelineLabels[stage]??stage}</span><strong>{Math.round(total/Math.max(1,data.crmSummary.total)*100)}%</strong></p>)}</div>
     </div>:<div className="dashboard-empty-inline"><strong>Pipeline indisponível</strong><p>Nenhuma distribuição foi fabricada.</p></div>}
    </section>

    <section className="dashboard-reference-panel dashboard-featured-panel" data-testid="dashboard-featured-content" aria-labelledby="dashboard-featured-title">
     <header className="dashboard-panel-heading"><div><h2 id="dashboard-featured-title">Conteúdos em Destaque</h2></div><Link to="/app/site/conteudos">Ver todos <ArrowUpRight size={14}/></Link></header>
     <div className="dashboard-featured-list">
      {data.availability.editorial&&data.featuredContents.length?data.featuredContents.map(item=><article key={item.id}>
       <div className="dashboard-featured-thumb">{item.coverImage?<img src={item.coverImage} alt=""/>:<FileText size={20}/>}</div>
       <div><strong>{item.title}</strong><time dateTime={item.publishedAt??item.updatedAt}>{formatDate(item.publishedAt??item.updatedAt)}</time><small>{item.tags.slice(0,2).join(' · ')||'Editorial'}</small></div>
      </article>):<div className="dashboard-empty-inline"><strong>Nenhum conteúdo publicado</strong><p>O painel permanece vazio sem inventar destaque.</p></div>}
     </div>
    </section>

    <section className="dashboard-reference-panel dashboard-pending-panel" data-testid="dashboard-pending-attention" aria-labelledby="dashboard-pending-title">
     <header className="dashboard-panel-heading"><div><h2 id="dashboard-pending-title">Pendências</h2></div></header>
     {domainErrorCount>0&&<p className="dashboard-source-warning">{domainErrorCount} fonte{domainErrorCount===1?'':'s'} operacional{domainErrorCount===1?'':'is'} indisponível{domainErrorCount===1?'':'eis'} nesta carga.</p>}
     <div className="dashboard-pending-list">
      {attention.length?attention.slice(0,4).map(item=><article key={item.id} data-attention-kind={item.kind}><span className="dashboard-attention-mark"/><div><strong>{item.title}</strong><p>{item.detail}</p>{item.dueAt&&<time dateTime={item.dueAt}>{formatDate(item.dueAt)}</time>}</div><Link to={item.href} aria-label={`Abrir ${item.title}`}><ArrowUpRight size={15}/></Link></article>):<div className="dashboard-empty-inline"><strong>Nenhuma pendência acionável</strong><p>As fontes disponíveis não indicam condição que exija ação agora.</p></div>}
     </div>
    </section>
   </section>
  </main>
 </AdminShell>
}