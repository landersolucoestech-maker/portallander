import type {ReactNode} from 'react'
import {Download,ExternalLink,FileText,MessageSquare,X} from 'lucide-react'
import {interactionOptions,label,leadStatusOptions,leadTypeOptions,originOptions,priorityOptions,serviceOptions,temperatureOptions,type Lead} from './domain'
import {getServiceDetailLabel} from './semantics'
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

export function LeadViewModal({open,lead,onClose}:{open:boolean;lead:Lead|null;onClose:()=>void}){
 const dialogRef=useModalA11y(onClose,open&&!!lead);if(!open||!lead)return null
 const serviceDetails=Object.entries(lead.serviceDetails).filter(([,value])=>Boolean(value))
 return <div className="crm-modal-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}><section ref={dialogRef} tabIndex={-1} className="crm-modal crm-modal-lg crm-readonly-view" role="dialog" aria-modal="true" aria-label="Visualizar lead"><header className="crm-modal-head crm-readonly-head"><div><div className="crm-badge-row"><span className={`crm-badge status-${lead.status}`}>{label(leadStatusOptions,lead.status)}</span><span className="crm-badge muted">{label(priorityOptions,lead.priority)}</span><span className="crm-badge muted">{label(leadTypeOptions,lead.type)}</span></div><h2>{lead.name}</h2><p>{lead.company||'Sem empresa informada'} · Visualização de lead</p></div><button className="crm-icon-btn" onClick={onClose} aria-label="Fechar"><X size={18}/></button></header>
 <div className="crm-modal-body" style={viewStyles.body}>
  <section aria-label="Resumo do lead" style={viewStyles.summary}>
   <Summary label="Serviço" value={label(serviceOptions,lead.service)}/><Summary label="Origem" value={label(originOptions,lead.origin)}/><Summary label="Temperatura" value={label(temperatureOptions,lead.temperature)}/><Summary label="Valor estimado" value={typeof lead.estimatedValue==='number'?lead.estimatedValue.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'—'}/>
  </section>
  <div style={viewStyles.grid}>
   <Section title="Identificação"><Data label="Nome" value={lead.name}/><Data label="Empresa" value={lead.company}/><Data label="Cargo / Função" value={lead.role}/><Data label="Responsável" value={lead.responsible}/></Section>
   <Section title="Contato"><Data label="Email" value={lead.email}/><Data label="Telefone / WhatsApp" value={lead.phone}/><Data label="Instagram" value={lead.instagram}/><Data label="Website" value={lead.website}/></Section>
   <Section title="Contexto comercial"><Data label="Campanha de origem" value={lead.campaign}/><Data label="Próximo follow-up" value={lead.nextFollowUp?new Date(lead.nextFollowUp).toLocaleString('pt-BR'):'—'}/><Data label="Cidade / UF" value={[lead.city,lead.state].filter(Boolean).join(' / ')}/><Data label="Tags" value={lead.tags.join(', ')}/></Section>
   <Section title="Necessidade"><ReadOnlyText>{lead.description||'Nenhuma descrição registrada.'}</ReadOnlyText></Section>
   {serviceDetails.length>0&&<Section title="Detalhes do serviço" wide>{serviceDetails.map(([key,value])=><Data key={key} label={getServiceDetailLabel(lead.service,key)} value={value}/>)}</Section>}
   <Section title="Observações internas" wide><ReadOnlyText>{lead.notes||'Nenhuma observação interna registrada.'}</ReadOnlyText></Section>
   <section style={{...viewStyles.section,...viewStyles.wide}}><div style={viewStyles.sectionHead}><h3 style={{...viewStyles.title,margin:0,padding:0,border:0}}>Interações da equipe</h3><MessageSquare size={15}/></div><div className="crm-timeline">{lead.interactions.length===0?<div className="crm-empty-mini">Nenhuma interação registrada.</div>:lead.interactions.map(i=><article key={i.id}><span className="crm-timeline-dot"/><div><strong>{label(interactionOptions,i.type)}</strong><p>{i.notes}</p><small>{i.responsible&&`${i.responsible} · `}{new Date(i.createdAt).toLocaleString('pt-BR')}</small></div></article>)}</div></section>
   <section style={{...viewStyles.section,...viewStyles.wide}}><div style={viewStyles.sectionHead}><h3 style={{...viewStyles.title,margin:0,padding:0,border:0}}>Anexos</h3><FileText size={15}/></div>{lead.attachments.length===0?<div className="crm-empty-mini">Nenhum anexo.</div>:<div className="crm-file-grid">{lead.attachments.map(a=><a key={a.id} href={a.dataUrl} download={a.name}><FileText size={16}/><span>{a.name}</span><Download size={14}/></a>)}</div>}</section>
   {(lead.status==='fechado'||lead.convertedContactId)&&<section style={{...viewStyles.section,...viewStyles.wide}}><div style={viewStyles.sectionHead}><h3 style={{...viewStyles.title,margin:0,padding:0,border:0}}>Conversão</h3><ExternalLink size={15}/></div><p style={viewStyles.note}>{lead.convertedContactId?'Lead convertido em contato/cliente.':'Lead fechado e elegível para conversão em contato/cliente.'}</p></section>}
   <Section title="Metadados" wide><Data label="Criado em" value={new Date(lead.createdAt).toLocaleString('pt-BR')}/><Data label="Atualizado em" value={new Date(lead.updatedAt).toLocaleString('pt-BR')}/></Section>
  </div>
 </div><footer className="crm-modal-foot crm-readonly-foot"><button className="crm-btn secondary" onClick={onClose}>Fechar</button></footer></section></div>
}
function Summary({label,value}:{label:string;value:string}){return <div style={viewStyles.summaryItem}><span style={viewStyles.summaryLabel}>{label}</span><strong style={viewStyles.summaryValue}>{value||'—'}</strong></div>}
function Section({title,children,wide=false}:{title:string;children:ReactNode;wide?:boolean}){return <section style={wide?{...viewStyles.section,...viewStyles.wide}:viewStyles.section}><h3 style={viewStyles.title}>{title}</h3><dl style={viewStyles.list}>{children}</dl></section>}
function Data({label,value}:{label:string;value?:string}){return <div style={viewStyles.item}><dt style={viewStyles.term}>{label}</dt><dd style={viewStyles.value}>{value||'—'}</dd></div>}
function ReadOnlyText({children}:{children:ReactNode}){return <div style={viewStyles.note}>{children}</div>}
