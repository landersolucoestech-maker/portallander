import type {MarketingContent} from './domain'

export const UPCOMING_DELIVERY_DAYS=7
const ACTIVE_DELIVERY_STATUSES=new Set<MarketingContent['status']>(['producao','revisao','agendado'])

function startOfLocalDay(value:Date){return new Date(value.getFullYear(),value.getMonth(),value.getDate())}
function parseDateKey(value:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null
  const [year,month,day]=value.split('-').map(Number)
  const parsed=new Date(year,month-1,day)
  return parsed.getFullYear()===year&&parsed.getMonth()===month-1&&parsed.getDate()===day?parsed:null
}

export function currentMonthKey(now=new Date()){
  const year=now.getFullYear(),month=String(now.getMonth()+1).padStart(2,'0')
  return `${year}-${month}`
}

export function isUpcomingDeliveryDate(dateKey:string,now=new Date(),days=UPCOMING_DELIVERY_DAYS){
  const value=parseDateKey(dateKey)
  if(!value||!Number.isInteger(days)||days<1)return false
  const start=startOfLocalDay(now)
  const endExclusive=new Date(start)
  endExclusive.setDate(endExclusive.getDate()+days)
  return value>=start&&value<endExclusive
}

export function upcomingDeliveries(contents:readonly MarketingContent[],now=new Date(),days=UPCOMING_DELIVERY_DAYS){
  return contents.filter(item=>ACTIVE_DELIVERY_STATUSES.has(item.status)&&isUpcomingDeliveryDate(item.publishDate,now,days))
}
