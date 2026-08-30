import type {FinanceCategory,FinanceInvoice,FinanceRule,FinanceTransaction} from '../domain'

const stamp='2026-08-30T05:00:00.000Z'

export const financeCategoriesMock:FinanceCategory[]=[
 {id:'cat-1',category:'Vendas e Serviços',subcategory:'Prestação de serviços',type:'receita',counterparty:'Cliente',active:true},
 {id:'cat-2',category:'Publicidade',subcategory:'Anúncios e mídia',type:'receita',counterparty:'Anunciante',active:true},
 {id:'cat-3',category:'Operacional',subcategory:'Fornecedores e serviços',type:'despesa',counterparty:'Fornecedor',active:true},
 {id:'cat-4',category:'Tecnologia',subcategory:'Software e infraestrutura',type:'despesa',counterparty:'Fornecedor',active:true},
 {id:'cat-5',category:'Impostos e Taxas',subcategory:'Tributos',type:'despesa',counterparty:'Órgão público',active:true},
 {id:'cat-6',category:'Marketing',subcategory:'Campanhas e aquisição',type:'despesa',counterparty:'Fornecedor',active:true},
]

export const financeTransactionsMock:FinanceTransaction[]=[
 {id:'tx-1',type:'receita',description:'Contrato de publicidade institucional',category:'Publicidade',subcategory:'Anúncios e mídia',status:'pago',date:'2026-08-05',dueDate:'2026-08-05',amount:8500,counterparty:'Cliente Exemplo',document:'NF-0001',paymentMethod:'Pix',contractRef:'CTR-2026-001',costCenter:'Comercial',competence:'08/2026',notes:'',createdAt:stamp,updatedAt:stamp},
 {id:'tx-2',type:'despesa',description:'Infraestrutura e serviços digitais',category:'Tecnologia',subcategory:'Software e infraestrutura',status:'pago',date:'2026-08-10',dueDate:'2026-08-10',amount:1290,counterparty:'Fornecedor Exemplo',document:'FAT-8821',paymentMethod:'Cartão',contractRef:'',costCenter:'Tecnologia',competence:'08/2026',notes:'',createdAt:stamp,updatedAt:stamp},
 {id:'tx-3',type:'receita',description:'Prestação de serviço editorial',category:'Vendas e Serviços',subcategory:'Prestação de serviços',status:'pendente',date:'2026-08-25',dueDate:'2026-09-05',amount:4200,counterparty:'Cliente Corporativo',document:'',paymentMethod:'Boleto',contractRef:'CTR-2026-014',costCenter:'Editorial',competence:'08/2026',notes:'',createdAt:stamp,updatedAt:stamp},
 {id:'tx-4',type:'despesa',description:'Campanha institucional',category:'Marketing',subcategory:'Campanhas e aquisição',status:'pendente',date:'2026-08-27',dueDate:'2026-09-10',amount:2750,counterparty:'Agência Parceira',document:'FAT-9012',paymentMethod:'Boleto',contractRef:'CTR-2026-019',costCenter:'Marketing',competence:'08/2026',notes:'',createdAt:stamp,updatedAt:stamp},
]

export const financeInvoicesMock:FinanceInvoice[]=[
 {id:'nf-1',number:'000001',series:'001',type:'saida',party:'Cliente Exemplo',document:'12.345.678/0001-90',issueDate:'2026-08-05',dueDate:'2026-08-05',amount:8500,status:'paga',description:'Serviços de publicidade institucional',pdfUrl:'',createdAt:stamp,updatedAt:stamp},
 {id:'nf-2',number:'000002',series:'001',type:'saida',party:'Cliente Corporativo',document:'48.765.432/0001-10',issueDate:'2026-08-25',dueDate:'2026-09-05',amount:4200,status:'pendente',description:'Prestação de serviço editorial',pdfUrl:'',createdAt:stamp,updatedAt:stamp},
 {id:'nf-3',number:'8821',series:'A',type:'entrada',party:'Fornecedor Exemplo',document:'33.444.555/0001-66',issueDate:'2026-08-10',dueDate:'2026-08-10',amount:1290,status:'paga',description:'Infraestrutura e serviços digitais',pdfUrl:'',createdAt:stamp,updatedAt:stamp},
]

export const financeRulesMock:FinanceRule[]=[
 {id:'rule-1',name:'Vencimento de nota fiscal',event:'invoice.due',condition:'Status pendente na data de vencimento',action:'Marcar como vencida e destacar no financeiro',active:true},
]
