import type {FinanceCategory,FinanceInvoice,FinanceRule,FinanceTransaction} from './domain'
import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'

const TRANSACTIONS_KEY='portal-lander:finance:transactions'
const INVOICES_KEY='portal-lander:finance:invoices'

const readStored=<T>(key:string,fallback:()=>T):T=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback()}catch{return fallback()}}
const writeStored=<T>(key:string,value:T)=>{localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new CustomEvent('portal-lander:finance:changed'))}

export const financeRepository={
 listTransactions:():FinanceTransaction[]=>readStored(TRANSACTIONS_KEY,()=>getRuntimeDataProvider().finance.transactions()),
 saveTransactions:(items:FinanceTransaction[])=>writeStored(TRANSACTIONS_KEY,items),
 listInvoices:():FinanceInvoice[]=>readStored(INVOICES_KEY,()=>getRuntimeDataProvider().finance.invoices()),
 saveInvoices:(items:FinanceInvoice[])=>writeStored(INVOICES_KEY,items),
 listCategories:():FinanceCategory[]=>getRuntimeDataProvider().finance.categories(),
 listRules:():FinanceRule[]=>getRuntimeDataProvider().finance.rules(),
 reset(){localStorage.removeItem(TRANSACTIONS_KEY);localStorage.removeItem(INVOICES_KEY);window.dispatchEvent(new CustomEvent('portal-lander:finance:changed'))},
}
