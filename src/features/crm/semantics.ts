import {serviceDetailFields,type ContactEntityType,type LeadService} from './domain'

export type ContactSemanticLabels={
 name:string
 company:string
 document:string
 role:string
}

export function getContactSemanticLabels(entityType:ContactEntityType):ContactSemanticLabels{
 return entityType==='pessoa_juridica'
  ?{name:'Razão Social *',company:'Nome Fantasia',document:'CNPJ',role:'Cargo / Função'}
  :{name:'Nome completo *',company:'Empresa / Organização',document:'CPF',role:'Cargo / Função'}
}

export function getServiceDetailLabel(service:LeadService,key:string):string{
 return serviceDetailFields[service]?.find(field=>field.key===key)?.label??key
}
