import {serviceDetailFields,type ContactEntityType,type LeadService} from './domain'

type ContactSemanticLabels={
 name:string
 company:string
 document:string
}

export function getContactSemanticLabels(entityType:ContactEntityType):ContactSemanticLabels{
 return entityType==='pessoa_juridica'
  ?{name:'Razão Social *',company:'Nome Fantasia',document:'CNPJ'}
  :{name:'Nome completo *',company:'Empresa / Organização',document:'CPF'}
}

export function getServiceDetailLabel(service:LeadService,key:string):string{
 return serviceDetailFields[service]?.find(field=>field.key===key)?.label??key
}
