import {BarChart3,CheckCircle2,Globe2,MousePointer2,Target,TrendingUp,Users} from 'lucide-react'
import {useEffect,useMemo,useState} from 'react'
import {analyticsClient} from '../../analytics/client'
import type {AnalyticsMetric,AnalyticsDataStatus} from '../../analytics/domain'
import {aggregateMetric} from '../../analytics/metricCatalog'
import {buildContentReachRanking} from '../analyticsRanking'
import {compact,money,type MarketingSeed} from '../domain'
import {Card,Empty,pct} from '../MarketingUi'

const DISPLAYABLE_STATUSES=new Set<AnalyticsDataStatus>(['LIVE','CACHED','MANUAL','STALE'])
const METRIC_KEYS=['reach','impressions','clicks','engagement','conversions','followers','spend'] as const

function monthRange(period:string){
  if(!/^\d{4}-\d{2}$/.test(period))return {}
  const [year,month]=period.split('-').map(Number)
  const start=new Date(Date.UTC(year,month-1,1)).toISOString()
  const end=new Date(Date.UTC(year,month,1)).toISOString()
  return {periodStart:start,periodEnd:end}
}

function usable(metric:AnalyticsMetric){return metric.value!==null&&DISPLAYABLE_STATUSES.has(metric.dataStatus)}
function safeAggregate(metrics:AnalyticsMetric[],key:string){return aggregateMetric(metrics.filter(usable),key)}
function valueLabel(value:number|null,kind:'number'|'money'='number'){return value===null?'INDISPONÍVEL':kind==='money'?money(value):compact(value)}
function sourceLabel(metrics:AnalyticsMetric[]){
  if(!metrics.length)return 'Fonte não conectada'
  const statuses=new Set(metrics.map(metric=>metric.dataStatus))
  if(statuses.has('SYNC_ERROR'))return 'Erro de sincronização'
  if(statuses.has('STALE'))return 'Dados desatualizados'
  const updated=metrics.map(metric=>metric.normalizedAt||metric.collectedAt).filter(Boolean).sort().at(-1)
  return updated?`Atualizado em ${new Date(updated).toLocaleString('pt-BR')}`:'Proveniência disponível na API'
}

export function MarketingMetrics({state}:{state:MarketingSeed}){
  const [provider,setProvider]=useState('all')
  const [period,setPeriod]=useState(()=>new Date().toISOString().slice(0,7))
  const [metrics,setMetrics]=useState<AnalyticsMetric[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{
    let active=true
    setLoading(true);setError('')
    const range=monthRange(period)
    analyticsClient.metrics({...range,limit:500}).then(result=>{if(active)setMetrics(result.metrics.filter(metric=>metric.dataStatus!=='MOCK'))}).catch(caught=>{if(active){setMetrics([]);setError(caught instanceof Error?caught.message:'Analytics indisponível.')}}).finally(()=>{if(active)setLoading(false)})
    return()=>{active=false}
  },[period])

  const providers=useMemo(()=>Array.from(new Set(metrics.map(metric=>metric.provider).filter((value):value is string=>Boolean(value)))).sort(),[metrics])
  const base=useMemo(()=>metrics.filter(metric=>provider==='all'||metric.provider===provider),[metrics,provider])
  const totals=useMemo(()=>Object.fromEntries(METRIC_KEYS.map(key=>[key,safeAggregate(base,key)])) as Record<(typeof METRIC_KEYS)[number],number|null>,[base])
  const ctr=totals.clicks!==null&&totals.impressions!==null&&totals.impressions>0?pct(totals.clicks,totals.impressions):null
  const maxReach=Math.max(...base.filter(metric=>metric.metricKey==='reach'&&usable(metric)).map(metric=>metric.value??0),1)
  const chartMetrics=base.filter(metric=>metric.metricKey==='reach'&&usable(metric))
  const ranked=useMemo(()=>buildContentReachRanking(state.contents,base),[state.contents,base])

  return <>
    <div className="marketing-platform-tabs marketing-platform-tabs-exact"><button type="button" className={provider==='all'?'active':''} onClick={()=>setProvider('all')}><Globe2 size={14}/>Visão Geral</button>{providers.map(name=><button type="button" key={name} className={provider===name?'active':''} onClick={()=>setProvider(name)}><span className="marketing-platform-dot"/>{name}</button>)}</div>
    <div className="marketing-metrics-period"><input type="month" value={period} onChange={event=>setPeriod(event.target.value)}/></div>
    {error&&<div className="marketing-empty"><strong>Analytics indisponível</strong><p>{error} Nenhum valor mock foi usado como fallback.</p></div>}
    <div className="marketing-metric-strip marketing-metric-strip-exact">{[
      ['Alcance',valueLabel(totals.reach),'não somado entre fontes/períodos incompatíveis',Users],
      ['Impressões',valueLabel(totals.impressions),'exibições',BarChart3],
      ['Cliques',valueLabel(totals.clicks),ctr===null?'CTR indisponível':`CTR ${ctr.toFixed(2)}%`,MousePointer2],
      ['Engajamento',valueLabel(totals.engagement),'interações',TrendingUp],
      ['Conversões',valueLabel(totals.conversions),'ações atribuídas',CheckCircle2],
      ['Seguidores',valueLabel(totals.followers),'último snapshot compatível',Target],
    ].map(([label,value,hint,Icon])=><article key={String(label)}><div><span>{String(label)}</span><strong>{loading?'CARREGANDO…':String(value)}</strong><small>{String(hint)}</small></div><Icon size={16}/></article>)}</div>
    <div className="marketing-analytics-grid marketing-analytics-reference">
      <Card title={provider==='all'?'Evolução consolidada':`${provider} · evolução`} description={sourceLabel(base)}>{chartMetrics.length?<div className="marketing-performance-chart"><div className="marketing-chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0</span></div><div className="marketing-chart-columns">{chartMetrics.map(metric=><div key={metric.id}><div className="marketing-chart-column-bar"><i style={{height:`${Math.max(8,Math.min(100,pct(metric.value??0,maxReach)))}%`}}/></div><span>{metric.provider||metric.scopeId}</span></div>)}</div></div>:<Empty empty text="Série histórica indisponível para o período selecionado."/>}</Card>
      <Card title={provider==='all'?'Resumo consolidado':`Resumo · ${provider}`} description="Agregação somente quando semanticamente segura"><div className="marketing-summary marketing-summary-reference"><p><span>Audiência total</span><strong>{valueLabel(totals.followers)}</strong></p><p><span>Impressões</span><strong>{valueLabel(totals.impressions)}</strong></p><p><span>Engajamento</span><strong>{valueLabel(totals.engagement)}</strong></p><p><span>Alcance</span><strong>{valueLabel(totals.reach)}</strong></p><p><span>Cliques</span><strong>{valueLabel(totals.clicks)}</strong></p><p><span>CTR</span><strong>{ctr===null?'INDISPONÍVEL':`${ctr.toFixed(2)}%`}</strong></p><p><span>Conversões</span><strong>{valueLabel(totals.conversions)}</strong></p><p><span>Investimento</span><strong>{valueLabel(totals.spend,'money')}</strong></p></div></Card>
    </div>
    <section className="marketing-card marketing-ranking marketing-ranking-exact"><header><h3>{provider==='all'?'Top Conteúdos':`Ranking · ${provider}`}</h3><p>Ranking somente quando a métrica possui vínculo real com o conteúdo e pode ser agregada sem perda semântica.</p></header><div className="marketing-card-body">{ranked.length?<><div className="marketing-ranking-header"><span>Posição</span><span>Conteúdo</span><span>Contexto/Campanha</span><span>Resultado</span><span>Plataforma</span></div><div className="marketing-ranking-list marketing-content-ranking">{ranked.slice(0,8).map((item,index)=><article key={item.content.id}><span className="marketing-rank">{index+1}</span><div className="marketing-ranking-main"><strong>{item.content.title}</strong><small>{item.content.type}</small></div><div className="marketing-ranking-main"><strong>{item.content.subject||item.content.campaign||item.content.context||'—'}</strong></div><div><strong>{compact(item.value)}</strong><small>Alcance</small></div><div><strong>{item.provider||'—'}</strong></div></article>)}</div></>:<Empty empty text="UNAVAILABLE — não existe vínculo analítico e agregação semântica comprovados para conteúdo neste período."/>}</div></section>
  </>
}
