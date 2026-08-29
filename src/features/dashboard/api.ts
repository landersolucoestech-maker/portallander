import type { AuditLogRow, OperationalDashboard } from './types'

const API_PREFIX='/api/v1'

async function request<T>(path:string):Promise<T>{
  const response=await fetch(`${API_PREFIX}${path}`,{credentials:'include',headers:{Accept:'application/json'}})
  if(!response.ok)throw new Error(`API ${response.status}: ${response.statusText}`)
  return response.json() as Promise<T>
}

export const dashboardApi={
  getOperational:()=>request<OperationalDashboard>('/analytics/dashboard'),
  getActivity:(limit:number)=>request<AuditLogRow[]>(`/audit-logs?limit=${encodeURIComponent(String(limit))}`),
}
