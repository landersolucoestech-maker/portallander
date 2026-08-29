import { Calendar, ChevronLeft, ChevronRight, MapPin, Plus, Search, X } from 'lucide-react'
import { useState } from 'react'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'

const weekDays=['SEG','TER','QUA','QUI','SEX','SÁB','DOM']
const eventTypes=['Reunião','Entrevista','Cobertura','Follow-up','Comercial','Editorial','Outro']

function SchedulerFormModal({onClose}:{onClose:()=>void}){
  return <div className="reference-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section className="reference-modal reference-modal-lg" role="dialog" aria-modal="true" aria-labelledby="scheduler-title">
      <header className="reference-modal-head"><div><span>AGENDA</span><h2 id="scheduler-title">Novo Evento</h2></div><button type="button" className="reference-modal-close" onClick={onClose} aria-label="Fechar"><X size={17}/></button></header>
      <form className="reference-modal-body reference-form" onSubmit={event=>event.preventDefault()}>
        <div className="reference-form-grid">
          <label className="wide"><span>Título do Evento *</span><input required placeholder="Digite o título do evento"/></label>
          <label><span>Tipo de Evento *</span><select defaultValue=""><option value="" disabled>Selecione o tipo</option>{eventTypes.map(item=><option key={item}>{item}</option>)}</select></label>
          <label><span>Status</span><select defaultValue="Planejado"><option>Planejado</option><option>Pendente</option><option>Confirmado</option><option>Cancelado</option></select></label>
          <label className="wide"><span>Participantes do Evento</span><input placeholder="Buscar artista, contato ou funcionário…"/></label>
        </div>
        <div className="reference-form-section"><h3>Quando</h3><div className="reference-form-grid four-col"><label><span>Data de Início *</span><input type="date" required/></label><label><span>Horário de Início</span><input type="time"/></label><label><span>Data de Fim</span><input type="date"/></label><label><span>Horário de Fim</span><input type="time"/></label></div></div>
        <div className="reference-form-section"><h3>Onde</h3><div className="reference-form-grid"><label><span>Nome do Local</span><input placeholder="Selecione ou informe o local"/></label><label><span>Contato do Local</span><input placeholder="Telefone / WhatsApp do local"/></label><label className="wide"><span>Endereço Completo</span><input placeholder="Endereço completo do local"/></label><label><span>Capacidade do Público</span><input type="number" min="0" placeholder="Capacidade máxima do local"/></label><label><span>Valor do Cachê</span><input type="number" min="0" step="0.01" placeholder="0,00"/></label><label><span>Público Esperado</span><input type="number" min="0" placeholder="Quantidade de pessoas esperadas"/></label></div></div>
        <div className="reference-form-grid"><label className="wide"><span>Descrição</span><textarea rows={4} placeholder="Descrição do evento"/></label><label className="wide"><span>Observações</span><textarea rows={3} placeholder="Observações sobre o evento"/></label></div>
      </form>
      <footer className="reference-modal-footer"><button type="button" className="zip-button secondary" onClick={onClose}>Cancelar</button><button type="button" className="zip-button" title="Persistência será conectada ao backend do CRM">Salvar Evento</button></footer>
    </section>
  </div>
}

function SchedulerViewModal({onClose}:{onClose:()=>void}){
  return <div className="reference-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="reference-modal reference-modal-lg" role="dialog" aria-modal="true"><header className="reference-modal-head"><div><span>FOLLOW-UP</span><h2>Follow-up comercial</h2></div><button type="button" className="reference-modal-close" onClick={onClose}><X size={17}/></button></header><div className="reference-modal-body reference-view-stack"><section><h3>Quando</h3><div className="reference-detail-grid"><div><span>Data Início</span><strong>29/08/2026</strong></div><div><span>Horário Início</span><strong>10:30</strong></div><div><span>Data Fim</span><strong>29/08/2026</strong></div><div><span>Horário Fim</span><strong>11:00</strong></div></div></section><section><h3><MapPin size={14}/> Onde</h3><div className="reference-detail-grid"><div><span>Local</span><strong>Portal Lander</strong></div><div><span>Endereço</span><strong>—</strong></div></div></section><section><h3>Participantes do Evento</h3><div className="reference-chip-row"><span>Equipe Comercial</span><span>Contato relacionado</span></div></section><section><h3>Descrição</h3><p>Follow-up comercial associado ao relacionamento no CRM.</p></section><section><h3>Checklist (1/3)</h3><div className="reference-checklist"><label><input type="checkbox" defaultChecked/> Confirmar pauta</label><label><input type="checkbox"/> Enviar material</label><label><input type="checkbox"/> Registrar retorno</label></div></section></div><footer className="reference-modal-footer"><button type="button" className="zip-button secondary" onClick={onClose}>Fechar</button><button type="button" className="zip-button">Editar Evento</button></footer></section></div>
}

export function AgendaReferencePage(){
  const [view,setView]=useState('mes')
  const [query,setQuery]=useState('')
  const [type,setType]=useState('todos')
  const [status,setStatus]=useState('todos')
  const [modal,setModal]=useState<'create'|'view'|null>(null)

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
        <select value={type} onChange={event=>setType(event.target.value)} aria-label="Tipo"><option value="todos">Todos os tipos</option>{eventTypes.map(item=><option key={item}>{item}</option>)}</select>
        <select value={status} onChange={event=>setStatus(event.target.value)} aria-label="Status"><option value="todos">Todos os status</option><option>Confirmado</option><option>Pendente</option><option>Planejado</option></select>
        <button className="zip-button" type="button" onClick={()=>setModal('create')}><Plus size={14}/> Novo Evento</button>
      </div>
      <section className="zip-calendar reference-calendar" aria-label="Calendário mensal"><div className="zip-calendar-head">{weekDays.map(day=><span key={day}>{day}</span>)}</div><div className="zip-calendar-grid">{Array.from({length:35},(_,index)=>{const day=index<2?30+index:index-1;const today=index===29;const showCommercial=[3,10,17,24,29].includes(index);const showEditorial=[5,12,19].includes(index);return <div key={index} className={today?'today':''}><span>{day}</span>{showCommercial&&<button type="button" className="reference-calendar-event commercial" onClick={()=>setModal('view')}>Follow-up comercial</button>}{showEditorial&&<button type="button" className="reference-calendar-event editorial" onClick={()=>setModal('view')}>Editorial</button>}</div>})}</div></section>
      <div className="reference-calendar-empty-note"><Calendar size={15}/><span>Clique em um evento para abrir os detalhes. O painel lateral “Próximos” permanece removido.</span></div>
    </div>
    {modal==='create'&&<SchedulerFormModal onClose={()=>setModal(null)}/>} {modal==='view'&&<SchedulerViewModal onClose={()=>setModal(null)}/>} 
  </AdminShell>
}
