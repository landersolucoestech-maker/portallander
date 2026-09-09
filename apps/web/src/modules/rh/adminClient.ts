import type {Employee,LeaveEntry,PayrollEntry,RhSeed} from './domain'

const apiBase=(import.meta.env.VITE_PORTAL_API_BASE_URL||'').replace(/\/$/,'')
export class RhAdminClientError extends Error{constructor(message:string,public code:string,public status:number){super(message)}}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{let response:Response;try{response=await fetch(`${apiBase}${path}`,{credentials:'include',headers:{'content-type':'application/json',...(init.headers||{})},...init})}catch{throw new RhAdminClientError('Não foi possível alcançar a API de RH.','RH_NETWORK_ERROR',0)}const payload=await response.json().catch(()=>({})) as Record<string,unknown>;if(!response.ok)throw new RhAdminClientError(String(payload.message||`Falha HTTP ${response.status}.`),String(payload.code||'RH_REQUEST_FAILED'),response.status);return payload as T}
const state=<T extends {state:RhSeed}>(value:T)=>value.state
export type EmployeeDraft=Omit<Employee,'id'|'createdAt'|'updatedAt'>
export type PayrollDraft=Omit<PayrollEntry,'id'|'createdAt'|'updatedAt'|'netSalary'>
export type LeaveDraft=Omit<LeaveEntry,'id'|'createdAt'|'updatedAt'|'days'|'approvedBy'|'approvedByUserId'|'approvedByDisplayName'|'approvedAt'>
export const rhAdminClient={
 state:()=>request<{state:RhSeed}>('/api/rh/state').then(state),
 saveEmployee:(value:EmployeeDraft,id?:string)=>request<{state:RhSeed}>(id?`/api/rh/employees/${encodeURIComponent(id)}`:'/api/rh/employees',{method:id?'PATCH':'POST',body:JSON.stringify(value)}).then(state),
 deleteEmployees:(ids:string[])=>request<{state:RhSeed}>('/api/rh/employees',{method:'DELETE',body:JSON.stringify({ids})}).then(state),
 savePayroll:(value:PayrollDraft,id?:string)=>request<{state:RhSeed}>(id?`/api/rh/payroll/${encodeURIComponent(id)}`:'/api/rh/payroll',{method:id?'PATCH':'POST',body:JSON.stringify(value)}).then(state),
 deletePayroll:(ids:string[])=>request<{state:RhSeed}>('/api/rh/payroll',{method:'DELETE',body:JSON.stringify({ids})}).then(state),
 saveLeave:(value:LeaveDraft,id?:string)=>request<{state:RhSeed}>(id?`/api/rh/leaves/${encodeURIComponent(id)}`:'/api/rh/leaves',{method:id?'PATCH':'POST',body:JSON.stringify(value)}).then(state),
 deleteLeaves:(ids:string[])=>request<{state:RhSeed}>('/api/rh/leaves',{method:'DELETE',body:JSON.stringify({ids})}).then(state),
 deleteDocument:(id:string)=>request<{state:RhSeed}>(`/api/rh/documents/${encodeURIComponent(id)}`,{method:'DELETE'}).then(state),
}
