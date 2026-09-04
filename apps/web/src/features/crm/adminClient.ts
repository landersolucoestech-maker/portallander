import {adminApiBase,AdminAuthError} from '../access/authClient'
import type {Contact,Interaction,InteractionType,Lead,LeadStatus,TimelineEntry} from './domain'

type ApiError={message?:string;code?:string}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const base=adminApiBase()
  if(!base)throw new AdminAuthError('A URL da API administrativa não está configurada.',503,'ADMIN_API_NOT_CONFIGURED')
  const response=await fetch(`${base}${path}`,{...init,credentials:'include',headers:{Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...init.headers}})
  const body=await response.json().catch(()=>({})) as T&ApiError
  if(!response.ok)throw new AdminAuthError(body.message||`A API administrativa respondeu ${response.status}.`,response.status,body.code)
  return body
}

export const crmAdminClient={
  async listLeads(){return (await request<{leads:Lead[]}>('/api/crm/leads')).leads},
  async listContacts(){return (await request<{contacts:Contact[]}>('/api/crm/contacts')).contacts},
  async createLead(input:Parameters<typeof import('./repository').crmRepository.createLead>[0]){return (await request<{lead:Lead}>('/api/crm/leads',{method:'POST',body:JSON.stringify(input)})).lead},
  async updateLead(id:string,patch:Partial<Lead>,expectedUpdatedAt?:string){return (await request<{lead:Lead}>(`/api/crm/leads/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({patch,expectedUpdatedAt})})).lead},
  async deleteLead(id:string){await request(`/api/crm/leads/${encodeURIComponent(id)}`,{method:'DELETE'})},
  async bulkDeleteLeads(ids:string[]){await request('/api/crm/leads/bulk-delete',{method:'POST',body:JSON.stringify({ids})})},
  async bulkStatus(ids:string[],status:LeadStatus){await request('/api/crm/leads/bulk-status',{method:'POST',body:JSON.stringify({ids,status})})},
  async addInteraction(leadId:string,type:InteractionType,notes:string,responsible:string){return (await request<{interaction:Interaction}>(`/api/crm/leads/${encodeURIComponent(leadId)}/interactions`,{method:'POST',body:JSON.stringify({type,notes,responsible})})).interaction},
  async convertLead(leadId:string){return (await request<{contact:Contact}>(`/api/crm/leads/${encodeURIComponent(leadId)}/convert`,{method:'POST'})).contact},
  async createContact(input:Parameters<typeof import('./repository').crmRepository.createContact>[0]){return (await request<{contact:Contact}>('/api/crm/contacts',{method:'POST',body:JSON.stringify(input)})).contact},
  async updateContact(id:string,patch:Partial<Contact>,expectedUpdatedAt?:string){return (await request<{contact:Contact}>(`/api/crm/contacts/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({patch,expectedUpdatedAt})})).contact},
  async deleteContact(id:string){await request(`/api/crm/contacts/${encodeURIComponent(id)}`,{method:'DELETE'})},
  async bulkDeleteContacts(ids:string[]){await request('/api/crm/contacts/bulk-delete',{method:'POST',body:JSON.stringify({ids})})},
  async addTimeline(contactId:string,type:string,description:string){return (await request<{entry:TimelineEntry}>(`/api/crm/contacts/${encodeURIComponent(contactId)}/timeline`,{method:'POST',body:JSON.stringify({type,description})})).entry},
}
