export type AdminUser={
  id:string
  email:string
  displayName:string
  role:'owner'|'admin'|'editor'
  lastLoginAt:string|null
}

export type AdminSession={authenticated:true;user:AdminUser;expiresAt:string}

type ApiErrorBody={message?:string;code?:string}

export class AdminAuthError extends Error{
  status:number
  code:string
  constructor(message:string,status:number,code='ADMIN_AUTH_ERROR'){
    super(message)
    this.name='AdminAuthError'
    this.status=status
    this.code=code
  }
}

export const adminApiBase=()=>String(import.meta.env.VITE_PORTAL_API_BASE_URL??'').trim().replace(/\/$/,'')
export const isAdminAuthConfigured=()=>Boolean(adminApiBase())

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

export async function readAdminSession():Promise<AdminSession|null>{
  const result=await request<AdminSession|{authenticated:false}>('/api/auth/session')
  return result.authenticated?result:null
}

export async function loginAdmin(input:{email:string;password:string;remember:boolean}){
  return request<AdminSession>('/api/auth/login',{method:'POST',body:JSON.stringify(input)})
}

export async function logoutAdmin(){
  await request<{authenticated:false}>('/api/auth/logout',{method:'POST'})
}
