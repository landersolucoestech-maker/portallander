import {readFile} from 'node:fs/promises'
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const failures=[]
const requireTokens=(path,source,tokens)=>{for(const token of tokens)if(!source.includes(token))failures.push(`${path} deve preservar: ${token}`)}
const forbidTokens=(path,source,tokens)=>{for(const token of tokens)if(source.includes(token))failures.push(`${path} não pode conter: ${token}`)}

const app=await read('src/app/InternalApp.tsx')
const nav=await read('src/shared/internal/adminNavigation.ts')
const marketing=await read('src/modules/marketing/MarketingPage.tsx')
const marketingMetrics=await read('src/modules/marketing/pages/MarketingMetrics.tsx')
const metrics=await read('src/modules/analytics/MetricsPage.tsx')
const client=await read('src/modules/analytics/metricsClient.ts')
const analyticsClient=await read('src/modules/analytics/client.ts')
const adminEntry=await read('src/styles/admin-entry.css')
const metricsStyles=await read('src/styles/admin-metrics.css')

requireTokens('InternalApp.tsx',app,["../modules/analytics/MetricsPage",'path="/app/metrics"'])
forbidTokens('InternalApp.tsx',app,['path="/app/metricas"','path="/app/marketing/metricas"','path="/app/marketing/metrics"','LegacyMetricsRedirect'])
requireTokens('adminNavigation.ts',nav,["['Métricas',BarChart3,'/app/metrics']"])
forbidTokens('adminNavigation.ts',nav,["['Métricas',BarChart3,'/app/metricas']","['Métricas',BarChart3,'/app/marketing/metricas']","['Métricas',BarChart3,'/app/marketing/metrics']"])
forbidTokens('MarketingPage.tsx',marketing,['MarketingMetrics','/app/marketing/metricas','/app/marketing/metrics'])

requireTokens('MetricsPage.tsx',metrics,[
  "const TABS=[['geral','Visão Geral'],['site','Site'],['instagram','Instagram'],['tiktok','TikTok'],['youtube','YouTube']] as const",
  "const INTERNAL_METRICS_RANGE:MetricsRange='30d'",
  'data-testid="metrics-page"',
  'data-testid="metrics-site-tab"',
  'testId="metrics-site-analytics"',
  'testId="metrics-site-content"',
  'testId="metrics-site-conversions"',
  'function MetricsSection(',
  'function MetricsKpiGrid(',
  'function MetricsCard(',
  'function MetricsRows(',
  'className="metrics-overview-grid"',
  'className="metrics-kpi-grid"',
  'className="metrics-card-grid"',
  'MetricsCard title="Comportamento"',
  'MetricsCard title="Estado editorial"',
  'MetricsCard title="Resultados"',
  'className="metrics-social-source"',
  'embeddedAdmin',
  'metrics-instagram-tab',
  'metrics-tiktok-tab',
  'metrics-youtube-tab',
])
forbidTokens('MetricsPage.tsx',metrics,[
  'Período global das métricas',
  'O período é compartilhado entre todas as fontes.',
  "['social','Redes Sociais']",
  "['conteudo','Conteúdo']",
  "['conversoes','Conversões']",
  '/app/metricas/site',
  '/app/metricas/social',
  '/app/metricas/conteudo',
  '/app/metricas/conversoes',
  '/app/metrics/site',
  '/app/metrics/social',
  '/app/metrics/content',
  '/app/metrics/conversions',
  "from '@portallander/mockup'",
  '128400','548200','48200','268000','415000',
  'function MetricStrip(',
  'marketing-metric-strip marketing-metric-strip-exact',
  'marketing-analytics-grid marketing-analytics-reference',
  'content_collaborations',
  'entryContext',
  'newVsReturning',
  'Views / usuário',
  'UNAVAILABLE —',
])

const siteTabStart=metrics.indexOf('function SiteTab(')
const siteTabEnd=metrics.indexOf('function SourceTab(',siteTabStart)
const siteTab=siteTabStart>=0&&siteTabEnd>siteTabStart?metrics.slice(siteTabStart,siteTabEnd):''
const siteKpiCalls=siteTab.match(/<MetricsKpiGrid\b/g)?.length??0
if(siteKpiCalls!==1)failures.push(`MetricsPage.tsx deve possuir exatamente uma faixa de KPIs na aba Site; encontrado: ${siteKpiCalls}`)
const firstKpi=siteTab.indexOf('<MetricsKpiGrid')
const firstSection=siteTab.indexOf('<MetricsSection')
if(firstKpi<0||firstSection<0||firstKpi>firstSection)failures.push('MetricsPage.tsx deve manter a única faixa de KPIs antes de qualquer TableView/seção analítica')

requireTokens('MarketingMetrics.tsx',marketingMetrics,[
  'embeddedAdmin?:boolean',
  'if(embeddedAdmin)',
  'className="metrics-social"',
  'className="metrics-kpi-grid"',
  'className="metrics-section metrics-social-section"',
  'Indicadores complementares',
  'Comparação com período anterior',
  'Conteúdo vinculado',
  'Sem conteúdo com vínculo analítico comprovado neste período.',
])
const embeddedStart=marketingMetrics.indexOf('if(embeddedAdmin)')
const embeddedEnd=marketingMetrics.indexOf('const maxReach',embeddedStart)
const embeddedSocial=embeddedStart>=0&&embeddedEnd>embeddedStart?marketingMetrics.slice(embeddedStart,embeddedEnd):''
forbidTokens('MarketingMetrics.tsx [embeddedAdmin]',embeddedSocial,[
  'marketing-performance-chart',
  'marketing-metric-strip',
  'marketing-analytics-grid',
  'marketing-ranking',
  'UNAVAILABLE —',
])
const embeddedKpis=embeddedSocial.match(/<AdminKpi\b/g)?.length??0
if(embeddedKpis!==1)failures.push(`MarketingMetrics.tsx deve renderizar a faixa social por um único map de AdminKpi; encontrado: ${embeddedKpis}`)

requireTokens('metricsClient.ts',client,['/api/metrics','loadDevelopmentMetricsOverview'])
forbidTokens('metricsClient.ts',client,["@portallander/mockup",'getMockupMetricsOverview'])
requireTokens('analytics/client.ts',analyticsClient,['loadDevelopmentMetricsOverview',"await import('@portallander/mockup')",'getMockupMetricsOverview'])
requireTokens('admin-entry.css',adminEntry,["@import './admin-metrics.css';"])
requireTokens('admin-metrics.css',metricsStyles,[
  '.metrics-page',
  'font-family:var(--ui-font)',
  '.metrics-overview-grid',
  '.metrics-section',
  '.metrics-section-head',
  '.metrics-kpi-grid',
  'grid-template-columns:repeat(4,minmax(0,1fr))',
  '.metrics-kpi-grid .admin-kpi',
  'position:relative',
  'justify-content:flex-start',
  '.metrics-kpi-grid .admin-kpi-top',
  'padding-right:calc(var(--ui-kpi-icon) + var(--ui-space-2))',
  '.metrics-kpi-grid .admin-kpi-icon',
  'position:absolute',
  '.metrics-card-grid',
  'grid-template-columns:repeat(2,minmax(0,1fr))',
  '.metrics-card',
  '.metrics-row',
  'min-height:56px',
  '.metrics-social',
  'var(--ui-kpi-icon)',
  'var(--ui-kpi-gap)',
  'var(--ui-card-gap)',
])
forbidTokens('admin-metrics.css',metricsStyles,['marketing-metric-strip','marketing-card','marketing-summary','marketing-performance-chart'])
if(/\.metrics-kpi-grid \.admin-kpi-top\{[^}]*height:var\(--ui-kpi-icon\)/s.test(metricsStyles))failures.push('admin-metrics.css não pode reservar a altura inteira do ícone dentro do fluxo vertical do KPI; isso recorta valor/detalhe no card canônico de 104px')

if(failures.length){console.error('Falha nos boundaries do módulo Métricas:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Metrics boundaries OK — Visão Geral, Site, Instagram, TikTok e YouTube compartilham grid 4-KPI, cards 2x, tipografia, rows e espaçamento; KPI reserva o ícone fora do fluxo vertical para não recortar valor/detalhe; Site mantém KPIs apenas no topo e canais sociais não usam o painel antigo de gráfico/barra única.')