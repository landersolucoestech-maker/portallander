import {Download,FileText,History,X} from 'lucide-react'
import {contactCategoryOptions,label,priorityOptions,type Contact} from './domain'
import {getContactSemanticLabels} from './semantics'
import {useModalA11y} from '../../shared/internal/useModalA11y'

export function ContactViewModal({open,contact,onClose}:{open:boolean;contact:Contact|null;onClose:()=>void}){
 const dialogRef=useModalA11y(onClose,open&&!!contact);if(!open||!contact)return null
 const semantic=getContactSemanticLabels(contact.entityType)
 return <div className="crm-modal-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}><section ref={dialogRef} tabIndex={-1} className="crm-modal crm-modal-lg crm-modal-semantic crm-modal-view crm-readonly-view" role="dialog" aria-modal="true" aria-label="Visualizar contato"><header className="crm-modal-head crm-readonly-head"><div><div className="crm-badge-row"><span className="crm-badge">{label(contactCategoryOptions,contact.category)}</span><span className="crm-badge muted">{contact.profile}</span><span className="crm-badge muted">{contact.status==='ativo'?'Ativo':'Inativo'}</span><span className="crm-badge muted">{label(priorityOptions,contact.priority)}</span></div><h2>{contact.name}</h2><p>{contact.company||(contact.entityType==='pessoa_fisica'?'Pessoa Física':'Pessoa Jurídica')}</p></div><button className="crm-icon-btn" onClick={onClose} aria-label="Fechar"><X size={18}/></button></header><div className="crm-modal-body crm-view-grid">
  <Info title="Identificação"><Row k="Tipo" v={contact.entityType==='pessoa_fisica'?'Pessoa Física':'Pessoa Jurídica'}/><Row k={semantic.document} v={contact.document}/><Row k={semantic.company} v={contact.company}/></Info>
  <Info title="Contato"><Row k="Email" v={contact.email}/><Row k="Telefone" v={contact.phone}/><Row k="WhatsApp" v={contact.whatsapp}/></Info>
  <Info title="Presença Digital"><Row k="Instagram" v={contact.instagram}/><Row k="Website" v={contact.website}/></Info>
  <Info title="Localização"><Row k="Cidade / UF" v={[contact.city,contact.state].filter(Boolean).join(' / ')}/></Info>
  <Info title="Relacionamento"><Row k="Tags" v={contact.tags.join(', ')}/>{contact.sourceLeadId&&<Row k="Origem" v="Convertido de Lead"/>}</Info>
  <Info title="Observações"><div className="crm-info-block"><span>Observações</span><p className="crm-long-text">{contact.notes||'Nenhuma observação registrada.'}</p></div></Info>
  <section className="crm-view-section wide"><div className="crm-section-title"><h3>Timeline</h3><History size={16}/></div><div className="crm-timeline">{contact.timeline.length===0?<div className="crm-empty-mini">Nenhuma entrada registrada.</div>:contact.timeline.map(t=><article key={t.id}><span className="crm-timeline-dot"/><div><strong>{t.type==='conversion'?'Conversão de lead':t.type==='updated'?'Contato atualizado':t.type==='created'?'Contato criado':'Nota'}</strong><p>{t.description}</p><small>{new Date(t.createdAt).toLocaleString('pt-BR')}</small></div></article>)}</div></section>
  <section className="crm-view-section wide"><div className="crm-section-title"><h3>Anexos</h3><FileText size={16}/></div>{contact.attachments.length===0?<div className="crm-empty-mini">Nenhum anexo.</div>:<div className="crm-file-grid">{contact.attachments.map(a=><a key={a.id} href={a.dataUrl} download={a.name}><FileText size={16}/><span>{a.name}</span><Download size={14}/></a>)}</div>}</section>
  <Info title="Metadados"><Row k="Criado em" v={new Date(contact.createdAt).toLocaleString('pt-BR')}/><Row k="Atualizado em" v={new Date(contact.updatedAt).toLocaleString('pt-BR')}/></Info>
 </div><footer className="crm-modal-foot crm-readonly-foot"><button className="crm-btn secondary" onClick={onClose}>Fechar</button></footer></section></div>
}
function Info({title,children}:{title:string;children:React.ReactNode}){return <section className="crm-view-section"><h3>{title}</h3>{children}</section>}
function Row({k,v}:{k:string;v?:string}){return <div className="crm-info-row"><span>{k}</span><strong>{v||'—'}</strong></div>}
