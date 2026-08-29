export type ContractStatus='draft'|'negotiation'|'active'|'suspended'|'expired'|'terminated'|'archived'
export type ContractVersionStatus='draft'|'review'|'approved'|'rejected'|'signed'|'superseded'
export type PartyType='person'|'organization'
export type ContractPartyRole='Contratante'|'Contratada'|'Cliente'|'Fornecedor'|'Parceiro'|'Prestador'|'Licenciante'|'Licenciado'|'Investidor'|'Beneficiário'|'Participante'|'Outro'
export type EconomicRuleType='percentage'|'fixed'|'tiered'|'custom'
export type EconomicBasis='gross_revenue'|'net_revenue'|'distributable_base'|'product_result'|'service_result'|'custom_reference'

export type ContractParty={id:string;versionId:string;partyType:PartyType;partyId:string;partyLabel:string;role:ContractPartyRole;signatoryPersonId?:string;signatoryLabel?:string;order:number;notes?:string}
export type ContractSigner={id:string;name:string;email:string;role:string;order:number;required:boolean;status:'prepared'|'pending'|'signed'|'declined'}
export type EconomicRule={id:string;versionId:string;name:string;type:EconomicRuleType;participantPartyType:PartyType;participantPartyId:string;participantLabel:string;percentage?:number;referenceValue?:number;basisType:EconomicBasis;deductions:string[];effectiveFrom?:string;effectiveUntil?:string;status:'draft'|'valid'}
export type ContractVersion={id:string;contractId:string;versionNumber:number;status:ContractVersionStatus;title:string;content:string;effectiveFrom?:string;effectiveUntil?:string;currency:string;referenceValue:number;snapshot:Record<string,string>;variablesSnapshot:Record<string,string>;signersSnapshot:ContractSigner[];createdAt:string;createdBy:string;approvedAt?:string;approvedBy?:string;signedAt?:string;supersededAt?:string;rejectionReason?:string;parties:ContractParty[];economicRules:EconomicRule[]}
export type Contract={id:string;number:string;name:string;type:string;category:string;status:ContractStatus;ownerUserId:string;responsibleUserIds:string[];startDate?:string;endDate?:string;renewalDate?:string;currency:string;referenceValue:number;customerPartyId?:string;customerLabel?:string;productId?:string;serviceId?:string;businessUnitId?:string;templateId?:string;templateVersionId?:string;activeVersionId?:string;latestVersionId:string;createdAt:string;createdBy:string;updatedAt:string;updatedBy:string;isDemo:boolean;versions:ContractVersion[];history:ContractHistoryEvent[]}
export type ContractHistoryEvent={id:string;type:string;at:string;user:string;reason?:string}

export type ContractTemplateStatus='draft'|'active'|'archived'
export type ContractTemplateVersion={id:string;templateId:string;versionNumber:number;status:'draft'|'active'|'superseded';content:string;variables:string[];createdAt:string}
export type ContractTemplate={id:string;name:string;category:string;type:string;status:ContractTemplateStatus;activeVersionId?:string;versions:ContractTemplateVersion[];updatedAt:string}
export type ContractVariable={id:string;key:string;label:string;description:string;scope:string;valueType:'Texto'|'Documento'|'Moeda'|'Data'|'Número';required:boolean;status:'Ativa'|'Inativa';origin:string}

export const CONTRACT_STATUS_LABEL:Record<ContractStatus,string>={draft:'Rascunho',negotiation:'Em negociação',active:'Ativo',suspended:'Suspenso',expired:'Expirado',terminated:'Encerrado',archived:'Arquivado'}
export const VERSION_STATUS_LABEL:Record<ContractVersionStatus,string>={draft:'Rascunho',review:'Em revisão',approved:'Aprovada',rejected:'Rejeitada',signed:'Assinada',superseded:'Substituída'}

export const BUILTIN_VARIABLES:ContractVariable[]=[
{id:'var-company-name',key:'{{EMPRESA.RAZAO_SOCIAL}}',label:'Razão social da empresa',description:'Razão social cadastrada nas configurações institucionais.',scope:'Empresa',valueType:'Texto',required:true,status:'Ativa',origin:'Configurações'},
{id:'var-company-doc',key:'{{EMPRESA.CNPJ}}',label:'CNPJ da empresa',description:'Documento institucional cadastrado nas configurações.',scope:'Empresa',valueType:'Documento',required:true,status:'Ativa',origin:'Configurações'},
{id:'var-customer-name',key:'{{CLIENTE.NOME}}',label:'Nome do cliente',description:'Nome da pessoa ou organização vinculada como cliente.',scope:'Cliente',valueType:'Texto',required:true,status:'Ativa',origin:'CRM'},
{id:'var-customer-doc',key:'{{CLIENTE.DOCUMENTO}}',label:'Documento do cliente',description:'CPF ou CNPJ da parte canônica vinculada ao contrato.',scope:'Cliente',valueType:'Documento',required:false,status:'Ativa',origin:'CRM'},
{id:'var-contract-number',key:'{{CONTRATO.NUMERO}}',label:'Número do contrato',description:'Número interno controlado do contrato.',scope:'Contrato',valueType:'Texto',required:true,status:'Ativa',origin:'Contratos'},
{id:'var-contract-value',key:'{{CONTRATO.VALOR}}',label:'Valor de referência',description:'Valor de referência informado no contrato.',scope:'Contrato',valueType:'Moeda',required:false,status:'Ativa',origin:'Contratos'},
]

export const EMPTY_TEMPLATES:ContractTemplate[]=[]
export const EMPTY_CONTRACTS:Contract[]=[]

export function createContract(input:{name:string;type:string;category:string;number:string;customerLabel?:string;startDate?:string;endDate?:string;currency:string;referenceValue:number;content:string;templateId?:string;templateVersionId?:string;variablesSnapshot?:Record<string,string>;signersSnapshot?:ContractSigner[]}):Contract{
 const now=new Date().toISOString();const id=`ctr-${Date.now()}`;const versionId=`${id}-v1`
 const version:ContractVersion={id:versionId,contractId:id,versionNumber:1,status:'draft',title:input.name,content:input.content,effectiveFrom:input.startDate,effectiveUntil:input.endDate,currency:input.currency,referenceValue:input.referenceValue,snapshot:{number:input.number,name:input.name,customer:input.customerLabel??'',currency:input.currency,referenceValue:String(input.referenceValue)},variablesSnapshot:input.variablesSnapshot??{},signersSnapshot:input.signersSnapshot??[],createdAt:now,createdBy:'Administrador local',parties:[],economicRules:[]}
 return {id,number:input.number,name:input.name,type:input.type,category:input.category,status:'draft',ownerUserId:'local-admin',responsibleUserIds:['local-admin'],startDate:input.startDate,endDate:input.endDate,currency:input.currency,referenceValue:input.referenceValue,customerLabel:input.customerLabel,templateId:input.templateId,templateVersionId:input.templateVersionId,latestVersionId:versionId,createdAt:now,createdBy:'Administrador local',updatedAt:now,updatedBy:'Administrador local',isDemo:false,versions:[version],history:[{id:`hist-${Date.now()}`,type:'contrato criado',at:now,user:'Administrador local'}]}
}

export function createNextVersion(contract:Contract):Contract{
 const current=contract.versions.find(v=>v.id===contract.latestVersionId)??contract.versions.at(-1)!;const now=new Date().toISOString();const versionNumber=Math.max(...contract.versions.map(v=>v.versionNumber))+1;const id=`${contract.id}-v${versionNumber}`
 const next:ContractVersion={...current,id,versionNumber,status:'draft',createdAt:now,createdBy:'Administrador local',approvedAt:undefined,approvedBy:undefined,signedAt:undefined,supersededAt:undefined,rejectionReason:undefined,variablesSnapshot:{...current.variablesSnapshot},signersSnapshot:current.signersSnapshot.map(s=>({...s,id:`${id}-${s.id}`,status:'prepared'})),parties:current.parties.map(p=>({...p,id:`${id}-${p.id}`,versionId:id})),economicRules:current.economicRules.map(r=>({...r,id:`${id}-${r.id}`,versionId:id,status:'draft'}))}
 return {...contract,latestVersionId:id,updatedAt:now,updatedBy:'Administrador local',versions:[...contract.versions,next],history:[...contract.history,{id:`hist-${Date.now()}`,type:`versão ${versionNumber} criada`,at:now,user:'Administrador local'}]}
}

export function canEditVersion(version:ContractVersion){return version.status==='draft'||version.status==='review'||version.status==='rejected'}
export function validatePercentage(value:number){return Number.isFinite(value)&&value>0&&value<=100}
