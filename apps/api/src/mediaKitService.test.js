import assert from 'node:assert/strict'
import test from 'node:test'
import {normalizePayload,resolveAudienceSnapshot} from './mediaKitService.js'

const row=({id,provider,accountId,metricKey,value,periodEnd='2026-09-01T00:00:00.000Z',dataStatus='CACHED',sourceReference,provenance={test:true}})=>({
 id,metric_key:metricKey,value:String(value),unit:'count',provider,provider_account_id:accountId,provider_property_id:null,scope_type:'portal',scope_id:'portal',period_start:'2026-08-01T00:00:00.000Z',period_end:periodEnd,granularity:'month',source_type:'provider',source_reference:sourceReference??`test:${provider}:${metricKey}`,collected_at:'2026-09-01T12:00:00.000Z',provider_updated_at:'2026-09-01T11:50:00.000Z',normalized_at:'2026-09-01T12:00:00.000Z',freshness_status:'FRESH',data_status:dataStatus,sync_id:null,provenance,is_estimated:false,is_manual:false,
})
const clientWith=rows=>({query:async sql=>String(sql).includes('distinct on')?{rows}:{rows:[]}})
const payload=audience=>normalizePayload({audience,inventory:{placements:[]}})
const manual=(metricKey,value)=>({id:`legacy-${metricKey}`,label:`Legacy ${metricKey}`,metricKey,unit:'count',sourceMode:'manual',manualValue:String(value),manualPeriodStart:'2026-08-01',manualPeriodEnd:'2026-09-01'})

test('automatic canonical provider snapshots are the only audience numbers published',async()=>{
 const input=payload({metrics:[manual('followers',999),manual('legacy_custom',12)],monthlyUsers:'999999',monthlyViews:'888888',socialReach:'777777'})
 assert.deepEqual(input.audience.metrics,[])
 assert.equal(input.audience.monthlyUsers,'')
 assert.equal(input.audience.monthlyViews,'')
 assert.equal(input.audience.socialReach,'')
 const resolved=await resolveAudienceSnapshot(clientWith([
  row({id:'instagram-followers',provider:'Instagram',accountId:'ig-portal',metricKey:'followers',value:128400}),
  row({id:'instagram-reach',provider:'Instagram',accountId:'ig-portal',metricKey:'reach',value:76900}),
  row({id:'youtube-followers',provider:'YouTube',accountId:'yt-channel',metricKey:'followers',value:22400}),
 ]),input)
 const instagram=resolved.audience.snapshot.find(item=>item.provider==='Instagram'&&item.metricKey==='followers')
 const youtube=resolved.audience.snapshot.find(item=>item.provider==='YouTube'&&item.metricKey==='followers')
 assert.equal(instagram?.value,128400)
 assert.equal(instagram?.providerAccountId,'ig-portal')
 assert.equal(instagram?.label,'Seguidores')
 assert.equal(youtube?.value,22400)
 assert.equal(resolved.audience.snapshot.some(item=>item.isManual||item.sourceType==='manual'),false)
 assert.equal(resolved.audience.snapshot.some(item=>item.metricKey==='legacy_custom'),false)
})

test('legacy manual audience values are discarded instead of used as fallback',async()=>{
 const resolved=await resolveAudienceSnapshot(clientWith([]),payload({metrics:[manual('followers',777)],monthlyUsers:'777'}))
 assert.deepEqual(resolved.audience.snapshot,[])
 assert.deepEqual(resolved.audience.metrics,[])
 assert.equal(resolved.audience.monthlyUsers,'')
})

test('missing provider data stays unavailable instead of inventing zero',async()=>{
 const resolved=await resolveAudienceSnapshot(clientWith([]),payload({metrics:[]}))
 assert.deepEqual(resolved.audience.snapshot,[])
})

test('published real canonical snapshot remains available when a provider has no newer ledger row',async()=>{
 const previous={id:'published-instagram-followers',label:'Seguidores',metricKey:'followers',value:127000,unit:'count',provider:'Instagram',providerAccountId:'ig-portal',providerPropertyId:null,periodStart:'2026-07-01T00:00:00.000Z',periodEnd:'2026-08-01T00:00:00.000Z',granularity:'month',sourceType:'provider',sourceReference:'published:analytics',collectedAt:'2026-08-01T12:00:00.000Z',providerUpdatedAt:null,normalizedAt:'2026-08-01T12:00:00.000Z',freshnessStatus:'STALE',dataStatus:'STALE',syncId:null,provenance:{published:true},isEstimated:false,isManual:false}
 const resolved=await resolveAudienceSnapshot(clientWith([]),payload({metrics:[]}),{previousSnapshot:[previous]})
 assert.equal(resolved.audience.snapshot[0].value,127000)
 assert.equal(resolved.audience.snapshot[0].provider,'Instagram')
})

test('synthetic rows and synthetic published snapshots are rejected fail-closed',async()=>{
 const currentFixture=row({id:'fixture-followers',provider:'Instagram',accountId:'ig-portal',metricKey:'followers',value:123456,sourceReference:'fixture:instagram',provenance:{fixture:true}})
 const previousMock={id:'mock-followers',label:'Seguidores',metricKey:'followers',value:654321,unit:'count',provider:'Instagram',providerAccountId:'ig-portal',providerPropertyId:null,periodStart:'2026-08-01',periodEnd:'2026-09-01',granularity:'month',sourceType:'provider',sourceReference:'mock:instagram',collectedAt:null,providerUpdatedAt:null,normalizedAt:null,freshnessStatus:'FRESH',dataStatus:'CACHED',syncId:null,provenance:{mock:true},isEstimated:false,isManual:false}
 const resolved=await resolveAudienceSnapshot(clientWith([currentFixture]),payload({}),{previousSnapshot:[previousMock]})
 assert.deepEqual(resolved.audience.snapshot,[])
})

test('legacy provider and account bindings are removed from the editable payload',()=>{
 const normalized=normalizePayload({audience:{metrics:[{id:'old-binding',label:'Seguidores',metricKey:'followers',sourceMode:'analytics',provider:'Instagram',providerAccountId:'ig-portal'}]},inventory:{placements:[]}})
 assert.deepEqual(normalized.audience.metrics,[])
})
