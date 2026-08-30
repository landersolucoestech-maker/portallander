import type {ReactNode} from 'react'
import {Download,FileText,History,X} from 'lucide-react'
import {contactCategoryOptions,label,priorityOptions,type Contact} from './domain'
import {getContactSemanticLabels} from './semantics'
import {useModalA11y} from '../../shared/internal/useModalA11y'

const viewStyles={
 body:{display:'grid',gap:18,padding:'22px 24px'} as const,
 summary:{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:1,border:'1px solid #ececec',borderRadius:10,overflow:'hidden',background:'#ececec'} as const,
 summaryItem:{background:'#fff',padding:'14px 16px',minWidth:0} as const,
 summaryLabel:{display:'block',fontSize:8,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#8a8a8a',marginBottom:6} as const,
 summaryValue:{display:'block',fontSize:11,fontWeight:800,color:'#222',overflowWrap:'anywhere'} as const,
 grid:{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:18} as const,
 section:{minWidth:0} as const,
 wide:{gridColumn:'1/-1'} as const,
 title:{margin:'0 0 10px',paddingBottom:7,borderBottom:'1px solid #ededed',fontSize:9,fontWeight:900,letterSpacing:'.09em',textTransform:'uppercase',color:'#555'} as const,
 list:{display:'grid',gap:0,margin:0} as const,
 item:{display:'grid',gridTemplateColumns:'minmax(110px,.7fr) minmax(0,1.3fr)',gap:14,padding:'8px 0',borderBottom:'1px solid #f3f3f3',alignItems:'baseline'} as const,
 term:{margin:0,fontSize:8,color:'#888'} as const,
 value:{margin:0,fontSize:10,fontWeight:700,color:'#2b2b2b',overflowWrap:'anywhere'} as const,
 note:{margin:0,padding:'12px 14px',borderLeft:'3px solid #dedede',background:'#fafafa',fontSize:10,lineHeight:1.65,color:'#555',whiteSpace:'pre-wrap'} as const,
 sectionHead:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:10,paddingBottom:7,borderBottom:'1px solid #ededed'} as const
}

export function ContactViewModal({open,contact,onClose}:{open:boolean;contact:Contact|null;onClose:()=>void}){
 const dialogRef=useModalA11y(onClose,open&&!!contact);if(!open||!contact)return null
 const semantic=getContactSemanticLabels(contact.entityType)
 return <div className="crm-modal-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}><section ref={dialogRef} tabIndex={-1} className="crm-modal crm-modal-lg crm-readonly-view" role="dialog" aria-modal="true" aria-label="Visualizar contato"><header className="crm-modal-head crm-readonly-head"><div><div className="crm-badge-row"><span className="crm-badge">{label(contactCategoryOptions,contact.category)}</span><span className="crm-badge muted">{contact.profile}</span><span className="crm-badge muted">{contact.status==='ativo'?'Ativo':'Inativo'}</span><span className="crm-badge muted">{label(priorityOptions,contact.priority)}</span></div><h2>{contact.name}</h2><p>{contact.company||(contact.entityType==='pessoa_fisica'?'Pessoa Física':'Pessoa Jurídica')} · Visualização de contato</p></div><button className="crm-icon-btn" onClick={onClose} aria-label="Fechar"><X size={18}/></button></header>
 <div className="crm-modal-body" style={viewStyles.body}>
  <section aria-label="Resumo do contato" style={viewStyles.summary}>
   <Summary label="Tipo" value={contact.entityType==='pessoa_fisica'?'Pessoa Física':'Pessoa Jurídica'}/><Summary label="Categoria" value={label(contactCategoryOptions,contact.category)}/><Summary label="Perfil" value={contact.profile}/><Summary label="Prioridade" value={label(priorityOptions,contact.priority)}/>
  </section>
  <div style={viewStyles.grid}>
   <Section title="Identificação"><Data label="Nome" value={contact.name}/><Data label={semantic.document} value={contact.document}/><Data label={semantic.company} value={contact.company}/><Data label="Status" value={contact.status==='ativo'?'Ativo':'Inativo'}/></Section>
   <Section title="Contato"><Data label="Email" value={contact.email}/><Data label="Telefone" value={contact.phone}/><Data label="WhatsApp" value={contact.whatsapp}/><Data label="Cidade / UF" value={[contact.city,contact.state].filter(Boolean).join(' / ')}/></Section>
   <Section title="Presença digital"><Data label="Instagram" value={contact.instagram}/><Data label="Website" value={contact.website}/></Section>
   <Section title="Relacionamento"><Data label="Tags" value={contact.tags.join(', ')}/>{contact.sourceLeadId&&<Data label="Origem" value="Convertido de Lead"/>}</Section>
   <Section title="Observações" wide><ReadOnlyText>{contact.notes||'Nenhuma observação registrada.'}</ReadOnlyText></Section>
   <section style={{...viewStyles.section,...viewStyles.wide}}><div style={viewStyles.sectionHead}><h3 style={{...viewStyles.title,margin:0,padding:0,border:0}}>Timeline</h3><History size={15}/></div><div className="crm-timeline">{contact.timeline.length===0?<div className="crm-empty-mini">Nenhuma entrada registrada.</div>:contact.timeline.map(t=><article key={t.id}><span className="crm-timeline-dot"/><div><strong>{t.type==='conversion'?'Conversão de lead':t.type==='updated'?'Contato atualizado':t.type==='created'?'Contato criado':'Nota'}</strong><p>{t.description}</p><small>{new Date(t.createdAt).toLocaleString('pt-BR')}</small></div></article>)}</div></section>
   <section style={{...viewStyles.section,...viewStyles.wide}}><div style={viewStyles.sectionHead}><h3 style={{...viewStyles.title,margin:0,padding:0,border:0}}>Anexos</h3><FileText size={15}/></div>{contact.attachments.length===0?<div className="crm-empty-mini">Nenhum anexo.</div>:<div className="crm-file-grid">{contact.attachments.map(a=><a key={a.id} href={a.dataUrl} download={a.name}><FileText size={16}/><span>{a.name}</span><Download size={14}/></a>)}</div>}</section>
   <Section title="Metadados" wide><Data label="Criado em" value={new Date(contact.createdAt).toLocaleString('pt-BR')}/><Data label="Atualizado em" value={new Date(contact.updatedAt).toLocaleString('pt-BR')}/></Section>
  </div>
 </div><footer className="crm-modal-foot crm-readonly-foot"><button className="crm-btn secondary" onClick={onClose}>Fechar</button></footer></section></div>
}
function Summary({label,value}:{label:string;value:string}){return <div style={viewStyles.summaryItem}><span style={viewStyles.summaryLabel}>{label}</span><strong style={viewStyles.summaryValue}>{value||'—'}</strong></div>}
function Section({title,children,wide=false}:{title:string;children:ReactNode;wide?:boolean}){return <section style={wide?{...viewStyles.section,...viewStyles.wide}:viewStyles.section}><h3 style={viewStyles.title}>{title}</h3><dl style={viewStyles.list}>{children}</dl></section>}
function Data({label,value}:{label:string;value?:string}){return <div style={viewStyles.item}><dt style={viewStyles.term}>{label}</dt><dd style={viewStyles.value}>{value||'—'}</dd></div>}
function ReadOnlyText({children}:{children:ReactNode}){return <div style={viewStyles.note}>{children}</div>}
