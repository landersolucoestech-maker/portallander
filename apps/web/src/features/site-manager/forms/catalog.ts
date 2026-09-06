import {SYSTEM_FORM_CANONICAL_COUNT,SYSTEM_FORM_KEYS,resolveSystemFormKey} from '../../../../../../packages/shared/systemFormCatalog.js'
import type {SiteFormDefinition} from './domain'

const clone=<T>(value:T):T=>structuredClone(value)
let runtimeForms:readonly SiteFormDefinition[]=[]

export let siteFormRegistry:readonly SiteFormDefinition[]=[]
export let systemForms:readonly SiteFormDefinition[]=[]

function assertCanonicalSystemForms(forms:readonly SiteFormDefinition[]){
  const operational=forms.filter(form=>form.source==='system')
  const keys=operational.map(form=>resolveSystemFormKey(form.id)||resolveSystemFormKey(form.slug))
  if(operational.length!==SYSTEM_FORM_CANONICAL_COUNT||keys.some(key=>!key)||new Set(keys).size!==SYSTEM_FORM_CANONICAL_COUNT||SYSTEM_FORM_KEYS.some(key=>!keys.includes(key))){
    throw new Error(`Canonical system forms mismatch: expected ${SYSTEM_FORM_KEYS.join(', ')}.`)
  }
}

export function setRuntimeSiteForms(forms:readonly SiteFormDefinition[]){
  assertCanonicalSystemForms(forms)
  runtimeForms=forms.map(clone)
  siteFormRegistry=runtimeForms
  systemForms=runtimeForms.filter(form=>form.source==='system')
}

export const listRuntimeSiteForms=()=>runtimeForms.map(clone)

export function getSiteFormBySlug(slug:string){
  const canonicalKey=resolveSystemFormKey(slug)
  if(canonicalKey)return runtimeForms.find(form=>form.source==='system'&&form.id===canonicalKey)
  return runtimeForms.find(form=>form.slug===slug)
}

export function getSiteFormById(id:string){
  const canonicalKey=resolveSystemFormKey(id)
  if(canonicalKey)return runtimeForms.find(form=>form.source==='system'&&form.id===canonicalKey)
  return runtimeForms.find(form=>form.id===id)
}

export const getSystemFormBySlug=getSiteFormBySlug
