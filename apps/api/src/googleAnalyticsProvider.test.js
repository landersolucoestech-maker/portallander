import test from 'node:test'
import assert from 'node:assert/strict'
import {GA4_METRIC_MAPPINGS,createGoogleAnalyticsProvider,ga4DayPeriod,googleAnalyticsConfig,normalizeGa4Range} from './googleAnalyticsProvider.js'

const env={GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'secret',GOOGLE_REFRESH_TOKEN:'refresh',GOOGLE_ANALYTICS_ACCOUNT_ID:'account',GOOGLE_ANALYTICS_PROPERTY_ID:'property',GOOGLE_ANALYTICS_TIMEZONE:'America/Sao_Paulo'}
const response=(status,payload)=>({ok:status>=200&&status<300,status,async json(){return payload}})

test('GA4 config never becomes configured without explicit timezone and account/property boundary',()=>{
  assert.equal(googleAnalyticsConfig({GOOGLE_CLIENT_ID:'c',GOOGLE_CLIENT_SECRET:'s',GOOGLE_REFRESH_TOKEN:'r',GOOGLE_ANALYTICS_ACCOUNT_ID:'a',GOOGLE_ANALYTICS_PROPERTY_ID:'p'}).configured,false)
  assert.equal(googleAnalyticsConfig({GOOGLE_CLIENT_ID:'c',GOOGLE_CLIENT_SECRET:'s',GOOGLE_REFRESH_TOKEN:'r',GOOGLE_ANALYTICS_ACCOUNT_ID:'a',GOOGLE_ANALYTICS_PROPERTY_ID:'p',GOOGLE_ANALYTICS_TIMEZONE:'America/Sao_Paulo'}).configured,true)
})

test('GA4 sync range is bounded, ordered and calendar-valid',()=>{
  assert.deepEqual(normalizeGa4Range({startDate:'2026-08-01',endDate:'2026-08-31'}),{startDate:'2026-08-01',endDate:'2026-08-31',days:31})
  assert.deepEqual(normalizeGa4Range({startDate:'2028-02-29',endDate:'2028-02-29'}),{startDate:'2028-02-29',endDate:'2028-02-29',days:1})
  assert.throws(()=>normalizeGa4Range({startDate:'2026-08-31',endDate:'2026-08-01'}),error=>error?.code==='GA4_RANGE_INVALID')
  assert.throws(()=>normalizeGa4Range({startDate:'2026-07-01',endDate:'2026-08-31'}),error=>error?.code==='GA4_RANGE_TOO_LARGE')
  assert.throws(()=>normalizeGa4Range({startDate:'2026-02-29',endDate:'2026-03-01'}),error=>error?.code==='GA4_DATE_INVALID')
})

test('GA4 daily boundaries preserve configured property timezone and UTC day identity',()=>{
  const period=ga4DayPeriod('2026-08-01','America/Sao_Paulo')
  assert.equal(period.periodStart.toISOString(),'2026-08-01T03:00:00.000Z')
  assert.equal(period.periodEnd.toISOString(),'2026-08-02T03:00:00.000Z')
  const monthStart=ga4DayPeriod('2026-09-01','America/Sao_Paulo')
  assert.equal(monthStart.periodStart.toISOString(),'2026-09-01T03:00:00.000Z')
  const utc=ga4DayPeriod('2026-09-01','UTC')
  assert.equal(utc.periodStart.toISOString(),'2026-09-01T00:00:00.000Z')
  assert.equal(utc.periodEnd.toISOString(),'2026-09-02T00:00:00.000Z')
})

test('GA4 provider metrics map explicitly instead of collapsing unlike concepts',()=>{
  assert.deepEqual(GA4_METRIC_MAPPINGS.map(item=>[item.providerMetric,item.metricKey]),[
    ['activeUsers','active_users'],['newUsers','new_users'],['sessions','sessions'],['screenPageViews','pageviews'],['engagedSessions','engaged_sessions'],['engagementRate','engagement_rate'],
  ])
})

test('GA4 transport performs token exchange then parses runReport shape without exposing credentials',async()=>{
  const calls=[]
  const provider=createGoogleAnalyticsProvider({env,fetchImpl:async(url,init)=>{
    calls.push({url:String(url),authorization:init?.headers?.Authorization||null,body:String(init?.body||'')})
    if(String(url).includes('oauth2.googleapis.com'))return response(200,{access_token:'test-access-token'})
    return response(200,{metricHeaders:[{name:'sessions'}],rows:[{dimensionValues:[{value:'20260901'}],metricValues:[{value:'1'},{value:'2'},{value:'3'},{value:'4'},{value:'5'},{value:'0.5'}]}]})
  }})
  const report=await provider.runDailyReport({startDate:'2026-09-01',endDate:'2026-09-01'})
  assert.equal(report.rows.length,1)
  assert.equal(report.accountId,'account')
  assert.equal(report.propertyId,'property')
  assert.equal(calls.length,2)
  assert.match(calls[0].body,/grant_type=refresh_token/)
  assert.equal(calls[1].authorization,'Bearer test-access-token')
})

test('GA4 returns an empty report as a valid zero-row provider response',async()=>{
  const provider=createGoogleAnalyticsProvider({env,fetchImpl:async url=>String(url).includes('oauth2.googleapis.com')?response(200,{access_token:'token'}):response(200,{rows:[]})})
  const report=await provider.runDailyReport({startDate:'2026-09-01',endDate:'2026-09-01'})
  assert.deepEqual(report.rows,[])
})

test('GA4 rejects malformed OAuth token responses',async()=>{
  const provider=createGoogleAnalyticsProvider({env,fetchImpl:async()=>response(200,{})})
  await assert.rejects(()=>provider.runDailyReport({startDate:'2026-09-01',endDate:'2026-09-01'}),error=>error?.code==='GA4_TOKEN_RESPONSE_INVALID')
})

for(const status of [401,403,429,500])test(`GA4 normalizes provider HTTP ${status}`,async()=>{
  let call=0
  const provider=createGoogleAnalyticsProvider({env,fetchImpl:async()=>{call+=1;return call===1?response(200,{access_token:'token'}):response(status,{error:{message:`provider-${status}`}})}})
  await assert.rejects(()=>provider.runDailyReport({startDate:'2026-09-01',endDate:'2026-09-01'}),error=>error?.code==='GA4_REQUEST_FAILED'&&error?.details?.providerStatus===status)
})

test('GA4 normalizes timeout and network failures without credential leakage',async()=>{
  const timeoutProvider=createGoogleAnalyticsProvider({env,fetchImpl:async()=>{const error=new Error('timed out');error.name='TimeoutError';throw error}})
  await assert.rejects(()=>timeoutProvider.runDailyReport({startDate:'2026-09-01',endDate:'2026-09-01'}),error=>error?.code==='GA4_TIMEOUT'&&!String(error?.message).includes('secret'))
  const networkProvider=createGoogleAnalyticsProvider({env,fetchImpl:async()=>{throw new Error('socket failed')}})
  await assert.rejects(()=>networkProvider.runDailyReport({startDate:'2026-09-01',endDate:'2026-09-01'}),error=>error?.code==='GA4_NETWORK_ERROR'&&!String(error?.message).includes('refresh'))
})
