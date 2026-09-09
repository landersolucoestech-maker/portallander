import type {EditorialContent,EditorialPage} from './model'

export type PublicEditorialSnapshot={pages:EditorialPage[];contents:EditorialContent[]}

const configuredBase=()=>String(import.meta.env.VITE_PORTAL_API_BASE_URL??'').trim().replace(/\/$/,'')

export function isEditorialApiConfigured(){return Boolean(configuredBase())}

async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const base=configuredBase()
  if(!base)throw new Error('VITE_PORTAL_API_BASE_URL não configurada.')
  const response=await fetch(`${base}${path}`,{
    ...init,
    headers:{accept:'application/json',...(init.body?{'content-type':'application/json'}:{}),...(init.headers||{})},
    signal:init.signal??AbortSignal.timeout(4000),
  })
  const body=response.status===204?null:await response.json().catch(()=>null)
  if(!response.ok){
    const message=body&&typeof body==='object'&&'message' in body?String(body.message):`API editorial respondeu ${response.status}.`
    const error=new Error(message) as Error&{status?:number;code?:string;details?:unknown}
    error.status=response.status
    if(body&&typeof body==='object'&&'code' in body)error.code=String(body.code)
    if(body&&typeof body==='object'&&'details' in body)error.details=body.details
    throw error
  }
  return body as T
}

export async function loadPublicEditorialSnapshot():Promise<PublicEditorialSnapshot|null>{
  if(!isEditorialApiConfigured())return null
  return request<PublicEditorialSnapshot>('/api/editorial/snapshot')
}

export type EditorialAdminCredentials={accessToken:string}
const authHeaders=(credentials:EditorialAdminCredentials)=>({authorization:`Bearer ${credentials.accessToken}`})

export const editorialApiClient={
  loadPublicSnapshot:loadPublicEditorialSnapshot,
  async listPages(credentials:EditorialAdminCredentials){const result=await request<{pages:EditorialPage[]}>('/api/editorial/pages',{headers:authHeaders(credentials)});return result.pages},
  async listContents(credentials:EditorialAdminCredentials){const result=await request<{contents:EditorialContent[]}>('/api/editorial/contents',{headers:authHeaders(credentials)});return result.contents},
  async createPage(page:EditorialPage,credentials:EditorialAdminCredentials){const result=await request<{page:EditorialPage}>('/api/editorial/pages',{method:'POST',headers:authHeaders(credentials),body:JSON.stringify(page)});return result.page},
  async updatePage(page:EditorialPage,credentials:EditorialAdminCredentials){const result=await request<{page:EditorialPage}>(`/api/editorial/pages/${encodeURIComponent(page.id)}`,{method:'PATCH',headers:authHeaders(credentials),body:JSON.stringify(page)});return result.page},
  async deletePage(id:string,credentials:EditorialAdminCredentials){await request(`/api/editorial/pages/${encodeURIComponent(id)}`,{method:'DELETE',headers:authHeaders(credentials)})},
  async createContent(content:EditorialContent,credentials:EditorialAdminCredentials){const result=await request<{content:EditorialContent}>('/api/editorial/contents',{method:'POST',headers:authHeaders(credentials),body:JSON.stringify(content)});return result.content},
  async updateContent(content:EditorialContent,credentials:EditorialAdminCredentials){const result=await request<{content:EditorialContent}>(`/api/editorial/contents/${encodeURIComponent(content.id)}`,{method:'PATCH',headers:authHeaders(credentials),body:JSON.stringify(content)});return result.content},
  async deleteContent(id:string,credentials:EditorialAdminCredentials){await request(`/api/editorial/contents/${encodeURIComponent(id)}`,{method:'DELETE',headers:authHeaders(credentials)})},
}
