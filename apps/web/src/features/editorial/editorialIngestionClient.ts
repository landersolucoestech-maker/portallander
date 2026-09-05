import {adminApiBase,AdminAuthError} from '../access/authClient'

export type IntegrationSource={id:string;provider:'rss'|'gdelt'|'youtube'|'official_source';name:string;sourceType:'news'|'official'|'video'|'trend';category:string;country:string;language:string;url:string;feedUrl:string;enabled:boolean;configuration:Record<string,unknown>;syncFrequencyMinutes:number;lastSyncAt:string|null;nextSyncAt:string|null;lastStatus:string;lastImportedCount:number;lastDuplicateCount:number;lastError:string}
export type ImportCandidate={id:string;sourceId:string|null;provider:string;sourceName:string;externalId:string;canonicalUrl:string;title:string;description:string;imageUrl:string;author:string;publishedAt:string|null;discoveredAt:string;language:string;country:string;sourceType:string;suggestedCategory:string;suggestedTags:string[];relevanceScore:number;status:'new'|'reviewing'|'approved'|'converted'|'rejected'|'ignored';editorialContentId:string|null;provenance:unknown[]}

type ApiError={message?:string;code?:string}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const base=adminApiBase()
  if(!base)throw new AdminAuthError('A URL da API administrativa não está configurada.',503,'ADMIN_API_NOT_CONFIGURED')
  const response=await fetch(`${base}${path}`,{...init,credentials:'include',headers:{Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...init.headers}})
  const body=await response.json().catch(()=>({})) as T&ApiError
  if(!response.ok)throw new AdminAuthError(body.message||`A API respondeu ${response.status}.`,response.status,body.code)
  return body
}

export async function listIntegrationSources(){return (await request<{sources:IntegrationSource[]}>('/api/integrations/sources')).sources}
export async function createIntegrationSource(input:Partial<IntegrationSource>){return (await request<{source:IntegrationSource}>('/api/integrations/sources',{method:'POST',body:JSON.stringify(input)})).source}
export async function updateIntegrationSource(id:string,input:Partial<IntegrationSource>){return (await request<{source:IntegrationSource}>(`/api/integrations/sources/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(input)})).source}
export async function syncIntegrationSource(id:string){return request<{received:number;created:number;duplicates:number;ignored:number;errors:number}>(`/api/integrations/sources/${encodeURIComponent(id)}/sync`,{method:'POST'})}
export async function listImportCandidates(status=''){const query=status?`?status=${encodeURIComponent(status)}`:'';return (await request<{items:ImportCandidate[]}>(`/api/editorial/import-candidates${query}`)).items}
export async function reviewImportCandidate(id:string,action:'review'|'approve'|'reject'|'ignore'){return (await request<{item:ImportCandidate}>(`/api/editorial/import-candidates/${encodeURIComponent(id)}/${action}`,{method:'POST',body:'{}'})).item}
export async function convertImportCandidate(id:string,pageId:string){return request<{item:ImportCandidate;content:{id:string}}>(`/api/editorial/import-candidates/${encodeURIComponent(id)}/convert`,{method:'POST',body:JSON.stringify({pageId})})}
