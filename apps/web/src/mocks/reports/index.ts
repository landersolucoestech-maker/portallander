import type {ReportsSeed} from '../../features/reports/domain'
const columns=(items:Array<[string,string,string]>)=>items.map(([name,label,type])=>({name,label,type,nullable:true}))
export const mockReportsSeed:ReportsSeed={
 entities:[
  {entityName:'ContactEntity',tableName:'contacts',label:'Contatos',category:'REPORTABLE',reportable:true,columns:columns([['name','Nome','text'],['email','E-mail','text'],['phone','Telefone','text']]),risks:[]},
  {entityName:'LeadEntity',tableName:'leads',label:'Leads',category:'REPORTABLE',reportable:true,columns:columns([['name','Nome','text'],['status','Status','enum'],['service','Serviço','text']]),risks:[]},
  {entityName:'ContractEntity',tableName:'contracts',label:'Contratos',category:'REPORTABLE',reportable:true,columns:columns([['title','Título','text'],['status','Status','enum'],['value','Valor','money']]),risks:[]},
  {entityName:'FinanceTransactionEntity',tableName:'finance_transactions',label:'Transações Financeiras',category:'REPORTABLE',reportable:true,columns:columns([['description','Descrição','text'],['amount','Valor','money'],['date','Data','date']]),risks:[]},
  {entityName:'FinanceInvoiceEntity',tableName:'finance_invoices',label:'Notas Fiscais',category:'REPORTABLE',reportable:true,columns:columns([['number','Número','text'],['client','Cliente','text'],['total','Valor total','money']]),risks:[]},
  {entityName:'EmployeeEntity',tableName:'employees',label:'Funcionários',category:'REPORTABLE',reportable:true,columns:columns([['name','Nome','text'],['role','Cargo','text'],['status','Status','enum']]),risks:[]},
  {entityName:'MarketingCampaignEntity',tableName:'marketing_campaigns',label:'Campanhas de Marketing',category:'REPORTABLE',reportable:true,columns:columns([['name','Nome','text'],['status','Status','enum'],['budget','Budget','money']]),risks:[]},
  {entityName:'MarketingContentEntity',tableName:'marketing_contents',label:'Conteúdos de Marketing',category:'REPORTABLE',reportable:true,columns:columns([['title','Título','text'],['status','Status','enum'],['publishDate','Publicação','date']]),risks:[]},
  {entityName:'MarketingTaskEntity',tableName:'marketing_tasks',label:'Tarefas de Marketing',category:'REPORTABLE',reportable:true,columns:columns([['title','Título','text'],['owner','Responsável','text'],['deadline','Prazo','date']]),risks:[]},
  {entityName:'MarketingBriefingEntity',tableName:'marketing_briefings',label:'Briefings',category:'REPORTABLE',reportable:true,columns:columns([['title','Título','text'],['objective','Objetivo','text'],['status','Status','enum']]),risks:[]},
  {entityName:'EditorialContentEntity',tableName:'editorial_contents',label:'Conteúdos Editoriais',category:'REPORTABLE',reportable:true,columns:columns([['title','Título','text'],['status','Status','enum'],['publishedAt','Publicação','date']]),risks:[]},
  {entityName:'AuditEntity',tableName:'audit_logs',label:'Auditoria',category:'SECURITY',reportable:false,columns:[],risks:['sensitive']},
  {entityName:'FutureReportEntity',tableName:'future_reports',label:'Relatórios Avançados',category:'REPORTABLE',reportable:true,columns:columns([['name','Nome','text']]),risks:[]},
 ],
 definitions:[
  {entityName:'ContactEntity',tableName:'contacts',category:'REPORTABLE',exportableColumns:['name','email','phone'],importableColumns:['name','email','phone'],requiredImportColumns:['name'],supportsExport:true,supportsImport:true},
  {entityName:'LeadEntity',tableName:'leads',category:'REPORTABLE',exportableColumns:['name','status','service'],importableColumns:['name','status','service'],requiredImportColumns:['name'],supportsExport:true,supportsImport:true},
  {entityName:'ContractEntity',tableName:'contracts',category:'REPORTABLE',exportableColumns:['title','status','value'],importableColumns:[],requiredImportColumns:[],supportsExport:true,supportsImport:false},
  {entityName:'FinanceTransactionEntity',tableName:'finance_transactions',category:'REPORTABLE',exportableColumns:['description','amount','date'],importableColumns:['description','amount','date'],requiredImportColumns:['description','amount'],supportsExport:true,supportsImport:true},
  {entityName:'FinanceInvoiceEntity',tableName:'finance_invoices',category:'REPORTABLE',exportableColumns:['number','client','total'],importableColumns:[],requiredImportColumns:[],supportsExport:true,supportsImport:false},
  {entityName:'EmployeeEntity',tableName:'employees',category:'REPORTABLE',exportableColumns:['name','role','status'],importableColumns:['name','role','status'],requiredImportColumns:['name'],supportsExport:true,supportsImport:true},
  {entityName:'MarketingCampaignEntity',tableName:'marketing_campaigns',category:'REPORTABLE',exportableColumns:['name','status','budget'],importableColumns:[],requiredImportColumns:[],supportsExport:true,supportsImport:false},
  {entityName:'MarketingContentEntity',tableName:'marketing_contents',category:'REPORTABLE',exportableColumns:['title','status','publishDate'],importableColumns:['title','status','publishDate'],requiredImportColumns:['title'],supportsExport:true,supportsImport:true},
  {entityName:'MarketingTaskEntity',tableName:'marketing_tasks',category:'REPORTABLE',exportableColumns:['title','owner','deadline'],importableColumns:['title','owner','deadline'],requiredImportColumns:['title'],supportsExport:true,supportsImport:true},
  {entityName:'MarketingBriefingEntity',tableName:'marketing_briefings',category:'REPORTABLE',exportableColumns:['title','objective','status'],importableColumns:[],requiredImportColumns:[],supportsExport:true,supportsImport:false},
  {entityName:'EditorialContentEntity',tableName:'editorial_contents',category:'REPORTABLE',exportableColumns:['title','status','publishedAt'],importableColumns:['title','status','publishedAt'],requiredImportColumns:['title'],supportsExport:true,supportsImport:true},
 ],
 importPreview:{contacts:{totalRows:24,validRows:24,invalidRows:0,errors:[],warnings:[]},leads:{totalRows:18,validRows:17,invalidRows:1,errors:['Linha 12: status não reconhecido.'],warnings:['1 linha precisa de correção antes da importação.']},finance_transactions:{totalRows:32,validRows:32,invalidRows:0,errors:[],warnings:['Datas serão normalizadas para o padrão do sistema.']},employees:{totalRows:12,validRows:12,invalidRows:0,errors:[],warnings:[]},marketing_contents:{totalRows:9,validRows:9,invalidRows:0,errors:[],warnings:[]},marketing_tasks:{totalRows:16,validRows:16,invalidRows:0,errors:[],warnings:[]},editorial_contents:{totalRows:7,validRows:7,invalidRows:0,errors:[],warnings:[]}}
}
