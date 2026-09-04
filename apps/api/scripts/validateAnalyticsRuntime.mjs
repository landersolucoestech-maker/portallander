import assert from 'node:assert/strict'
import {analyticsService} from '../src/analyticsService.js'
import {createGoogleAnalyticsProvider} from '../src/googleAnalyticsProvider.js'
import {createGoogleAnalyticsSyncService} from '../src/googleAnalyticsSyncService.js'
import {getPool} from '../src/db.js'

const pool=getPool()
const periodStart='2026-09-01T03:00:00.000Z'
const periodEnd='2026-09-02T03:00:00.000Z'
const sourceReference='runtime:ga4:prop-test:20260901:sessions'
const response=(status,payload)=>({ok:status>=200&&status<300,status,async json(){return payload}})

try{
  await pool.query(`delete from analytics_metrics where source_reference like 'runtime:%' or provider_account_id='sim-account'`)
  await pool.query(`delete from analytics_raw_metrics where source_reference like 'runtime:%' or provider_account_id='sim-account'`)
  await pool.query(`delete from analytics_sync_runs where metadata->>'validation'='analytics-runtime' or provider_account_id='sim-account'`)

  const firstSync=await analyticsService.beginSync({provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',metadata:{validation:'analytics-runtime'}})
  const firstRaw=await analyticsService.upsertRawMetric({syncId:firstSync.id,provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',providerMetric:'sessions',value:10,periodStart,periodEnd,granularity:'day',timezone:'America/Sao_Paulo',sourceReference,collectedAt:'2026-09-02T04:00:00Z'})
  const firstMetric=await analyticsService.upsertMetric({rawMetricId:firstRaw.id,syncId:firstSync.id,metricKey:'sessions',value:10,provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',periodStart,periodEnd,granularity:'day',timezone:'America/Sao_Paulo',sourceType:'provider',sourceReference,dataStatus:'LIVE',freshnessStatus:'FRESH',provenance:{validation:'analytics-runtime'}})
  await analyticsService.finishSync(firstSync.id,{status:'succeeded',recordsImported:1})
  assert.equal(firstMetric.value,10)
  assert.equal(firstMetric.dataStatus,'LIVE')
  assert.equal(firstMetric.freshnessStatus,'FRESH')
  assert.equal(firstMetric.provenance.validation,'analytics-runtime')

  let counts=(await pool.query(`select (select count(*)::int from analytics_raw_metrics where source_reference=$1) raw_count,(select count(*)::int from analytics_metrics where source_reference=$1) metric_count`,[sourceReference])).rows[0]
  assert.deepEqual(counts,{raw_count:1,metric_count:1})

  const secondSync=await analyticsService.beginSync({provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',retryCount:1,metadata:{validation:'analytics-runtime'}})
  const secondRaw=await analyticsService.upsertRawMetric({syncId:secondSync.id,provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',providerMetric:'sessions',value:20,periodStart,periodEnd,granularity:'day',timezone:'America/Sao_Paulo',sourceReference,collectedAt:'2026-09-02T05:00:00Z'})
  const secondMetric=await analyticsService.upsertMetric({rawMetricId:secondRaw.id,syncId:secondSync.id,metricKey:'sessions',value:20,provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',periodStart,periodEnd,granularity:'day',timezone:'America/Sao_Paulo',sourceType:'provider',sourceReference,dataStatus:'LIVE',freshnessStatus:'FRESH',provenance:{validation:'analytics-runtime',retry:true}})
  await analyticsService.finishSync(secondSync.id,{status:'succeeded',recordsUpdated:1})
  assert.equal(firstRaw.id,secondRaw.id)
  assert.equal(secondMetric.id,firstMetric.id)
  assert.equal(secondMetric.value,20)
  assert.equal(secondMetric.provenance.retry,true)
  counts=(await pool.query(`select (select count(*)::int from analytics_raw_metrics where source_reference=$1) raw_count,(select count(*)::int from analytics_metrics where source_reference=$1) metric_count`,[sourceReference])).rows[0]
  assert.deepEqual(counts,{raw_count:1,metric_count:1})

  await analyticsService.upsertMetric({metricKey:'sessions',value:0,provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',periodStart:'2026-09-02T03:00:00Z',periodEnd:'2026-09-03T03:00:00Z',granularity:'day',timezone:'America/Sao_Paulo',sourceType:'provider',sourceReference:'runtime:zero',dataStatus:'LIVE',freshnessStatus:'FRESH',provenance:{validation:'analytics-runtime'}})
  await analyticsService.upsertMetric({metricKey:'sessions',value:99,provider:'google-analytics',providerAccountId:'acct-B',providerPropertyId:'prop-B',periodStart,periodEnd,granularity:'day',timezone:'America/Sao_Paulo',sourceType:'provider',sourceReference:'runtime:account-b',dataStatus:'LIVE',freshnessStatus:'FRESH',provenance:{validation:'analytics-runtime'}})
  const accountA=await analyticsService.listMetrics({provider:'google-analytics',providerAccountId:'acct-A',periodStart:'2026-09-01T00:00:00Z',periodEnd:'2026-09-04T00:00:00Z'})
  assert.equal(accountA.some(item=>item.providerAccountId==='acct-B'),false)
  assert.equal(accountA.some(item=>item.value===0&&item.dataStatus==='LIVE'),true)
  assert.deepEqual(await analyticsService.listMetrics({metricKey:'does_not_exist',providerAccountId:'acct-A'}),[])

  const simEnv={GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'secret',GOOGLE_REFRESH_TOKEN:'refresh',GOOGLE_ANALYTICS_ACCOUNT_ID:'sim-account',GOOGLE_ANALYTICS_PROPERTY_ID:'sim-property',GOOGLE_ANALYTICS_TIMEZONE:'America/Sao_Paulo'}
  const configResolver=()=>({clientId:'client',clientSecret:'secret',refreshToken:'refresh',accountId:'sim-account',propertyId:'sim-property',timezone:'America/Sao_Paulo',configured:true})
  const validRows=[{dimensionValues:[{value:'20260901'}],metricValues:[{value:'10'},{value:'2'},{value:'7'},{value:'14'},{value:'5'},{value:'0.5'}]}]
  const providerFor=payload=>{let calls=0;return createGoogleAnalyticsProvider({env:simEnv,fetchImpl:async()=>{calls+=1;return calls%2===1?response(200,{access_token:'simulation-token'}):response(200,payload)}})}

  const simulated=createGoogleAnalyticsSyncService({provider:providerFor({rows:validRows}),analytics:analyticsService,configResolver})
  const simulatedFirst=await simulated.syncRange({startDate:'2026-09-01',endDate:'2026-09-01'})
  assert.equal(simulatedFirst.processed,6)
  let simCounts=(await pool.query(`select (select count(*)::int from analytics_raw_metrics where provider_account_id='sim-account') raw_count,(select count(*)::int from analytics_metrics where provider_account_id='sim-account') normalized_count`)).rows[0]
  assert.deepEqual(simCounts,{raw_count:6,normalized_count:6})

  const simulatedMetrics=await analyticsService.listMetrics({provider:'google-analytics',providerAccountId:'sim-account',providerPropertyId:'sim-property',limit:20})
  const simulatedSessions=simulatedMetrics.find(item=>item.metricKey==='sessions')
  assert.ok(simulatedSessions)
  assert.equal(simulatedSessions.dataStatus,'LIVE')
  assert.equal(simulatedSessions.freshnessStatus,'FRESH')
  assert.equal(simulatedSessions.provenance.provider,'Google Analytics Data API')
  assert.equal(simulatedSessions.provenance.accountId,'sim-account')
  assert.equal(simulatedSessions.provenance.propertyId,'sim-property')
  assert.equal(simulatedSessions.provenance.apiVersion,'v1beta')

  const simulatedRetry=createGoogleAnalyticsSyncService({provider:providerFor({rows:validRows}),analytics:analyticsService,configResolver})
  await simulatedRetry.syncRange({startDate:'2026-09-01',endDate:'2026-09-01'})
  simCounts=(await pool.query(`select (select count(*)::int from analytics_raw_metrics where provider_account_id='sim-account') raw_count,(select count(*)::int from analytics_metrics where provider_account_id='sim-account') normalized_count`)).rows[0]
  assert.deepEqual(simCounts,{raw_count:6,normalized_count:6})

  const empty=createGoogleAnalyticsSyncService({provider:providerFor({rows:[]}),analytics:analyticsService,configResolver})
  const emptyResult=await empty.syncRange({startDate:'2026-09-02',endDate:'2026-09-02'})
  assert.equal(emptyResult.processed,0)
  assert.equal(emptyResult.sync.status,'succeeded')

  const malformed=createGoogleAnalyticsSyncService({provider:providerFor({rows:[{dimensionValues:[{value:'bad-date'}],metricValues:validRows[0].metricValues}]}),analytics:analyticsService,configResolver})
  await assert.rejects(()=>malformed.syncRange({startDate:'2026-09-03',endDate:'2026-09-03'}),error=>error?.code==='GA4_RESPONSE_DATE_INVALID')
  const malformedRun=(await pool.query(`select status,error from analytics_sync_runs where provider_account_id='sim-account' order by started_at desc limit 1`)).rows[0]
  assert.equal(malformedRun.status,'failed')
  assert.ok(malformedRun.error)

  const databaseFailureAnalytics={...analyticsService,async upsertRawMetric(){throw new Error('simulated database write failure')}}
  const dbFailure=createGoogleAnalyticsSyncService({provider:providerFor({rows:validRows}),analytics:databaseFailureAnalytics,configResolver})
  await assert.rejects(()=>dbFailure.syncRange({startDate:'2026-09-04',endDate:'2026-09-04'}),/simulated database write failure/)
  const dbFailureRun=(await pool.query(`select status,error from analytics_sync_runs where provider_account_id='sim-account' order by started_at desc limit 1`)).rows[0]
  assert.equal(dbFailureRun.status,'failed')
  assert.match(dbFailureRun.error,/simulated database write failure/)

  console.log(JSON.stringify({
    serviceIdempotency:{rawCount:counts.raw_count,normalizedCount:counts.metric_count,updatedValue:secondMetric.value},
    accountIsolation:true,
    zeroPreserved:true,
    unavailableAsMissing:true,
    provenanceAndStatus:true,
    ga4Simulation:{processed:simulatedFirst.processed,rawCountAfterRetry:simCounts.raw_count,normalizedCountAfterRetry:simCounts.normalized_count,emptyReport:emptyResult.sync.status,malformedPayload:malformedRun.status,databaseFailure:dbFailureRun.status},
  }))
}finally{
  await pool.end()
}
