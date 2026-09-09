import {describe,expect,it} from 'vitest'
import type {FinanceTransaction} from './domain'
import {financeSummary,financeTransactionPeriod,normalizeFinanceCompetence} from './financeSummary'

const tx=(overrides:Partial<FinanceTransaction>):FinanceTransaction=>({
  id:'tx',type:'receita',description:'Teste',category:'Teste',subcategory:'Teste',status:'pago',date:'2026-09-10',dueDate:'2026-09-20',amount:100,counterparty:'Teste',document:'',paymentMethod:'pix',contractRef:'',costCenter:'',competence:'09/2026',notes:'',createdAt:'2026-09-01T00:00:00.000Z',updatedAt:'2026-09-01T00:00:00.000Z',...overrides,
})

describe('finance summary',()=>{
  it('normalizes accounting competence before falling back to transaction date',()=>{
    expect(normalizeFinanceCompetence('09/2026')).toBe('2026-09')
    expect(normalizeFinanceCompetence('2027-01')).toBe('2027-01')
    expect(normalizeFinanceCompetence('13/2026')).toBeNull()
    expect(financeTransactionPeriod(tx({date:'2026-08-31',competence:'09/2026'}))).toBe('2026-09')
    expect(financeTransactionPeriod(tx({date:'2026-12-15',competence:''}))).toBe('2026-12')
  })

  it('calculates September 2026 from paid transactions in the current competence only',()=>{
    const result=financeSummary([
      tx({id:'r-current',type:'receita',amount:1000,status:'pago',date:'2026-08-31',competence:'09/2026'}),
      tx({id:'e-current',type:'despesa',amount:250,status:'pago',competence:'09/2026'}),
      tx({id:'r-previous',type:'receita',amount:900,status:'pago',competence:'08/2026'}),
      tx({id:'r-future',type:'receita',amount:800,status:'pago',competence:'10/2026'}),
      tx({id:'r-pending',type:'receita',amount:700,status:'pendente',competence:'09/2026'}),
      tx({id:'e-pending',type:'despesa',amount:300,status:'pendente',competence:'09/2026'}),
    ],new Date(2026,8,4,12))
    expect(result.periodKey).toBe('2026-09')
    expect(result.monthlyReceipts).toBe(1000)
    expect(result.monthlyExpenses).toBe(250)
    expect(result.monthlyProfit).toBe(750)
    expect(result.monthlyMargin).toBe(75)
    expect(result.openReceivable).toBe(700)
    expect(result.openPayable).toBe(300)
  })

  it('keeps pending and overdue accounts open while excluding paid and cancelled records',()=>{
    const result=financeSummary([
      tx({id:'receivable-pending',type:'receita',amount:100,status:'pendente'}),
      tx({id:'receivable-overdue',type:'receita',amount:200,status:'vencido'}),
      tx({id:'payable-pending',type:'despesa',amount:80,status:'pendente'}),
      tx({id:'payable-overdue',type:'despesa',amount:120,status:'vencido'}),
      tx({id:'paid',type:'receita',amount:999,status:'pago'}),
      tx({id:'cancelled',type:'despesa',amount:999,status:'cancelado'}),
    ],new Date(2026,8,4,12))
    expect(result.openReceivable).toBe(300)
    expect(result.openPayable).toBe(200)
    expect(result.openReceivableCount).toBe(2)
    expect(result.openPayableCount).toBe(2)
    expect(result.overdueReceivableCount).toBe(1)
    expect(result.overduePayableCount).toBe(1)
  })

  it.each([
    [new Date(2026,11,15,12),'12/2026','2026-12'],
    [new Date(2027,0,15,12),'01/2027','2027-01'],
  ])('handles year boundaries without fixed dates', (now,competence,periodKey)=>{
    const result=financeSummary([tx({competence,amount:450})],now)
    expect(result.periodKey).toBe(periodKey)
    expect(result.monthlyReceipts).toBe(450)
  })
})
