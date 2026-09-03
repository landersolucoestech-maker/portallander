import test from 'node:test'
import assert from 'node:assert/strict'
import {newsletterService,normalizeNewsletterEmail} from './newsletterService.js'

test('newsletter normaliza e-mail antes da persistência',()=>{
  assert.equal(normalizeNewsletterEmail('  Leitor@Example.COM '),'leitor@example.com')
})

test('newsletter rejeita e-mail inválido',()=>{
  assert.throws(()=>normalizeNewsletterEmail('email-invalido'),error=>error?.code==='NEWSLETTER_EMAIL_INVALID')
})

test('Resend transactional send rejects empty content before provider call',async()=>{
  await assert.rejects(()=>newsletterService.sendTransactional({to:'cliente@example.com',subject:'Assunto'}),error=>error?.code==='RESEND_CONTENT_REQUIRED')
})

test('Resend transactional send requires configured sender identity',async()=>{
  const previous=process.env.RESEND_FROM_EMAIL
  delete process.env.RESEND_FROM_EMAIL
  try{await assert.rejects(()=>newsletterService.sendTransactional({to:'cliente@example.com',subject:'Assunto',text:'Mensagem'}),error=>error?.code==='RESEND_FROM_NOT_CONFIGURED')}
  finally{if(previous===undefined)delete process.env.RESEND_FROM_EMAIL;else process.env.RESEND_FROM_EMAIL=previous}
})
