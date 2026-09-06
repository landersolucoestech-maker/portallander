import assert from 'node:assert/strict'
import test from 'node:test'
import {createMetricsService,resolveMetricsRange} from './metricsService.js'

const configuredEnv={GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'secret',GOOGLE_REFRESH_TOKEN:'refresh',GOOGLE_ANALYTICS_ACCOUNT_ID:'account',GOOGLE_ANALYTICS_PROPERTY_ID:'property',GOOGLE_ANALYTICS_TIMEZONE:'UTC'}
function row(metrics,dimensions=[]){return {dimensionValues:dimensions.map(value=>({value})),metricValues:metrics.map(value=>({value:String(value)}))}}
const gaFixture={runPortalOverview:async()=>({rows:[row([100,40,130,420,4.2,.62,75])]}),runAcquisition:async()=>({rows:[]}),runContentPerformance:async()=>({rows:[]}),runNewVsReturning:async()=>({rows:[row([40],['returning'])]})}
function poolFixture(){return {async query(sql){
 if(sql.includes('group by status'))return {rows:[{status:'published',count:9},{status:'draft',count:3},{status:'archived',count:2}]}
 if(sql.includes("published_at >= $1::date"))return {rows:[{count:4}]}
 if(sql.includes('join editorial_pages'))return {rows:[]}
 if(sql.includes('form_submissions'))return {rows:[
  {slug:'contato-comercial',name:'Contato Comercial',purpose:'lead_capture',entry_context:'contato',count:2,leads_created:2,collaborations_created:0},
  {slug:'colabore-anuncie',name:'Colabore / Anuncie',purpose:'editorial_submission',entry_context:'colabore',count:3,leads_created:0,collaborations_created:3},
  {slug:'colabore-anuncie',name:'Colabore / Anuncie',purpose:'editorial_submission',entry_context:'anuncie',count:4,leads_created:0,collaborations_created:4},
 ]}
 throw new Error(`Unexpected SQL: ${sql}`)
}}}

test('canonical Metrics range supports shared page presets',()=>{
 assert.equal(resolveMetricsRange({range:'7d'},configuredEnv).days,7)
 assert.equal(resolveMetricsRange({range:'90d'},configuredEnv).days,90)
})

test('canonical Metrics service derives conversion contexts from the existing two-form pipeline',async()=>{
 const result=await createMetricsService({env:configuredEnv,pool:poolFixture(),cacheStore:new Map(),ga4Provider:gaFixture}).overview({range:'30d'})
 assert.equal(result.conversions.total,9)
 assert.equal(result.conversions.leadsCreated,2)
 assert.equal(result.conversions.collaborationsCreated,7)
 assert.deepEqual(result.conversions.contexts,{contato:2,colabore:3,anuncie:4})
 assert.equal(result.ga4.overview.users.value,100)
})

test('canonical Metrics service never fabricates GA4 when provider is not configured',async()=>{
 const result=await createMetricsService({env:{},pool:poolFixture(),cacheStore:new Map(),ga4Provider:{}}).overview({range:'30d'})
 assert.equal(result.ga4.status,'unavailable')
 assert.equal(result.ga4.reason,'GA4_NOT_CONFIGURED')
})
