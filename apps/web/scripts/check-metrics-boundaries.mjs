import {readFile} from 'node:fs/promises'
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const failures=[]
const requireTokens=(path,source,tokens)=>{for(const token of tokens)if(!source.includes(token))failures.push(`${path} deve preservar: ${token}`)}
const forbidTokens=(path,source,tokens)=>{for(const token of tokens)if(source.includes(token))failures.push(`${path} não pode conter: ${token}`)}

const app=await read('src/app/InternalApp.tsx')
const nav=await read('src/shared/internal/adminNavigation.ts')
const marketing=await read('src/features/marketing/MarketingPage.tsx')
const metrics=await read('src/features/analytics/MetricsPage.tsx')
const client=await read('src/features/analytics/metricsClient.ts')
const analyticsClient=await read('src/features/analytics/client.ts')

requireTokens('InternalApp.tsx',app,["../features/analytics/MetricsPage",'path="/app/metricas"','path="/app/marketing/metricas"','LegacyMetricsRedirect'])
requireTokens('adminNavigation.ts',nav,["['Métricas',BarChart3,'/app/metricas']"])
forbidTokens('adminNavigation.ts',nav,["['Métricas',BarChart3,'/app/marketing/metricas']"])
forbidTokens('MarketingPage.tsx',marketing,['MarketingMetrics','/app/marketing/metricas'])
requireTokens('MetricsPage.tsx',metrics,['Visão Geral','Site','Redes Sociais','Conteúdo','Conversões','data-testid="metrics-page"','Período global das métricas'])
forbidTokens('MetricsPage.tsx',metrics,['/app/metricas/site','/app/metricas/social','/app/metricas/conteudo','/app/metricas/conversoes',"from '@portallander/mockup'",'128400','548200','48200','268000','415000'])
requireTokens('metricsClient.ts',client,['/api/metrics','loadDevelopmentMetricsOverview'])
forbidTokens('metricsClient.ts',client,["@portallander/mockup",'getMockupMetricsOverview'])
requireTokens('analytics/client.ts',analyticsClient,['loadDevelopmentMetricsOverview',"await import('@portallander/mockup')",'getMockupMetricsOverview'])

if(failures.length){console.error('Falha nos boundaries do módulo Métricas:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Metrics boundaries OK — módulo global, rota única, cinco abas internas, Marketing sem ownership, UI sem KPI de fixture e mockup mediado pelo adapter analítico.')
