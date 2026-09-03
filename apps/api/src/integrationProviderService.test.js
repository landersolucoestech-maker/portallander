import test from 'node:test'
import assert from 'node:assert/strict'
import {autentiqueProvider,integrationProviderConfig,integrationRuntimeStatus,normalizeWhatsappRecipient} from './integrationProviderService.js'

test('integration provider config requires complete WhatsApp credentials',()=>{
  const partial=integrationProviderConfig({WHATSAPP_ACCESS_TOKEN:'token',WHATSAPP_PHONE_NUMBER_ID:'123'})
  assert.equal(partial.whatsapp.configured,false)
  const complete=integrationProviderConfig({WHATSAPP_ACCESS_TOKEN:'token',WHATSAPP_PHONE_NUMBER_ID:'123',WHATSAPP_GRAPH_API_VERSION:'v1.0',WHATSAPP_WEBHOOK_VERIFY_TOKEN:'verify'})
  assert.equal(complete.whatsapp.configured,true)
  assert.equal(complete.whatsapp.verifyTokenConfigured,true)
})

test('Autentique is configured only when API token exists',()=>{
  assert.equal(integrationProviderConfig({}).autentique.configured,false)
  assert.equal(integrationProviderConfig({AUTENTIQUE_API_TOKEN:'secret'}).autentique.configured,true)
})

test('Autentique refuses missing or invalid PDFs before contacting provider',async()=>{
  await assert.rejects(()=>autentiqueProvider.createDocument({name:'Contrato',signers:[{email:'signer@example.com'}]}),error=>error?.code==='AUTENTIQUE_DOCUMENT_FILE_REQUIRED')
  await assert.rejects(()=>autentiqueProvider.createDocument({name:'Contrato',signers:[{email:'signer@example.com'}],file:{filename:'fake.pdf',mimeType:'application/pdf',buffer:Buffer.from('not-pdf')}}),error=>error?.code==='AUTENTIQUE_DOCUMENT_FILE_INVALID')
})

test('WhatsApp recipient is normalized to digits',()=>{
  assert.equal(normalizeWhatsappRecipient('+55 (33) 99999-9999'),'5533999999999')
  assert.throws(()=>normalizeWhatsappRecipient('123'),error=>error?.code==='WHATSAPP_RECIPIENT_INVALID')
})

test('runtime status never claims planned providers are configured',()=>{
  const status=integrationRuntimeStatus()
  for(const id of ['meta','tiktok','google','nfe']){
    assert.equal(status[id].implementation,'planned')
    assert.equal(status[id].configured,false)
  }
})
