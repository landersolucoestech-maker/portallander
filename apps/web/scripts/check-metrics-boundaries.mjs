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
requireTokens('MetricsPage.tsx',metrics,["const TABS=[['geral','Visão Geral'],['site','Site'],['instagram','Instagram'],['tiktok','TikTok'],['youtube','YouTube']] as const","const INTERNAL_METRICS_RANGE:MetricsRange='30d'",'data-testid="metrics-page"','data-testid="metrics-site-content"','data-testid="metrics-site-conversions"','metrics-instagram-tab','metrics-tiktok-tab','metrics-youtube-tab'])
forbidTokens('MetricsPage.tsx',metrics,['Período global das métricas','O período é compartilhado entre todas as fontes.',"['social','Redes Sociais']","['conteudo','Conteúdo']","['conversoes','Conversões']",'/app/metricas/site','/app/metricas/social','/app/metricas/conteudo','/app/metricas/conversoes','/app/metrics/site','/app/metrics/social','/app/metrics/content','/app/metrics/conversions',"from '@portallander/mockup'",'128400','548200','48200','268000','415000'])
requireTokens('metricsClient.ts',client,['/api/metrics','loadDevelopmentMetricsOverview'])
forbidTokens('metricsClient.ts',client,["@portallander/mockup",'getMockupMetricsOverview'])
requireTokens('analytics/client.ts',analyticsClient,['loadDevelopmentMetricsOverview',"await import('@portallander/mockup')",'getMockupMetricsOverview'])
requireTokens('admin-entry.css',adminEntry,["@import './admin-metrics.css';"])
requireTokens('admin-metrics.css',metricsStyles,[
  '[data-testid="metrics-site-tab"]',
  '.marketing-metric-strip',
  'grid-template-columns:repeat(4,minmax(0,1fr))',
  '.marketing-analytics-grid',
  'grid-template-columns:repeat(2,minmax(0,1fr))',
  '.marketing-summary-reference p',
  'var(--ui-kpi-icon)',
  'var(--ui-card-gap)',
])

if(failures.length){console.error('Falha nos boundaries do módulo Métricas:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Metrics boundaries OK — módulo global em /app/metrics, rota única, cinco abas por fonte (Visão Geral, Site, Instagram, TikTok e YouTube), Site consolida editorial/conversões com KPIs 4x e cards analíticos responsivos padronizados, período interno canônico de 30 dias sem seletor manual, Marketing sem ownership, UI sem KPI de fixture e mockup mediado pelo adapter analítico.')
