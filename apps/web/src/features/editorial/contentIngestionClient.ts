const apiBase=(import.meta.env.VITE_PORTAL_API_BASE_URL||'').replace(/\/$/,'')

export type EditorialSourceProvider='rss'|'gdelt'|'youtube'|'official_source'
export type EditorialSource={id:string;sourceKey:string;provider:EditorialSourceProvider;name:string;sourceType:string;category:string;country:string;language:string;url:string;feedUrl:string;enabled:boolean;configuration:Record<string,unknown>;syncFrequencyMinutes:number;lastSyncAt:string|null;nextSyncAt:string|null;lastStatus:string;lastImportedCount:number;lastError:string;createdAt:string|null;updatedAt:string|null}
export type EditorialProviderStatus={implemented:boolean;configured?:boolean;enabled?:number;total?:number;lastSyncAt?:string|null;credential?:string;cost?:string;reused?:boolean;managedBy?:string}
export type EditorialSyncRun={id:string;sourceId:string;provider:string;startedAt:string|null;finishedAt:string|null;status:string;received:number;created:number;duplicates:number;ignored:number;errors:number;errorSummary:string;metadata:Record<string,unknown>}
export type ImportCandidateStatus='new'|'reviewing'|'approved'|'rejected'|'ignored'|'converted'
export type ImportCandidate={id:string;provider:string;sourceId:string|null;sourceName:string;externalId:string;canonicalUrl:string;normalizedUrl:string;title:string;description:string;imageUrl:string;author:string;publishedAt:string|null;discoveredAt:string|null;language:string;country:string;sourceType:string;suggestedCategory:string;suggestedTags:string[];detectedEntities:Record<string,unknown>;relevanceScore:number;relevanceReasons:string[];duplicateKey:string;provenance:Array<{provider?:string;sourceName?:string;url?:string}>;rawMetadata:Record<string,unknown>;status:ImportCandidateStatus;reviewedAt:string|null;reviewedBy:string|null;editorialContentId:string|null;createdAt:string|null;updatedAt:string|null}

export class ContentIngestionClientError extends Error{constructor(message:string,public code:string,public status:number,public details?:unknown){super(message)}}
async function read(response:Response){try{return await response.json()}catch{return {}}}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{let response:Response;try{response=await fetch(`${apiBase}${path}`,{credentials:'include',...init})}catch{throw new ContentIngestionClientError('Não foi possível alcançar a API editorial.','EDITORIAL_INGESTION_NETWORK_ERROR',0)}const payload=await read(response),body=payload&&typeof payload==='object'?payload as Record<string,unknown>:{};if(!response.ok)throw new ContentIngestionClientError(String(body.message||`Falha HTTP ${response.status}.`),String(body.code||'EDITORIAL_INGESTION_REQUEST_FAILED'),response.status,body.details);return payload as T}
const json=(method:string,body?:unknown):RequestInit=>({method,headers:{'content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})})

export const contentIngestionClient={
 providerStatus:()=>request<{providers:Record<string,EditorialProviderStatus>}>('/api/integrations/editorial/provider-status'),
 listSources:()=>request<{sources:EditorialSource[]}>('/api/integrations/editorial/sources').then(value=>value.sources),
 createSource:(input:Partial<EditorialSource>)=>request<{source:EditorialSource}>('/api/integrations/editorial/sources',json('POST',input)).then(value=>value.source),
 updateSource:(id:string,input:Partial<EditorialSource>)=>request<{source:EditorialSource}>(`/api/integrations/editorial/sources/${encodeURIComponent(id)}`,json('PATCH',input)).then(value=>value.source),
 syncSource:(id:string)=>request<{run:EditorialSyncRun}>(`/api/integrations/editorial/sources/${encodeURIComponent(id)}/sync`,json('POST')).then(value=>value.run),
 syncDue:()=>request<{results:Array<{sourceId:string;ok:boolean;run?:EditorialSyncRun;error?:string}>}>('/api/integrations/editorial/sync-due',json('POST')),
 listSyncRuns:(sourceId?:string)=>request<{runs:EditorialSyncRun[]}>(`/api/integrations/editorial/sync-runs${sourceId?`?sourceId=${encodeURIComponent(sourceId)}`:''}`).then(value=>value.runs),
 listCandidates:(filters:{status?:ImportCandidateStatus;provider?:string;limit?:number}={})=>{const params=new URLSearchParams();if(filters.status)params.set('status',filters.status);if(filters.provider)params.set('provider',filters.provider);if(filters.limit)params.set('limit',String(filters.limit));return request<{candidates:ImportCandidate[]}>(`/api/editorial/import-candidates${params.size?`?${params}`:''}`).then(value=>value.candidates)},
 reviewCandidate:(id:string)=>request<{candidate:ImportCandidate}>(`/api/editorial/import-candidates/${encodeURIComponent(id)}/review`,json('POST')).then(value=>value.candidate),
 approveCandidate:(id:string)=>request<{candidate:ImportCandidate}>(`/api/editorial/import-candidates/${encodeURIComponent(id)}/approve`,json('POST')).then(value=>value.candidate),
 rejectCandidate:(id:string)=>request<{candidate:ImportCandidate}>(`/api/editorial/import-candidates/${encodeURIComponent(id)}/reject`,json('POST')).then(value=>value.candidate),
 ignoreCandidate:(id:string)=>request<{candidate:ImportCandidate}>(`/api/editorial/import-candidates/${encodeURIComponent(id)}/ignore`,json('POST')).then(value=>value.candidate),
 convertCandidate:(id:string,pageId:string)=>request<{candidate:ImportCandidate;content:{id:string;status:string;active:boolean}}>(`/api/editorial/import-candidates/${encodeURIComponent(id)}/convert`,json('POST',{pageId})),
}
