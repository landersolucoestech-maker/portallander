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

 it.each([
  ['setembro/2026','2026-09-04T12:00:00.000Z','2026-09'],
  ['dezembro/2026','2026-12-31T23:00:00.000Z','2026-12'],
  ['janeiro/2027','2027-01-01T01:00:00.000Z','2027-01'],
  ['fevereiro/2027','2027-02-15T10:30:00.000Z','2027-02'],
 ])('derives %s from the supplied clock without source constants',(_label,clock,month)=>{
  const now=new Date(clock)
  const data=dashboardReadModel.snapshot(now)
  expect(data.period.month).toBe(month)
  expect(data.period.generatedAt).toBe(clock)
  expect(data.upcoming.every(item=>item.startsAt>=clock)).toBe(true)
  const today=clock.slice(0,10)
  expect(data.pendingTasks.every(item=>!item.deadline||item.deadline>=today)).toBe(true)
 })

 it('does not embed the retired August 2026 cutoff in production calculations',()=>{
  const january=dashboardReadModel.snapshot(new Date('2027-01-10T12:00:00.000Z'))
  expect(january.period.month).toBe('2027-01')
  expect(january.period.generatedAt).not.toContain('2026-08')
 })
})
