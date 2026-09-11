import {BarChart3,CheckCircle2,FileText,Globe2,Target,TrendingUp,Users} from 'lucide-react'
import type {LucideIcon} from 'lucide-react'
import {useEffect,useState,type ReactNode} from 'react'
import {useSearchParams} from 'react-router-dom'
import {AdminKpi,AdminNotice,AdminShell} from '../../shared/internal/AdminUi'
import {UNIFIED_ADMIN_NAV} from '../../shared/internal/adminNavigation'
import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import {marketingRepository} from '../marketing/repository'
import type {MarketingSeed} from '../marketing/domain'
import {compact} from '../marketing/domain'
import {Card} from '../marketing/MarketingUi'
import {MarketingMetrics} from '../marketing/pages/MarketingMetrics'
import {analyticsClient} from './client'
import type {AnalyticsDataStatus,AnalyticsMetric} from './domain'
import {aggregateMetric} from './metricCatalog'
import {loadMetrics,type MetricsRange,type MetricsResponse} from './metricsClient'
import '../marketing/marketing.css'
import '../marketing/marketing-reference.css'
import '../marketing/marketing-reference-exact.css'

const TABS=[['geral','Visão Geral'],['site','Site'],['instagram','Instagram'],['tiktok','TikTok'],['youtube','YouTube']] as const
type MetricsTab=(typeof TABS)[number][0]
const VALID_TABS=new Set<MetricsTab>(TABS.map(([key])=>key))
const DISPLAYABLE_STATUSES=new Set<AnalyticsDataStatus>(['LIVE','CACHED','MANUAL','STALE'])
const SOCIAL_PROVIDERS={instagram:'Instagram',tiktok:'TikTok',youtube:'YouTube'} as const
const INTERNAL_METRICS_RANGE:MetricsRange='30d'

type SiteKpiItem=readonly [label:string,value:string,detail:string,icon:LucideIcon]
type SiteRow=readonly string[]

const dateText=(date:Date)=>date.toISOString().slice(0,10)
const shiftDate=(value:string,days:number)=>{const date=new Date(`${value}T12:00:00.000Z`);date.setUTCDate(date.getUTCDate()+days);return dateText(date)}
function selectedRange(range:MetricsRange,customStart:string,customEnd:string){
 const today=dateText(new Date()),endDate=range==='custom'&&customEnd?customEnd:today
 const startDate=range==='custom'&&customStart?customStart:range==='today'?endDate:range==='7d'?shiftDate(endDate,-6):range==='90d'?shiftDate(endDate,-89):shiftDate(endDate,-29)
 const exclusiveEnd=shiftDate(endDate,1),days=Math.max(1,Math.round((new Date(`${exclusiveEnd}T00:00:00.000Z`).getTime()-new Date(`${startDate}T00:00:00.000Z`).getTime())/86_400_000))
 const previousEnd=startDate,previousStart=shiftDate(startDate,-days)
 return {startDate,endDate,periodStart:`${startDate}T00:00:00.000Z`,periodEnd:`${exclusiveEnd}T00:00:00.000Z`,previousPeriodStart:`${previousStart}T00:00:00.000Z`,previousPeriodEnd:`${previousEnd}T00:00:00.000Z`}
}
const valueLabel=(value:number|null|undefined)=>value===null||value===undefined?'INDISPONÍVEL':compact(value)
const decimalLabel=(value:number|null|undefined)=>value===null||value===undefined?'INDISPONÍVEL':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value)
const percentLabel=(value:number|null|undefined)=>value===null||value===undefined?'INDISPONÍVEL':`${new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(value*100)}%`
const durationLabel=(value:number|null|undefined)=>{if(value===null||value===undefined)return 'INDISPONÍVEL';const minutes=Math.floor(value/60),seconds=Math.round(value%60);return `${minutes} min ${seconds}s`}
const publicationDateLabel=(value:string|null|undefined)=>value?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(new Date(value)):'Sem data'
const usable=(metric:AnalyticsMetric)=>metric.value!==null&&DISPLAYABLE_STATUSES.has(metric.dataStatus)
const socialOnly=(metrics:AnalyticsMetric[])=>metrics.filter(metric=>usable(metric)&&metric.provider!=='google-analytics')

function SummaryRows({rows}:{rows:ReadonlyArray<ReadonlyArray<string>>}){return <div className="marketing-summary marketing-summary-reference">{rows.map((row,index)=>{const [label='',value='',detail='']=row;return <p key={`${label}-${index}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></p>})}</div>}

function SiteSection({testId,eyebrow,title,description,children}:{testId:string;eyebrow:string;title:string;description:string;children:ReactNode}){
 return <section className="metrics-site-section" data-testid={testId}>
  <header className="metrics-site-section-head">
   <div><span>{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>
   <small>Últimos 30 dias</small>
  </header>
  {children}
 </section>
}

function SiteKpiGrid({items}:{items:ReadonlyArray<SiteKpiItem>}){
 return <div className="metrics-site-kpis">{items.map(([label,value,detail,Icon])=><AdminKpi key={label} label={label} value={value} detail={detail} icon={<Icon size={16}/>}/>)}</div>
}

function SiteCard({title,description,children}:{title:string;description:string;children:ReactNode}){
 return <article className="metrics-site-card"><header><h3>{title}</h3><p>{description}</p></header><div className="metrics-site-card-body">{children}</div></article>
}

function SiteRows({rows}:{rows:ReadonlyArray<SiteRow>}){
 return <div className="metrics-site-rows">{rows.map((row,index)=>{const [label='',value='',detail='']=row;return <div className="metrics-site-row" key={`${label}-${index}`}><div><strong>{label}</strong><small>{detail}</small></div><b>{value}</b></div>})}</div>
}

function SiteEmpty({children}:{children:ReactNode}){return <div className="metrics-site-empty">{children}</div>}

function OverviewTab({data,socialMetrics}:{data:MetricsResponse;socialMetrics:AnalyticsMetric[]}){
 const social=socialOnly(socialMetrics),impressions=aggregateMetric(social,'impressions'),engagement=aggregateMetric(social,'engagement'),clicks=aggregateMetric(social,'clicks'),followers=aggregateMetric(social,'followers')
 const site=data.ga4.overview
 return <div className="marketing-analytics-grid marketing-analytics-reference" data-testid="metrics-overview-tab">
  <Card title="Site" description={data.ga4.status==='available'?'Google Analytics 4 · fonte canônica':'GA4 não configurado ou indisponível'}><SummaryRows rows={[
   ['Usuários',valueLabel(site.users?.value),'usuários ativos no período'],['Sessões',valueLabel(site.sessions?.value),'sessões no período'],['Visualizações',valueLabel(site.pageviews?.value),'visualizações de página'],['Engajamento',percentLabel(site.engagementRate?.value),'taxa de engajamento GA4'],
  ]}/></Card>
  <Card title="Canais sociais" description="Snapshots canônicos por integração"><SummaryRows rows={[
   ['Impressões',valueLabel(impressions),'agregação permitida pelo catálogo'],['Engajamento',valueLabel(engagement),'interações normalizadas'],['Cliques',valueLabel(clicks),'cliques normalizados'],['Seguidores',valueLabel(followers),followers===null?'mantidos por provider; não somados':'snapshot compatível'],
  ]}/></Card>
  <Card title="Conteúdo do Site" description="Dados editoriais canônicos"><SummaryRows rows={[
   ['Publicados',valueLabel(data.editorial.counts.published),'conteúdos publicados'],['No período',valueLabel(data.editorial.counts.publishedInPeriod),'publicados no período'],['Rascunhos',valueLabel(data.editorial.counts.drafts),'estado editorial'],['Arquivados',valueLabel(data.editorial.counts.archived),'estado editorial'],
  ]}/></Card>
  <Card title="Conversões do Site" description="Resultados derivados dos pipelines canônicos"><SummaryRows rows={[
   ['Submissões',valueLabel(data.conversions.total),'submissões aceitas'],['Leads',valueLabel(data.conversions.leadsCreated),'Contato Comercial → CRM'],['Colaborações',valueLabel(data.conversions.collaborationsCreated),'Colabore / Anuncie'],['Anuncie',valueLabel(data.conversions.contexts.anuncie),'origem Anuncie'],
  ]}/></Card>
 </div>
}

function SiteTab({data}:{data:MetricsResponse}){
 const overview=data.ga4.overview
 const topContent=data.ga4.status==='available'?data.ga4.pages.filter(page=>data.editorial.latest.some(content=>page.path.includes(`/${content.slug}`))):[]
 return <div className="metrics-site" data-testid="metrics-site-tab">
  <SiteSection testId="metrics-site-analytics" eyebrow="Audiência" title="Tráfego e comportamento" description="Dados do Google Analytics 4 para entender alcance, recorrência e navegação.">
   {data.ga4.status==='available'?<>
    <SiteKpiGrid items={[
     ['Usuários',valueLabel(overview.users?.value),'Ativos no período',Users],
     ['Novos usuários',valueLabel(overview.newUsers?.value),'Primeira visita no período',Users],
     ['Usuários recorrentes',valueLabel(data.ga4.returningUsers?.value),'Retornaram no período',Users],
     ['Sessões',valueLabel(overview.sessions?.value),'Visitas iniciadas',Globe2],
     ['Visualizações',valueLabel(overview.pageviews?.value),'Páginas visualizadas',BarChart3],
     ['Visualizações / usuário',decimalLabel(overview.pageviewsPerUser?.value),'Média por usuário',Target],
     ['Engajamento',percentLabel(overview.engagementRate?.value),'Taxa de sessões engajadas',TrendingUp],
     ['Tempo médio',durationLabel(overview.averageSessionDuration?.value),'Duração média da sessão',CheckCircle2],
    ]}/>
    <div className="metrics-site-card-grid">
     <SiteCard title="Aquisição por canal" description="Principais origens de tráfego por sessões e usuários."><SiteRows rows={data.ga4.acquisition.slice(0,6).map(item=>[item.channel,valueLabel(item.sessions),`${valueLabel(item.users)} usuários`])}/></SiteCard>
     <SiteCard title="Páginas mais acessadas" description="As seis páginas com maior volume de visualizações."><SiteRows rows={data.ga4.pages.slice(0,6).map(item=>[item.title||item.path,valueLabel(item.pageviews),`${valueLabel(item.users)} usuários · ${item.path}`])}/></SiteCard>
    </div>
   </>:<AdminNotice title={data.ga4.reason==='GA4_NOT_CONFIGURED'?'GA4 não configurado':'Dados do Site indisponíveis'} description={data.ga4.message||'Nenhum valor fictício é usado quando a integração real do Google Analytics 4 não está disponível.'}/>} 
  </SiteSection>

  <SiteSection testId="metrics-site-content" eyebrow="Conteúdo" title="Publicação e desempenho" description="Estado editorial atual e desempenho dos conteúdos que possuem vínculo seguro com o GA4.">
   <SiteKpiGrid items={[
    ['Publicados',valueLabel(data.editorial.counts.published),'Total atualmente publicado',FileText],
    ['Novos no período',valueLabel(data.editorial.counts.publishedInPeriod),'Publicados nos últimos 30 dias',CheckCircle2],
    ['Rascunhos',valueLabel(data.editorial.counts.drafts),'Aguardando publicação',FileText],
    ['Arquivados',valueLabel(data.editorial.counts.archived),'Fora de exibição',FileText],
   ]}/>
   <div className="metrics-site-card-grid">
    <SiteCard title="Publicações recentes" description="Últimos conteúdos registrados na fonte editorial persistida.">{data.editorial.latest.length?<SiteRows rows={data.editorial.latest.slice(0,6).map(item=>[item.title,publicationDateLabel(item.publishedAt),item.pageTitle||'Conteúdo editorial'])}/>:<SiteEmpty>Nenhum conteúdo publicado foi encontrado.</SiteEmpty>}</SiteCard>
    <SiteCard title="Conteúdos com mais visualizações" description="Desempenho dos conteúdos relacionados com segurança às páginas do GA4.">{topContent.length?<SiteRows rows={topContent.slice(0,6).map(item=>[item.title||item.path,valueLabel(item.pageviews),`${valueLabel(item.users)} usuários · ${item.path}`])}/>:<SiteEmpty>Não foi possível relacionar conteúdos publicados às páginas do GA4 neste período.</SiteEmpty>}</SiteCard>
   </div>
  </SiteSection>

  <SiteSection testId="metrics-site-conversions" eyebrow="Conversões" title="Resultados dos formulários" description="Submissões aceitas e encaminhadas pelos fluxos de conversão do site.">
   <SiteKpiGrid items={[
    ['Submissões',valueLabel(data.conversions.total),'Total aceito no período',CheckCircle2],
    ['Leads criados',valueLabel(data.conversions.leadsCreated),'Enviados ao CRM',Users],
    ['Colaborações',valueLabel(data.conversions.collaborationsCreated),'Recebidas por Colabore',FileText],
    ['Anuncie',valueLabel(data.conversions.contexts.anuncie),'Recebidas por Anuncie',Target],
   ]}/>
   <div className="metrics-site-card-grid metrics-site-card-grid-single">
    <SiteCard title="Conversões por origem" description="Distribuição das submissões conforme o ponto de entrada no site."><SiteRows rows={[
     ['Contato Comercial',valueLabel(data.conversions.contexts.contato),'Direcionado ao CRM como lead'],
     ['Colabore',valueLabel(data.conversions.contexts.colabore),'Direcionado ao fluxo de colaboração'],
     ['Anuncie',valueLabel(data.conversions.contexts.anuncie),'Direcionado ao fluxo comercial de publicidade'],
    ]}/></SiteCard>
   </div>
  </SiteSection>
 </div>
}

function SourceTab({provider,state,dates,testId}:{provider:string;state:MarketingSeed;dates:ReturnType<typeof selectedRange>;testId:string}){return <div data-testid={testId}><MarketingMetrics state={state} providerOverride={provider} periodStart={dates.periodStart} periodEnd={dates.periodEnd} previousPeriodStart={dates.previousPeriodStart} previousPeriodEnd={dates.previousPeriodEnd} hidePeriodControl/></div>}

export default function MetricsPage(){
 const [searchParams,setSearchParams]=useSearchParams(),requested=searchParams.get('tab') as MetricsTab|null,tab:MetricsTab=requested&&VALID_TABS.has(requested)?requested:'geral'
 const [data,setData]=useState<MetricsResponse|null>(null),[socialMetrics,setSocialMetrics]=useState<AnalyticsMetric[]>([]),[error,setError]=useState(''),[settledRequest,setSettledRequest]=useState('')
 const [marketingState,setMarketingState]=useState<MarketingSeed>(()=>marketingRepository.snapshot())
 const dates=selectedRange(INTERNAL_METRICS_RANGE,'','')
 const requestKey=`${INTERNAL_METRICS_RANGE}|${dates.startDate}|${dates.endDate}|${dates.periodStart}|${dates.periodEnd}`
 const loading=settledRequest!==requestKey
 useEffect(()=>{const refresh=()=>setMarketingState(marketingRepository.snapshot());window.addEventListener(marketingRepository.eventName,refresh);return()=>window.removeEventListener(marketingRepository.eventName,refresh)},[])
 useEffect(()=>{
  let active=true
  const aggregate=loadMetrics({range:INTERNAL_METRICS_RANGE,startDate:dates.startDate,endDate:dates.endDate}).then(value=>{if(active){setData(value);setError('')}}).catch(caught=>{if(active){setData(null);setError(caught instanceof Error?caught.message:'Métricas indisponíveis.')}})
  const social=analyticsClient.metrics({periodStart:dates.periodStart,periodEnd:dates.periodEnd,limit:500}).then(value=>{if(active)setSocialMetrics(value.metrics.filter(metric=>metric.dataStatus!=='MOCK'))}).catch(()=>{if(active)setSocialMetrics([])})
  void Promise.allSettled([aggregate,social]).finally(()=>{if(active)setSettledRequest(requestKey)})
  return()=>{active=false}
 },[requestKey,dates.startDate,dates.endDate,dates.periodStart,dates.periodEnd])
 const productionMock=import.meta.env.PROD&&getRuntimeDataProvider().kind==='mock',metricState=productionMock?{...marketingState,contents:[]}:marketingState
 const selectTab=(next:MetricsTab)=>{const nextParams=new URLSearchParams(searchParams);nextParams.set('tab',next);setSearchParams(nextParams,{replace:true})}
 return <AdminShell area="metrics" items={UNIFIED_ADMIN_NAV} header={{title:'Métricas',description:'Analytics global organizado por fonte e canal de dados'}}><section className="marketing-page metrics-page" data-testid="metrics-page">
  <div className="marketing-platform-tabs marketing-platform-tabs-exact" role="tablist" aria-label="Fontes de Métricas">{TABS.map(([key,label])=><button key={key} type="button" role="tab" aria-selected={tab===key} className={tab===key?'active':''} onClick={()=>selectTab(key)}>{label}</button>)}</div>
  {!loading&&error&&<AdminNotice title="Métricas indisponíveis" description={`${error} Nenhum valor mock é usado como fallback em produção.`}/>} 
  {loading&&!data?<div className="marketing-empty">Carregando métricas canônicas…</div>:data?<>
   {tab==='geral'&&<OverviewTab data={data} socialMetrics={socialMetrics}/>} 
   {tab==='site'&&<SiteTab data={data}/>} 
   {tab==='instagram'&&<SourceTab provider={SOCIAL_PROVIDERS.instagram} state={metricState} dates={dates} testId="metrics-instagram-tab"/>} 
   {tab==='tiktok'&&<SourceTab provider={SOCIAL_PROVIDERS.tiktok} state={metricState} dates={dates} testId="metrics-tiktok-tab"/>} 
   {tab==='youtube'&&<SourceTab provider={SOCIAL_PROVIDERS.youtube} state={metricState} dates={dates} testId="metrics-youtube-tab"/>} 
  </>:null}
 </section></AdminShell>
}
