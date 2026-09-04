import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizePayload} from './mediaKitService.js'

test('normaliza o Mídia Kit sem aceitar status ou versão vindos do payload',()=>{
  const payload=normalizePayload({
    version:999,
    status:'published',
    institutional:{title:'  Portal Lander Pro  ',summary:'  Resumo  ',positioning:' Posicionamento '},
    audience:{monthlyUsers:' 120 mil ',monthlyViews:' 350 mil ',socialReach:' 900 mil ',notes:' Fonte interna '},
    adFormats:[{id:' banner-home ',name:' Banner Home ',placement:' Homepage ',dimensions:' 300x350 ',description:' Destaque '}],
    commercial:{name:' Comercial ',email:' ads@portal.test ',phone:' 11999999999 ',cta:' Anuncie agora '},
  })
  assert.equal(payload.institutional.title,'Portal Lander Pro')
  assert.equal(payload.institutional.summary,'Resumo')
  assert.equal(payload.adFormats[0].id,'banner-home')
  assert.equal(payload.adFormats[0].name,'Banner Home')
  assert.equal(payload.commercial.cta,'Anuncie agora')
  assert.equal('version' in payload,false)
  assert.equal('status' in payload,false)
})

test('aplica defaults seguros para campos institucionais e CTA',()=>{
  const payload=normalizePayload({institutional:{},audience:{},commercial:{},adFormats:[]})
  assert.equal(payload.institutional.title,'Portal Lander')
  assert.equal(payload.commercial.cta,'Fale com nosso time comercial')
  assert.deepEqual(payload.adFormats,[])
  assert.deepEqual(payload.inventory.placements.map(item=>item.placementId),['home-sidebar','editorial-sidebar','advertise-here'])
})

test('rejeita payload ou formato publicitário inválido',()=>{
  assert.throws(()=>normalizePayload(null),error=>error?.code==='MEDIA_KIT_INVALID')
  assert.throws(()=>normalizePayload({adFormats:['inválido']}),error=>error?.code==='MEDIA_KIT_FORMAT_INVALID')
})

test('nunca aceita snapshot de audiência fornecido pelo cliente',()=>{
  const payload=normalizePayload({audience:{metrics:[],snapshot:[{id:'fake',value:999999}],snapshotResolvedAt:'2026-01-01T00:00:00.000Z'}})
  assert.deepEqual(payload.audience.snapshot,[])
  assert.equal(payload.audience.snapshotResolvedAt,null)
})

test('rejeita placement que não pertence ao inventário canônico do Portal',()=>{
  for(const placementId of ['invented-takeover','300x600-random','homepage-mega-takeover']){
    assert.throws(()=>normalizePayload({inventory:{placements:[{placementId,commercialAvailability:'AVAILABLE'}]}}),error=>error?.code==='MEDIA_KIT_PLACEMENT_NOT_CANONICAL')
  }
})

test('binding manual permanece explicitamente manual e preserva período',()=>{
  const payload=normalizePayload({audience:{metrics:[{id:'users',label:'Usuários',metricKey:'users',unit:'count',sourceMode:'manual',manualValue:'120',manualPeriodStart:'2026-08-01',manualPeriodEnd:'2026-09-01'}]}})
  const [metric]=payload.audience.metrics
  assert.equal(metric.sourceMode,'manual')
  assert.equal(metric.manualValue,'120')
  assert.equal(metric.manualPeriodStart,'2026-08-01')
  assert.equal(metric.manualPeriodEnd,'2026-09-01')
})

test('binding manual inválido é rejeitado antes de persistir draft',()=>{
  assert.throws(()=>normalizePayload({audience:{metrics:[{metricKey:'users',sourceMode:'manual',manualValue:'abc',manualPeriodStart:'2026-08-01',manualPeriodEnd:'2026-09-01'}]}}),error=>error?.code==='MEDIA_KIT_MANUAL_METRIC_INVALID')
  assert.throws(()=>normalizePayload({audience:{metrics:[{metricKey:'users',sourceMode:'manual',manualValue:'10'}]}}),error=>error?.code==='MEDIA_KIT_MANUAL_METRIC_INVALID')
  assert.throws(()=>normalizePayload({audience:{metrics:[{metricKey:'users',sourceMode:'manual',manualValue:'10',manualPeriodStart:'2026-09-01',manualPeriodEnd:'2026-08-01'}]}}),error=>error?.code==='MEDIA_KIT_MANUAL_METRIC_INVALID')
})

test('binding Analytics exige provider e account boundary explícitos',()=>{
  assert.throws(()=>normalizePayload({audience:{metrics:[{metricKey:'sessions',sourceMode:'analytics'}]}}),error=>error?.code==='MEDIA_KIT_ANALYTICS_BOUNDARY_REQUIRED')
  assert.throws(()=>normalizePayload({audience:{metrics:[{metricKey:'sessions',sourceMode:'analytics',provider:'google-analytics'}]}}),error=>error?.code==='MEDIA_KIT_ANALYTICS_BOUNDARY_REQUIRED')
  const payload=normalizePayload({audience:{metrics:[{metricKey:'sessions',sourceMode:'analytics',provider:'google-analytics',providerAccountId:'acct-A',providerPropertyId:'prop-A'}]}})
  assert.equal(payload.audience.metrics[0].providerAccountId,'acct-A')
})
