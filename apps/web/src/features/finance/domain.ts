export type FinanceTransactionType='receita'|'despesa'
export type FinanceStatus='pago'|'pendente'|'vencido'|'cancelado'
export type FinancePaymentType='avista'|'parcelado'
export type FinancePaymentMethod='pix'|'boleto'|'transferencia'|'cartao'|'dinheiro'|'outro'
export type FinanceTransaction={id:string;type:FinanceTransactionType;description:string;category:string;subcategory:string;status:FinanceStatus;date:string;dueDate:string;amount:number;counterparty:string;document:string;paymentMethod:string;paymentType?:FinancePaymentType;installmentCount?:number;installmentInterval?:number;firstInstallmentDate?:string;contractRef:string;contactRef?:string;supplierRef?:string;costCenter:string;competence:string;notes:string;attachmentName?:string;attachmentDataUrl?:string;createdAt:string;updatedAt:string}
export type InvoiceType='entrada'|'saida'
export type InvoiceStatus='emitida'|'pendente'|'paga'|'cancelada'
export type FinanceInvoice={id:string;number:string;series:string;type:InvoiceType;party:string;document:string;issueDate:string;dueDate:string;amount:number;status:InvoiceStatus;description:string;pdfUrl:string;model?:string;accessKey?:string;operationNature?:string;cfop?:string;entryExitDate?:string;stateRegistration?:string;municipalRegistration?:string;email?:string;phone?:string;address?:string;city?:string;state?:string;zipCode?:string;productsAmount?:number;freightAmount?:number;insuranceAmount?:number;discountAmount?:number;otherExpenses?:number;icmsBase?:number;icmsAmount?:number;ipiAmount?:number;pisAmount?:number;cofinsAmount?:number;issAmount?:number;paymentMethod?:string;paymentCondition?:string;xmlUrl?:string;additionalInfo?:string;createdAt:string;updatedAt:string}
export type FinanceCategory={id:string;category:string;subcategory:string;type:FinanceTransactionType;counterparty:string;active:boolean}
export type FinanceRuleEvent='transaction.created'|'transaction.paid'|'invoice.due'|'contract.signed'
export type FinanceRule={id:string;name:string;event:FinanceRuleEvent;condition:string;action:string;active:boolean}

export const transactionTypeOptions:readonly (readonly [FinanceTransactionType,string])[]=[['receita','Receita'],['despesa','Despesa']]
export const financeStatusOptions:readonly (readonly [FinanceStatus,string])[]=[['pago','Pago'],['pendente','Pendente'],['vencido','Vencido'],['cancelado','Cancelado']]
export const financePaymentTypeOptions:readonly (readonly [FinancePaymentType,string])[]=[['avista','À vista'],['parcelado','Parcelado']]
export const financePaymentMethodOptions:readonly (readonly [FinancePaymentMethod,string])[]=[['pix','Pix'],['boleto','Boleto'],['transferencia','Transferência'],['cartao','Cartão'],['dinheiro','Dinheiro'],['outro','Outro']]
export const invoiceTypeOptions:readonly (readonly [InvoiceType,string])[]=[['saida','Saída'],['entrada','Entrada']]
export const invoiceStatusOptions:readonly (readonly [InvoiceStatus,string])[]=[['emitida','Emitida'],['pendente','Pendente'],['paga','Paga'],['cancelada','Cancelada']]

export const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export const uid=(prefix:string)=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
