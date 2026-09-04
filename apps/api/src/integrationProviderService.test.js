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

test('Google Analytics requires complete server-side OAuth and property boundary',()=>{
  const partial=integrationProviderConfig({GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'secret',GOOGLE_REFRESH_TOKEN:'refresh',GOOGLE_ANALYTICS_ACCOUNT_ID:'account',GOOGLE_ANALYTICS_PROPERTY_ID:'property'})
  assert.equal(partial.google.configured,false)
  const complete=integrationProviderConfig({GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'secret',GOOGLE_REFRESH_TOKEN:'refresh',GOOGLE_ANALYTICS_ACCOUNT_ID:'account',GOOGLE_ANALYTICS_PROPERTY_ID:'property',GOOGLE_ANALYTICS_TIMEZONE:'America/Sao_Paulo'})
  assert.equal(complete.google.configured,true)
})

test('Autentique refuses missing or invalid PDFs before contacting provider',async()=>{
  await assert.rejects(()=>autentiqueProvider.createDocument({name:'Contrato',signers:[{email:'signer@example.com'}]}),error=>error?.code==='AUTENTIQUE_DOCUMENT_FILE_REQUIRED')
  await assert.rejects(()=>autentiqueProvider.createDocument({name:'Contrato',signers:[{email:'signer@example.com'}],file:{filename:'fake.pdf',mimeType:'application/pdf',buffer:Buffer.from('not-pdf')}}),error=>error?.code==='AUTENTIQUE_DOCUMENT_FILE_INVALID')
})

test('WhatsApp recipient is normalized to digits',()=>{
  assert.equal(normalizeWhatsappRecipient('+55 (33) 99999-9999'),'5533999999999')
  assert.throws(()=>normalizeWhatsappRecipient('123'),error=>error?.code==='WHATSAPP_RECIPIENT_INVALID')
})

test('runtime status keeps unimplemented providers planned and Google partial',()=>{
  const status=integrationRuntimeStatus()
  for(const id of ['meta','tiktok','nfe']){
    assert.equal(status[id].implementation,'planned')
    assert.equal(status[id].configured,false)
  }
  assert.equal(status.google.implementation,'partial')
})
