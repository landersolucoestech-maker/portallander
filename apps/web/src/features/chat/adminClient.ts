import type {ChatAutomationSettings,ChatSeed,SupportStatus} from './domain'

const apiBase=(import.meta.env.VITE_PORTAL_API_BASE_URL||'').replace(/\/$/,'')
export class ChatAdminClientError extends Error{constructor(message:string,public code:string,public status:number){super(message)}}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{let response:Response;try{response=await fetch(`${apiBase}${path}`,{credentials:'include',headers:{'content-type':'application/json',...(init.headers||{})},...init})}catch{throw new ChatAdminClientError('Não foi possível alcançar a API do Chat.','CHAT_NETWORK_ERROR',0)}const payload=await response.json().catch(()=>({})) as Record<string,unknown>;if(!response.ok)throw new ChatAdminClientError(String(payload.message||`Falha HTTP ${response.status}.`),String(payload.code||'CHAT_REQUEST_FAILED'),response.status);return payload as T}
const state=<T extends {state:ChatSeed}>(value:T)=>value.state
export const chatAdminClient={
 state:()=>request<{state:ChatSeed}>('/api/chat/state').then(state),
 createSupport:(input:{customer:string;phone:string;initialMessage?:string})=>request<{state:ChatSeed}>('/api/chat/support',{method:'POST',body:JSON.stringify(input)}).then(state),
 sendSupport:(id:string,input:{body:string;internalNote?:boolean})=>request<{state:ChatSeed}>(`/api/chat/support/${encodeURIComponent(id)}/messages`,{method:'POST',body:JSON.stringify(input)}).then(state),
 setStatus:(id:string,status:SupportStatus)=>request<{state:ChatSeed}>(`/api/chat/support/${encodeURIComponent(id)}/status`,{method:'PATCH',body:JSON.stringify({status})}).then(state),
 transfer:(id:string,assignee:string)=>request<{state:ChatSeed}>(`/api/chat/support/${encodeURIComponent(id)}/transfer`,{method:'POST',body:JSON.stringify({assignee})}).then(state),
 addTag:(id:string,tag:string)=>request<{state:ChatSeed}>(`/api/chat/support/${encodeURIComponent(id)}/tags`,{method:'POST',body:JSON.stringify({tag})}).then(state),
 markCrm:(id:string,patch:{existingCustomer?:boolean;lead?:string;openDeal?:string;stage?:string})=>request<{state:ChatSeed}>(`/api/chat/support/${encodeURIComponent(id)}/crm`,{method:'PATCH',body:JSON.stringify(patch)}).then(state),
 createInternal:(participantAuthUserIds:string[])=>request<{state:ChatSeed}>('/api/chat/internal',{method:'POST',body:JSON.stringify({participantAuthUserIds})}).then(state),
 sendInternal:(id:string,body:string)=>request<{state:ChatSeed}>(`/api/chat/internal/${encodeURIComponent(id)}/messages`,{method:'POST',body:JSON.stringify({body})}).then(state),
 saveAutomation:(value:ChatAutomationSettings)=>request<{state:ChatSeed}>('/api/chat/automation',{method:'PUT',body:JSON.stringify(value)}).then(state),
}
