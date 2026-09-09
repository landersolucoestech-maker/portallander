import {Building2,CalendarDays,CheckSquare,DollarSign,FileText,MapPin,Pencil,Phone,Tag,UserRound,Users,X,type LucideIcon} from 'lucide-react'
import {useEffect,type ReactNode} from 'react'
import {agendaStatusLabel,agendaTypeLabel} from '../constants'
import type {AgendaEvent,AgendaParticipant} from '../domain'

type Props={open:boolean;event?:AgendaEvent;participants:AgendaParticipant[];onClose:()=>void;onEdit:()=>void}
const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value)
const date=(value:string)=>new Date(value).toLocaleDateString('pt-BR')
const time=(value:string)=>new Date(value).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
function Field({label,value}:{label:string;value:ReactNode}){return <div className="agenda-view-field"><span>{label}</span><strong>{value||'—'}</strong></div>}
function Section({title,icon:Icon,children}:{title:string;icon:LucideIcon;children:ReactNode}){return <section className="agenda-view-section"><h3><Icon size={15}/>{title}</h3>{children}</section>}
export default function AgendaViewModal({open,event,participants,onClose,onEdit}:Props){
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[open,onClose])
 if(!open||!event)return null
 const eventParticipants=event.participantIds.map(id=>participants.find(item=>item.id===id)).filter((item):item is AgendaParticipant=>Boolean(item)),done=event.checklist.filter(item=>item.concluido).length
 return <div className="agenda-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="agenda-modal agenda-view-modal" role="dialog" aria-modal="true" aria-labelledby="agenda-view-title">
  <header><div><span>AGENDA</span><h2 id="agenda-view-title">{event.title}</h2><p>Detalhes completos do evento</p><div className="agenda-view-badges"><em><Tag size={12}/>{agendaTypeLabel(event.type)}</em><em className={`status-${event.status}`}>{agendaStatusLabel(event.status)}</em></div></div><button className="agenda-icon-button" type="button" onClick={onClose} aria-label="Fechar"><X size={17}/></button></header>
  <div className="agenda-modal-body agenda-view-body">
   <Section title="Quando" icon={CalendarDays}><div className="agenda-view-grid four"><Field label="Data Início" value={date(event.startsAt)}/><Field label="Horário Início" value={time(event.startsAt)}/><Field label="Data Fim" value={event.endsAt?date(event.endsAt):'—'}/><Field label="Horário Fim" value={event.endsAt?time(event.endsAt):'—'}/></div></Section>
   <Section title="Onde" icon={MapPin}><div className="agenda-view-grid two"><Field label="Local" value={event.location}/><Field label="Endereço" value={event.address}/></div></Section>
   {eventParticipants.length>0&&<Section title="Participantes do Evento" icon={UserRound}><div className="agenda-participant-cards">{eventParticipants.map(item=><article key={item.id}><i><UserRound size={18}/></i><div><strong>{item.label}</strong><span>{item.category}</span></div><small>{item.email}{item.phone&&<><br/>{item.phone}</>}</small></article>)}</div></Section>}
   {(event.venueContact||event.venuePhone||event.venueEmail)&&<Section title="Contato no Local" icon={Phone}><div className="agenda-view-grid three"><Field label="Responsável" value={event.venueContact&&<span className="agenda-inline-icon"><Building2 size={13}/>{event.venueContact}</span>}/><Field label="Telefone" value={event.venuePhone}/><Field label="E-mail" value={event.venueEmail}/></div></Section>}
   {(event.fee!=null||event.capacity!=null||event.expectedAudience!=null)&&<Section title="Detalhes Operacionais" icon={DollarSign}><div className="agenda-operational-cards">{event.fee!=null&&<article><span>Cachê</span><strong>{money(event.fee)}</strong></article>}{event.capacity!=null&&<article><span>Capacidade</span><strong><Users size={15}/>{event.capacity.toLocaleString('pt-BR')}</strong></article>}{event.expectedAudience!=null&&<article><span>Público Esperado</span><strong><Users size={15}/>{event.expectedAudience.toLocaleString('pt-BR')}</strong></article>}</div></Section>}
   {event.description&&<Section title="Descrição" icon={FileText}><div className="agenda-readonly-note">{event.description}</div></Section>}
   {event.checklist.length>0&&<Section title={`Checklist (${done}/${event.checklist.length})`} icon={CheckSquare}><div className="agenda-checklist">{event.checklist.map((item,index)=><div key={`${item.item}-${index}`}><span className={item.concluido?'done':''}>{item.concluido?'✓':''}</span><p className={item.concluido?'completed':''}>{item.item}</p></div>)}</div></Section>}
   {event.notes&&<Section title="Observações" icon={FileText}><div className="agenda-readonly-note muted">{event.notes}</div></Section>}
  </div><footer><button className="button outline" type="button" onClick={onClose}>Fechar</button><button className="button dark" type="button" onClick={onEdit}><Pencil size={14}/>Editar</button></footer>
 </section></div>
}
