import assert from 'node:assert/strict'
import {analyticsService} from '../src/analyticsService.js'
import {getPool} from '../src/db.js'

const pool=getPool()
const periodStart='2026-09-01T03:00:00.000Z'
const periodEnd='2026-09-02T03:00:00.000Z'
const sourceReference='runtime:ga4:prop-test:20260901:sessions'

try{
  await pool.query(`delete from analytics_metrics where source_reference like 'runtime:%'`)
  await pool.query(`delete from analytics_raw_metrics where source_reference like 'runtime:%'`)
  await pool.query(`delete from analytics_sync_runs where metadata->>'validation'='analytics-runtime'`)

  const firstSync=await analyticsService.beginSync({provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',metadata:{validation:'analytics-runtime'}})
  const firstRaw=await analyticsService.upsertRawMetric({syncId:firstSync.id,provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',providerMetric:'sessions',value:10,periodStart,periodEnd,granularity:'day',timezone:'America/Sao_Paulo',sourceReference,collectedAt:'2026-09-02T04:00:00Z'})
  const firstMetric=await analyticsService.upsertMetric({rawMetricId:firstRaw.id,syncId:firstSync.id,metricKey:'sessions',value:10,provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',periodStart,periodEnd,granularity:'day',timezone:'America/Sao_Paulo',sourceType:'provider',sourceReference,dataStatus:'LIVE',freshnessStatus:'FRESH',provenance:{validation:'analytics-runtime'}})
  await analyticsService.finishSync(firstSync.id,{status:'succeeded',recordsImported:1})

  assert.equal(firstMetric.value,10)
  let counts=(await pool.query(`select (select count(*)::int from analytics_raw_metrics where source_reference=$1) raw_count,(select count(*)::int from analytics_metrics where source_reference=$1) metric_count`,[sourceReference])).rows[0]
  assert.deepEqual(counts,{raw_count:1,metric_count:1})

  const secondSync=await analyticsService.beginSync({provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',retryCount:1,metadata:{validation:'analytics-runtime'}})
  const secondRaw=await analyticsService.upsertRawMetric({syncId:secondSync.id,provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',providerMetric:'sessions',value:20,periodStart,periodEnd,granularity:'day',timezone:'America/Sao_Paulo',sourceReference,collectedAt:'2026-09-02T05:00:00Z'})
  const secondMetric=await analyticsService.upsertMetric({rawMetricId:secondRaw.id,syncId:secondSync.id,metricKey:'sessions',value:20,provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',periodStart,periodEnd,granularity:'day',timezone:'America/Sao_Paulo',sourceType:'provider',sourceReference,dataStatus:'LIVE',freshnessStatus:'FRESH',provenance:{validation:'analytics-runtime',retry:true}})
  await analyticsService.finishSync(secondSync.id,{status:'succeeded',recordsUpdated:1})

  assert.equal(firstRaw.id,secondRaw.id)
  assert.equal(secondMetric.id,firstMetric.id)
  assert.equal(secondMetric.value,20)
  counts=(await pool.query(`select (select count(*)::int from analytics_raw_metrics where source_reference=$1) raw_count,(select count(*)::int from analytics_metrics where source_reference=$1) metric_count`,[sourceReference])).rows[0]
  assert.deepEqual(counts,{raw_count:1,metric_count:1})

  await analyticsService.upsertMetric({metricKey:'sessions',value:0,provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-test',periodStart:'2026-09-02T03:00:00Z',periodEnd:'2026-09-03T03:00:00Z',granularity:'day',timezone:'America/Sao_Paulo',sourceType:'provider',sourceReference:'runtime:zero',dataStatus:'LIVE',freshnessStatus:'FRESH',provenance:{validation:'analytics-runtime'}})
  await analyticsService.upsertMetric({metricKey:'sessions',value:99,provider:'google-analytics',providerAccountId:'acct-B',providerPropertyId:'prop-B',periodStart,periodEnd,granularity:'day',timezone:'America/Sao_Paulo',sourceType:'provider',sourceReference:'runtime:account-b',dataStatus:'LIVE',freshnessStatus:'FRESH',provenance:{validation:'analytics-runtime'}})

  const accountA=await analyticsService.listMetrics({provider:'google-analytics',providerAccountId:'acct-A',periodStart:'2026-09-01T00:00:00Z',periodEnd:'2026-09-04T00:00:00Z'})
  assert.equal(accountA.some(item=>item.providerAccountId==='acct-B'),false)
  assert.equal(accountA.some(item=>item.value===0&&item.dataStatus==='LIVE'),true)
  const missing=await analyticsService.listMetrics({metricKey:'does_not_exist',providerAccountId:'acct-A'})
  assert.deepEqual(missing,[])

  console.log(JSON.stringify({sync1:firstSync.id,sync2:secondSync.id,rawId:firstRaw.id,metricId:firstMetric.id,rawCount:counts.raw_count,normalizedCount:counts.metric_count,updatedValue:secondMetric.value,accountBoundaryRows:accountA.length,zeroPreserved:true,unavailableRepresentedByMissingRows:true}))
}finally{
  await pool.end()
}
