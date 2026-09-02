export type FormPurpose='lead_capture'|'contact'|'advertising'|'editorial_submission'|'newsletter'|'survey'|'event_registration'|'custom'
export type FormDestination='crm'|'content_collaborations'|'marketing'|'internal'|'none'
export type FormStatus='draft'|'active'|'inactive'
export type FormFieldType='text'|'email'|'tel'|'textarea'|'select'|'radio'|'checkbox'|'url'|'file'|'date'|'number'|'hidden'

export interface FormFieldDefinition{
  id:string
  key:string
  label:string
  type:FormFieldType
  required:boolean
  placeholder?:string
  helpText?:string
  options?:readonly string[]
  order:number
}

export interface FormConsentDefinition{
  id:string
  kind:'privacy'|'marketing'|'terms'|'content_rights'
  label:string
  required:boolean
  version:string
  text:string
}

export interface FormRoutingDefinition{
  destination:FormDestination
  crm?:{origin:string;responsible?:string;tags?:readonly string[]}
  collaboration?:{defaultStatus:'received';defaultPriority?:'low'|'normal'|'high'}
}

export interface SiteFormDefinition{
  id:string
  name:string
  slug:string
  purpose:FormPurpose
  status:FormStatus
  source:'system'|'custom'
  fields:readonly FormFieldDefinition[]
  consents:readonly FormConsentDefinition[]
  routing:FormRoutingDefinition
  successMessage:string
}

export type SubmissionProcessingStatus='received'|'validating'|'accepted'|'rejected'|'spam'|'failed'

export interface FormSubmissionEnvelope{
  id:string
  formId:string
  formVersionId:string
  submittedAt:string
  payload:Record<string,unknown>
  source:{page?:string;campaign?:string;referrer?:string;utm?:Record<string,string>}
  consentSnapshot:readonly {consentId:string;version:string;text:string;accepted:boolean;acceptedAt:string}[]
  attachmentIds:readonly string[]
  processingStatus:SubmissionProcessingStatus
  routingResults:{crmLeadId?:string;collaborationId?:string}
}
