import test from 'node:test'
import assert from 'node:assert/strict'
import {deriveFreshnessStatus} from './analyticsFreshness.js'

const now=new Date('2026-09-04T12:00:00.000Z')

test('GA4 ingestion freshness is FRESH for collection age up to 48 hours',()=>{
 assert.equal(deriveFreshnessStatus({provider:'google-analytics',collectedAt:'2026-09-03T12:00:00.000Z',now}),'FRESH')
 assert.equal(deriveFreshnessStatus({provider:'google-analytics',collectedAt:'2026-09-02T12:00:00.000Z',now}),'FRESH')
})

test('GA4 ingestion freshness is STALE after 48 hours',()=>{
 assert.equal(deriveFreshnessStatus({provider:'google-analytics',collectedAt:'2026-09-02T11:59:59.000Z',now}),'STALE')
})

test('freshness remains UNKNOWN when source or timestamps cannot justify a status',()=>{
 assert.equal(deriveFreshnessStatus({provider:'manual',collectedAt:'2026-09-04T11:00:00.000Z',now}),'UNKNOWN')
 assert.equal(deriveFreshnessStatus({provider:'google-analytics',collectedAt:null,now}),'UNKNOWN')
 assert.equal(deriveFreshnessStatus({provider:'google-analytics',collectedAt:'invalid',now}),'UNKNOWN')
 assert.equal(deriveFreshnessStatus({provider:'google-analytics',collectedAt:'2026-09-05T00:00:00.000Z',now}),'UNKNOWN')
})
