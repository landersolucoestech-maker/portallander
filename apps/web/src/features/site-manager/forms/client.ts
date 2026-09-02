import type {FormSubmissionEnvelope,SiteFormDefinition} from './domain'
import {getSiteFormBySlug} from './catalog'

export class FormSubmissionError extends Error{
  code:string
  status?:number
  constructor(message:string,code='FORM_SUBMISSION_FAILED',status?:number){super(message);this.name='FormSubmissionError';this.code=code;this.status=status}
}

const apiBase=()=>((import.meta.env.VITE_PUBLIC_API_URL as string|undefined)||'').replace(/\/$/,'')

function buildConsentSnapshot(form:SiteFormDefinition,acceptedConsentIds:readonly string[]){
  const accepted=new Set(acceptedConsentIds)
  const stamp=new Date().toISOString()
  return form.consents.map(consent=>({consentId:consent.id,version:consent.version,text:consent.text,accepted:accepted.has(consent.id),acceptedAt:accepted.has(consent.id)?stamp:''}))
}

export async function submitSiteForm(slug:string,input:{payload:Record<string,unknown>;acceptedConsentIds:readonly string[];source?:FormSubmissionEnvelope['source'];files?:readonly File[]}):Promise<FormSubmissionEnvelope>{
  const form=getSiteFormBySlug(slug)
  if(!form||form.status!=='active')throw new FormSubmissionError('Este formulário não está disponível para envio.','FORM_INACTIVE')
  for(const field of form.fields){if(!field.required)continue;const value=input.payload[field.key];if(value===undefined||value===null||String(value).trim()==='')throw new FormSubmissionError(`Preencha o campo obrigatório: ${field.label}.`,'FORM_VALIDATION')}
  for(const consent of form.consents){if(consent.required&&!input.acceptedConsentIds.includes(consent.id))throw new FormSubmissionError(`É necessário aceitar: ${consent.label}.`,'FORM_CONSENT_REQUIRED')}

  const body=new FormData()
  body.set('formId',form.id)
  body.set('formVersionId',`${form.id}:v${form.version}`)
  body.set('payload',JSON.stringify(input.payload))
  body.set('source',JSON.stringify(input.source??{}))
  body.set('consentSnapshot',JSON.stringify(buildConsentSnapshot(form,input.acceptedConsentIds)))
  for(const file of input.files??[])body.append('attachments',file,file.name)

  const response=await fetch(`${apiBase()}/api/forms/${encodeURIComponent(slug)}/submissions`,{method:'POST',body,headers:{Accept:'application/json'}}).catch(()=>{throw new FormSubmissionError('O serviço de recebimento está indisponível no momento.','FORM_API_UNAVAILABLE')})
  const data=await response.json().catch(()=>null) as FormSubmissionEnvelope|{message?:string;code?:string}|null
  if(!response.ok)throw new FormSubmissionError((data&&'message' in data&&data.message)||'Não foi possível enviar o formulário.',(data&&'code' in data&&data.code)||'FORM_SUBMISSION_FAILED',response.status)
  return data as FormSubmissionEnvelope
}
