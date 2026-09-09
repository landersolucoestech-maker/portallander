import {adminApiBase,AdminAuthError} from '../access/authClient'
import type {FinanceCategory,FinanceInvoice,FinanceRule,FinanceTransaction} from './domain'

type ApiError={message?:string;code?:string}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const base=adminApiBase()
  if(!base)throw new AdminAuthError('A URL da API administrativa não está configurada.',503,'ADMIN_API_NOT_CONFIGURED')
  const response=await fetch(`${base}${path}`,{...init,credentials:'include',headers:{Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...init.headers}})
  const body=await response.json().catch(()=>({})) as T&ApiError
  if(!response.ok)throw new AdminAuthError(body.message||`A API administrativa respondeu ${response.status}.`,response.status,body.code)
  return body
}

const itemPath=(collection:string,id:string)=>`/api/finance/${collection}/${encodeURIComponent(id)}`
export const financeAdminClient={
  async listTransactions(){return (await request<{transactions:FinanceTransaction[]}>('/api/finance/transactions')).transactions},
  async createTransaction(value:FinanceTransaction){return (await request<{transaction:FinanceTransaction}>('/api/finance/transactions',{method:'POST',body:JSON.stringify(value)})).transaction},
  async updateTransaction(value:FinanceTransaction){return (await request<{transaction:FinanceTransaction}>(itemPath('transactions',value.id),{method:'PATCH',body:JSON.stringify({patch:value,expectedUpdatedAt:value.updatedAt})})).transaction},
  async removeTransaction(id:string){await request(itemPath('transactions',id),{method:'DELETE'})},

  async listInvoices(){return (await request<{invoices:FinanceInvoice[]}>('/api/finance/invoices')).invoices},
  async createInvoice(value:FinanceInvoice){return (await request<{invoice:FinanceInvoice}>('/api/finance/invoices',{method:'POST',body:JSON.stringify(value)})).invoice},
  async updateInvoice(value:FinanceInvoice){return (await request<{invoice:FinanceInvoice}>(itemPath('invoices',value.id),{method:'PATCH',body:JSON.stringify({patch:value,expectedUpdatedAt:value.updatedAt})})).invoice},
  async removeInvoice(id:string){await request(itemPath('invoices',id),{method:'DELETE'})},

  async listCategories(){return (await request<{categories:FinanceCategory[]}>('/api/finance/categories')).categories},
  async createCategory(value:FinanceCategory){return (await request<{category:FinanceCategory}>('/api/finance/categories',{method:'POST',body:JSON.stringify(value)})).category},
  async updateCategory(value:FinanceCategory){return (await request<{category:FinanceCategory}>(itemPath('categories',value.id),{method:'PATCH',body:JSON.stringify({patch:value})})).category},
  async removeCategory(id:string){await request(itemPath('categories',id),{method:'DELETE'})},

  async listRules(){return (await request<{rules:FinanceRule[]}>('/api/finance/rules')).rules},
  async createRule(value:FinanceRule){return (await request<{rule:FinanceRule}>('/api/finance/rules',{method:'POST',body:JSON.stringify(value)})).rule},
  async updateRule(value:FinanceRule){return (await request<{rule:FinanceRule}>(itemPath('rules',value.id),{method:'PATCH',body:JSON.stringify({patch:value})})).rule},
  async removeRule(id:string){await request(itemPath('rules',id),{method:'DELETE'})},
}
