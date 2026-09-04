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
  await analyticsService.upsertMetric({metricKey:'mock_metric',value:999999,unit:'count',provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-A',scopeType:'portal',scopeId:'portal',periodStart:start,periodEnd:end,granularity:'month',timezone:'America/Sao_Paulo',sourceType:'provider',sourceReference:'runtime:media-kit:mock',dataStatus:'MOCK',freshnessStatus:'UNKNOWN',provenance:{validation:'media-kit-runtime'}})

  const draftInput={
    status:'published',
    version:999,
    audience:{
      snapshot:[{id:'forged',value:777777}],
      snapshotResolvedAt:'2020-01-01T00:00:00Z',
      metrics:[
        {id:'live',label:'Sessões',metricKey:'sessions',unit:'count',sourceMode:'analytics',provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-A',scopeType:'portal',scopeId:'portal'},
        {id:'mock',label:'Mock proibido',metricKey:'mock_metric',unit:'count',sourceMode:'analytics',provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-A',scopeType:'portal',scopeId:'portal'},
        {id:'manual',label:'Manual',metricKey:'manual_audience',unit:'count',sourceMode:'manual',manualValue:'45',manualPeriodStart:'2026-08-01',manualPeriodEnd:'2026-09-01'},
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
  assert.deepEqual(normalized.inventory.placements.map(item=>item.placementId),canonicalPlacements)
  assert.equal(normalized.inventory.placements[0].commercialAvailability,'UNKNOWN')

  const draft=await mediaKitService.saveDraft(draftInput,null)
  assert.equal(draft.status,'draft')
  assert.notEqual(draft.version,999)

  const published=await mediaKitService.publish(null)
  assert.equal(published.status,'published')
  assert.deepEqual(published.inventory.placements.map(item=>item.placementId),canonicalPlacements)
  const byId=Object.fromEntries(published.audience.snapshot.map(item=>[item.id,item]))

  assert.equal(byId.live.value,321)
  assert.equal(byId.live.sourceReference,live.sourceReference)
  assert.equal(byId.live.dataStatus,'LIVE')
  assert.equal(byId.live.freshnessStatus,'FRESH')
  assert.equal(byId.live.provenance.validation,'media-kit-runtime')
  assert.equal(byId.live.provenance.resolvedForMediaKit,true)

  assert.equal(byId.mock.value,null)
  assert.equal(byId.mock.dataStatus,'UNAVAILABLE')
  assert.equal(byId.mock.provenance.reason,'NO_MATCHING_METRIC')

  assert.equal(byId.manual.value,45)
  assert.equal(byId.manual.dataStatus,'MANUAL')
  assert.equal(byId.manual.isManual,true)
  assert.equal(byId.manual.provenance.collectionMethod,'manual')
  assert.equal(byId.manual.provenance.resolvedForMediaKit,true)

  await analyticsService.upsertMetric({...live,value:654,rawMetricId:null,syncId:null,collectedAt:null,providerUpdatedAt:null,normalizedAt:undefined})
  const publishedAfterUpdate=await mediaKitService.readPublished()
  const immutable=publishedAfterUpdate.audience.snapshot.find(item=>item.id==='live')
  assert.equal(immutable.value,321)

  assert.throws(()=>normalizePayload({audience:{metrics:[{metricKey:'manual_bad',sourceMode:'manual',manualValue:'x'}]}}),error=>error?.code==='MEDIA_KIT_MANUAL_METRIC_INVALID')
  assert.throws(()=>normalizePayload({audience:{metrics:[{metricKey:'sessions',sourceMode:'analytics',provider:'google-analytics'}]}}),error=>error?.code==='MEDIA_KIT_ANALYTICS_BOUNDARY_REQUIRED')
  for(const placementId of ['invented-takeover','300x600-random','homepage-mega-takeover']){
    assert.throws(()=>normalizePayload({inventory:{placements:[{placementId}]}}),error=>error?.code==='MEDIA_KIT_PLACEMENT_NOT_CANONICAL')
  }

  console.log(JSON.stringify({
    publishedVersion:published.version,
    authoritativeSnapshotValue:byId.live.value,
    forgedSnapshotIgnored:true,
    mockExcludedStatus:byId.mock.dataStatus,
    manualStatus:byId.manual.dataStatus,
    immutableAfterAnalyticsUpdate:immutable.value,
    provenancePreserved:true,
    canonicalPlacements:published.inventory.placements.map(item=>({id:item.placementId,commercialAvailability:item.commercialAvailability})),
    inventedPlacementsRejected:true,
  }))
}finally{
  await pool.end()
}
