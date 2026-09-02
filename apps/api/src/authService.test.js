import assert from 'node:assert/strict'
import test from 'node:test'
import {authInternals,hashPassword,verifyPassword} from './authService.js'

test('admin passwords are salted and verifiable',async()=>{
  const password='Portal-Lander-Admin-2026'
  const first=await hashPassword(password)
  const second=await hashPassword(password)
  assert.match(first,/^scrypt\$/)
  assert.notEqual(first,second)
  assert.equal(await verifyPassword(password,first),true)
  assert.equal(await verifyPassword('senha-incorreta',first),false)
})

test('short admin passwords are rejected',async()=>{
  await assert.rejects(()=>hashPassword('curta'),error=>error?.code==='ADMIN_PASSWORD_TOO_SHORT')
})

test('admin identities are normalized before lookup',()=>{
  assert.equal(authInternals.normalizeEmail('  ADMIN@PortalLander.Com '),'admin@portallander.com')
  assert.equal(authInternals.sha256('session-token').length,64)
  assert.equal(authInternals.safeEqualText('same','same'),true)
  assert.equal(authInternals.safeEqualText('same','different'),false)
})
