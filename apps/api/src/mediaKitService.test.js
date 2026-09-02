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
})

test('rejeita payload ou formato publicitário inválido',()=>{
  assert.throws(()=>normalizePayload(null),error=>error?.code==='MEDIA_KIT_INVALID')
  assert.throws(()=>normalizePayload({adFormats:['inválido']}),error=>error?.code==='MEDIA_KIT_FORMAT_INVALID')
})
