import {financeCategoriesMock,financeInvoicesMock,financeRulesMock,financeTransactionsMock} from './mocks'

export type FinanceTransactionType='receita'|'despesa'
export type FinanceStatus='pago'|'pendente'|'vencido'|'cancelado'
export type FinanceTransaction={id:string;type:FinanceTransactionType;description:string;category:string;subcategory:string;status:FinanceStatus;date:string;dueDate:string;amount:number;counterparty:string;document:string;paymentMethod:string;contractRef:string;costCenter:string;competence:string;notes:string;createdAt:string;updatedAt:string}
export type InvoiceType='entrada'|'saida'
export type InvoiceStatus='emitida'|'pendente'|'paga'|'cancelada'
export type FinanceInvoice={id:string;number:string;series:string;type:InvoiceType;party:string;document:string;issueDate:string;dueDate:string;amount:number;status:InvoiceStatus;description:string;pdfUrl:string;createdAt:string;updatedAt:string}
export type FinanceCategory={id:string;category:string;subcategory:string;type:FinanceTransactionType;counterparty:string;active:boolean}
export type FinanceRule={id:string;name:string;event:'transaction.created'|'transaction.paid'|'invoice.due'|'contract.signed';condition:string;action:string;active:boolean}

export const financeCategories=financeCategoriesMock
export const seedTransactions=financeTransactionsMock
export const seedInvoices=financeInvoicesMock
export const seedRules=financeRulesMock

export const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export const uid=(prefix:string)=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
