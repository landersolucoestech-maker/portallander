import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'

const monthKey=(now:Date)=>`${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`
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
  const today=currentMonth+'-'+String(now.getUTCDate()).padStart(2,'0')
  const revenue=paidRevenue(transactions)
  const monthRevenue=revenue.filter(item=>item.date.startsWith(currentMonth)).reduce((sum,item)=>sum+item.amount,0)
  const receivable=transactions.filter(item=>item.type==='receita'&&(item.status==='pendente'||item.status==='vencido')).reduce((sum,item)=>sum+item.amount,0)
  const activeContracts=contracts.filter(item=>['signed','active','awaiting_signature','partially_signed'].includes(item.status))
  const pendingCommercialPublications=contracts.filter(item=>item.status!=='cancelled'&&item.status!=='closed'&&item.status!=='expired'&&/conte[uú]do|public|editorial/i.test(`${item.type} ${item.description}`)).length
  const pipeline=crm.leads.reduce<Record<string,number>>((acc,item)=>{acc[item.status]=(acc[item.status]??0)+1;return acc},{})
  const revenueByCategory=Object.entries(revenue.reduce<Record<string,number>>((acc,item)=>{acc[item.category]=(acc[item.category]??0)+item.amount;return acc},{})).sort((a,b)=>b[1]-a[1])
  const upcoming=agenda.filter(item=>item.status!=='cancelled'&&item.status!=='completed'&&item.startsAt>=nowIso).sort((a,b)=>a.startsAt.localeCompare(b.startsAt)).slice(0,5)
  const pendingTasks=marketing.tasks.filter(item=>item.status!=='concluida'&&(!item.deadline||item.deadline>=today)).sort((a,b)=>(a.deadline||'9999-12-31').localeCompare(b.deadline||'9999-12-31')).slice(0,5)
  const editorialCounts={drafts:editorial.filter(item=>item.status==='draft').length,published:editorial.filter(item=>item.status==='published').length,archived:editorial.filter(item=>item.status==='archived').length,publishedThisMonth:editorial.filter(item=>item.status==='published'&&item.publishedAt?.startsWith(currentMonth)).length}
  return {period:{month:currentMonth,generatedAt:nowIso},monthRevenue,receivable,activeContracts:activeContracts.length,pendingCommercialPublications,pipeline,revenueByCategory,upcoming,pendingTasks,alerts:operational.alerts,editorialCounts}
 },
}
