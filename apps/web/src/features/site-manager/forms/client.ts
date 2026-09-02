import type {FormSubmissionEnvelope} from './domain'
import {getSiteFormBySlug} from './catalog'

export class FormSubmissionError extends Error{
  code:string
  status?:number
  constructor(message:string,code='FORM_SUBMISSION_FAILED',status?:number){super(message);this.name='FormSubmissionError';this.code=code;this.status=status}
}

const apiBase=()=>String(import.meta.env.VITE_PORTAL_API_BASE_URL??'').trim().replace(/\/$/,'')

export async function submitSiteForm(slug:string,input:{payload:Record<string,unknown>;acceptedConsentIds:readonly string[];source?:FormSubmissionEnvelope['source'];files?:readonly File[];antiSpam?:{honeypot:string;startedAt:number}}):Promise<FormSubmissionEnvelope>{
  const form=getSiteFormBySlug(slug)
  if(!form||form.status!=='active')throw new FormSubmissionError('Este formulário não está disponível para envio.','FORM_INACTIVE')
  for(const field of form.fields){if(!field.required||field.type==='file')continue;const value=input.payload[field.key];if(value===undefined||value===null||String(value).trim()==='')throw new FormSubmissionError(`Preencha o campo obrigatório: ${field.label}.`,'FORM_VALIDATION')}
  for(const consent of form.consents){if(consent.required&&!input.acceptedConsentIds.includes(consent.id))throw new FormSubmissionError(`É necessário aceitar: ${consent.label}.`,'FORM_CONSENT_REQUIRED')}

  const base=apiBase()
  if(!base)throw new FormSubmissionError('O serviço de recebimento ainda não foi configurado neste ambiente.','FORM_API_NOT_CONFIGURED')

  const body=new FormData()
  body.set('formVersion',String(form.version))
  body.set('payload',JSON.stringify(input.payload))
  body.set('source',JSON.stringify(input.source??{}))
  body.set('acceptedConsentIds',JSON.stringify(input.acceptedConsentIds))
  body.set('antiSpam',JSON.stringify(input.antiSpam??{}))
  for(const file of input.files??[])body.append('attachments',file,file.name)

  const response=await fetch(`${base}/api/forms/${encodeURIComponent(slug)}/submissions`,{method:'POST',body,headers:{Accept:'application/json'}}).catch(()=>{throw new FormSubmissionError('O serviço de recebimento está indisponível no momento.','FORM_API_UNAVAILABLE')})
  const data=await response.json().catch(()=>null) as FormSubmissionEnvelope|{message?:string;code?:string}|null
  if(!response.ok)throw new FormSubmissionError((data&&'message' in data&&data.message)||'Não foi possível enviar o formulário.',(data&&'code' in data&&data.code)||'FORM_SUBMISSION_FAILED',response.status)
  return data as FormSubmissionEnvelope
}
