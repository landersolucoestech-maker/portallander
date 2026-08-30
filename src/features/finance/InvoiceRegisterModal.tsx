import {Plus,Trash2,X} from 'lucide-react'
import {useMemo,useState,type FormEvent} from 'react'
import {uid,type FinanceInvoice,type FinanceInvoiceItem,type FinanceInvoiceRetention,type FinanceInvoiceTax,type InvoiceType} from './domain'

type Props={onClose:()=>void;onSave:(value:FinanceInvoice)=>void}

const emptyItem=():FinanceInvoiceItem=>({id:uid('item'),description:'',quantity:1,unit:'UN',unitPrice:0,discountAmount:0,totalAmount:0})
const emptyTax=():FinanceInvoiceTax=>({id:uid('tax'),taxType:'',taxCode:'',baseAmount:0,rate:0,amount:0,withheld:false,treatment:'informativo'})
const emptyRetention=():FinanceInvoiceRetention=>({id:uid('ret'),type:'',baseAmount:0,rate:0,amount:0})

export default function InvoiceRegisterModal({onClose,onSave}:Props){
 const now=new Date().toISOString()
 const [form,setForm]=useState<FinanceInvoice>({id:'',number:'',series:'001',type:'saida',party:'',document:'',issueDate:new Date().toISOString().slice(0,10),dueDate:'',amount:0,status:'pendente',description:'',pdfUrl:'',createdAt:now,updatedAt:now,documentType:'',model:'',competenceDate:'',productRef:'',serviceRef:'',businessUnitRef:'',contractRef:'',xmlReference:'',notes:'',items:[emptyItem()],taxes:[],retentions:[]})
 const items=form.items??[],taxes=form.taxes??[],retentions=form.retentions??[]
 const totals=useMemo(()=>{
  const itemTotal=items.reduce((sum,item)=>sum+Math.max(0,item.quantity*item.unitPrice-item.discountAmount),0)
  const addedTaxes=taxes.filter(tax=>tax.treatment==='adicionado').reduce((sum,tax)=>sum+Math.max(0,tax.amount),0)
  const retained=retentions.reduce((sum,retention)=>sum+Math.max(0,retention.amount),0)
  return {gross:itemTotal,total:itemTotal+addedTaxes,net:itemTotal+addedTaxes-retained}
 },[items,taxes,retentions])
 const submit=(event:FormEvent)=>{event.preventDefault();if(!form.party.trim())return;onSave({...form,amount:totals.total||form.amount,updatedAt:new Date().toISOString()})}
 const updateItem=(id:string,patch:Partial<FinanceInvoiceItem>)=>setForm(current=>({...current,items:(current.items??[]).map(item=>item.id===id?{...item,...patch,totalAmount:Math.max(0,(patch.quantity??item.quantity)*(patch.unitPrice??item.unitPrice)-(patch.discountAmount??item.discountAmount))}:item)}))
 const updateTax=(id:string,patch:Partial<FinanceInvoiceTax>)=>setForm(current=>({...current,taxes:(current.taxes??[]).map(item=>item.id===id?{...item,...patch}:item)}))
 const updateRetention=(id:string,patch:Partial<FinanceInvoiceRetention>)=>setForm(current=>({...current,retentions:(current.retentions??[]).map(item=>item.id===id?{...item,...patch}:item)}))
 return <div className="crm-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
  <section className="finance-modal wide finance-invoice-register-modal" role="dialog" aria-modal="true" aria-label="Registrar nota fiscal">
   <header><div><span>Notas Fiscais</span><h2>Registrar Nota Fiscal</h2></div><button type="button" className="crm-icon-btn" onClick={onClose} aria-label="Fechar"><X size={18}/></button></header>
   <form onSubmit={submit}>
    <div className="finance-modal-body finance-invoice-register-body">
     <section className="finance-form-section"><h3>Dados gerais</h3><div className="finance-form-grid">
      <SelectField label="Tipo da nota" value={form.type} options={[["saida","Saída"],["entrada","Entrada"]]} onChange={value=>setForm(current=>({...current,type:value as InvoiceType}))}/>
      <Field label={form.type==='entrada'?'Fornecedor / Emitente':'Cliente / Tomador'} value={form.party} required onChange={value=>setForm(current=>({...current,party:value}))}/>
      <Field label="CPF / CNPJ" value={form.document} onChange={value=>setForm(current=>({...current,document:value}))}/>
      <Field label="Número" value={form.number} onChange={value=>setForm(current=>({...current,number:value}))}/>
      <Field label="Série" value={form.series} onChange={value=>setForm(current=>({...current,series:value}))}/>
      <Field label="Tipo documental" value={form.documentType??''} onChange={value=>setForm(current=>({...current,documentType:value}))}/>
      <Field label="Modelo" value={form.model??''} onChange={value=>setForm(current=>({...current,model:value}))}/>
      <Field label="Data de emissão" type="date" value={form.issueDate} onChange={value=>setForm(current=>({...current,issueDate:value}))}/>
      <Field label="Competência fiscal" type="date" value={form.competenceDate??''} onChange={value=>setForm(current=>({...current,competenceDate:value}))}/>
      <Field label="Vencimento" type="date" value={form.dueDate} onChange={value=>setForm(current=>({...current,dueDate:value}))}/>
      <SelectField label="Status" value={form.status} options={form.type==='saida'?[['pendente','Pendente'],['emitida','Emitida · registro interno'],['paga','Paga'],['cancelada','Cancelada']]:[['pendente','Pendente'],['emitida','Registrada'],['paga','Paga'],['cancelada','Cancelada']]} onChange={value=>setForm(current=>({...current,status:value as FinanceInvoice['status']}))}/>
     </div><TextArea label="Descrição" value={form.description} onChange={value=>setForm(current=>({...current,description:value}))}/></section>

     <section className="finance-form-section"><div className="finance-register-section-title"><h3>Itens</h3><button type="button" className="crm-btn secondary small" onClick={()=>setForm(current=>({...current,items:[...(current.items??[]),emptyItem()]}))}><Plus size={14}/>Adicionar item</button></div>{items.map((item,index)=><div className="finance-invoice-line" key={item.id}><div className="finance-form-grid">
      <Field label={`Descrição ${index+1}`} value={item.description} onChange={value=>updateItem(item.id,{description:value})}/><Field label="Quantidade" type="number" value={String(item.quantity)} onChange={value=>updateItem(item.id,{quantity:Number(value)})}/><Field label="Unidade" value={item.unit} onChange={value=>updateItem(item.id,{unit:value})}/><Field label="Valor unitário" type="number" value={String(item.unitPrice)} onChange={value=>updateItem(item.id,{unitPrice:Number(value)})}/><Field label="Desconto" type="number" value={String(item.discountAmount)} onChange={value=>updateItem(item.id,{discountAmount:Number(value)})}/><Field label="Produto" value={item.productRef??''} onChange={value=>updateItem(item.id,{productRef:value})}/><Field label="Serviço" value={item.serviceRef??''} onChange={value=>updateItem(item.id,{serviceRef:value})}/></div>{items.length>1&&<button type="button" className="crm-btn danger small finance-line-remove" onClick={()=>setForm(current=>({...current,items:(current.items??[]).filter(value=>value.id!==item.id)}))}><Trash2 size={14}/>Remover</button>}</div>)}</section>

     <section className="finance-form-section"><div className="finance-register-section-title"><h3>Tributos</h3><button type="button" className="crm-btn secondary small" onClick={()=>setForm(current=>({...current,taxes:[...(current.taxes??[]),emptyTax()]}))}><Plus size={14}/>Adicionar tributo</button></div>{taxes.length===0?<p className="finance-register-empty-line">Nenhum tributo informado.</p>:taxes.map(tax=><div className="finance-invoice-line" key={tax.id}><div className="finance-form-grid"><Field label="Tributo" value={tax.taxType} onChange={value=>updateTax(tax.id,{taxType:value})}/><Field label="Código" value={tax.taxCode} onChange={value=>updateTax(tax.id,{taxCode:value})}/><Field label="Base" type="number" value={String(tax.baseAmount)} onChange={value=>updateTax(tax.id,{baseAmount:Number(value)})}/><Field label="Alíquota (%)" type="number" value={String(tax.rate)} onChange={value=>updateTax(tax.id,{rate:Number(value)})}/><Field label="Valor" type="number" value={String(tax.amount)} onChange={value=>updateTax(tax.id,{amount:Number(value)})}/><SelectField label="Tratamento" value={tax.treatment} options={[["informativo","Informativo"],["adicionado","Adicionado ao total"]]} onChange={value=>updateTax(tax.id,{treatment:value as FinanceInvoiceTax['treatment']})}/></div><button type="button" className="crm-btn danger small finance-line-remove" onClick={()=>setForm(current=>({...current,taxes:(current.taxes??[]).filter(value=>value.id!==tax.id)}))}><Trash2 size={14}/>Remover</button></div>)}</section>

     <section className="finance-form-section"><div className="finance-register-section-title"><h3>Retenções</h3><button type="button" className="crm-btn secondary small" onClick={()=>setForm(current=>({...current,retentions:[...(current.retentions??[]),emptyRetention()]}))}><Plus size={14}/>Adicionar retenção</button></div>{retentions.length===0?<p className="finance-register-empty-line">Nenhuma retenção informada.</p>:retentions.map(retention=><div className="finance-invoice-line" key={retention.id}><div className="finance-form-grid"><Field label="Tipo" value={retention.type} onChange={value=>updateRetention(retention.id,{type:value})}/><Field label="Base" type="number" value={String(retention.baseAmount)} onChange={value=>updateRetention(retention.id,{baseAmount:Number(value)})}/><Field label="Alíquota (%)" type="number" value={String(retention.rate)} onChange={value=>updateRetention(retention.id,{rate:Number(value)})}/><Field label="Valor" type="number" value={String(retention.amount)} onChange={value=>updateRetention(retention.id,{amount:Number(value)})}/></div><button type="button" className="crm-btn danger small finance-line-remove" onClick={()=>setForm(current=>({...current,retentions:(current.retentions??[]).filter(value=>value.id!==retention.id)}))}><Trash2 size={14}/>Remover</button></div>)}</section>

     <section className="finance-form-section"><h3>Relacionamentos e documentos</h3><div className="finance-form-grid"><Field label="Produto" value={form.productRef??''} onChange={value=>setForm(current=>({...current,productRef:value}))}/><Field label="Serviço" value={form.serviceRef??''} onChange={value=>setForm(current=>({...current,serviceRef:value}))}/><Field label="Unidade" value={form.businessUnitRef??''} onChange={value=>setForm(current=>({...current,businessUnitRef:value}))}/><Field label="Contrato" value={form.contractRef??''} onChange={value=>setForm(current=>({...current,contractRef:value}))}/><Field label="XML / Referência" value={form.xmlReference??''} onChange={value=>setForm(current=>({...current,xmlReference:value}))}/><Field label="PDF / URL" value={form.pdfUrl} onChange={value=>setForm(current=>({...current,pdfUrl:value}))}/></div><TextArea label="Observações" value={form.notes??''} onChange={value=>setForm(current=>({...current,notes:value}))}/></section>

     <div className="finance-invoice-register-totals"><span>Itens <strong>{totals.gross.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></span><span>Total fiscal <strong>{totals.total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></span><span>Valor líquido <strong>{totals.net.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></span></div>
    </div>
    <footer className="finance-modal-foot"><button type="button" className="crm-btn secondary" onClick={onClose}>Cancelar</button><button type="submit" className="crm-btn primary">Registrar Nota</button></footer>
   </form>
  </section>
 </div>
}

function Field({label,value,onChange,type='text',required=false}:{label:string;value:string;onChange:(value:string)=>void;type?:string;required?:boolean}){return <label className="finance-field"><span>{label}</span><input required={required} type={type} value={value} onChange={event=>onChange(event.target.value)}/></label>}
function TextArea({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){return <label className="finance-field wide"><span>{label}</span><textarea rows={3} value={value} onChange={event=>onChange(event.target.value)}/></label>}
function SelectField({label,value,options,onChange}:{label:string;value:string;options:readonly (readonly [string,string])[];onChange:(value:string)=>void}){return <label className="finance-field"><span>{label}</span><select value={value} onChange={event=>onChange(event.target.value)}>{options.map(([option,text])=><option key={option} value={option}>{text}</option>)}</select></label>}
