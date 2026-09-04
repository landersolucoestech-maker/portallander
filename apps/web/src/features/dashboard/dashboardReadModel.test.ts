import {beforeEach,describe,expect,it} from 'vitest'
import {mockDataProvider} from '../../shared/data/mockDataProvider'
import {setRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import {dashboardReadModel} from './dashboardReadModel'

describe('dashboard derived metrics',()=>{
 beforeEach(()=>{mockDataProvider.setScenario('success');setRuntimeDataProvider(mockDataProvider)})
 it('derives financial, CRM, agenda, marketing and editorial metrics from source records',()=>{
  const data=dashboardReadModel.snapshot(new Date('2026-08-30T00:00:00.000Z'))
  expect(data.period.month).toBe('2026-08')
  expect(data.monthRevenue).toBeGreaterThan(0)
  expect(data.receivable).toBeGreaterThan(0)
  expect(data.activeContracts).toBeGreaterThan(0)
  expect(Object.values(data.pipeline).reduce((sum,value)=>sum+value,0)).toBe(mockDataProvider.crm.state().leads.length)
  expect(data.revenueByCategory.reduce((sum,[,value])=>sum+value,0)).toBeGreaterThan(0)
  expect(data.editorialCounts.drafts+data.editorialCounts.published+data.editorialCounts.archived).toBe(mockDataProvider.editorial.contents().length)
  expect(data.pendingTasks.every(task=>task.status!=='concluida')).toBe(true)
 })

 it('derives the current month and future cutoff from the supplied clock instead of source constants',()=>{
  const future=dashboardReadModel.snapshot(new Date('2027-02-15T10:30:00.000Z'))
  expect(future.period.month).toBe('2027-02')
  expect(future.period.generatedAt).toBe('2027-02-15T10:30:00.000Z')
  expect(future.upcoming.every(item=>item.startsAt>='2027-02-15T10:30:00.000Z')).toBe(true)
  expect(future.pendingTasks.every(item=>!item.deadline||item.deadline>='2027-02-15')).toBe(true)
 })
})
