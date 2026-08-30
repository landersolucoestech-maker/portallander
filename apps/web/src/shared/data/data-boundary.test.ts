import {beforeEach,describe,expect,it} from 'vitest'
import {mockDataProvider} from './mockDataProvider'
import {getRuntimeDataProvider,setRuntimeDataProvider} from './runtimeDataProvider'

describe('application data boundary',()=>{
 beforeEach(()=>{
  mockDataProvider.setScenario('success')
  setRuntimeDataProvider(mockDataProvider)
 })

 it('exposes a stable runtime provider instead of raw mock imports in consumers',()=>{
  const provider=getRuntimeDataProvider()
  expect(provider.kind).toBe('mock')
  expect(provider.crm.state().contacts.length).toBeGreaterThan(0)
  expect(provider.contracts.state().contracts.length).toBeGreaterThan(0)
  expect(provider.finance.transactions().length).toBeGreaterThan(0)
  expect(provider.editorial.contents().length).toBeGreaterThan(0)
 })

 it('returns cloned data so UI mutations cannot corrupt the canonical fixture universe',()=>{
  const first=mockDataProvider.crm.state()
  const originalName=first.contacts[0]?.name
  if(first.contacts[0])first.contacts[0].name='MUTATED IN TEST'
  expect(mockDataProvider.crm.state().contacts[0]?.name).toBe(originalName)
 })

 it('supports controlled empty, partial, permission and offline scenarios',()=>{
  mockDataProvider.setScenario('empty')
  expect(mockDataProvider.crm.state().contacts).toEqual([])
  expect(mockDataProvider.finance.transactions()).toEqual([])

  mockDataProvider.setScenario('partial')
  expect(mockDataProvider.crm.state().contacts.length).toBeGreaterThan(0)
  expect(mockDataProvider.crm.state().contacts.length).toBeLessThan(30)

  mockDataProvider.setScenario('permission-denied')
  expect(()=>mockDataProvider.contracts.state()).toThrow(/Permission denied/)
  expect(()=>mockDataProvider.finance.transactions()).toThrow(/Permission denied/)

  mockDataProvider.setScenario('offline')
  expect(mockDataProvider.getScenario().offline).toBe(true)
 })
})
