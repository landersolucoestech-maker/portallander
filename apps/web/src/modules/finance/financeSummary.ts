import type {FinanceTransaction} from './domain'

export type FinanceSummary={
  periodKey:string
  monthlyReceipts:number
  monthlyExpenses:number
  monthlyProfit:number
  monthlyMargin:number
  openReceivable:number
  openPayable:number
  openReceivableCount:number
  openPayableCount:number
  overdueReceivableCount:number
  overduePayableCount:number
}

const pad=(value:number)=>String(value).padStart(2,'0')
const validMonth=(value:number)=>Number.isInteger(value)&&value>=1&&value<=12

export function normalizeFinanceCompetence(value:string):string|null{
  const raw=value.trim()
  let match=raw.match(/^(\d{2})\/(\d{4})$/)
  if(match){
    const month=Number(match[1])
    return validMonth(month)?`${match[2]}-${pad(month)}`:null
  }
  match=raw.match(/^(\d{4})-(\d{2})$/)
  if(match){
    const month=Number(match[2])
    return validMonth(month)?`${match[1]}-${pad(month)}`:null
  }
  return null
}

export function financeTransactionPeriod(transaction:FinanceTransaction):string|null{
  const competence=normalizeFinanceCompetence(transaction.competence)
  if(competence)return competence
  return /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(transaction.date)?transaction.date.slice(0,7):null
}

export function financeSummary(transactions:readonly FinanceTransaction[],now=new Date()):FinanceSummary{
  const periodKey=`${now.getFullYear()}-${pad(now.getMonth()+1)}`
  const monthlyPaid=transactions.filter(item=>item.status==='pago'&&financeTransactionPeriod(item)===periodKey)
  const monthlyReceipts=monthlyPaid.filter(item=>item.type==='receita').reduce((sum,item)=>sum+item.amount,0)
  const monthlyExpenses=monthlyPaid.filter(item=>item.type==='despesa').reduce((sum,item)=>sum+item.amount,0)
  const monthlyProfit=monthlyReceipts-monthlyExpenses
  const monthlyMargin=monthlyReceipts?monthlyProfit/monthlyReceipts*100:0
  const open=transactions.filter(item=>item.status==='pendente'||item.status==='vencido')
  const receivable=open.filter(item=>item.type==='receita')
  const payable=open.filter(item=>item.type==='despesa')
  return {
    periodKey,
    monthlyReceipts,
    monthlyExpenses,
    monthlyProfit,
    monthlyMargin,
    openReceivable:receivable.reduce((sum,item)=>sum+item.amount,0),
    openPayable:payable.reduce((sum,item)=>sum+item.amount,0),
    openReceivableCount:receivable.length,
    openPayableCount:payable.length,
    overdueReceivableCount:receivable.filter(item=>item.status==='vencido').length,
    overduePayableCount:payable.filter(item=>item.status==='vencido').length,
  }
}
