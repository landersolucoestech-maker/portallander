import type {Contract,ContractTemplate,ContractVariable} from './domain'
import {formatCurrency,formatDate} from './format'
export const extractPlaceholders=(text:string)=>Array.from(new Set(text.match(/\{\{[A-Z][A-Z0-9_]*\.[A-Z][A-Z0-9_]*\}\}/g)??[]))
export const resolveDocument=(template:Pick<ContractTemplate,'contentHtml'|'headerHtml'|'footerHtml'>,values:Record<string,string>)=>({contentHtml:replace(template.contentHtml,values),headerHtml:replace(template.headerHtml,values),footerHtml:replace(template.footerHtml,values),missing:extractPlaceholders(`${template.headerHtml}\n${template.contentHtml}\n${template.footerHtml}`).filter(key=>!values[key]?.trim())})
const replace=(text:string,values:Record<string,string>)=>text.replace(/\{\{[A-Z][A-Z0-9_]*\.[A-Z][A-Z0-9_]*\}\}/g,key=>values[key]??key)
export function valuesFromContract(contract:Contract,variables:ContractVariable[],categoryName=''){
 const contractor=contract.parties.find(p=>p.role==='contractor'),contracted=contract.parties.find(p=>p.role==='contracted')
 const auto:Record<string,string>={
  '{{CONTRATANTE.NAME}}':contractor?.name??'','{{CONTRATANTE.COMPANY_NAME}}':contractor?.entityType==='company'?contractor.name:'','{{CONTRATANTE.TRADE_NAME}}':contractor?.tradeName??'','{{CONTRATANTE.EMAIL}}':contractor?.email??'','{{CONTRATANTE.PHONE}}':contractor?.phone??'','{{CONTRATANTE.ADDRESS}}':contractor?.address??'','{{CONTRATANTE.CITY}}':contractor?.city??'','{{CONTRATANTE.STATE}}':contractor?.state??'','{{CONTRATANTE.CPF}}':contractor?.entityType==='person'?contractor.document:'','{{CONTRATANTE.CNPJ}}':contractor?.entityType==='company'?contractor.document:'','{{CONTRATANTE.REPRESENTATIVE_NAME}}':contractor?.representativeName??'','{{CONTRATANTE.REPRESENTATIVE_ROLE}}':contractor?.representativeRole??'',
  '{{CONTRATADA.NAME}}':contracted?.name??'','{{CONTRATADA.COMPANY_NAME}}':contracted?.entityType==='company'?contracted.name:'','{{CONTRATADA.CNPJ}}':contracted?.entityType==='company'?contracted.document:'','{{CONTRATADA.EMAIL}}':contracted?.email??'','{{CONTRATADA.ADDRESS}}':contracted?.address??'','{{CONTRATADA.REPRESENTATIVE_NAME}}':contracted?.representativeName??'',
  '{{CONTRACT.TITLE}}':contract.title,'{{CONTRACT.NUMBER}}':contract.number,'{{CONTRACT.TYPE}}':contract.type,'{{CONTRACT.CATEGORY}}':categoryName,'{{CONTRACT.START_DATE}}':formatDate(contract.startDate),'{{CONTRACT.END_DATE}}':formatDate(contract.endDate),'{{CONTRACT.OBJECT}}':contract.description,'{{CONTRACT.DURATION}}':contract.duration,
  '{{PAYMENT.AMOUNT}}':formatCurrency(contract.payment.amount,contract.payment.currency),'{{PAYMENT.CURRENCY}}':contract.payment.currency,'{{PAYMENT.METHOD}}':contract.payment.method,'{{PAYMENT.INSTALLMENTS}}':String(contract.payment.installments||''),'{{PAYMENT.PERIODICITY}}':contract.payment.periodicity,
 }
 for(const variable of variables)if(!(variable.key in auto))auto[variable.key]=variable.defaultValue
 return {...auto,...contract.variableValues}
}
