import assert from 'node:assert/strict'
import {analyticsService} from '../src/analyticsService.js'
import {createGoogleAnalyticsProvider} from '../src/googleAnalyticsProvider.js'
import {createGoogleAnalyticsSyncService} from '../src/googleAnalyticsSyncService.js'
import {getPool} from '../src/db.js'

const pool=getPool()
const env={GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'secret',GOOGLE_REFRESH_TOKEN:'refresh',GOOGLE_ANALYTICS_ACCOUNT_ID:'sim-account',GOOGLE_ANALYTICS_PROPERTY_ID:'sim-property',GOOGLE_ANALYTICS_TIMEZONE:'America/Sao_Paulo'}
const response=(status,payload)=>({ok:status>=200&&status<300,status,async json(){return payload}})
const validRows=[{dimensionValues:[{value:'20260901'}],metricValues:[{value:'10'},{value:'2'},{value:'7'},{value:'14'},{value:'5'},{value:'0.5'}]}]

function providerFor(payload){let calls=0;return createGoogleAnalyticsProvider({env,fetchImpl:async()=>{calls+=1;return calls%2===1?response(200,{access_token:'simulation-token'}):response(200,payload)}})}
const configResolver=()=>({...env,clientId:env.GOOGLE_CLIENT_ID,clientSecret:env.GOOGLE_CLIENT_SECRET,refreshToken:env.GOOGLE_REFRESH_TOKEN,accountId:env.GOOGLE_ANALYTICS_ACCOUNT_ID,propertyId:env.GOOGLE_ANALYTICS_PROPERTY_ID,timezone:env.GOOGLE_ANALYTICS_TIMEZONE,configured:true})

try{
  await pool.query(`delete from analytics_metrics where provider='google-analytics' and provider_account_id='sim-account'`)
  await pool.query(`delete from analytics_raw_metrics where provider='google-analytics' and provider_account_id='sim-account'`)
  await pool.query(`delete from analytics_sync_runs where provider='google-analytics' and provider_account_id='sim-account'`)

  const syncService=createGoogleAnalyticsSyncService({provider:providerFor({rows:validRows}),analytics:analyticsService,configResolver})
  const first=await syncService.syncRange({startDate:'2026-09-01',endDate:'2026-09-01'})
  assert.equal(first.processed,6)
  assert.equal(first.sync.status,'succeeded')
  let counts=(await pool.query(`select (select count(*)::int from analytics_raw_metrics where provider_account_id='sim-account') raw_count,(select count(*)::int from analytics_metrics where provider_account_id='sim-account') normalized_count`)).rows[0]
  assert.deepEqual(counts,{raw_count:6,normalized_count:6})

  const retryService=createGoogleAnalyticsSyncService({provider:providerFor({rows:validRows}),analytics:analyticsService,configResolver})
  const second=await retryService.syncRange({startDate:'2026-09-01',endDate:'2026-09-01'})
  assert.equal(second.processed,6)
  counts=(await pool.query(`select (select count(*)::int from analytics_raw_metrics where provider_account_id='sim-account') raw_count,(select count(*)::int from analytics_metrics where provider_account_id='sim-account') normalized_count`)).rows[0]
  assert.deepEqual(counts,{raw_count:6,normalized_count:6})

  const emptyService=createGoogleAnalyticsSyncService({provider:providerFor({rows:[]}),analytics:analyticsService,configResolver})
  const empty=await emptyService.syncRange({startDate:'2026-09-02',endDate:'2026-09-02'})
  assert.equal(empty.processed,0)
  assert.equal(empty.sync.status,'succeeded')

  const malformedService=createGoogleAnalyticsSyncService({provider:providerFor({rows:[{dimensionValues:[{value:'bad-date'}],metricValues:validRows[0].metricValues}]}),analytics:analyticsService,configResolver})
  await assert.rejects(()=>malformedService.syncRange({startDate:'2026-09-03',endDate:'2026-09-03'}),error=>error?.code==='GA4_RESPONSE_DATE_INVALID')
  const malformedRun=(await pool.query(`select status,error from analytics_sync_runs where provider_account_id='sim-account' order by started_at desc limit 1`)).rows[0]
  assert.equal(malformedRun.status,'failed')
  assert.match(malformedRun.error,/dimensão date inválida/)

  const databaseFailureAnalytics={...analyticsService,async upsertRawMetric(){throw new Error('simulated database write failure')}}
  const dbFailureService=createGoogleAnalyticsSyncService({provider:providerFor({rows:validRows}),analytics:databaseFailureAnalytics,configResolver})
  await assert.rejects(()=>dbFailureService.syncRange({startDate:'2026-09-04',endDate:'2026-09-04'}),/simulated database write failure/)
  const failedDbRun=(await pool.query(`select status,error from analytics_sync_runs where provider_account_id='sim-account' order by started_at desc limit 1`)).rows[0]
  assert.equal(failedDbRun.status,'failed')
  assert.match(failedDbRun.error,/simulated database write failure/)

  console.log(JSON.stringify({ga4Simulation:'PASS',firstProcessed:first.processed,retryProcessed:second.processed,rawCountAfterRetry:counts.raw_count,normalizedCountAfterRetry:counts.normalized_count,emptyReportStatus:empty.sync.status,malformedPayloadRun:malformedRun.status,databaseFailureRun:failedDbRun.status}))
}finally{
  await pool.end()
}
