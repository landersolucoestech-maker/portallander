import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizeIntegrationEvent} from './integrationEventService.js'

test('integration event envelope normalizes provider data',()=>{
  assert.deepEqual(normalizeIntegrationEvent({provider:' WhatsApp ',providerEventId:'evt_1',eventType:'messages',externalObjectId:'msg_1',payload:{ok:true}}),{provider:'whatsapp',providerEventId:'evt_1',eventType:'messages',externalObjectId:'msg_1',payload:{ok:true}})
})

test('integration event envelope rejects unknown provider and missing provider event id',()=>{
  assert.throws(()=>normalizeIntegrationEvent({provider:'unknown',providerEventId:'evt',eventType:'event'}),error=>error?.code==='INTEGRATION_EVENT_PROVIDER_INVALID')
  assert.throws(()=>normalizeIntegrationEvent({provider:'resend',eventType:'email.delivered'}),error=>error?.code==='INTEGRATION_EVENT_ID_INVALID')
})
