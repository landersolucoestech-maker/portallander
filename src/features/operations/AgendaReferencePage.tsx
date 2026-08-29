import { Calendar, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'

const weekDays=['SEG','TER','QUA','QUI','SEX','SÁB','DOM']

export function AgendaReferencePage(){
  const [view,setView]=useState('mes')
  const [query,setQuery]=useState('')
  const [type,setType]=useState('todos')
  const [status,setStatus]=useState('todos')

  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / AGENDA" title="Agenda" description="Agenda operacional para reuniões, entrevistas, coberturas, follow-ups, compromissos editoriais e comerciais."/>
    <div className="zip-stack reference-agenda-page">
      <div className="zip-toolbar reference-toolbar">
        <button className="zip-button secondary" type="button">Hoje</button>
        <button className="zip-icon" type="button" aria-label="Período anterior"><ChevronLeft size={15}/></button>
        <button className="zip-icon" type="button" aria-label="Próximo período"><ChevronRight size={15}/></button>
        <strong className="zip-period">Agosto — Setembro 2026</strong>
        <label className="zip-search"><Search size={14}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar evento..."/></label>
        <select value={view} onChange={event=>setView(event.target.value)} aria-label="Visualização"><option value="dia">Dia</option><option value="semana">Semana</option><option value="mes">Mês</option><option value="ano">Ano</option></select>
        <select value={type} onChange={event=>setType(event.target.value)} aria-label="Tipo"><option value="todos">Todos os tipos</option><option>Comercial</option><option>Editorial</option><option>Cobertura</option></select>
        <select value={status} onChange={event=>setStatus(event.target.value)} aria-label="Status"><option value="todos">Todos os status</option><option>Confirmado</option><option>Pendente</option><option>Planejado</option></select>
        <button className="zip-button" type="button" disabled title="Criação será ativada quando a persistência estiver conectada"><Plus size={14}/> Novo Evento</button>
      </div>

      <section className="zip-calendar reference-calendar" aria-label="Calendário mensal">
        <div className="zip-calendar-head">{weekDays.map(day=><span key={day}>{day}</span>)}</div>
        <div className="zip-calendar-grid">
          {Array.from({length:35},(_,index)=>{
            const day=index<2?30+index:index-1
            const today=index===29
            const showCommercial=[3,10,17,24].includes(index)
            const showEditorial=[5,12,19].includes(index)
            return <div key={index} className={today?'today':''}><span>{day}</span>{showCommercial&&<b>Follow-up comercial</b>}{showEditorial&&<em>Editorial</em>}</div>
          })}
        </div>
      </section>

      <div className="reference-calendar-empty-note"><Calendar size={15}/><span>Selecione um evento no calendário para abrir os detalhes. O painel lateral “Próximos” não faz parte desta versão.</span></div>
    </div>
  </AdminShell>
}
