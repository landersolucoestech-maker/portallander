import {beforeEach,describe,expect,it} from 'vitest'
import {mockDataProvider} from '../../shared/data/mockDataProvider'
import {setRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import {dashboardReadModel} from './dashboardReadModel'

describe('dashboard derived metrics',()=>{
 beforeEach(()=>{mockDataProvider.setScenario('success');setRuntimeDataProvider(mockDataProvider)})
 it('derives financial, contract, CRM, agenda and editorial metrics from source records',()=>{
  const data=dashboardReadModel.snapshot()
  expect(data.monthRevenue).toBeGreaterThan(0)
  expect(data.receivable).toBeGreaterThan(0)
  expect(data.activeContracts).toBeGreaterThan(0)
  expect(Object.values(data.pipeline).reduce((sum,value)=>sum+value,0)).toBe(mockDataProvider.crm.state().leads.length)
  expect(data.revenueByCategory.reduce((sum,[,value])=>sum+value,0)).toBeGreaterThan(0)
  expect(data.editorialCounts.drafts+data.editorialCounts.published+data.editorialCounts.archived).toBe(mockDataProvider.editorial.contents().length)
 })
})
