import assert from 'node:assert/strict'
import {analyticsService} from '../src/analyticsService.js'
import {getPool} from '../src/db.js'
import {mediaKitService,normalizePayload} from '../src/mediaKitService.js'

const pool=getPool()
const start='2026-08-01T03:00:00.000Z'
const end='2026-09-01T03:00:00.000Z'
const canonicalPlacements=['home-sidebar','editorial-sidebar','advertise-here']

try{
  await pool.query(`delete from media_kit_versions`)
  await pool.query(`delete from analytics_metrics where source_reference like 'runtime:media-kit:%'`)

  const live=await analyticsService.upsertMetric({metricKey:'sessions',value:321,unit:'count',provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-A',scopeType:'portal',scopeId:'portal',periodStart:start,periodEnd:end,granularity:'month',timezone:'America/Sao_Paulo',sourceType:'provider',sourceReference:'runtime:media-kit:live',dataStatus:'LIVE',freshnessStatus:'FRESH',provenance:{validation:'media-kit-runtime'}})
  await analyticsService.upsertMetric({metricKey:'sessions',value:999999,unit:'count',provider:'mock-provider',providerAccountId:'mock-account',providerPropertyId:'mock-property',scopeType:'portal',scopeId:'portal',periodStart:start,periodEnd:end,granularity:'month',timezone:'America/Sao_Paulo',sourceType:'provider',sourceReference:'runtime:media-kit:mock',dataStatus:'MOCK',freshnessStatus:'UNKNOWN',provenance:{validation:'media-kit-runtime',mock:true}})

  const draftInput={
    status:'published',
    version:999,
    audience:{
      monthlyUsers:'777777',
      monthlyViews:'888888',
      socialReach:'999999',
      snapshot:[{id:'forged',value:777777}],
      snapshotResolvedAt:'2020-01-01T00:00:00Z',
      metrics:[
        {id:'legacy-bound',label:'Sessões',metricKey:'sessions',unit:'count',sourceMode:'analytics',provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-A',scopeType:'portal',scopeId:'portal'},
        {id:'manual',label:'Manual',metricKey:'sessions',unit:'count',sourceMode:'manual',manualValue:'45',manualPeriodStart:'2026-08-01',manualPeriodEnd:'2026-09-01'},
      ],
    },
    inventory:{placements:[
      {placementId:'home-sidebar',commercialAvailability:'UNKNOWN'},
      {placementId:'editorial-sidebar',commercialAvailability:'UNAVAILABLE'},
      {placementId:'advertise-here',commercialAvailability:'UNKNOWN'},
    ]},
  }

  const normalized=normalizePayload(draftInput)
  assert.deepEqual(normalized.audience.snapshot,[])
  assert.deepEqual(normalized.audience.metrics,[])
  assert.equal(normalized.audience.monthlyUsers,'')
  assert.equal(normalized.audience.monthlyViews,'')
  assert.equal(normalized.audience.socialReach,'')
  assert.deepEqual(normalized.inventory.placements.map(item=>item.placementId),canonicalPlacements)
  assert.equal(normalized.inventory.placements[0].commercialAvailability,'UNKNOWN')

  const draft=await mediaKitService.saveDraft(draftInput,null)
  assert.equal(draft.status,'draft')
  assert.notEqual(draft.version,999)
  assert.deepEqual(draft.audience.metrics,[])

  const published=await mediaKitService.publish(null)
  assert.equal(published.status,'published')
  assert.deepEqual(published.inventory.placements.map(item=>item.placementId),canonicalPlacements)
  const authoritative=published.audience.snapshot.find(item=>item.provider==='google-analytics'&&item.providerAccountId==='acct-A'&&item.metricKey==='sessions')

  assert.equal(authoritative.value,321)
  assert.equal(authoritative.sourceReference,live.sourceReference)
  assert.equal(authoritative.dataStatus,'LIVE')
  assert.equal(authoritative.freshnessStatus,'FRESH')
  assert.equal(authoritative.provenance.validation,'media-kit-runtime')
  assert.equal(authoritative.provenance.resolvedForMediaKit,true)
  assert.equal(published.audience.snapshot.some(item=>item.isManual||item.sourceType==='manual'||item.dataStatus==='MANUAL'),false)
  assert.equal(published.audience.snapshot.some(item=>item.provider==='mock-provider'||item.dataStatus==='MOCK'),false)
  assert.equal(published.audience.snapshot.some(item=>item.value===45||item.value===777777||item.value===888888||item.value===999999),false)

  await analyticsService.upsertMetric({...live,value:654,rawMetricId:null,syncId:null,collectedAt:null,providerUpdatedAt:null,normalizedAt:undefined})
  const publishedAfterUpdate=await mediaKitService.readPublished()
  const immutable=publishedAfterUpdate.audience.snapshot.find(item=>item.provider==='google-analytics'&&item.providerAccountId==='acct-A'&&item.metricKey==='sessions')
  assert.equal(immutable.value,321)

  const legacyAttempt=normalizePayload({audience:{monthlyUsers:'1000',metrics:[{metricKey:'sessions',sourceMode:'manual',manualValue:'1000'}]}})
  assert.equal(legacyAttempt.audience.monthlyUsers,'')
  assert.deepEqual(legacyAttempt.audience.metrics,[])
  for(const placementId of ['invented-takeover','300x600-random','homepage-mega-takeover']){
    assert.throws(()=>normalizePayload({inventory:{placements:[{placementId}]}}),error=>error?.code==='MEDIA_KIT_PLACEMENT_NOT_CANONICAL')
  }

  console.log(JSON.stringify({
    publishedVersion:published.version,
    authoritativeSnapshotValue:authoritative.value,
    forgedSnapshotIgnored:true,
    mockExcluded:true,
    manualAudienceExcluded:true,
    legacyBindingsRemoved:true,
    immutableAfterAnalyticsUpdate:immutable.value,
    provenancePreserved:true,
    canonicalPlacements:published.inventory.placements.map(item=>({id:item.placementId,commercialAvailability:item.commercialAvailability})),
    inventedPlacementsRejected:true,
  }))
}finally{
  await pool.end()
}
