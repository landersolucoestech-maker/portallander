import {readFile} from 'node:fs/promises'
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const failures=[]
const requireTokens=(path,source,tokens)=>{for(const token of tokens)if(!source.includes(token))failures.push(`${path} deve preservar: ${token}`)}
const forbidTokens=(path,source,tokens)=>{for(const token of tokens)if(source.includes(token))failures.push(`${path} não pode conter: ${token}`)}

const app=await read('src/app/InternalApp.tsx')
const nav=await read('src/shared/internal/adminNavigation.ts')
const marketing=await read('src/modules/marketing/MarketingPage.tsx')
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
  'function SiteSection(',
  'function SiteKpiGrid(',
  'function SiteCard(',
  'function SiteRows(',
  'className="metrics-site-kpis"',
  'className="metrics-site-card-grid"',
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
  'content_collaborations',
  'entryContext',
  'newVsReturning',
  'Views / usuário',
  'UNAVAILABLE —',
])
requireTokens('metricsClient.ts',client,['/api/metrics','loadDevelopmentMetricsOverview'])
forbidTokens('metricsClient.ts',client,["@portallander/mockup",'getMockupMetricsOverview'])
requireTokens('analytics/client.ts',analyticsClient,['loadDevelopmentMetricsOverview',"await import('@portallander/mockup')",'getMockupMetricsOverview'])
requireTokens('admin-entry.css',adminEntry,["@import './admin-metrics.css';"])
requireTokens('admin-metrics.css',metricsStyles,[
  '.metrics-page',
  'font-family:var(--ui-font)',
  '.metrics-site-section',
  '.metrics-site-section-head',
  '.metrics-site-kpis',
  'grid-template-columns:repeat(4,minmax(0,1fr))',
  '.metrics-site-card-grid',
  'grid-template-columns:repeat(2,minmax(0,1fr))',
  '.metrics-site-card',
  '.metrics-site-row',
  'min-height:56px',
  'var(--ui-kpi-icon)',
  'var(--ui-kpi-gap)',
  'var(--ui-card-gap)',
])
forbidTokens('admin-metrics.css',metricsStyles,['marketing-metric-strip','marketing-card','marketing-summary'])

if(failures.length){console.error('Falha nos boundaries do módulo Métricas:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Metrics boundaries OK — módulo global em /app/metrics, cinco abas por fonte e aba Site com superfície própria: três seções claras, AdminKpi canônico, tipografia Montserrat, grade 4/2/1 responsiva, cards 2/1 colunas, rows de 56px e sem jargão técnico ou componentes visuais herdados de Marketing.')
