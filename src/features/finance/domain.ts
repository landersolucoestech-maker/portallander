import {financeCategoriesMock,financeInvoicesMock,financeRulesMock,financeTransactionsMock} from './mocks'

export type FinanceTransactionType='receita'|'despesa'
export type FinanceStatus='pago'|'pendente'|'vencido'|'cancelado'
export type FinancePaymentType='avista'|'parcelado'
export type FinanceTransaction={id:string;type:FinanceTransactionType;description:string;category:string;subcategory:string;status:FinanceStatus;date:string;dueDate:string;amount:number;counterparty:string;document:string;paymentMethod:string;paymentType?:FinancePaymentType;installmentCount?:number;installmentInterval?:number;firstInstallmentDate?:string;contractRef:string;contactRef?:string;supplierRef?:string;costCenter:string;competence:string;notes:string;attachmentName?:string;attachmentDataUrl?:string;createdAt:string;updatedAt:string}
export type InvoiceType='entrada'|'saida'
export type InvoiceStatus='emitida'|'pendente'|'paga'|'cancelada'
export type FinanceInvoiceItem={id:string;description:string;quantity:number;unit:string;unitPrice:number;discountAmount:number;totalAmount:number;productRef?:string;serviceRef?:string}
export type FinanceInvoiceTax={id:string;taxType:string;taxCode:string;baseAmount:number;rate:number;amount:number;withheld:boolean;treatment:'informativo'|'adicionado'}
export type FinanceInvoiceRetention={id:string;type:string;baseAmount:number;rate:number;amount:number}
export type FinanceInvoice={id:string;number:string;series:string;type:InvoiceType;party:string;document:string;issueDate:string;dueDate:string;amount:number;status:InvoiceStatus;description:string;pdfUrl:string;createdAt:string;updatedAt:string;documentType?:string;model?:string;competenceDate?:string;productRef?:string;serviceRef?:string;businessUnitRef?:string;contractRef?:string;xmlReference?:string;notes?:string;items?:FinanceInvoiceItem[];taxes?:FinanceInvoiceTax[];retentions?:FinanceInvoiceRetention[]}
export type FinanceCategory={id:string;category:string;subcategory:string;type:FinanceTransactionType;counterparty:string;active:boolean}
export type FinanceRule={id:string;name:string;event:'transaction.created'|'transaction.paid'|'invoice.due'|'contract.signed';condition:string;action:string;active:boolean}

export const financeCategories=financeCategoriesMock
export const seedTransactions=financeTransactionsMock
export const seedInvoices=financeInvoicesMock
export const seedRules=financeRulesMock

export const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export const uid=(prefix:string)=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
