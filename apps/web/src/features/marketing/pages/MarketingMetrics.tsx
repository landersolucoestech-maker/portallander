import {BarChart3,Clock3,FileText,Globe2,MousePointer2,RefreshCw,TrendingUp,Users} from 'lucide-react'
import {useEffect,useState} from 'react'
import type {MarketingSeed} from '../domain'
import {compact} from '../domain'
import {Card,Empty} from '../MarketingUi'
import {loadMarketingMetrics,type MarketingMetricsRange,type MarketingMetricsResponse,type MetricValue} from '../metricsClient'

const presets:[MarketingMetricsRange,string][]=[['today','Hoje'],['7d','7 dias'],['30d','30 dias'],['90d','90 dias'],['custom','Personalizado']]
const unavailable='MÉTRICA NÃO DISPONÍVEL'
function metricLabel(metric:MetricValue|undefined,kind:'number'|'percent'|'duration'|'decimal'='number'){
 if(!metric||metric.value===null)return unavailable
 if(kind==='percent')return `${(metric.value*100).toLocaleString('pt-BR',{maximumFractionDigits:1})}%`
 if(kind==='duration'){const seconds=Math.max(0,metric.value),minutes=Math.floor(seconds/60),rest=Math.round(seconds%60);return minutes?`${minutes}min ${rest}s`:`${rest}s`}
 if(kind==='decimal')return metric.value.toLocaleString('pt-BR',{maximumFractionDigits:2})
 return compact(metric.value)
}

export function MarketingMetrics({state}:{state:MarketingSeed}){
 void state
 const [range,setRange]=useState<MarketingMetricsRange>('30d'),[startDate,setStartDate]=useState(''),[endDate,setEndDate]=useState(''),[data,setData]=useState<MarketingMetricsResponse|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('')
 const load=(nextRange:MarketingMetricsRange=range)=>{if(nextRange==='custom'&&(!startDate||!endDate))return;setLoading(true);setError('');void loadMarketingMetrics({range:nextRange,startDate,endDate}).then(setData).catch(caught=>{setData(null);setError(caught instanceof Error?caught.message:'Métricas indisponíveis.')}).finally(()=>setLoading(false))}
 useEffect(()=>{let active=true;void loadMarketingMetrics({range:'30d'}).then(value=>{if(active)setData(value)}).catch(caught=>{if(active){setData(null);setError(caught instanceof Error?caught.message:'Métricas indisponíveis.')}}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[])
 const ga4=data?.ga4,overview=ga4?.overview||{},gaAvailable=ga4?.status==='available'
 return <>
  <div className="marketing-platform-tabs marketing-platform-tabs-exact" aria-label="Período das métricas">{presets.map(([id,label])=><button type="button" key={id} className={range===id?'active':''} onClick={()=>{setRange(id);if(id!=='custom')load(id)}}><Globe2 size={14}/>{label}</button>)}<button type="button" onClick={()=>load()} disabled={loading}><RefreshCw size={14}/>{loading?'Atualizando…':'Atualizar'}</button></div>
  {range==='custom'&&<div className="marketing-metrics-period"><label>De <input type="date" value={startDate} onChange={event=>setStartDate(event.target.value)}/></label><label>Até <input type="date" value={endDate} onChange={event=>setEndDate(event.target.value)}/></label><button type="button" className="button" onClick={()=>load('custom')} disabled={!startDate||!endDate||loading}>Aplicar período</button></div>}
  {data&&<div className="marketing-metrics-period"><small>Período real: {data.range.startDate} → {data.range.endDate} · timezone {data.range.timezone}. Atualizado em {new Date(data.generatedAt).toLocaleString('pt-BR')}.</small></div>}
  {error&&<div className="marketing-empty" role="alert"><strong>Métricas indisponíveis</strong><p>{error} Nenhum mock ou número substituto foi utilizado.</p></div>}
  {ga4&&ga4.status!=='available'&&<div className="marketing-empty"><strong>GA4 NÃO CONFIGURADO / INDISPONÍVEL</strong><p>{ga4.message||ga4.reason||'Não existe leitura GA4 válida neste ambiente.'} Métricas editoriais e conversões persistidas continuam independentes.</p></div>}

  <div className="marketing-metric-strip marketing-metric-strip-exact">{[
   ['Usuários',gaAvailable?metricLabel(overview.users):unavailable,'GA4 · activeUsers',Users],
   ['Sessões',gaAvailable?metricLabel(overview.sessions):unavailable,'GA4 · sessions',Globe2],
   ['Visualizações',gaAvailable?metricLabel(overview.pageviews):unavailable,'GA4 · screenPageViews',BarChart3],
   ['Views / usuário',gaAvailable?metricLabel(overview.pageviewsPerUser,'decimal'):unavailable,'GA4 · screenPageViewsPerUser',MousePointer2],
   ['Engajamento',gaAvailable?metricLabel(overview.engagementRate,'percent'):unavailable,'GA4 · engagementRate',TrendingUp],
   ['Tempo médio',gaAvailable?metricLabel(overview.averageSessionDuration,'duration'):unavailable,'GA4 · averageSessionDuration',Clock3],
   ['Novos usuários',gaAvailable?metricLabel(overview.newUsers):unavailable,'GA4 · newUsers',Users],
   ['Retorno',gaAvailable?metricLabel(ga4?.returningUsers||undefined):unavailable,'GA4 · newVsReturning',Users],
  ].map(([label,value,hint,Icon])=><article key={String(label)}><div><span>{String(label)}</span><strong>{loading?'CARREGANDO…':String(value)}</strong><small>{String(hint)}</small></div><Icon size={16}/></article>)}</div>

  <div className="marketing-analytics-grid marketing-analytics-reference">
   <Card title="Aquisição" description="Canais retornados pelo GA4; a taxonomia não é fabricada pelo Portal.">{gaAvailable&&ga4.acquisition.length?<div className="marketing-summary marketing-summary-reference">{ga4.acquisition.map(item=><p key={item.channel}><span>{item.channel}</span><strong>{item.sessions===null?'INDISPONÍVEL':compact(item.sessions)}</strong><small>{item.users===null?'Usuários indisponíveis':`${compact(item.users)} usuários`}</small></p>)}</div>:<Empty empty text={ga4?.partial?.acquisition?'GA4 não retornou aquisição para este período.':unavailable}/>}</Card>
   <Card title="Editorial" description="Contagem do PostgreSQL; não confundir volume editorial com audiência.">{data?<div className="marketing-summary marketing-summary-reference"><p><span>Publicados</span><strong>{data.editorial.counts.published}</strong><small>total persistido</small></p><p><span>Publicados no período</span><strong>{data.editorial.counts.publishedInPeriod}</strong><small>{data.range.startDate} → {data.range.endDate}</small></p><p><span>Rascunhos</span><strong>{data.editorial.counts.drafts}</strong><small>não publicados</small></p><p><span>Arquivados</span><strong>{data.editorial.counts.archived}</strong><small>fora de publicação</small></p></div>:<Empty empty text="Carregando contagem editorial real."/>}</Card>
  </div>

  <section className="marketing-card marketing-ranking marketing-ranking-exact"><header><h3>Páginas mais acessadas</h3><p>Performance de audiência GA4, separada da quantidade de conteúdos no CMS.</p></header><div className="marketing-card-body">{gaAvailable&&ga4.pages.length?<><div className="marketing-ranking-header"><span>Posição</span><span>Página</span><span>Caminho</span><span>Visualizações</span><span>Usuários</span></div><div className="marketing-ranking-list marketing-content-ranking">{ga4.pages.slice(0,10).map((item,index)=><article key={`${item.path}:${item.title}`}><span className="marketing-rank">{index+1}</span><div className="marketing-ranking-main"><strong>{item.title||item.path||'Página sem título'}</strong></div><div className="marketing-ranking-main"><small>{item.path||'—'}</small></div><div><strong>{item.pageviews===null?'INDISPONÍVEL':compact(item.pageviews)}</strong></div><div><strong>{item.users===null?'INDISPONÍVEL':compact(item.users)}</strong></div></article>)}</div></>:<Empty empty text={unavailable}/>}</div></section>

  <div className="marketing-analytics-grid marketing-analytics-reference">
   <Card title="Conversões persistidas" description="Submissões aceitas de formulários reais do Portal; zero aqui é zero medido no banco, não fallback.">{data?<div className="marketing-summary marketing-summary-reference"><p><span>Total no período</span><strong>{data.conversions.total}</strong><small>form_submissions aceitas</small></p>{data.conversions.forms.map(form=><p key={form.slug}><span>{form.name}</span><strong>{form.count}</strong><small>{form.purpose} · /{form.slug}</small></p>)}</div>:<Empty empty text="Carregando conversões persistidas."/>}</Card>
   <Card title="Últimas publicações" description="Conteúdo publicado e ativo no CMS.">{data?.editorial.latest.length?<div className="marketing-summary marketing-summary-reference">{data.editorial.latest.slice(0,8).map(item=><p key={item.id}><span>{item.pageTitle}</span><strong>{item.title}</strong><small>{item.publishedAt?new Date(item.publishedAt).toLocaleString('pt-BR'):'Data indisponível'} · /{item.pageSlug}/{item.slug}</small></p>)}</div>:<Empty empty text="Nenhuma publicação persistida disponível."/>}</Card>
  </div>
  <div className="marketing-empty"><FileText size={16}/><strong>Proveniência explícita</strong><p>GA4 = audiência; PostgreSQL editorial = estado do CMS; formulários = conversões registradas. Valores ausentes permanecem indisponíveis.</p></div>
 </>
}
