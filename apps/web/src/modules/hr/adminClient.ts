import type {Employee,HrSeed,LeaveEntry,PayrollEntry} from './domain'

const apiBase=(import.meta.env.VITE_PORTAL_API_BASE_URL||'').replace(/\/$/,'')
const ERROR_MESSAGES_PT_BR:Record<string,string>={
  HR_NETWORK_ERROR:'Não foi possível alcançar a API de RH.',
  HR_UNAUTHENTICATED:'Sua sessão administrativa não é válida.',
  HR_EMPLOYEE_NOT_FOUND:'Funcionário não encontrado.',
  HR_EMPLOYEE_STATUS_INVALID:'Status de funcionário inválido.',
  HR_CONTRACT_TYPE_INVALID:'Tipo de contrato inválido.',
  HR_PAYROLL_NOT_FOUND:'Registro de pagamento não encontrado.',
  HR_LEAVE_NOT_FOUND:'Férias ou ausência não encontrada.',
  HR_DOCUMENT_NOT_FOUND:'Documento não encontrado.',
  HR_DOCUMENT_UPLOAD_UNAVAILABLE:'O upload de documentos ainda não está disponível neste ambiente.',
  HR_REQUEST_FAILED:'Não foi possível concluir a solicitação de RH.'
}
export class HrAdminClientError extends Error{constructor(message:string,public code:string,public status:number){super(message)}}
const localizedMessage=(code:string,fallback:string)=>ERROR_MESSAGES_PT_BR[code]??fallback
async function request<T>(path:string,init:RequestInit={}):Promise<T>{let response:Response;try{response=await fetch(`${apiBase}${path}`,{credentials:'include',headers:{'content-type':'application/json',...(init.headers||{})},...init})}catch{throw new HrAdminClientError(ERROR_MESSAGES_PT_BR.HR_NETWORK_ERROR,'HR_NETWORK_ERROR',0)}const payload=await response.json().catch(()=>({})) as Record<string,unknown>;if(!response.ok){const code=String(payload.code||'HR_REQUEST_FAILED');throw new HrAdminClientError(localizedMessage(code,ERROR_MESSAGES_PT_BR.HR_REQUEST_FAILED),code,response.status)}return payload as T}
const state=<T extends {state:HrSeed}>(value:T)=>value.state
export type EmployeeDraft=Omit<Employee,'id'|'createdAt'|'updatedAt'>
export type PayrollDraft=Omit<PayrollEntry,'id'|'createdAt'|'updatedAt'|'netSalary'>
export type LeaveDraft=Omit<LeaveEntry,'id'|'createdAt'|'updatedAt'|'days'|'approvedBy'|'approvedByUserId'|'approvedByDisplayName'|'approvedAt'>
export const hrAdminClient={
  state:()=>request<{state:HrSeed}>('/api/hr/state').then(state),
  saveEmployee:(value:EmployeeDraft,id?:string)=>request<{state:HrSeed}>(id?`/api/hr/employees/${encodeURIComponent(id)}`:'/api/hr/employees',{method:id?'PATCH':'POST',body:JSON.stringify(value)}).then(state),
  deleteEmployees:(ids:string[])=>request<{state:HrSeed}>('/api/hr/employees',{method:'DELETE',body:JSON.stringify({ids})}).then(state),
  savePayroll:(value:PayrollDraft,id?:string)=>request<{state:HrSeed}>(id?`/api/hr/payroll/${encodeURIComponent(id)}`:'/api/hr/payroll',{method:id?'PATCH':'POST',body:JSON.stringify(value)}).then(state),
  deletePayroll:(ids:string[])=>request<{state:HrSeed}>('/api/hr/payroll',{method:'DELETE',body:JSON.stringify({ids})}).then(state),
  saveLeave:(value:LeaveDraft,id?:string)=>request<{state:HrSeed}>(id?`/api/hr/leaves/${encodeURIComponent(id)}`:'/api/hr/leaves',{method:id?'PATCH':'POST',body:JSON.stringify(value)}).then(state),
  deleteLeaves:(ids:string[])=>request<{state:HrSeed}>('/api/hr/leaves',{method:'DELETE',body:JSON.stringify({ids})}).then(state),
  deleteDocument:(id:string)=>request<{state:HrSeed}>(`/api/hr/documents/${encodeURIComponent(id)}`,{method:'DELETE'}).then(state),
}
