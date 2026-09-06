import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizeSubmissionFiles,resolveCanonicalFormSlug,validateAntiSpamSignal} from './formService.js'

test('anti-spam aceita preenchimento humano com honeypot vazio',()=>{
  const now=10_000
  assert.doesNotThrow(()=>validateAntiSpamSignal({honeypot:'',startedAt:8_000},now))
})

test('anti-spam rejeita honeypot preenchido',()=>{
  assert.throws(()=>validateAntiSpamSignal({honeypot:'website',startedAt:1_000},10_000),error=>error?.code==='FORM_SPAM_DETECTED')
})

test('anti-spam rejeita submissão rápida demais',()=>{
  assert.throws(()=>validateAntiSpamSignal({honeypot:'',startedAt:9_500},10_000),error=>error?.code==='FORM_SPAM_TOO_FAST')
})

test('aliases históricos resolvem para os dois slugs canônicos sem criar identidade nova',()=>{
  assert.equal(resolveCanonicalFormSlug('captacao-leads'),'contato-comercial')
  assert.equal(resolveCanonicalFormSlug('contato'),'contato-comercial')
  assert.equal(resolveCanonicalFormSlug('colabore'),'colabore-anuncie')
  assert.equal(resolveCanonicalFormSlug('anuncie'),'colabore-anuncie')
  assert.equal(resolveCanonicalFormSlug('anuncie-contato'),'colabore-anuncie')
  assert.equal(resolveCanonicalFormSlug('advertising-inquiry'),'colabore-anuncie')
  assert.equal(resolveCanonicalFormSlug('custom-form'),'custom-form')
})

const formWithRequiredFile={fields:[{key:'arquivo',label:'Arquivo de apoio',type:'file',required:true}]}

test('anexo mantém identidade do campo configurado',()=>{
  const files=normalizeSubmissionFiles(formWithRequiredFile,[{fieldName:'file:arquivo',filename:'pauta.pdf',mimeType:'application/pdf',size:10,buffer:Buffer.from('ok')}])
  assert.equal(files[0].fieldKey,'arquivo')
})

test('anexo em campo inexistente é rejeitado',()=>{
  assert.throws(()=>normalizeSubmissionFiles(formWithRequiredFile,[{fieldName:'file:documento',filename:'x.pdf',mimeType:'application/pdf',size:10,buffer:Buffer.from('ok')}]),error=>error?.code==='FORM_FILE_FIELD_UNKNOWN')
})

test('campo de arquivo obrigatório sem anexo é rejeitado',()=>{
  assert.throws(()=>normalizeSubmissionFiles(formWithRequiredFile,[]),error=>error?.code==='FORM_FILE_REQUIRED')
})
