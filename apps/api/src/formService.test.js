import test from 'node:test'
import assert from 'node:assert/strict'
import {validateAntiSpamSignal} from './formService.js'

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
