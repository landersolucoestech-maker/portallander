import {useQuery} from '@tanstack/react-query'
import {ArrowUpRight,BarChart3,CalendarDays,CircleDollarSign,Clock3,FileText,Handshake,Landmark,Newspaper,UsersRound} from 'lucide-react'
import {useMemo} from 'react'
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
import {lastThirtyDayRange,resolveMultichannelPulses,type DashboardAnalyticsSource} from './dashboardAnalytics'
import {dashboardReadModel,deriveAgendaSummary,deriveCrmSummary,deriveEditorialSummary,deriveFinanceSummary,deriveOperationalAttention,deriveProviderAttention} from './dashboardReadModel'
import {useActivityHistory} from './hooks/useActivityHistory'
import '../../styles/admin-dashboard-unified.css'

const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const compact=(value:number)=>new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1}).format(value)
const monthKey=(now:Date)=>`${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`
const formatDate=(raw:string|undefined)=>{if(!raw)return '—';const date=new Date(raw);return Number.isFinite(date.getTime())?date.toLocaleDateString('pt-BR'):'—'}
const pipelineLabels:Record<string,string>={novo:'Novos',contato_realizado:'Contato realizado',qualificado:'Qualificados',proposta:'Propostas',negociacao:'Negociação',fechado:'Fechados',perdido:'Perdidos'}
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

function sourceLabel(source:DashboardAnalyticsSource){
 if(source==='REAL')return 'DADO REAL'
 if(source==='MANUAL_IDENTIFIED')return 'MANUAL IDENTIFICADO'
 if(source==='DEVELOPMENT')return 'DADO DE DESENVOLVIMENTO'
 return 'INDISPONÍVEL'
}
function displayNumber(available:boolean,value:number,formatter:(value:number)=>string=compact){return available?formatter(value):'INDISPONÍVEL'}

export default function DashboardPage(){
 const {status}=useAdminAuth()
 const authenticated=status==='authenticated'
 const adminDashboard=useQuery({queryKey:['dashboard','authenticated','executive'],queryFn:()=>loadAuthenticatedDashboard(),enabled:authenticated,staleTime:10_000})
 const analytics=useQuery({queryKey:['dashboard','analytics','30d'],queryFn:loadDashboardAnalytics,staleTime:30_000,refetchOnWindowFocus:false,retry:1})
 const activity=useActivityHistory(6)
 const data=authenticated?adminDashboard.data:dashboardReadModel.snapshot()

 const channels=useMemo(()=>resolveMultichannelPulses(analytics.data?.overview??null,analytics.data?.metrics??[],developmentAnalytics),[analytics.data])
 const attention=useMemo(()=>{
  const combined=[...(data?.attention??[]),...deriveProviderAttention(analytics.data?.providers??[])]
  return [...new Map(combined.map(item=>[item.id,item])).values()].sort((a,b)=>a.priority-b.priority||(a.dueAt??'9999').localeCompare(b.dueAt??'9999')||a.id.localeCompare(b.id)).slice(0,5)
 },[data?.attention,analytics.data?.providers])

 if(!data){
  return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:'Visão Geral'}}><section className="unified-dashboard">{adminDashboard.isError?<div className="dashboard-load-state" role="alert"><strong>DADOS OPERACIONAIS INDISPONÍVEIS</strong><p>{adminDashboard.error instanceof Error?adminDashboard.error.message:'A API administrativa não pôde carregar o Dashboard.'}</p><button type="button" onClick={()=>void adminDashboard.refetch()}>Tentar novamente</button></div>:<div className="dashboard-load-state" role="status">Consultando dados administrativos reais…</div>}</section></AdminShell>
 }

 const pipelineEntries=Object.entries(data.crmSummary.pipeline).filter(([,total])=>total>0).sort(([,a],[,b])=>b-a).slice(0,5)
 const recentActivity=(activity.data??[]).slice(0,4)
 const domainErrorCount=Object.keys(data.domainErrors).length

 return <AdminShell area="crm" items={UNIFIED_ADMIN_NAV} header={{title:'DASHBOARD',description:`Visão Geral · ${data.period.month}`}}>
  <main className="unified-dashboard" aria-busy={activity.isLoading||analytics.isLoading||adminDashboard.isLoading}>
   <section className="dashboard-executive-board" data-testid="dashboard-executive-summary" aria-labelledby="dashboard-executive-title">
    <div className="dashboard-executive-summary">
     <header className="dashboard-section-heading">
      <div><span className="dashboard-eyebrow">P0 · visão executiva</span><h2 id="dashboard-executive-title">Resumo executivo</h2><p>Financeiro, comercial e operação editorial em uma leitura única.</p></div>
      <span className="dashboard-period">{data.period.month}</span>
     </header>
     <div className="dashboard-domain-groups">
      <section className="dashboard-domain-group">
       <div className="dashboard-domain-title"><span><Landmark size={17}/>Financeiro</span><Link to="/app/finance" aria-label="Abrir Financeiro">Detalhar <ArrowUpRight size={13}/></Link></div>
       <div className="dashboard-inline-stats">
        <p><span>Faturamento do mês</span><strong>{displayNumber(data.availability.finance,data.financeSummary.monthRevenue,money)}</strong><small>receitas pagas</small></p>
        <p><span>A receber</span><strong>{displayNumber(data.availability.finance,data.financeSummary.receivable,money)}</strong><small>{data.availability.finance?`${data.financeSummary.overdueCount} vencido${data.financeSummary.overdueCount===1?'':'s'}`:'fonte indisponível'}</small></p>
       </div>
      </section>
      <section className="dashboard-domain-group">
       <div className="dashboard-domain-title"><span><Handshake size={17}/>Comercial</span><Link to="/app/crm" aria-label="Abrir CRM">Detalhar <ArrowUpRight size={13}/></Link></div>
       <div className="dashboard-inline-stats">
        <p><span>Novos leads</span><strong>{displayNumber(data.availability.crm,data.crmSummary.newLeads,value=>String(value))}</strong><small>{data.availability.crm?`${data.crmSummary.total} no pipeline`:'fonte indisponível'}</small></p>
        <p><span>Negociações</span><strong>{displayNumber(data.availability.crm,data.crmSummary.negotiations,value=>String(value))}</strong><small>{data.availability.crm?`${data.crmSummary.followUps.overdue} follow-up vencido${data.crmSummary.followUps.overdue===1?'':'s'}`:'fonte indisponível'}</small></p>
       </div>
      </section>
      <section className="dashboard-domain-group">
       <div className="dashboard-domain-title"><span><Newspaper size={17}/>Conteúdo</span><Link to="/app/site/conteudos" aria-label="Abrir Conteúdos">Detalhar <ArrowUpRight size={13}/></Link></div>
       <div className="dashboard-inline-stats">
        <p><span>Publicados</span><strong>{displayNumber(data.availability.editorial,data.editorialCounts.published,value=>String(value))}</strong><small>conteúdos ativos</small></p>
        <p><span>No mês</span><strong>{displayNumber(data.availability.editorial,data.editorialCounts.publishedThisMonth,value=>String(value))}</strong><small>{data.availability.editorial?`${data.editorialCounts.drafts} rascunho${data.editorialCounts.drafts===1?'':'s'}`:'fonte indisponível'}</small></p>
       </div>
      </section>
     </div>
    </div>
    <aside className="dashboard-operational-attention" data-testid="dashboard-operational-attention" aria-labelledby="dashboard-attention-title">
     <header className="dashboard-section-heading compact"><div><span className="dashboard-eyebrow">P0 · ação</span><h2 id="dashboard-attention-title">Atenção operacional</h2><p>Somente condições derivadas das fontes conectadas.</p></div></header>
     {domainErrorCount>0&&<p className="dashboard-source-warning">{domainErrorCount} fonte{domainErrorCount===1?'':'s'} operacional{domainErrorCount===1?'':'is'} indisponível{domainErrorCount===1?'':'eis'} nesta carga.</p>}
     <div className="dashboard-attention-list">
      {attention.length?attention.map(item=><article key={item.id} data-attention-kind={item.kind}><span className="dashboard-attention-mark"/><div><strong>{item.title}</strong><p>{item.detail}</p>{item.dueAt&&<time dateTime={item.dueAt}>{formatDate(item.dueAt)}</time>}</div><Link to={item.href} aria-label={`Abrir ${item.title}`}><ArrowUpRight size={14}/></Link></article>):<div className="dashboard-empty-inline"><strong>Nenhum item acionável agora</strong><p>Não há condição derivada que exija atenção imediata nas fontes disponíveis.</p></div>}
     </div>
    </aside>
   </section>

   <section className="dashboard-multichannel" data-testid="dashboard-multichannel" aria-labelledby="dashboard-multichannel-title">
    <header className="dashboard-section-heading">
     <div><span className="dashboard-eyebrow">P1 · analytics</span><h2 id="dashboard-multichannel-title">Performance multicanal</h2><p>Pulse de 30 dias. A análise aprofundada permanece no módulo Métricas.</p></div>
     <Link className="dashboard-section-link" to="/app/metricas">Ver Métricas <ArrowUpRight size={13}/></Link>
    </header>
    <div className="dashboard-channel-grid">
     {channels.map(channel=><article className="dashboard-channel" key={channel.key} data-channel={channel.key}>
      <div className="dashboard-channel-heading"><span>{channel.label}</span><small className={`dashboard-source ${channel.source.toLowerCase()}`}>{sourceLabel(channel.source)}</small></div>
      <strong>{channel.value===null?'INDISPONÍVEL':compact(channel.value)}</strong>
      <p>{channel.metricLabel}</p>
      <small>{channel.accountId??channel.provider}</small>
      <Link to={channel.href} aria-label={`Abrir Métricas de ${channel.label}`}>Abrir detalhe <ArrowUpRight size={12}/></Link>
     </article>)}
    </div>
    {(analytics.data?.errors.overview||analytics.data?.errors.metrics)&&<p className="dashboard-analytics-note">Uma ou mais fontes Analytics não responderam. Os canais afetados permanecem como INDISPONÍVEL; nenhum zero ou fallback fictício foi aplicado.</p>}
   </section>

   <div className="dashboard-operational-grid">
    <section className="dashboard-operations-panel dashboard-crm-panel" data-testid="dashboard-crm-summary" aria-labelledby="dashboard-crm-title">
     <header className="dashboard-section-heading compact"><div><span className="dashboard-eyebrow">Comercial / CRM</span><h2 id="dashboard-crm-title">Pipeline e follow-ups</h2><p>Uma única leitura do mesmo pipeline comercial.</p></div><Link className="dashboard-section-link" to="/app/crm">Abrir CRM <ArrowUpRight size={13}/></Link></header>
     <div className="dashboard-crm-body">
      <div className="dashboard-pipeline-list">{data.availability.crm&&pipelineEntries.length?pipelineEntries.map(([status,total])=><p key={status}><span>{pipelineLabels[status]??status}</span><strong>{total}</strong><i style={{width:`${Math.max(8,Math.round((total/Math.max(1,data.crmSummary.total))*100))}%`}}/></p>):<div className="dashboard-empty-inline">Pipeline indisponível.</div>}</div>
      <div className="dashboard-followup-strip"><p><Clock3 size={15}/><span>Vencidos</span><strong>{data.availability.crm?data.crmSummary.followUps.overdue:'—'}</strong></p><p><span>Hoje</span><strong>{data.availability.crm?data.crmSummary.followUps.today:'—'}</strong></p><p><span>Próximos</span><strong>{data.availability.crm?data.crmSummary.followUps.upcoming:'—'}</strong></p></div>
     </div>
    </section>

    <section className="dashboard-operations-panel dashboard-content-panel" data-testid="dashboard-content-activity" aria-labelledby="dashboard-content-title">
     <header className="dashboard-section-heading compact"><div><span className="dashboard-eyebrow">Conteúdo / atividade</span><h2 id="dashboard-content-title">Operação editorial</h2><p>{data.availability.editorial?`${data.editorialCounts.published} publicados · ${data.editorialCounts.drafts} rascunhos · ${data.editorialCounts.archived} arquivados`:'Fonte editorial indisponível'}</p></div><Link className="dashboard-section-link" to="/app/site/conteudos">Conteúdos <ArrowUpRight size={13}/></Link></header>
     <div className="dashboard-activity-list">{activity.isLoading?<div className="dashboard-empty-inline">Carregando movimentações…</div>:recentActivity.length?recentActivity.map(item=><article key={item.id}><span className="dashboard-row-icon"><FileText size={14}/></span><div><strong>{item.title}</strong><p>{item.action==='published'?'Publicado':'Atualizado'} · {item.category}</p></div><time>{formatDate(item.occurred_at)}</time></article>):<div className="dashboard-empty-inline">Nenhuma movimentação editorial recente.</div>}</div>
    </section>

    <section className="dashboard-operations-panel dashboard-agenda-panel" data-testid="dashboard-agenda" aria-labelledby="dashboard-agenda-title">
     <header className="dashboard-section-heading compact"><div><span className="dashboard-eyebrow">Agenda</span><h2 id="dashboard-agenda-title">Próximos compromissos</h2><p>Contexto operacional, sem competir com os indicadores P0.</p></div><Link className="dashboard-section-link" to="/app/agenda">Agenda <ArrowUpRight size={13}/></Link></header>
     <div className="dashboard-agenda-list">{data.availability.agenda&&data.upcoming.length?data.upcoming.slice(0,4).map(item=><article key={item.id}><span><CalendarDays size={14}/></span><div><strong>{item.title}</strong><time dateTime={item.startsAt}>{formatDate(item.startsAt)}</time></div></article>):<div className="dashboard-empty-inline">{data.availability.agenda?'Nenhum compromisso futuro agendado.':'Agenda indisponível nesta carga.'}</div>}</div>
    </section>
   </div>

   <nav className="dashboard-quick-actions" data-testid="dashboard-quick-actions" aria-label="Ações rápidas do Dashboard">
    <div><span className="dashboard-eyebrow">Ações rápidas</span><strong>Ir para</strong></div>
    <Link to="/app/metricas"><BarChart3 size={15}/>Métricas</Link>
    <Link to="/app/crm"><UsersRound size={15}/>CRM</Link>
    <Link to="/app/finance"><CircleDollarSign size={15}/>Financeiro</Link>
    <Link to="/app/site/conteudos"><FileText size={15}/>Conteúdos</Link>
    <Link to="/app/agenda"><CalendarDays size={15}/>Agenda</Link>
   </nav>
  </main>
 </AdminShell>
}
