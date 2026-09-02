export class SectionConfigurationApiError extends Error{
  status:number
  code:string
  constructor(message:string,status:number,code='SECTION_CONFIGURATION_API_ERROR'){
    super(message)
    this.name='SectionConfigurationApiError'
    this.status=status
    this.code=code
  }
}

type ApiErrorBody={message?:string;code?:string}
export type PersistedSectionConfigurations=Record<string,Record<string,unknown>>

export const sectionConfigurationApiBase=()=>String(import.meta.env.VITE_PORTAL_API_BASE_URL??'').trim().replace(/\/$/,'')
export const isSectionConfigurationApiConfigured=()=>Boolean(sectionConfigurationApiBase())

async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const base=sectionConfigurationApiBase()
  if(!base)throw new SectionConfigurationApiError('A API de configuração de seções não está configurada.',503,'SECTION_CONFIGURATION_API_NOT_CONFIGURED')
  const response=await fetch(`${base}${path}`,{
    ...init,
    credentials:'include',
    headers:{Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...init.headers},
  })
  const body=await response.json().catch(()=>({})) as ApiErrorBody&T
  if(!response.ok)throw new SectionConfigurationApiError(body.message||`A API de configuração respondeu ${response.status}.`,response.status,body.code)
  return body
}

export async function listPublicSectionConfigurations(pageKey:string){
  const result=await request<{configurations:PersistedSectionConfigurations}>(`/api/editorial/section-configurations/${encodeURIComponent(pageKey)}?public=1`)
  return result.configurations
}

export async function listAdminSectionConfigurations(pageKey:string){
  const result=await request<{configurations:PersistedSectionConfigurations}>(`/api/editorial/section-configurations/${encodeURIComponent(pageKey)}`)
  return result.configurations
}

export async function readAdminSectionConfiguration(pageKey:string,sectionSlug:string){
  const result=await request<{configuration:Record<string,unknown>|null}>(`/api/editorial/section-configurations/${encodeURIComponent(pageKey)}/${encodeURIComponent(sectionSlug)}`)
  return result.configuration
}

export async function saveAdminSectionConfiguration(pageKey:string,sectionSlug:string,configuration:Record<string,unknown>){
  const result=await request<{configuration:Record<string,unknown>}>(`/api/editorial/section-configurations/${encodeURIComponent(pageKey)}/${encodeURIComponent(sectionSlug)}`,{
    method:'PUT',
    body:JSON.stringify({configuration}),
  })
  return result.configuration
}
