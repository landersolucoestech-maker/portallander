import {CalendarClock,CalendarDays,CheckCircle2,ChevronLeft,ChevronRight,Clock,Plus,Search} from 'lucide-react'
import {useEffect,useMemo,useState} from 'react'
import {AdminKpi,AdminShell} from '../../shared/internal/AdminUi'
import {CRM_WORKSPACE_NAV} from '../../shared/internal/adminNavigation'
import AgendaCalendar from './components/AgendaCalendar'
import AgendaFormModal from './components/AgendaFormModal'
import AgendaViewModal from './components/AgendaViewModal'
import {AGENDA_EVENT_TYPES,AGENDA_STATUS_OPTIONS,AGENDA_VIEW_OPTIONS} from './constants'
import {addDays,addMonths,addYears,periodLabel,startOfDay,startOfWeek} from './date'
import type {AgendaEvent,AgendaEventDraft,AgendaLocation,AgendaParticipant,AgendaViewMode} from './domain'
import {agendaRepository} from './repository'
import './agenda.css'

const isInVisiblePeriod=(event:AgendaEvent,mode:AgendaViewMode,reference:Date)=>{const start=new Date(event.startsAt);if(mode==='dia'){const d=startOfDay(reference);return start>=d&&start<addDays(d,1)}if(mode==='semana'){const d=startOfWeek(reference);return start>=d&&start<addDays(d,7)}if(mode==='mes')return start.getFullYear()===reference.getFullYear()&&start.getMonth()===reference.getMonth();return start.getFullYear()===reference.getFullYear()}
const safeLoad=()=>{try{return{events:agendaRepository.list(),participants:agendaRepository.participants(),locations:agendaRepository.locations(),error:false}}catch{return{events:[] as AgendaEvent[],participants:[] as AgendaParticipant[],locations:[] as AgendaLocation[],error:true}}}

export default function AgendaPage(){
 const [initial]=useState(safeLoad),[todayTimestamp]=useState(()=>Date.now())
 const [events,setEvents]=useState<AgendaEvent[]>(initial.events),[loadError,setLoadError]=useState(initial.error)
 const participants=initial.participants,locations=initial.locations,scenario=agendaRepository.scenario()
 const [view,setView]=useState<AgendaViewMode>('semana'),[reference,setReference]=useState(()=>new Date()),[search,setSearch]=useState(''),[typeFilter,setTypeFilter]=useState('all-type'),[statusFilter,setStatusFilter]=useState('all-status')
 const [form,setForm]=useState<{open:boolean;mode:'create'|'edit';event?:AgendaEvent}>({open:false,mode:'create'}),[viewEvent,setViewEvent]=useState<AgendaEvent|undefined>()
 useEffect(()=>{const sync=()=>{try{setEvents(agendaRepository.list());setLoadError(false)}catch{setLoadError(true)}};window.addEventListener('portal-lander:agenda:changed',sync);return()=>window.removeEventListener('portal-lander:agenda:changed',sync)},[])
 const visibleEvents=useMemo(()=>events.filter(event=>isInVisiblePeriod(event,view,reference)).filter(event=>typeFilter==='all-type'||event.type===typeFilter).filter(event=>statusFilter==='all-status'||event.status===statusFilter).filter(event=>{if(!search.trim())return true;const term=search.toLowerCase();const participantText=event.participantIds.map(id=>participants.find(item=>item.id===id)?.label??'').join(' ');return `${event.title} ${event.location} ${participantText}`.toLowerCase().includes(term)}),[events,view,reference,typeFilter,statusFilter,search,participants])
 const metrics=useMemo(()=>{const week=todayTimestamp+7*86400000;return{total:events.length,confirmed:events.filter(event=>event.status==='confirmado').length,pending:events.filter(event=>event.status==='pendente'||event.status==='agendado').length,next7:events.filter(event=>{const start=new Date(event.startsAt).getTime();return start>=todayTimestamp&&start<=week}).length}},[events,todayTimestamp])
 const hasFilters=Boolean(search)||typeFilter!=='all-type'||statusFilter!=='all-status'
 const move=(direction:-1|1)=>{if(view==='dia')setReference(date=>addDays(date,direction));else if(view==='semana')setReference(date=>addDays(date,7*direction));else if(view==='mes')setReference(date=>addMonths(date,direction));else setReference(date=>addYears(date,direction))}
 const save=(draft:AgendaEventDraft)=>{if(form.mode==='edit'&&form.event)agendaRepository.update(form.event.id,draft);else agendaRepository.create(draft);setForm(current=>({...current,open:false}))}
 const retry=()=>{try{setEvents(agendaRepository.list());setLoadError(false)}catch{setLoadError(true)}}
 return <AdminShell area="agenda" items={CRM_WORKSPACE_NAV} header={{title:'Agenda',description:'Gerencie shows, turnês e compromissos com foco operacional'}} headerAction={{label:'Novo Evento',icon:Plus,onClick:()=>setForm({open:true,mode:'create'})}}>
  <section className="agenda-page">
   {scenario.name==='loading'?<div className="agenda-loading" role="status"><span className="agenda-spinner"/><strong>Carregando agenda…</strong><p>Preparando eventos e compromissos.</p></div>:loadError||scenario.name==='error'?<div className="agenda-empty agenda-error" role="alert"><CalendarDays size={42}/><strong>Não foi possível carregar a agenda</strong><p>Ocorreu um erro ao carregar os eventos. Tente novamente.</p><button className="button outline" type="button" onClick={retry}>Tentar novamente</button></div>:<>
    <div className="agenda-kpis"><AdminKpi label="Eventos" value={String(metrics.total)} detail="no total" icon={<CalendarDays size={17}/>}/><AdminKpi label="Confirmados" value={String(metrics.confirmed)} detail="eventos confirmados" icon={<CheckCircle2 size={17}/>}/><AdminKpi label="Pendentes" value={String(metrics.pending)} detail="aguardando confirmação" icon={<Clock size={17}/>}/><AdminKpi label="Próximos 7 dias" value={String(metrics.next7)} detail="na próxima semana" icon={<CalendarClock size={17}/>}/></div>
    <div className="agenda-toolbar"><button className="button outline agenda-today" type="button" onClick={()=>setReference(new Date())}>Hoje</button><button className="agenda-icon-button bordered" type="button" onClick={()=>move(-1)} aria-label="Período anterior"><ChevronLeft size={16}/></button><button className="agenda-icon-button bordered" type="button" onClick={()=>move(1)} aria-label="Próximo período"><ChevronRight size={16}/></button><span className="agenda-period-label">{periodLabel(view,reference)}</span><label className="agenda-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar evento..."/></label><select aria-label="Visualização da agenda" value={view} onChange={e=>setView(e.target.value as AgendaViewMode)}>{AGENDA_VIEW_OPTIONS.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select><select aria-label="Filtrar por tipo" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="all-type">Todos Tipos</option>{AGENDA_EVENT_TYPES.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select><select aria-label="Filtrar por status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all-status">Todos Status</option>{AGENDA_STATUS_OPTIONS.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select>{hasFilters&&<button className="button outline" type="button" onClick={()=>{setSearch('');setTypeFilter('all-type');setStatusFilter('all-status')}}>Limpar filtros</button>}</div>
    {visibleEvents.length===0?<div className="agenda-empty"><CalendarDays size={42}/><strong>Nenhum evento encontrado</strong><p>Não existem eventos para este período e filtros.</p><button className="button outline" type="button" onClick={()=>setForm({open:true,mode:'create'})}><Plus size={14}/>Criar primeiro evento</button></div>:<AgendaCalendar view={view} referenceDate={reference} events={visibleEvents} participants={participants} onSelect={setViewEvent}/>} 
   </>}
  </section>
  <AgendaFormModal key={`${form.mode}-${form.event?.id??'new'}-${form.open?'open':'closed'}`} open={form.open} mode={form.mode} event={form.event} participants={participants} locations={locations} onClose={()=>setForm(current=>({...current,open:false}))} onSave={save}/>
  <AgendaViewModal open={Boolean(viewEvent)} event={viewEvent} participants={participants} onClose={()=>setViewEvent(undefined)} onEdit={()=>{if(!viewEvent)return;setForm({open:true,mode:'edit',event:viewEvent});setViewEvent(undefined)}}/>
 </AdminShell>
}
