import assert from 'node:assert/strict'
import test from 'node:test'
import {isAdministrativeRole} from './http.js'

test('owner and admin retain administrative access',()=>{
  assert.equal(isAdministrativeRole('owner'),true)
  assert.equal(isAdministrativeRole('admin'),true)
})

test('editor does not inherit administrative access',()=>{
  assert.equal(isAdministrativeRole('editor'),false)
  assert.equal(isAdministrativeRole(''),false)
  assert.equal(isAdministrativeRole(null),false)
})
