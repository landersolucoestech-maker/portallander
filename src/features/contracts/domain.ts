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
export const defaultCategories:ContractCategory[]=['Comercial','Publicidade','Editorial','Conteúdo','Prestação de Serviços','Parcerias','Fornecedores','Jurídico','Institucional','Outro'].map((name,index)=>({id:`category_${index+1}`,name,description:'',active:true,order:index+1,createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z'}))
const variable=(group:VariableGroup,key:string,name:string,required=false):ContractVariable=>({id:`variable_${group}_${key}`.toLowerCase(),name,key:`{{${group}.${key}}}`,group,description:'',type:'text',required,defaultValue:'',active:true,createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z'})
export const defaultVariables:ContractVariable[]=[
 variable('CONTRATANTE','NAME','Nome do contratante',true),variable('CONTRATANTE','COMPANY_NAME','Razão social do contratante'),variable('CONTRATANTE','TRADE_NAME','Nome fantasia do contratante'),variable('CONTRATANTE','CPF','CPF do contratante'),variable('CONTRATANTE','CNPJ','CNPJ do contratante'),variable('CONTRATANTE','EMAIL','E-mail do contratante'),variable('CONTRATANTE','PHONE','Telefone do contratante'),variable('CONTRATANTE','ADDRESS','Endereço do contratante'),variable('CONTRATANTE','CITY','Cidade do contratante'),variable('CONTRATANTE','STATE','Estado do contratante'),variable('CONTRATANTE','REPRESENTATIVE_NAME','Representante do contratante'),variable('CONTRATANTE','REPRESENTATIVE_ROLE','Cargo do representante'),
 variable('CONTRATADA','NAME','Nome da contratada'),variable('CONTRATADA','COMPANY_NAME','Razão social da contratada'),variable('CONTRATADA','CNPJ','CNPJ da contratada'),variable('CONTRATADA','EMAIL','E-mail da contratada'),variable('CONTRATADA','ADDRESS','Endereço da contratada'),variable('CONTRATADA','REPRESENTATIVE_NAME','Representante da contratada'),
 variable('CONTRACT','TITLE','Título do contrato',true),variable('CONTRACT','NUMBER','Número do contrato'),variable('CONTRACT','TYPE','Tipo do contrato',true),variable('CONTRACT','CATEGORY','Categoria'),variable('CONTRACT','START_DATE','Data de início'),variable('CONTRACT','END_DATE','Data de término'),variable('CONTRACT','OBJECT','Objeto do contrato'),variable('CONTRACT','DURATION','Vigência'),
 variable('PAYMENT','AMOUNT','Valor'),variable('PAYMENT','AMOUNT_IN_WORDS','Valor por extenso'),variable('PAYMENT','CURRENCY','Moeda'),variable('PAYMENT','METHOD','Forma de pagamento'),variable('PAYMENT','INSTALLMENTS','Parcelas'),variable('PAYMENT','DUE_DATE','Vencimento'),variable('PAYMENT','PERIODICITY','Periodicidade'),
 variable('SERVICE','NAME','Serviço'),variable('SERVICE','DESCRIPTION','Descrição do serviço'),variable('SERVICE','QUANTITY','Quantidade'),variable('SERVICE','START_DATE','Início do serviço'),variable('SERVICE','END_DATE','Fim do serviço'),
 variable('CAMPAIGN','NAME','Nome da campanha'),variable('CAMPAIGN','PERIOD','Período da campanha'),variable('CAMPAIGN','OBJECTIVE','Objetivo da campanha'),variable('CAMPAIGN','CHANNELS','Canais'),variable('CAMPAIGN','FORMATS','Formatos'),variable('CAMPAIGN','BUDGET','Orçamento'),
 variable('EVENT','NAME','Nome do evento'),variable('EVENT','DATE','Data do evento'),variable('EVENT','LOCATION','Local do evento'),variable('EVENT','CITY','Cidade do evento'),variable('EVENT','STATE','Estado do evento'),variable('EVENT','COVERAGE_SCOPE','Escopo da cobertura'),
 variable('CONTENT','TITLE','Título do conteúdo'),variable('CONTENT','SUBJECT','Assunto'),variable('CONTENT','FORMAT','Formato'),variable('CONTENT','PUBLICATION_DATE','Data de publicação'),variable('CONTENT','CTA','CTA'),variable('CONTENT','URL','URL'),
 variable('SIGNATURE','CONTRATANTE','Assinatura do contratante'),variable('SIGNATURE','CONTRATADA','Assinatura da contratada'),variable('SIGNATURE','REPRESENTATIVE','Assinatura do representante'),
]
export const optionLabel=<T extends string>(options:readonly (readonly [T,string])[],value:T)=>options.find(([key])=>key===value)?.[1]??value
export const newId=(prefix:string)=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
