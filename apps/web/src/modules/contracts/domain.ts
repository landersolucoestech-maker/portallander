export type ContractStatus='draft'|'in_review'|'awaiting_signature'|'partially_signed'|'signed'|'active'|'suspended'|'closed'|'cancelled'|'expired'
export type SigningProvider='autentique'|'clicksign'|'docusign'
export type SignatureStatus='not_sent'|'preparing'|'sent'|'viewed'|'awaiting_signature'|'partially_signed'|'signed'|'rejected'|'cancelled'|'expired'|'error'
export type DocumentStatus=SignatureStatus
export type PartySource='crm'|'manual'|'portal_lander'
export type PartyEntityType='person'|'company'
export type CurrencyCode='BRL'|'USD'|'EUR'
export type VariableGroup='CONTRATANTE'|'CONTRATADA'|'CONTRACT'|'PAYMENT'|'SERVICE'|'CAMPAIGN'|'EVENT'|'CONTENT'|'SIGNATURE'|'GENERAL'

export interface ContractRepresentative{name:string;document:string;role:string;email:string}
export interface ContractParty{
 id:string;source:PartySource;entityType:PartyEntityType;crmContactId?:string;role:'contractor'|'contracted'|'other';
 name:string;tradeName:string;document:string;rg:string;email:string;phone:string;nationality:string;occupation:string;maritalStatus:string;
 address:string;city:string;state:string;representativeName:string;representativeDocument:string;representativeRole:string;representativeEmail:string;
}
export type ContractPartyPerson=ContractParty&{entityType:'person'}
export type ContractPartyCompany=ContractParty&{entityType:'company'}
export interface ContractPaymentTerms{amount:number|'';currency:CurrencyCode;periodicity:string;method:string;installments:number|'';dueDay:number|'';finePercent:number|'';interestPercent:number|'';notes:string}
export interface ContractSigner{id:string;name:string;email:string;document:string;role:'contractor'|'contracted'|'legal_representative'|'witness'|'other';partyId?:string;order:number;required:boolean;status:SignatureStatus}
export interface ContractSignature{provider?:SigningProvider;status:SignatureStatus;externalId?:string;sentAt?:string;signedAt?:string;cancelledAt?:string;errorMessage?:string}
export interface ContractDocumentVersion{id:string;version:number;contentHtml:string;createdAt:string;createdBy:string;notes:string;provider?:SigningProvider;externalId?:string;fileUrl?:string}
export interface ContractDocument{id:string;title:string;contentHtml:string;headerHtml:string;footerHtml:string;status:DocumentStatus;versions:ContractDocumentVersion[];signedFileUrl?:string;provider?:SigningProvider;externalId?:string}
export interface ContractAttachment{id:string;name:string;type:string;size:number;dataUrl:string;createdAt:string}
export interface ContractTimelineEntry{id:string;event:string;description:string;createdAt:string;actor:string}
export interface Contract{
 id:string;title:string;number:string;type:string;categoryId:string;status:ContractStatus;startDate:string;endDate:string;duration:string;description:string;internalNotes:string;
 payment:ContractPaymentTerms;parties:ContractParty[];variableValues:Record<string,string>;document:ContractDocument;signers:ContractSigner[];attachments:ContractAttachment[];timeline:ContractTimelineEntry[];
 signingProvider?:SigningProvider;signatureStatus:SignatureStatus;createdAt:string;updatedAt:string;
}
export interface ContractTemplate{id:string;name:string;categoryId:string;description:string;contentHtml:string;headerHtml:string;footerHtml:string;variableKeys:string[];active:boolean;createdAt:string;updatedAt:string}
export interface ContractCategory{id:string;name:string;description:string;active:boolean;order:number;createdAt:string;updatedAt:string}
export interface ContractVariable{id:string;name:string;key:string;group:VariableGroup;description:string;type:'text'|'number'|'date'|'currency'|'email';required:boolean;defaultValue:string;active:boolean;createdAt:string;updatedAt:string}
export interface ContractsState{contracts:Contract[];templates:ContractTemplate[];categories:ContractCategory[];variables:ContractVariable[]}

export const contractStatusOptions:readonly (readonly [ContractStatus,string])[]=[
 ['draft','Rascunho'],['in_review','Em Análise'],['awaiting_signature','Aguardando Assinatura'],['partially_signed','Parcialmente Assinado'],['signed','Assinado'],['active','Vigente'],['suspended','Suspenso'],['closed','Encerrado'],['cancelled','Cancelado'],['expired','Expirado'],
]
export const signatureStatusOptions:readonly (readonly [SignatureStatus,string])[]=[
 ['not_sent','Não enviado'],['preparing','Preparando'],['sent','Enviado'],['viewed','Visualizado'],['awaiting_signature','Aguardando assinatura'],['partially_signed','Parcialmente assinado'],['signed','Assinado'],['rejected','Recusado'],['cancelled','Cancelado'],['expired','Expirado'],['error','Erro'],
]
export const contractTypeOptions=([
 'Publicidade','Campanha Publicitária','Banner Publicitário','Publieditorial','Matéria Patrocinada','Publicação Comercial','Patrocínio','Produção de Conteúdo','Cobertura de Evento','Divulgação de Evento','Divulgação de Lançamento','Entrevista','Design','Marketing','Desenvolvimento Web','Consultoria','Prestação de Serviços','Parceria Comercial','Permuta','Coprodução','Fornecedor','Prestador de Serviço','Serviço Recorrente','Cessão de Conteúdo','Licença de Conteúdo','Autorização de Uso de Imagem','Autorização de Uso de Conteúdo','NDA / Confidencialidade','Aditivo','Distrato','Termo','Outro',
] as const)
export const currencyOptions:readonly (readonly [CurrencyCode,string])[]=[['BRL','BRL'],['USD','USD'],['EUR','EUR']]
export const partySourceOptions:readonly (readonly [PartySource,string])[]=[['crm','CRM — Contato'],['manual','Manual'],['portal_lander','Portal Lander']]
export const partyEntityTypeOptions:readonly (readonly [PartyEntityType,string])[]=[['person','Pessoa Física'],['company','Pessoa Jurídica']]
export const optionLabel=<T extends string>(options:readonly (readonly [T,string])[],value:T)=>options.find(([key])=>key===value)?.[1]??value
export const newId=(prefix:string)=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
