import type {FinanceCategory,FinanceInvoice,FinanceRule,FinanceTransaction} from './domain'
import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'

const TRANSACTIONS_KEY='portal-lander:finance:transactions'
const INVOICES_KEY='portal-lander:finance:invoices'
const CATEGORIES_KEY='portal-lander:finance:categories'
const RULES_KEY='portal-lander:finance:rules'

const readStored=<T>(key:string,fallback:()=>T):T=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback()}catch{return fallback()}}
const writeStored=<T>(key:string,value:T)=>{localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new CustomEvent('portal-lander:finance:changed'))}

export const financeRepository={
 listTransactions:():FinanceTransaction[]=>readStored(TRANSACTIONS_KEY,()=>getRuntimeDataProvider().finance.transactions()),
 saveTransactions:(items:FinanceTransaction[])=>writeStored(TRANSACTIONS_KEY,items),
 listInvoices:():FinanceInvoice[]=>readStored(INVOICES_KEY,()=>getRuntimeDataProvider().finance.invoices()),
 saveInvoices:(items:FinanceInvoice[])=>writeStored(INVOICES_KEY,items),
 listCategories:():FinanceCategory[]=>readStored(CATEGORIES_KEY,()=>getRuntimeDataProvider().finance.categories()),
 saveCategories:(items:FinanceCategory[])=>writeStored(CATEGORIES_KEY,items),
 listRules:():FinanceRule[]=>readStored(RULES_KEY,()=>getRuntimeDataProvider().finance.rules()),
 saveRules:(items:FinanceRule[])=>writeStored(RULES_KEY,items),
 reset(){for(const key of [TRANSACTIONS_KEY,INVOICES_KEY,CATEGORIES_KEY,RULES_KEY])localStorage.removeItem(key);window.dispatchEvent(new CustomEvent('portal-lander:finance:changed'))},
}
