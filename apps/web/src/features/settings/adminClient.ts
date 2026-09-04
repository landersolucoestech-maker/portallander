import type {SettingsCompany,SettingsSeed} from './domain'

const apiBase=(import.meta.env.VITE_PORTAL_API_BASE_URL||'').replace(/\/$/,'')
export class SettingsAdminClientError extends Error{constructor(message:string,public code:string,public status:number){super(message)}}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{let response:Response;try{response=await fetch(`${apiBase}${path}`,{credentials:'include',headers:{'content-type':'application/json',...(init.headers||{})},...init})}catch{throw new SettingsAdminClientError('Não foi possível alcançar a API de Settings.','SETTINGS_NETWORK_ERROR',0)}const payload=await response.json().catch(()=>({})) as Record<string,unknown>;if(!response.ok)throw new SettingsAdminClientError(String(payload.message||`Falha HTTP ${response.status}.`),String(payload.code||'SETTINGS_REQUEST_FAILED'),response.status);return payload as T}
const state=<T extends {state:SettingsSeed}>(value:T)=>value.state
export const settingsAdminClient={
 state:()=>request<{state:SettingsSeed}>('/api/settings/state').then(state),
 saveCompany:(company:SettingsCompany)=>request<{state:SettingsSeed}>('/api/settings/company',{method:'PUT',body:JSON.stringify(company)}).then(state),
 changePassword:(currentPassword:string,newPassword:string)=>request<{state:SettingsSeed}>('/api/settings/security/password',{method:'POST',body:JSON.stringify({currentPassword,newPassword})}).then(state),
 revokeOtherSessions:()=>request<{state:SettingsSeed}>('/api/settings/security/sessions/revoke-others',{method:'POST'}).then(state),
}
