import test from 'node:test'
import assert from 'node:assert/strict'
import {GA4_METRIC_MAPPINGS,ga4DayPeriod,googleAnalyticsConfig,normalizeGa4Range} from './googleAnalyticsProvider.js'

test('GA4 config never becomes configured without explicit timezone and account/property boundary',()=>{
  assert.equal(googleAnalyticsConfig({GOOGLE_CLIENT_ID:'c',GOOGLE_CLIENT_SECRET:'s',GOOGLE_REFRESH_TOKEN:'r',GOOGLE_ANALYTICS_ACCOUNT_ID:'a',GOOGLE_ANALYTICS_PROPERTY_ID:'p'}).configured,false)
  assert.equal(googleAnalyticsConfig({GOOGLE_CLIENT_ID:'c',GOOGLE_CLIENT_SECRET:'s',GOOGLE_REFRESH_TOKEN:'r',GOOGLE_ANALYTICS_ACCOUNT_ID:'a',GOOGLE_ANALYTICS_PROPERTY_ID:'p',GOOGLE_ANALYTICS_TIMEZONE:'America/Sao_Paulo'}).configured,true)
})

test('GA4 sync range is bounded and ordered',()=>{
  assert.deepEqual(normalizeGa4Range({startDate:'2026-08-01',endDate:'2026-08-31'}),{startDate:'2026-08-01',endDate:'2026-08-31',days:31})
  assert.throws(()=>normalizeGa4Range({startDate:'2026-08-31',endDate:'2026-08-01'}),error=>error?.code==='GA4_RANGE_INVALID')
  assert.throws(()=>normalizeGa4Range({startDate:'2026-07-01',endDate:'2026-08-31'}),error=>error?.code==='GA4_RANGE_TOO_LARGE')
})

test('GA4 daily boundaries preserve configured property timezone',()=>{
  const period=ga4DayPeriod('2026-08-01','America/Sao_Paulo')
  assert.equal(period.periodStart.toISOString(),'2026-08-01T03:00:00.000Z')
  assert.equal(period.periodEnd.toISOString(),'2026-08-02T03:00:00.000Z')
})

test('GA4 provider metrics map explicitly instead of collapsing unlike concepts',()=>{
  assert.deepEqual(GA4_METRIC_MAPPINGS.map(item=>[item.providerMetric,item.metricKey]),[
    ['activeUsers','active_users'],['newUsers','new_users'],['sessions','sessions'],['screenPageViews','pageviews'],['engagedSessions','engaged_sessions'],['engagementRate','engagement_rate'],
  ])
})
