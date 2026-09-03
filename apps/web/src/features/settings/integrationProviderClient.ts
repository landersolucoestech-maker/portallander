const apiBase=(import.meta.env.VITE_PORTAL_API_BASE_URL||'').replace(/\/$/,'')

export type ProviderRuntimeState={implementation:'implemented'|'partial'|'planned';configured:boolean;webhookVerifyTokenConfigured?:boolean}
export type ProviderRuntimeResponse={providers:Record<string,ProviderRuntimeState>}
export type WhatsAppSendResult={provider:'whatsapp';messageId:string;to:string}
export type AutentiqueDocumentResult={provider:'autentique';externalId:string;name:string;createdAt:string|null;signatures:Array<{public_id?:string;name?:string;email?:string;link?:{short_link?:string}}>} 

export class IntegrationProviderClientError extends Error{
 constructor(message:string,public code:string,public status:number,public details?:unknown){super(message)}
}

async function read(response:Response){try{return await response.json()}catch{return {}}}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{
 let response:Response
 try{response=await fetch(`${apiBase}${path}`,{credentials:'include',...init})}catch{throw new IntegrationProviderClientError('Não foi possível alcançar a API de integrações.','INTEGRATION_NETWORK_ERROR',0)}
 const payload=await read(response),body=payload&&typeof payload==='object'?payload as Record<string,unknown>:{}
 if(!response.ok)throw new IntegrationProviderClientError(String(body.message||`Falha HTTP ${response.status}.`),String(body.code||'INTEGRATION_REQUEST_FAILED'),response.status,body.details)
 return payload as T
}

export const integrationProviderClient={
 runtime:()=>request<ProviderRuntimeResponse>('/api/integrations/providers'),
 sendWhatsApp:(to:string,text:string)=>request<WhatsAppSendResult>('/api/integrations/providers/whatsapp/messages',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({to,text})}),
 createAutentiqueDocument:(input:{name:string;signers:Array<{name:string;email:string;order:number}>;file:File})=>{
  const form=new FormData();form.append('name',input.name);form.append('signers',JSON.stringify(input.signers));form.append('file',input.file)
  return request<AutentiqueDocumentResult>('/api/integrations/providers/autentique/documents',{method:'POST',body:form})
 },
}
