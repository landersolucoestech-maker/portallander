import assert from 'node:assert/strict'
import test from 'node:test'
import {createMetricsService,resolveMetricsRange} from './metricsService.js'

const configuredEnv={GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'secret',GOOGLE_REFRESH_TOKEN:'refresh',GOOGLE_ANALYTICS_ACCOUNT_ID:'account',GOOGLE_ANALYTICS_PROPERTY_ID:'property',GOOGLE_ANALYTICS_TIMEZONE:'UTC'}
function row(metrics,dimensions=[]){return {dimensionValues:dimensions.map(value=>({value})),metricValues:metrics.map(value=>({value:String(value)}))}}
function gaFixture(overrides={}){return {
 runPortalOverview:async()=>({rows:[row([100,40,130,420,4.2,.62,75])]}),
 runAcquisition:async()=>({rows:[row([70,55],['Organic Search']),row([30,25],['Direct'])]}),
 runContentPerformance:async()=>({rows:[row([200,80],['/noticias/materia-real','Matéria real'])]}),
 runNewVsReturning:async()=>({rows:[row([60],['new']),row([40],['returning'])]}),
 ...overrides,
}}
function poolFixture(){return {async query(sql){
 if(sql.includes('group by status'))return {rows:[{status:'published',count:9},{status:'draft',count:3},{status:'archived',count:2}]}
 if(sql.includes("published_at >= $1::date"))return {rows:[{count:4}]}
 if(sql.includes('join editorial_pages'))return {rows:[{id:'content-1',title:'Matéria real',slug:'materia-real',status:'published',published_at:new Date('2026-09-01T12:00:00Z'),page_slug:'noticias',page_title:'Notícias'}]}
 if(sql.includes('form_submissions'))return {rows:[
  {slug:'contato-comercial',name:'Contato Comercial',purpose:'lead_capture',entry_context:'contato',count:2,leads_created:2,collaborations_created:0},
  {slug:'colabore-anuncie',name:'Colabore / Anuncie',purpose:'editorial_submission',entry_context:'colabore',count:3,leads_created:0,collaborations_created:3},
  {slug:'colabore-anuncie',name:'Colabore / Anuncie',purpose:'editorial_submission',entry_context:'anuncie',count:4,leads_created:0,collaborations_created:4},
 ]}
 throw new Error(`Unexpected SQL: ${sql}`)
}}}

test('canonical Metrics range supports presets, custom dates and rejects invalid ranges',()=>{
 assert.equal(resolveMetricsRange({range:'7d'},configuredEnv).days,7)
 assert.equal(resolveMetricsRange({range:'90d'},configuredEnv).days,90)
 const custom=resolveMetricsRange({range:'custom',startDate:'2026-08-01',endDate:'2026-08-31'},configuredEnv)
 assert.equal(custom.days,31)
 assert.throws(()=>resolveMetricsRange({range:'invalid'},configuredEnv),/Período de Métricas inválido/)
})

test('missing GA4 configuration stays unavailable while database metrics remain real',async()=>{
 const service=createMetricsService({env:{},pool:poolFixture(),cacheStore:new Map(),ga4Provider:{}})
 const result=await service.overview({range:'30d'})
 assert.equal(result.ga4.status,'unavailable')
 assert.equal(result.ga4.reason,'GA4_NOT_CONFIGURED')
 assert.deepEqual(result.editorial.counts,{published:9,drafts:3,archived:2,publishedInPeriod:4})
 assert.equal(result.conversions.total,9)
 assert.equal(result.conversions.leadsCreated,2)
 assert.equal(result.conversions.collaborationsCreated,7)
 assert.deepEqual(result.conversions.contexts,{contato:2,colabore:3,anuncie:4})
})

test('GA4 mapping preserves provider values, acquisition, pages and returning users',async()=>{
 const service=createMetricsService({env:configuredEnv,pool:poolFixture(),cacheStore:new Map(),ga4Provider:gaFixture()})
 const result=await service.overview({range:'7d'})
 assert.equal(result.ga4.status,'available')
 assert.equal(result.ga4.overview.users.value,100)
 assert.equal(result.ga4.overview.sessions.value,130)
 assert.equal(result.ga4.overview.pageviewsPerUser.value,4.2)
 assert.equal(result.ga4.overview.engagementRate.value,.62)
 assert.equal(result.ga4.returningUsers.value,40)
 assert.deepEqual(result.ga4.acquisition[0],{channel:'Organic Search',sessions:70,users:55})
 assert.equal(result.ga4.pages[0].path,'/noticias/materia-real')
 assert.equal(result.editorial.latest[0].slug,'materia-real')
})

test('GA4 overview failure is explicit and does not erase database metrics',async()=>{
 const failed=gaFixture({runPortalOverview:async()=>{const error=new Error('provider down');error.code='GA4_NETWORK_ERROR';throw error}})
 const service=createMetricsService({env:configuredEnv,pool:poolFixture(),cacheStore:new Map(),ga4Provider:failed})
 const result=await service.overview({range:'30d'})
 assert.equal(result.ga4.status,'error')
 assert.equal(result.ga4.reason,'GA4_NETWORK_ERROR')
 assert.equal(result.editorial.counts.published,9)
 assert.equal(result.conversions.total,9)
})

test('empty GA4 values remain null instead of synthetic zero',async()=>{
 const empty=gaFixture({runPortalOverview:async()=>({rows:[]}),runAcquisition:async()=>({rows:[]}),runContentPerformance:async()=>({rows:[]}),runNewVsReturning:async()=>({rows:[]})})
 const service=createMetricsService({env:configuredEnv,pool:poolFixture(),cacheStore:new Map(),ga4Provider:empty})
 const result=await service.overview({range:'30d'})
 assert.equal(result.ga4.overview.users.value,null)
 assert.equal(result.ga4.overview.users.status,'empty')
 assert.equal(result.ga4.returningUsers.value,null)
 assert.deepEqual(result.ga4.acquisition,[])
 assert.deepEqual(result.ga4.pages,[])
})
