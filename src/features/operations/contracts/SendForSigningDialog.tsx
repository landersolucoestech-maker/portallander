import { CheckCircle, Send, X } from 'lucide-react'
import { useState } from 'react'

type Signer={name:string;email:string;order:number;platform:string}

export function SendForSigningDialog({open,title,signers,onClose,onSend}:{open:boolean;title:string;signers:Signer[];onClose:()=>void;onSend:(provider:string)=>void}){
  const [provider,setProvider]=useState('Autentique')
  const [message,setMessage]=useState('Olá, segue o contrato para assinatura digital.')
  const [deadline,setDeadline]=useState('')
  const [reminders,setReminders]=useState(true)
  if(!open)return null
  return <div className="reference-modal-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onClose()}>
    <section className="reference-modal contracts-signing-dialog">
      <header className="reference-modal-head"><div><span>ASSINATURA DIGITAL</span><h2>Enviar para Assinatura Digital</h2></div><button className="reference-modal-close" type="button" onClick={onClose}><X size={17}/></button></header>
      <div className="reference-modal-body reference-form">
        <section className="reference-form-section"><h3>Documento</h3><div className="contracts-signing-document"><CheckCircle size={18}/><div><strong>{title}</strong><small>Documento pronto para envio</small></div></div></section>
        <section className="reference-form-section"><h3>Plataforma de Assinatura</h3><label><span>Plataforma</span><select value={provider} onChange={event=>setProvider(event.target.value)}><option>Autentique</option><option>Clicksign</option><option>DocuSign</option></select></label></section>
        <section className="reference-form-section"><h3>Signatários</h3><div className="contracts-signers-review">{signers.length?signers.map((signer,index)=><div key={`${signer.email}-${index}`}><span>{signer.order}</span><div><strong>{signer.name||'Signatário sem nome'}</strong><small>{signer.email||'E-mail não informado'} · {signer.platform||provider}</small></div></div>):<p>Nenhum signatário informado.</p>}</div></section>
        <section className="reference-form-section"><h3>Configurações do Envio</h3><label><span>Mensagem</span><textarea rows={4} value={message} onChange={event=>setMessage(event.target.value)}/></label><label><span>Prazo para assinatura</span><input type="date" value={deadline} onChange={event=>setDeadline(event.target.value)}/></label><label className="contracts-checkbox-label"><input type="checkbox" checked={reminders} onChange={event=>setReminders(event.target.checked)}/> Enviar lembretes automáticos</label></section>
      </div>
      <footer className="reference-modal-footer"><button className="zip-button secondary" type="button" onClick={onClose}>Cancelar</button><button className="zip-button" type="button" onClick={()=>onSend(provider)}><Send size={14}/> Enviar para Assinatura</button></footer>
    </section>
  </div>
}
