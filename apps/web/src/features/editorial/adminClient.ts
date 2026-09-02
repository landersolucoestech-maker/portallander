import {adminApiBase,AdminAuthError} from '../access/authClient'
import type {EditorialContent,EditorialPage} from './model'

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

export async function listAdminEditorialPages(){
  const result=await request<{pages:EditorialPage[]}>('/api/editorial/pages')
  return result.pages
}

export async function getAdminEditorialPage(id:string){
  const result=await request<{page:EditorialPage}>(`/api/editorial/pages/${encodeURIComponent(id)}`)
  return result.page
}

export async function createAdminEditorialPage(page:EditorialPage){
  const result=await request<{page:EditorialPage}>('/api/editorial/pages',{method:'POST',body:JSON.stringify(page)})
  return result.page
}

export async function updateAdminEditorialPage(id:string,page:EditorialPage){
  const result=await request<{page:EditorialPage}>(`/api/editorial/pages/${encodeURIComponent(id)}`,{method:'PUT',body:JSON.stringify(page)})
  return result.page
}

export async function deleteAdminEditorialPage(id:string){
  await request<{deleted:true;id:string}>(`/api/editorial/pages/${encodeURIComponent(id)}`,{method:'DELETE'})
}

export async function listAdminEditorialContents(pageId?:string){
  const query=pageId?`?pageId=${encodeURIComponent(pageId)}`:''
  const result=await request<{contents:EditorialContent[]}>(`/api/editorial/contents${query}`)
  return result.contents
}

export async function getAdminEditorialContent(id:string){
  const result=await request<{content:EditorialContent}>(`/api/editorial/contents/${encodeURIComponent(id)}`)
  return result.content
}

export async function createAdminEditorialContent(content:EditorialContent){
  const result=await request<{content:EditorialContent}>('/api/editorial/contents',{method:'POST',body:JSON.stringify(content)})
  return result.content
}

export async function updateAdminEditorialContent(id:string,content:EditorialContent){
  const result=await request<{content:EditorialContent}>(`/api/editorial/contents/${encodeURIComponent(id)}`,{method:'PUT',body:JSON.stringify(content)})
  return result.content
}

export async function deleteAdminEditorialContent(id:string){
  await request<{deleted:true;id:string}>(`/api/editorial/contents/${encodeURIComponent(id)}`,{method:'DELETE'})
}
