import {afterEach,describe,expect,it} from 'vitest'
import {mockContracts,mockFinanceTransactions,mockCrmState} from '../../mocks'
import {mockDataProvider} from './mockDataProvider'

const idsUnique=(items:Array<{id:string}>)=>new Set(items.map(item=>item.id)).size===items.length

describe('mock data provider scenarios',()=>{
 afterEach(()=>mockDataProvider.setScenario('success'))

 it('returns empty operational collections in empty scenario',()=>{
  mockDataProvider.setScenario('empty')
  expect(mockDataProvider.crm.state().leads).toEqual([])
  expect(mockDataProvider.contracts.state().contracts).toEqual([])
  expect(mockDataProvider.finance.transactions()).toEqual([])
  expect(mockDataProvider.editorial.contents()).toEqual([])
 })

 it('returns reduced collections in partial scenario',()=>{
  mockDataProvider.setScenario('partial')
  expect(mockDataProvider.crm.state().leads.length).toBeLessThan(mockCrmState.leads.length)
  expect(mockDataProvider.finance.transactions().length).toBeLessThan(mockFinanceTransactions.length)
 })

 it('scales operational collections with unique ids in large scenario',()=>{
  mockDataProvider.setScenario('large')
  const crm=mockDataProvider.crm.state()
  const contracts=mockDataProvider.contracts.state().contracts
  const transactions=mockDataProvider.finance.transactions()
  expect(crm.leads.length).toBe(mockCrmState.leads.length*4)
  expect(contracts.length).toBe(mockContracts.length*4)
  expect(transactions.length).toBe(mockFinanceTransactions.length*4)
  expect(idsUnique(crm.leads)).toBe(true)
  expect(idsUnique(crm.contacts)).toBe(true)
  expect(idsUnique(contracts)).toBe(true)
  expect(idsUnique(transactions)).toBe(true)
 })

 it('blocks protected domains in permission-denied scenario',()=>{
  mockDataProvider.setScenario('permission-denied')
  expect(()=>mockDataProvider.finance.transactions()).toThrow(/Permission denied/)
  expect(()=>mockDataProvider.contracts.state()).toThrow(/Permission denied/)
  expect(()=>mockDataProvider.crm.state()).not.toThrow()
 })

 it('keeps shell identity available while operational domains fail offline',()=>{
  mockDataProvider.setScenario('offline')
  expect(()=>mockDataProvider.identity.currentUser()).not.toThrow()
  expect(()=>mockDataProvider.branding.config()).not.toThrow()
  expect(()=>mockDataProvider.crm.state()).toThrow(/Mock data failure/)
  expect(()=>mockDataProvider.home.stories()).toThrow(/Mock data failure/)
  expect(()=>mockDataProvider.dashboard.operationalSnapshot()).toThrow(/Mock data failure/)
 })
})
