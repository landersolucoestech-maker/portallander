import assert from 'node:assert/strict'
import test from 'node:test'
import {createMarketingMetricsService,resolveMarketingMetricsRange} from './marketingMetricsService.js'

const configuredEnv={GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'secret',GOOGLE_REFRESH_TOKEN:'refresh',GOOGLE_ANALYTICS_ACCOUNT_ID:'account',GOOGLE_ANALYTICS_PROPERTY_ID:'property',GOOGLE_ANALYTICS_TIMEZONE:'UTC'}
function poolFixture(){return {async query(sql){
 if(sql.includes('group by status'))return {rows:[{status:'published',count:9},{status:'draft',count:3},{status:'archived',count:2}]}
 if(sql.includes("published_at >= $1::date"))return {rows:[{count:4}]}
 if(sql.includes('join editorial_pages'))return {rows:[{id:'content-1',title:'Matéria real',slug:'materia-real',status:'published',published_at:new Date('2026-09-01T12:00:00Z'),page_slug:'noticias',page_title:'Notícias'}]}
 if(sql.includes('form_submissions'))return {rows:[{slug:'contato',name:'Contato',purpose:'contact',count:2},{slug:'colabore',name:'Colabore',purpose:'editorial_submission',count:1}]}
 throw new Error(`Unexpected SQL: ${sql}`)
}}}
function row(metrics,dimensions=[]){return {dimensionValues:dimensions.map(value=>({value})),metricValues:metrics.map(value=>({value:String(value)}))}}
function gaFixture(overrides={}){return {
 runPortalOverview:async()=>({rows:[row([100,40,130,420,4.2,.62,75])]}),
 runAcquisition:async()=>({rows:[row([70,55],['Organic Search']),row([30,25],['Direct'])]}),
 runContentPerformance:async()=>({rows:[row([200,80],['/noticias/materia-real','Matéria real'])]}),
 runNewVsReturning:async()=>({rows:[row([60],['new']),row([40],['returning'])]}),
 ...overrides,
}}

test('marketing range resolves presets and custom dates',()=>{
 const seven=resolveMarketingMetricsRange({range:'7d'},configuredEnv)
 assert.equal(seven.days,7)
 const custom=resolveMarketingMetricsRange({range:'custom',startDate:'2026-08-01',endDate:'2026-08-31'},configuredEnv)
 assert.equal(custom.days,31)
 assert.throws(()=>resolveMarketingMetricsRange({range:'invalid'},configuredEnv),/Período de Métricas inválido/)
})

test('missing GA4 configuration stays unavailable while database metrics remain real',async()=>{
 const service=createMarketingMetricsService({env:{},pool:poolFixture(),cacheStore:new Map(),ga4Provider:{}})
 const result=await service.overview({range:'30d'})
 assert.equal(result.ga4.status,'unavailable')
 assert.equal(result.ga4.reason,'GA4_NOT_CONFIGURED')
 assert.deepEqual(result.editorial.counts,{published:9,drafts:3,archived:2,publishedInPeriod:4})
 assert.equal(result.conversions.total,3)
})

test('GA4 mapping preserves provider values, acquisition, pages and returning users',async()=>{
 const service=createMarketingMetricsService({env:configuredEnv,pool:poolFixture(),cacheStore:new Map(),ga4Provider:gaFixture()})
 const result=await service.overview({range:'7d'})
 assert.equal(result.ga4.status,'available')
 assert.equal(result.ga4.overview.users.value,100)
 assert.equal(result.ga4.overview.sessions.value,130)
 assert.equal(result.ga4.overview.pageviewsPerUser.value,4.2)
 assert.equal(result.ga4.overview.engagementRate.value,.62)
 assert.equal(result.ga4.returningUsers.value,40)
 assert.deepEqual(result.ga4.acquisition[0],{channel:'Organic Search',sessions:70,users:55})
 assert.equal(result.ga4.pages[0].path,'/noticias/materia-real')
})

test('GA4 overview failure is explicit and does not erase database metrics',async()=>{
 const failed=gaFixture({runPortalOverview:async()=>{const error=new Error('provider down');error.code='GA4_NETWORK_ERROR';throw error}})
 const service=createMarketingMetricsService({env:configuredEnv,pool:poolFixture(),cacheStore:new Map(),ga4Provider:failed})
 const result=await service.overview({range:'30d'})
 assert.equal(result.ga4.status,'error')
 assert.equal(result.ga4.reason,'GA4_NETWORK_ERROR')
 assert.equal(result.editorial.counts.published,9)
 assert.equal(result.conversions.total,3)
})

test('empty GA4 values remain null instead of synthetic zero',async()=>{
 const empty=gaFixture({runPortalOverview:async()=>({rows:[]}),runAcquisition:async()=>({rows:[]}),runContentPerformance:async()=>({rows:[]}),runNewVsReturning:async()=>({rows:[]})})
 const service=createMarketingMetricsService({env:configuredEnv,pool:poolFixture(),cacheStore:new Map(),ga4Provider:empty})
 const result=await service.overview({range:'30d'})
 assert.equal(result.ga4.overview.users.value,null)
 assert.equal(result.ga4.overview.users.status,'empty')
 assert.equal(result.ga4.returningUsers.value,null)
})
