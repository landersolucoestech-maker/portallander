import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import type {AnalyticsProviderStatus} from '../analytics/domain'
import type {Lead} from '../crm/domain'
import type {EditorialContent} from '../editorial/model'
import type {FinanceTransaction} from '../finance/domain'

const FOLLOW_UP_HORIZON_DAYS=3
const AGENDA_HORIZON_HOURS=24
const CLOSED_LEAD_STATUSES=new Set(['fechado','perdido'])
const CLOSED_EVENT_STATUSES=new Set(['cancelado','cancelled','concluido','completed','realizado'])

const monthKey=(now:Date)=>`${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`
const previousMonthKey=(now:Date)=>{const previous=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,1));return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth()+1).padStart(2,'0')}`}
const dayKey=(now:Date)=>`${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}-${String(now.getUTCDate()).padStart(2,'0')}`
const normalizeDay=(value:string)=>value.slice(0,10)
const plusDays=(day:string,days:number)=>{const date=new Date(`${day}T00:00:00.000Z`);date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10)}

export type DashboardAttentionItem={
 id:string
 kind:'crm'|'finance'|'analytics'|'agenda'
 priority:number
 title:string
 detail:string
 href:string
 dueAt:string|null
}

type DashboardAgendaEntry={
 id:string
 title:string
 startsAt:string
 status:string
 endsAt?:string
 type?:string
 description?:string
}

export type DashboardFeaturedContent={
 id:string
 title:string
 coverImage?:string
 tags:string[]
 publishedAt?:string
 updatedAt:string
}

export function deriveFinanceSummary(items:readonly FinanceTransaction[],now=new Date()){
 const month=monthKey(now),previousMonth=previousMonthKey(now),today=dayKey(now)
 const revenuePaid=items.filter(item=>item.type==='receita'&&item.status==='pago')
 const expensePaid=items.filter(item=>item.type==='despesa'&&item.status==='pago')
 const monthRevenue=revenuePaid.filter(item=>item.date.startsWith(month)).reduce((sum,item)=>sum+item.amount,0)
 const previousMonthRevenue=revenuePaid.filter(item=>item.date.startsWith(previousMonth)).reduce((sum,item)=>sum+item.amount,0)
 const monthExpenses=expensePaid.filter(item=>item.date.startsWith(month)).reduce((sum,item)=>sum+item.amount,0)
 const receivable=items.filter(item=>item.type==='receita'&&(item.status==='pendente'||item.status==='vencido')).reduce((sum,item)=>sum+item.amount,0)
 const overdue=items.filter(item=>item.status==='vencido'||(item.status==='pendente'&&Boolean(item.dueDate)&&normalizeDay(item.dueDate)<today))
 return {monthRevenue,previousMonthRevenue,monthExpenses,balance:monthRevenue-monthExpenses,receivable,overdueCount:overdue.length,overdueAmount:overdue.reduce((sum,item)=>sum+item.amount,0)}
}

export function deriveCrmSummary(leads:readonly Lead[],now=new Date()){
 const today=dayKey(now),horizon=plusDays(today,FOLLOW_UP_HORIZON_DAYS),month=monthKey(now),previousMonth=previousMonthKey(now)
 const pipeline=leads.reduce<Record<string,number>>((acc,item)=>{acc[item.status]=(acc[item.status]??0)+1;return acc},{})
 const active=leads.filter(item=>!CLOSED_LEAD_STATUSES.has(item.status))
 const closed=leads.filter(item=>item.status==='fechado')
 const followUps=active.filter(item=>Boolean(item.nextFollowUp)).map(item=>({...item,followUpDay:normalizeDay(item.nextFollowUp)}))
 const newLeadsThisMonth=leads.filter(item=>(item.createdAt??'').startsWith(month)).length
 const previousMonthNewLeads=leads.filter(item=>(item.createdAt??'').startsWith(previousMonth)).length
 const pipelineValue=active.reduce((sum,item)=>sum+(typeof item.estimatedValue==='number'?item.estimatedValue:0),0)
 return {
  pipeline,
  total:leads.length,
  newLeads:pipeline.novo??0,
  newLeadsThisMonth,
  previousMonthNewLeads,
  negotiations:pipeline.negociacao??0,
  activeOpportunities:active.length,
  pipelineValue,
  conversionRate:leads.length?closed.length/leads.length*100:0,
  followUps:{
   overdue:followUps.filter(item=>item.followUpDay<today).length,
   today:followUps.filter(item=>item.followUpDay===today).length,
   upcoming:followUps.filter(item=>item.followUpDay>today&&item.followUpDay<=horizon).length,
  },
 }
}

export function deriveEditorialSummary(contents:readonly EditorialContent[],now=new Date()){
 const month=monthKey(now)
 return {
  drafts:contents.filter(item=>item.status==='draft').length,
  published:contents.filter(item=>item.status==='published').length,
  archived:contents.filter(item=>item.status==='archived').length,
  publishedThisMonth:contents.filter(item=>item.status==='published'&&item.publishedAt?.startsWith(month)).length,
 }
}

export function deriveFeaturedContents(contents:readonly EditorialContent[]):DashboardFeaturedContent[]{
 return contents.filter(item=>item.active&&item.status==='published')
  .sort((a,b)=>(b.publishedAt??b.updatedAt).localeCompare(a.publishedAt??a.updatedAt)||b.updatedAt.localeCompare(a.updatedAt)||b.id.localeCompare(a.id))
  .slice(0,3)
  .map(item=>({id:item.id,title:item.title,coverImage:item.coverImage,tags:[...item.tags],publishedAt:item.publishedAt,updatedAt:item.updatedAt}))
}

export function deriveAgendaSummary(events:readonly DashboardAgendaEntry[],now=new Date()){
 const nowIso=now.toISOString()
 const upcoming=events.filter(item=>!CLOSED_EVENT_STATUSES.has(item.status)&&item.startsAt>=nowIso).sort((a,b)=>a.startsAt.localeCompare(b.startsAt)).slice(0,5)
 const immediateEnd=new Date(now.getTime()+AGENDA_HORIZON_HOURS*60*60*1000).toISOString()
 return {upcoming,immediate:upcoming.filter(item=>item.startsAt<=immediateEnd)}
}

export function deriveProviderAttention(providers:readonly AnalyticsProviderStatus[]):DashboardAttentionItem[]{
 return providers.flatMap(provider=>{
  const status=String(provider.lastStatus||'').toLowerCase()
  const hasError=Boolean(provider.lastError)||/error|fail|failed|failure|unavailable/.test(status)
  const stale=provider.freshnessStatus==='STALE'
  if(!hasError&&!stale)return []
  return [{
   id:`analytics:${provider.provider}:${provider.providerAccountId??provider.providerPropertyId??'default'}`,
   kind:'analytics' as const,
   priority:hasError?0:1,
   title:hasError?`Analytics · ${provider.provider} com falha`:`Analytics · ${provider.provider} desatualizado`,
   detail:provider.lastError||'A última sincronização disponível está marcada como stale.',
   href:'/app/metricas',
   dueAt:provider.lastSyncAt,
  }]
 })
}

export function deriveOperationalAttention(input:{leads:readonly Lead[];transactions:readonly FinanceTransaction[];events:readonly DashboardAgendaEntry[];providers?:readonly AnalyticsProviderStatus[]},now=new Date()):DashboardAttentionItem[]{
 const crm=deriveCrmSummary(input.leads,now)
 const finance=deriveFinanceSummary(input.transactions,now)
 const agenda=deriveAgendaSummary(input.events,now)
 const items:DashboardAttentionItem[]=[]
 if(crm.followUps.overdue>0)items.push({id:'crm:overdue-followups',kind:'crm',priority:0,title:`${crm.followUps.overdue} follow-up${crm.followUps.overdue===1?'':'s'} vencido${crm.followUps.overdue===1?'':'s'}`,detail:'Leads ativos com próxima ação anterior a hoje.',href:'/app/crm',dueAt:null})
 if(finance.overdueCount>0)items.push({id:'finance:overdue',kind:'finance',priority:0,title:`${finance.overdueCount} lançamento${finance.overdueCount===1?'':'s'} financeiro${finance.overdueCount===1?'':'s'} vencido${finance.overdueCount===1?'':'s'}`,detail:'Pendências vencidas ou com data de vencimento ultrapassada.',href:'/app/finance',dueAt:null})
 if(crm.followUps.today>0)items.push({id:'crm:today-followups',kind:'crm',priority:1,title:`${crm.followUps.today} follow-up${crm.followUps.today===1?'':'s'} para hoje`,detail:'Leads ativos com próxima ação marcada para hoje.',href:'/app/crm',dueAt:null})
 items.push(...deriveProviderAttention(input.providers??[]))
 if(agenda.immediate.length>0){const event=agenda.immediate[0];items.push({id:`agenda:${event.id}`,kind:'agenda',priority:2,title:'Compromisso nas próximas 24h',detail:event.title,href:'/app/agenda',dueAt:event.startsAt})}
 if(crm.followUps.upcoming>0)items.push({id:'crm:upcoming-followups',kind:'crm',priority:2,title:`${crm.followUps.upcoming} follow-up${crm.followUps.upcoming===1?'':'s'} nos próximos ${FOLLOW_UP_HORIZON_DAYS} dias`,detail:'Próximas ações comerciais já programadas.',href:'/app/crm',dueAt:null})
 return items.sort((a,b)=>a.priority-b.priority||(a.dueAt??'9999').localeCompare(b.dueAt??'9999')||a.id.localeCompare(b.id))
}

const paidRevenue=(items:ReturnType<ReturnType<typeof getRuntimeDataProvider>['finance']['transactions']>)=>items.filter(item=>item.type==='receita'&&item.status==='pago')

export const dashboardReadModel={
 snapshot(now=new Date()){
  const provider=getRuntimeDataProvider()
  const transactions=provider.finance.transactions()
  const contracts=provider.contracts.state().contracts
  const crm=provider.crm.state()
  const agenda=provider.agenda.items()
  const editorial=provider.editorial.contents()
  const marketing=provider.marketing.seed()
  const operational=provider.dashboard.operationalSnapshot()
  const currentMonth=monthKey(now)
  const nowIso=now.toISOString()
  const today=dayKey(now)
  const revenue=paidRevenue(transactions)
  const financeSummary=deriveFinanceSummary(transactions,now)
  const crmSummary=deriveCrmSummary(crm.leads,now)
  const agendaSummary=deriveAgendaSummary(agenda,now)
  const editorialContents=editorial as EditorialContent[]
  const editorialCounts=deriveEditorialSummary(editorialContents,now)
  const featuredContents=deriveFeaturedContents(editorialContents)
  const activeContracts=contracts.filter(item=>['signed','active','awaiting_signature','partially_signed'].includes(item.status))
  const pendingCommercialPublications=contracts.filter(item=>item.status!=='cancelled'&&item.status!=='closed'&&item.status!=='expired'&&/conte[uú]do|public|editorial/i.test(`${item.type} ${item.description}`)).length
  const revenueByCategory=Object.entries(revenue.reduce<Record<string,number>>((acc,item)=>{acc[item.category]=(acc[item.category]??0)+item.amount;return acc},{})).sort((a,b)=>b[1]-a[1])
  const pendingTasks=marketing.tasks.filter(item=>item.status!=='concluida'&&(!item.deadline||item.deadline>=today)).sort((a,b)=>(a.deadline||'9999-12-31').localeCompare(b.deadline||'9999-12-31')).slice(0,5)
  return {
   period:{month:currentMonth,generatedAt:nowIso},
   financeSummary,
   crmSummary,
   editorialCounts,
   featuredContents,
   upcoming:agendaSummary.upcoming,
   attention:deriveOperationalAttention({leads:crm.leads,transactions,events:agenda},now),
   availability:{finance:true,crm:true,editorial:true,agenda:true},
   domainErrors:{} as Record<string,string>,
   monthRevenue:financeSummary.monthRevenue,
   receivable:financeSummary.receivable,
   activeContracts:activeContracts.length,
   pendingCommercialPublications,
   pipeline:crmSummary.pipeline,
   revenueByCategory,
   pendingTasks,
   alerts:operational.alerts,
  }
 },
}
