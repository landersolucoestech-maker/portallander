export type FormPurpose='lead_capture'|'contact'|'advertising'|'editorial_submission'|'newsletter'|'survey'|'event_registration'|'custom'
export type FormDestination='crm'|'content_collaborations'|'marketing'|'internal'|'none'
export type FormStatus='draft'|'active'|'inactive'
export type FormFieldType='text'|'email'|'tel'|'textarea'|'select'|'radio'|'checkbox'|'url'|'file'|'date'|'number'|'hidden'
export type FormAppearancePreset='portal'|'minimal'|'editorial'|'compact'|'highlight'

export interface FormAppearance{
  preset:FormAppearancePreset
  container:{maxWidth:number;width:number;align:'left'|'center'|'right';padding:number;background:string;border:'none'|'solid';borderColor:string;borderWidth:number;borderRadius:number;shadow:'none'|'soft'|'strong'}
  layout:{columns:1|2;responsiveCollapseAt:'mobile'|'tablet';columnGap:number;rowGap:number}
  typography:{font:'montserrat'|'system';labelSize:number;labelWeight:400|500|600|700;labelColor:string;helpSize:number;helpColor:string}
  fields:{height:number;background:string;textColor:string;placeholderColor:string;borderColor:string;borderWidth:number;borderRadius:number;paddingX:number;focusColor:string;focusRing:number}
  textarea:{minHeight:number;resize:'none'|'vertical'|'both'}
  button:{text:string;align:'left'|'center'|'right';width:'auto'|'full';height:number;background:string;foreground:string;borderColor:string;borderWidth:number;borderRadius:number;fontSize:number;fontWeight:500|600|700;hoverBackground:string;focusColor:string}
  consents:{color:string;gap:number;fontSize:number}
  upload:{background:string;borderColor:string;borderWidth:number;borderRadius:number;foreground:string}
  states:{successBackground:string;successForeground:string;errorBackground:string;errorForeground:string;borderColor:string;borderRadius:number}
}

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
  version:number
  purpose:FormPurpose
  status:FormStatus
  source:'system'|'custom'
  fields:readonly FormFieldDefinition[]
  consents:readonly FormConsentDefinition[]
  routing:FormRoutingDefinition
  successMessage:string
  appearance?:FormAppearance
}

export interface FormVersionSnapshot{
  id:string
  formId:string
  version:number
  definition:SiteFormDefinition
  createdAt:string
  publishedAt?:string
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

export type CollaborationStatus='received'|'triage'|'review'|'approved'|'production'|'published'|'rejected'|'duplicate'|'spam'|'archived'
export type CollaborationPriority='low'|'normal'|'high'
export interface ContentCollaboration{
  id:string
  submissionId:string
  formId:string
  title:string
  type:string
  submitterName:string
  submitterEmail:string
  submitterPhone:string
  location:string
  sourceUrl:string
  message:string
  attachmentIds:readonly string[]
  status:CollaborationStatus
  priority:CollaborationPriority
  assignedTo?:string
  tags:readonly string[]
  receivedAt:string
  updatedAt:string
  publishedContentId?:string
}
