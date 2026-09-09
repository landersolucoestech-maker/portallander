import {adminApiBase,AdminAuthError} from '../../access/authClient'
import type {FormStatus,SiteFormDefinition} from './domain'

type ApiErrorBody={message?:string;code?:string}

async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const base=adminApiBase()
  if(!base)throw new AdminAuthError('A URL da API administrativa não está configurada.',503,'ADMIN_API_NOT_CONFIGURED')
  const response=await fetch(`${base}${path}`,{
    ...init,
    credentials:'include',
    headers:{Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...init.headers},
  })
  const body=await response.json().catch(()=>({})) as ApiErrorBody&T
  if(!response.ok)throw new AdminAuthError(body.message||`A API administrativa respondeu ${response.status}.`,response.status,body.code)
  return body
}

export async function listAdminSiteForms(){
  const result=await request<{forms:SiteFormDefinition[]}>('/api/forms/definitions')
  return result.forms
}

export async function getAdminSiteForm(key:string){
  const result=await request<{form:SiteFormDefinition}>(`/api/forms/definitions/${encodeURIComponent(key)}`)
  return result.form
}

export async function createAdminSiteForm(form:SiteFormDefinition){
  const result=await request<{form:SiteFormDefinition}>('/api/forms/definitions',{method:'POST',body:JSON.stringify(form)})
  return result.form
}

export async function saveAdminSiteForm(key:string,form:SiteFormDefinition){
  const result=await request<{form:SiteFormDefinition}>(`/api/forms/definitions/${encodeURIComponent(key)}`,{method:'PUT',body:JSON.stringify(form)})
  return result.form
}

export async function publishAdminSiteForm(key:string){
  const result=await request<{form:SiteFormDefinition}>(`/api/forms/definitions/${encodeURIComponent(key)}/publish`,{method:'POST'})
  return result.form
}

export async function setAdminSiteFormStatus(key:string,status:Extract<FormStatus,'active'|'inactive'>){
  const result=await request<{form:SiteFormDefinition}>(`/api/forms/definitions/${encodeURIComponent(key)}/status`,{method:'PATCH',body:JSON.stringify({status})})
  return result.form
}

export async function deleteAdminSiteForm(key:string){
  await request<{deleted:true;key:string}>(`/api/forms/definitions/${encodeURIComponent(key)}`,{method:'DELETE'})
}
