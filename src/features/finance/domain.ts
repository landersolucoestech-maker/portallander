export type FinanceTransactionType='receita'|'despesa'
export type FinanceStatus='pago'|'pendente'|'vencido'|'cancelado'
export type FinanceTransaction={id:string;type:FinanceTransactionType;description:string;category:string;subcategory:string;status:FinanceStatus;date:string;dueDate:string;amount:number;counterparty:string;document:string;paymentMethod:string;contractRef:string;costCenter:string;competence:string;notes:string;createdAt:string;updatedAt:string}
export type InvoiceType='entrada'|'saida'
export type InvoiceStatus='emitida'|'pendente'|'paga'|'cancelada'
export type FinanceInvoice={id:string;number:string;series:string;type:InvoiceType;party:string;document:string;issueDate:string;dueDate:string;amount:number;status:InvoiceStatus;description:string;pdfUrl:string;createdAt:string;updatedAt:string}
export type FinanceCategory={id:string;category:string;subcategory:string;type:FinanceTransactionType;counterparty:string;active:boolean}
export type FinanceRule={id:string;name:string;event:'transaction.created'|'transaction.paid'|'invoice.due'|'contract.signed';condition:string;action:string;active:boolean}
export const financeCategories:FinanceCategory[]=[
{id:'cat-1',category:'Vendas e Serviços',subcategory:'Prestação de serviços',type:'receita',counterparty:'Cliente',active:true},
{id:'cat-2',category:'Publicidade',subcategory:'Anúncios e mídia',type:'receita',counterparty:'Anunciante',active:true},
{id:'cat-3',category:'Operacional',subcategory:'Fornecedores e serviços',type:'despesa',counterparty:'Fornecedor',active:true},
{id:'cat-4',category:'Tecnologia',subcategory:'Software e infraestrutura',type:'despesa',counterparty:'Fornecedor',active:true},
{id:'cat-5',category:'Impostos e Taxas',subcategory:'Tributos',type:'despesa',counterparty:'Órgão público',active:true},
{id:'cat-6',category:'Marketing',subcategory:'Campanhas e aquisição',type:'despesa',counterparty:'Fornecedor',active:true},
]
export const seedTransactions:FinanceTransaction[]=[
{id:'tx-1',type:'receita',description:'Contrato de publicidade institucional',category:'Publicidade',subcategory:'Anúncios e mídia',status:'pago',date:'2026-08-05',dueDate:'2026-08-05',amount:8500,counterparty:'Cliente Exemplo',document:'NF-0001',paymentMethod:'Pix',contractRef:'CTR-2026-001',costCenter:'Comercial',competence:'08/2026',notes:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
{id:'tx-2',type:'despesa',description:'Infraestrutura e serviços digitais',category:'Tecnologia',subcategory:'Software e infraestrutura',status:'pago',date:'2026-08-10',dueDate:'2026-08-10',amount:1290,counterparty:'Fornecedor Exemplo',document:'FAT-8821',paymentMethod:'Cartão',contractRef:'',costCenter:'Tecnologia',competence:'08/2026',notes:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
{id:'tx-3',type:'receita',description:'Prestação de serviço editorial',category:'Vendas e Serviços',subcategory:'Prestação de serviços',status:'pendente',date:'2026-08-25',dueDate:'2026-09-05',amount:4200,counterparty:'Cliente Corporativo',document:'',paymentMethod:'Boleto',contractRef:'CTR-2026-014',costCenter:'Editorial',competence:'08/2026',notes:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
]
export const seedInvoices:FinanceInvoice[]=[
{id:'nf-1',number:'000001',series:'001',type:'saida',party:'Cliente Exemplo',document:'12.345.678/0001-90',issueDate:'2026-08-05',dueDate:'2026-08-05',amount:8500,status:'paga',description:'Serviços de publicidade institucional',pdfUrl:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
]
export const seedRules:FinanceRule[]=[{id:'rule-1',name:'Vencimento de nota fiscal',event:'invoice.due',condition:'Status pendente na data de vencimento',action:'Marcar como vencida e destacar no financeiro',active:true}]
export const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export const uid=(prefix:string)=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
