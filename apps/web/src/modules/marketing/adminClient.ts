import {adminApiBase} from '../access/authClient'
import type {MarketingContent} from './domain'
export const isMarketingApiConfigured=()=>Boolean(adminApiBase())
export type MarketingContentDraft=Omit<MarketingContent,'id'|'createdAt'|'updatedAt'>
export interface MarketingMediaAsset{id:string;type:string;name:string;url:string;size:number;alt?:string;caption?:string;createdAt?:string}
export interface MarketingHashtagSuggestion{tag:string;source:'history'|'instagram';externalId?:string}
export interface MarketingHashtagSuggestionResponse{suggestions:MarketingHashtagSuggestion[];instagramAvailable:boolean;instagramMatched:boolean;capability:'exact_lookup'}
export interface MarketingPublication{id:string;contentId:string;provider:'instagram';status:'pending'|'publishing'|'published'|'failed';externalCreationId:string;externalMediaId:string;permalink:string;attemptCount:number;startedAt:string|null;publishedAt:string|null;lastError:string;createdAt:string;updatedAt:string}
export interface MarketingPublicationResponse{publication:MarketingPublication;content:MarketingContent;idempotent:boolean}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{const base=adminApiBase();if(!base)throw new Error('A API administrativa não está configurada.');const response=await fetch(`${base}${path}`,{credentials:'include',...init,headers:{Accept:'application/json',...(init.body instanceof FormData?{}:init.body?{'Content-Type':'application/json'}:{}),...init.headers}});const body=response.status===204?null:await response.json().catch(()=>null);if(!response.ok){const message=body&&typeof body==='object'&&'message' in body?String(body.message):`API de Marketing respondeu ${response.status}.`;throw new Error(message)}return body as T}
export const marketingAdminClient={
 async listContents(){const result=await request<{contents:MarketingContent[]}>('/api/marketing/contents');return result.contents},
 async createContent(value:MarketingContentDraft){const result=await request<{content:MarketingContent}>('/api/marketing/contents',{method:'POST',body:JSON.stringify(value)});return result.content},
 async updateContent(id:string,value:MarketingContentDraft,expectedUpdatedAt?:string){const result=await request<{content:MarketingContent}>(`/api/marketing/contents/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({patch:value,expectedUpdatedAt})});return result.content},
 async deleteContent(id:string){await request(`/api/marketing/contents/${encodeURIComponent(id)}`,{method:'DELETE'})},
 async suggestHashtags(query:string){return request<MarketingHashtagSuggestionResponse>(`/api/marketing/hashtags/suggestions?provider=instagram&q=${encodeURIComponent(query)}`)},
 async publishContent(id:string,provider:'instagram'='instagram'){return request<MarketingPublicationResponse>(`/api/marketing/contents/${encodeURIComponent(id)}/publish`,{method:'POST',body:JSON.stringify({provider})})},
 async getPublication(id:string,provider:'instagram'='instagram'){const result=await request<{publication:MarketingPublication|null}>(`/api/marketing/contents/${encodeURIComponent(id)}/publications/${provider}`);return result.publication},
 async uploadMedia(file:File){const data=new FormData();data.append('file',file);const result=await request<{media:MarketingMediaAsset}>('/api/editorial/media',{method:'POST',body:data});return result.media},
}
