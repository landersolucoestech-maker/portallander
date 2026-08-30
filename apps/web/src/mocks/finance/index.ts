import type {FinanceCategory,FinanceInvoice,FinanceRule,FinanceTransaction,FinanceTransactionType} from '../../features/finance/domain'
import {mockIds,MOCK_REFERENCE_DATE} from '../shared'

export const mockFinanceCategories:FinanceCategory[]=[
 {id:'fin_cat_1',category:'Vendas e Serviços',subcategory:'Prestação de serviços',type:'receita',counterparty:'Cliente',active:true},
 {id:'fin_cat_2',category:'Publicidade',subcategory:'Campanhas e mídia',type:'receita',counterparty:'Anunciante',active:true},
 {id:'fin_cat_3',category:'Patrocínio',subcategory:'Cotas e ativações',type:'receita',counterparty:'Patrocinador',active:true},
 {id:'fin_cat_4',category:'Editorial',subcategory:'Conteúdo patrocinado',type:'receita',counterparty:'Cliente',active:true},
 {id:'fin_cat_5',category:'Tecnologia',subcategory:'Software e infraestrutura',type:'despesa',counterparty:'Fornecedor',active:true},
 {id:'fin_cat_6',category:'Operacional',subcategory:'Serviços terceirizados',type:'despesa',counterparty:'Fornecedor',active:true},
 {id:'fin_cat_7',category:'Marketing',subcategory:'Aquisição e campanhas',type:'despesa',counterparty:'Fornecedor',active:true},
 {id:'fin_cat_8',category:'Impostos e Taxas',subcategory:'Tributos e tarifas',type:'despesa',counterparty:'Órgão público',active:true},
 {id:'fin_cat_9',category:'Produção',subcategory:'Audiovisual e eventos',type:'despesa',counterparty:'Fornecedor',active:true},
 {id:'fin_cat_10',category:'Administrativo',subcategory:'Serviços profissionais',type:'despesa',counterparty:'Fornecedor',active:true},
]

const receivables=[
 ['Aurora Foods',mockIds.contacts.aurora,mockIds.contracts.aurora],['Nexo Mobility',mockIds.contacts.nexo,mockIds.contracts.nexo],['Vértice Eventos',mockIds.contacts.vertice,mockIds.contracts.vertice],['Atlas Comunicação',mockIds.contacts.atlas,mockIds.contracts.atlas],['Lumina Tech',mockIds.contacts.lumina,mockIds.contracts.lumina],['Prisma Labs',mockIds.contacts.prisma,mockIds.contracts.prisma],['Norte Criativo',mockIds.contacts.norte,'contract_norte'],['Órbita Studio',mockIds.contacts.orbita,'contract_orbita'],['Cubo Digital',mockIds.contacts.cubo,'contract_cubo'],['Trama Cultural',mockIds.contacts.trama,'contract_trama'],['Axis Sports',mockIds.contacts.axis,'contract_axis'],['Tempo Editorial',mockIds.contacts.tempo,'contract_tempo'],
] as const
const suppliers=[['Nuvem Host','contact_nuvem-host'],['Frame Lab','contact_frame-lab'],['Voga Design','contact_voga'],['Cais Filmes','contact_cais-filmes'],['Ponte Agência','contact_ponte'],['Faro Comunicação','contact_faro']] as const
const receiptCategories=[['Publicidade','Campanhas e mídia'],['Vendas e Serviços','Prestação de serviços'],['Editorial','Conteúdo patrocinado'],['Patrocínio','Cotas e ativações']] as const
const expenseCategories=[['Tecnologia','Software e infraestrutura'],['Operacional','Serviços terceirizados'],['Marketing','Aquisição e campanhas'],['Impostos e Taxas','Tributos e tarifas'],['Produção','Audiovisual e eventos'],['Administrativo','Serviços profissionais']] as const
const statuses:FinanceTransaction['status'][]=['pago','pago','pendente','vencido','pago','cancelado']
const methods=['pix','boleto','transferencia','cartao'] as const

export const mockFinanceTransactions:FinanceTransaction[]=Array.from({length:72},(_,index)=>{
 const type:FinanceTransactionType=index%3===2?'despesa':'receita'
 const source=type==='receita'?receivables[index%receivables.length]:suppliers[index%suppliers.length]
 const [counterparty,contactRef,contractRefCandidate]=source.length===3?source:[source[0],source[1],'']
 const categoryCycle=Math.floor(index/3)
 const categoryPair=type==='receita'?receiptCategories[categoryCycle%receiptCategories.length]:expenseCategories[categoryCycle%expenseCategories.length]
 const month=1+(index%8),day=2+((index*3)%25),date=`2026-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
 const dueDay=Math.min(28,day+7),dueDate=`2026-${String(month).padStart(2,'0')}-${String(dueDay).padStart(2,'0')}`
 const status=statuses[index%statuses.length]
 const amount=type==='receita'?3200+((index*1750)%28500):380+((index*690)%9400)
 return {id:`finance_tx_${String(index+1).padStart(3,'0')}`,type,description:type==='receita'?`${['Campanha publicitária','Prestação de serviço','Conteúdo patrocinado','Cota de patrocínio'][categoryCycle%4]} · ${counterparty}`:`${['Infraestrutura digital','Serviço terceirizado','Campanha de aquisição','Tributos operacionais','Produção audiovisual','Assessoria administrativa'][categoryCycle%6]} · ${counterparty}`,category:categoryPair[0],subcategory:categoryPair[1],status,date,dueDate,amount,counterparty,document:index%5===0?'':`${type==='receita'?'NF':'FAT'}-${String(2600+index).padStart(5,'0')}`,paymentMethod:methods[index%methods.length],paymentType:index%7===0?'parcelado':'avista',installmentCount:index%7===0?3:1,installmentInterval:index%7===0?30:undefined,firstInstallmentDate:index%7===0?date:undefined,contractRef:type==='receita'?contractRefCandidate:'',contactRef,supplierRef:type==='despesa'?contactRef:undefined,costCenter:type==='receita'?(index%2===0?'Comercial':'Editorial'):(index%2===0?'Operações':'Administrativo'),competence:`${String(month).padStart(2,'0')}/2026`,notes:index%11===0?'Registro com observação operacional para validar conteúdo extenso e auditoria financeira.':'',attachmentName:index%9===0?'comprovante.pdf':'',attachmentDataUrl:'',createdAt:`${date}T10:00:00.000Z`,updatedAt:`2026-08-${String(3+index%25).padStart(2,'0')}T16:00:00.000Z`}
})

export const mockFinanceInvoices:FinanceInvoice[]=Array.from({length:42},(_,index)=>{
 const outgoing=index%3!==2
 const source=outgoing?receivables[index%receivables.length]:suppliers[index%suppliers.length]
 const party=source[0]
 const month=1+(index%8),day=3+((index*4)%23)
 const issueDate=`2026-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
 const dueDate=`2026-${String(month).padStart(2,'0')}-${String(Math.min(28,day+8)).padStart(2,'0')}`
 const invoiceStatuses:FinanceInvoice['status'][]=['paga','pendente','emitida','cancelada','paga']
 return {id:`finance_invoice_${String(index+1).padStart(3,'0')}`,number:String(1001+index).padStart(6,'0'),series:outgoing?'001':'E1',type:outgoing?'saida':'entrada',party,document:`${String(12000000000000+index*771133).padStart(14,'0')}`,issueDate,dueDate,amount:outgoing?3600+((index*2100)%32000):650+((index*870)%12500),status:invoiceStatuses[index%invoiceStatuses.length],description:outgoing?['Publicidade institucional','Produção de conteúdo patrocinado','Prestação de serviços de comunicação'][index%3]:['Infraestrutura de tecnologia','Produção audiovisual','Serviços profissionais'][index%3],pdfUrl:index%6===0?'':`mock://invoice/${1001+index}.pdf`,createdAt:`${issueDate}T11:00:00.000Z`,updatedAt:MOCK_REFERENCE_DATE}
})

export const mockFinanceRules:FinanceRule[]=[
 {id:'finance_rule_due',name:'Destacar cobrança vencida',event:'invoice.due',condition:'Nota fiscal pendente após a data de vencimento',action:'Marcar como vencida e incluir no painel de cobrança',active:true},
 {id:'finance_rule_paid',name:'Concluir conta recebida',event:'transaction.paid',condition:'Transação de receita alterada para paga',action:'Atualizar indicadores e remover do contas a receber',active:true},
 {id:'finance_rule_contract',name:'Preparar faturamento de contrato',event:'contract.signed',condition:'Contrato assinado com valor financeiro informado',action:'Criar pendência de faturamento vinculada ao contrato',active:true},
 {id:'finance_rule_category',name:'Classificar infraestrutura',event:'transaction.created',condition:'Descrição contém hospedagem, cloud ou software',action:'Aplicar categoria Tecnologia / Software e infraestrutura',active:true},
 {id:'finance_rule_review',name:'Revisar despesa elevada',event:'transaction.created',condition:'Despesa superior a R$ 10.000',action:'Sinalizar registro para revisão financeira',active:false},
]
