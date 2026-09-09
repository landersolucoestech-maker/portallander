import {beforeEach,describe,expect,it} from 'vitest'
import type {AnalyticsProviderStatus} from '../analytics/domain'
import type {AgendaEvent} from '../agenda/domain'
import type {Lead} from '../crm/domain'
import type {EditorialContent} from '../editorial/model'
import type {FinanceTransaction} from '../finance/domain'
import {mockDataProvider} from '../../shared/data/mockDataProvider'
import {setRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import {dashboardReadModel,deriveFeaturedContents,deriveOperationalAttention} from './dashboardReadModel'

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
  expect(data.featuredContents.length).toBeLessThanOrEqual(3)
  expect(data.pendingTasks.every(task=>task.status!=='concluida')).toBe(true)
  expect(data.financeSummary.monthRevenue).toBe(data.monthRevenue)
  expect(data.crmSummary.pipeline).toEqual(data.pipeline)
 })

 it('selects featured content from canonical published editorial records instead of cloning activity history',()=>{
  const makeContent=(id:string,status:EditorialContent['status'],active:boolean,publishedAt:string):EditorialContent=>({
   id,pageId:'page-noticias',title:`Conteúdo ${id}`,slug:`conteudo-${id}`,summary:'Resumo',body:[],author:'Portal Lander',status,active,tags:['notícias'],media:[],seo:{},createdAt:'2026-09-01T00:00:00.000Z',updatedAt:publishedAt,publishedAt,
  })
  const featured=deriveFeaturedContents([
   makeContent('old','published',true,'2026-09-01T10:00:00.000Z'),
   makeContent('draft','draft',true,'2026-09-06T10:00:00.000Z'),
   makeContent('inactive','published',false,'2026-09-06T11:00:00.000Z'),
   makeContent('latest','published',true,'2026-09-06T12:00:00.000Z'),
  ])
  expect(featured.map(item=>item.id)).toEqual(['latest','old'])
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

 it('derives overdue CRM and finance attention without a notification feed',()=>{
  const lead={id:'l1',status:'negociacao',nextFollowUp:'2026-09-05'} as Lead
  const transaction={id:'f1',type:'receita',status:'pendente',dueDate:'2026-09-04',date:'2026-08-01',amount:900} as FinanceTransaction
  const attention=deriveOperationalAttention({leads:[lead],transactions:[transaction],events:[]},new Date('2026-09-06T12:00:00.000Z'))
  expect(attention.map(item=>item.id)).toContain('crm:overdue-followups')
  expect(attention.map(item=>item.id)).toContain('finance:overdue')
 })

 it('derives provider stale/error and immediate agenda attention from real contracts',()=>{
  const providers=[{provider:'Instagram',providerAccountId:'ig',providerPropertyId:null,lastSyncAt:'2026-09-05T12:00:00.000Z',lastSuccessAt:'2026-09-04T12:00:00.000Z',lastStatus:'error',lastError:'token expired',freshnessStatus:'STALE'}] as AnalyticsProviderStatus[]
  const event={id:'e1',title:'Reunião comercial',startsAt:'2026-09-06T18:00:00.000Z',status:'agendado'} as AgendaEvent
  const attention=deriveOperationalAttention({leads:[],transactions:[],events:[event],providers},new Date('2026-09-06T12:00:00.000Z'))
  expect(attention[0]?.id).toContain('analytics:Instagram')
  expect(attention.map(item=>item.id)).toContain('agenda:e1')
 })

 it('returns no fake attention when no source condition is met',()=>{
  expect(deriveOperationalAttention({leads:[],transactions:[],events:[],providers:[]},new Date('2026-09-06T12:00:00.000Z'))).toEqual([])
 })
})
