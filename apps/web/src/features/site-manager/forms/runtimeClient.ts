import {setRuntimeSiteForms} from './catalog'
import type {SiteFormDefinition} from './domain'

const apiBase=()=>String(import.meta.env.VITE_PORTAL_API_BASE_URL??'').trim().replace(/\/$/,'')

export async function bootstrapPublishedSiteForms(){
  const base=apiBase()
  if(!base)return false
  const response=await fetch(`${base}/api/forms/definitions/public`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(4000)})
  if(!response.ok)throw new Error(`API de formulários respondeu ${response.status}.`)
  const data=await response.json() as {forms?:SiteFormDefinition[]}
  if(!Array.isArray(data.forms))throw new Error('Resposta inválida da API de formulários.')
  setRuntimeSiteForms(data.forms)
  return true
}
