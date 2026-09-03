import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizeNewsletterEmail} from './newsletterService.js'

test('newsletter normaliza e-mail antes da persistência',()=>{
  assert.equal(normalizeNewsletterEmail('  Leitor@Example.COM '),'leitor@example.com')
})

test('newsletter rejeita e-mail inválido',()=>{
  assert.throws(()=>normalizeNewsletterEmail('email-invalido'),error=>error?.code==='NEWSLETTER_EMAIL_INVALID')
})
