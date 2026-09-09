import {adminApiBase,AdminAuthError} from '../access/authClient'
import type {AgendaEvent,AgendaEventDraft} from './domain'

type ApiError={message?:string;code?:string}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const base=adminApiBase()
  if(!base)throw new AdminAuthError('A URL da API administrativa não está configurada.',503,'ADMIN_API_NOT_CONFIGURED')
  const response=await fetch(`${base}${path}`,{...init,credentials:'include',headers:{Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...init.headers}})
  const body=await response.json().catch(()=>({})) as T&ApiError
  if(!response.ok)throw new AdminAuthError(body.message||`A API administrativa respondeu ${response.status}.`,response.status,body.code)
  return body
}

export const agendaAdminClient={
  async list(){return (await request<{events:AgendaEvent[]}>('/api/agenda/events')).events},
  async create(draft:AgendaEventDraft){return (await request<{event:AgendaEvent}>('/api/agenda/events',{method:'POST',body:JSON.stringify(draft)})).event},
  async update(id:string,draft:AgendaEventDraft,expectedUpdatedAt?:string){return (await request<{event:AgendaEvent}>(`/api/agenda/events/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({patch:draft,expectedUpdatedAt})})).event},
  async remove(id:string){await request(`/api/agenda/events/${encodeURIComponent(id)}`,{method:'DELETE'})},
}
