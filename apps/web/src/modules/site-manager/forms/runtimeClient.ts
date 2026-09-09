import {setRuntimeSiteForms} from './catalog'
import type {SiteFormDefinition} from './domain'

const apiBase=()=>String(import.meta.env.VITE_PORTAL_API_BASE_URL??'').trim().replace(/\/$/,'')
const demoDataEnabled=import.meta.env.DEV||import.meta.env.VITE_ENABLE_DEMO_DATA==='true'
const mockupScenario=()=>String(import.meta.env.VITE_MOCKUP_SCENARIO||'full').trim()||'full'

export async function bootstrapPublishedSiteForms(){
  if(demoDataEnabled){
    const {getDevelopmentSystemForms}=await import('../../../shared/data/mockDataProvider')
    setRuntimeSiteForms(getDevelopmentSystemForms(mockupScenario()) as SiteFormDefinition[])
    return true
  }
  const base=apiBase()
  if(!base)return false
  const response=await fetch(`${base}/api/forms/definitions/public`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(4000)})
  if(!response.ok)throw new Error(`API de formulários respondeu ${response.status}.`)
  const data=await response.json() as {forms?:SiteFormDefinition[]}
  if(!Array.isArray(data.forms))throw new Error('Resposta inválida da API de formulários.')
  setRuntimeSiteForms(data.forms)
  return true
}
