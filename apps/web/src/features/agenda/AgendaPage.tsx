import {CalendarClock,CalendarDays,CheckCircle2,ChevronLeft,ChevronRight,Clock,Plus,Search} from 'lucide-react'
import {useMemo,useState} from 'react'
import {AdminKpi,AdminShell} from '../../shared/internal/AdminUi'
import {UNIFIED_ADMIN_NAV} from '../../shared/internal/adminNavigation'
import AgendaCalendar from './components/AgendaCalendar'
import AgendaFormModal from './components/AgendaFormModal'
import AgendaViewModal from './components/AgendaViewModal'
import {AGENDA_EVENT_TYPES,AGENDA_FILTER_STATUS_OPTIONS,AGENDA_VIEW_OPTIONS} from './constants'
import {addDays,addMonths,addYears,periodLabel,startOfDay,startOfWeek} from './date'
import type {AgendaEvent,AgendaEventDraft,AgendaViewMode} from './domain'
import {useAgendaEvents,useAgendaRuntime,useCreateAgendaEvent,useUpdateAgendaEvent} from './hooks'
import './agenda.css'
import './agenda-responsive.css'

const isInVisiblePeriod=(event:AgendaEvent,mode:AgendaViewMode,reference:Date)=>{const start=new Date(event.startsAt);if(mode==='dia'){const d=startOfDay(reference);return start>=d&&start<addDays(d,1)}if(mode==='semana'){const d=startOfWeek(reference);return start>=d&&start<addDays(d,7)}if(mode==='mes')return start.getFullYear()===reference.getFullYear()&&start.getMonth()===reference.getMonth();return start.getFullYear()===reference.getFullYear()}

export default function AgendaPage(){
 const eventsQuery=useAgendaEvents(),createEvent=useCreateAgendaEvent(),updateEvent=useUpdateAgendaEvent(),{lookups,api}=useAgendaRuntime(),[todayTimestamp]=useState(()=>Date.now())
 const events=eventsQuery.data??[],participants=lookups.participants,locations=lookups.locations
 const [view,setView]=useState<AgendaViewMode>('semana'),[reference,setReference]=useState(()=>new Date()),[search,setSearch]=useState(''),[typeFilter,setTypeFilter]=useState('all-type'),[statusFilter,setStatusFilter]=useState('all-status')
 const [form,setForm]=useState<{open:boolean;mode:'create'|'edit';event?:AgendaEvent}>({open:false,mode:'create'}),[viewEvent,setViewEvent]=useState<AgendaEvent|undefined>(),[saveError,setSaveError]=useState('')
 const visibleEvents=useMemo(()=>events.filter(event=>isInVisiblePeriod(event,view,reference)).filter(event=>typeFilter==='all-type'||event.type===typeFilter).filter(event=>statusFilter==='all-status'||event.status===statusFilter).filter(event=>{if(!search.trim())return true;const term=search.toLowerCase();const participantText=event.participantIds.map(id=>participants.find(item=>item.id===id)?.label??'').join(' ');return `${event.title} ${event.location} ${participantText}`.toLowerCase().includes(term)}),[events,view,reference,typeFilter,statusFilter,search,participants])
 const metrics=useMemo(()=>{const week=todayTimestamp+7*86400000;return{total:events.length,confirmed:events.filter(event=>event.status==='confirmado').length,pending:events.filter(event=>event.status==='pendente'||event.status==='agendado'||event.status==='negociacao').length,next7:events.filter(event=>{const start=new Date(event.startsAt).getTime();return start>=todayTimestamp&&start<=week}).length}},[events,todayTimestamp])
 const hasFilters=Boolean(search)||typeFilter!=='all-type'||statusFilter!=='all-status'
 const move=(direction:-1|1)=>{if(view==='semana')setReference(date=>addDays(date,7*direction));else if(view==='mes')setReference(date=>addMonths(date,direction));else if(view==='ano')setReference(date=>addYears(date,direction))}
 const save=async(draft:AgendaEventDraft)=>{setSaveError('');try{if(form.mode==='edit'&&form.event)await updateEvent.mutateAsync({id:form.event.id,draft,expectedUpdatedAt:form.event.updatedAt});else await createEvent.mutateAsync(draft);setForm(current=>({...current,open:false}))}catch(error){setSaveError(error instanceof Error?error.message:'Não foi possível salvar o evento.')}}
 const retry=()=>void eventsQuery.refetch()
 const openCreate=()=>{setSaveError('');setForm({open:true,mode:'create'})}
 return <AdminShell area="agenda" items={UNIFIED_ADMIN_NAV} header={{title:'Agenda',description:'Gerencie shows, turnês e compromissos com foco operacional'}} headerAction={{label:'Novo Evento',icon:Plus,onClick:openCreate}}>
  <section className="agenda-page">
   {api&&!lookups.available&&<div className="agenda-empty" role="status"><CalendarDays size={28}/><strong>Catálogos auxiliares não configurados</strong><p>{lookups.reason}</p></div>}
   {eventsQuery.isLoading?<div className="agenda-loading" role="status" aria-label="Carregando agenda"><span className="agenda-spinner"/></div>:eventsQuery.isError?<div className="agenda-empty agenda-error" role="alert"><CalendarDays size={42}/><strong>Não foi possível carregar a agenda</strong><p>{eventsQuery.error instanceof Error?eventsQuery.error.message:'A API da Agenda está indisponível.'}</p><button className="button outline" type="button" onClick={retry}>Tentar novamente</button></div>:<>
    <div className="agenda-kpis"><AdminKpi label="Eventos" value={String(metrics.total)} detail="no total" icon={<CalendarDays size={17}/>}/><AdminKpi label="Confirmados" value={String(metrics.confirmed)} detail="eventos confirmados" icon={<CheckCircle2 size={17}/>}/><AdminKpi label="Pendentes" value={String(metrics.pending)} detail="aguardando confirmação" icon={<Clock size={17}/>}/><AdminKpi label="Próximos 7 dias" value={String(metrics.next7)} detail="na próxima semana" icon={<CalendarClock size={17}/>}/></div>
    <div className="agenda-toolbar"><button className="button outline agenda-today" type="button" onClick={()=>setReference(new Date())}>Hoje</button><button className="agenda-icon-button bordered" type="button" onClick={()=>move(-1)} aria-label="Período anterior"><ChevronLeft size={16}/></button><button className="agenda-icon-button bordered" type="button" onClick={()=>move(1)} aria-label="Próximo período"><ChevronRight size={16}/></button><span className="agenda-period-label">{periodLabel(view,reference)}</span><label className="agenda-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar evento..."/></label><select aria-label="Visualização da agenda" value={view} onChange={e=>setView(e.target.value as AgendaViewMode)}>{AGENDA_VIEW_OPTIONS.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select><select aria-label="Filtrar por tipo" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="all-type">Todos Tipos</option>{AGENDA_EVENT_TYPES.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select><select aria-label="Filtrar por status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all-status">Todos Status</option>{AGENDA_FILTER_STATUS_OPTIONS.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select>{hasFilters&&<button className="button outline" type="button" onClick={()=>{setSearch('');setTypeFilter('all-type');setStatusFilter('all-status')}}>Limpar filtros</button>}</div>
    {visibleEvents.length===0?<div className="agenda-empty"><CalendarDays size={42}/><strong>Nenhum evento encontrado</strong><button className="button outline" type="button" onClick={openCreate}><Plus size={14}/>Criar primeiro evento</button></div>:<AgendaCalendar view={view} referenceDate={reference} events={visibleEvents} participants={participants} onSelect={setViewEvent}/>} 
   </>}
   {saveError&&<div className="agenda-empty agenda-error" role="alert"><strong>Não foi possível salvar</strong><p>{saveError}</p></div>}
  </section>
  <AgendaFormModal key={`${form.mode}-${form.event?.id??'new'}-${form.open?'open':'closed'}`} open={form.open} mode={form.mode} event={form.event} participants={participants} locations={locations} onClose={()=>setForm(current=>({...current,open:false}))} onSave={draft=>{void save(draft)}}/>
  <AgendaViewModal open={Boolean(viewEvent)} event={viewEvent} participants={participants} onClose={()=>setViewEvent(undefined)} onEdit={()=>{if(!viewEvent)return;setForm({open:true,mode:'edit',event:viewEvent});setViewEvent(undefined)}}/>
 </AdminShell>
}
