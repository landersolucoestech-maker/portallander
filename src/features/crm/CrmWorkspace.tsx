import { BarChart3, BriefcaseBusiness, CalendarDays, CircleDollarSign, LayoutDashboard, Megaphone, Search, TrendingUp, UserPlus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminEmpty, AdminKpi, AdminPageHeader, AdminShell, type AdminNavItem } from '../../shared/internal/AdminUi'
import { formatCurrency, statusClass, type CrmActivity, type CrmContact } from './model'

export const crmNav: readonly AdminNavItem[] = [
  ['Dashboard',LayoutDashboard,'/app/crm'],
  ['Contatos',Users,'/app/crm/contatos'],
  ['Negócios',BriefcaseBusiness,'/app/crm/negocios'],
  ['Atividades',CalendarDays,'/app/crm/atividades'],
  ['Pipeline',TrendingUp,'/app/crm/pipeline'],
  ['Campanhas',Megaphone,'/app/crm/campanhas'],
  ['Relatórios',BarChart3,'/app/crm/relatorios'],
  ['Financeiro',CircleDollarSign,'/app/crm/financeiro'],
]

const contacts: readonly CrmContact[] = [
  { id:'marina-costa', name:'Marina Costa', company:'Norte Produções', status:'Lead', owner:'Comercial', relatedValue:18000 },
  { id:'rafael-alves', name:'Rafael Alves', company:'Estúdio Horizonte', status:'Cliente', owner:'Deyvisson', relatedValue:32500 },
  { id:'camila-rocha', name:'Camila Rocha', company:'Aurora Music', status:'Negociação', owner:'Comercial', relatedValue:24000 },
  { id:'bruno-lima', name:'Bruno Lima', company:'BL Eventos', status:'Contato', owner:'Equipe', relatedValue:7500 },
]

const activities: readonly CrmActivity[] = [
  { id:'retornar-aurora', time:'10:30', title:'Retornar proposta — Aurora Music', channel:'Ligação' },
  { id:'reuniao-norte', time:'14:00', title:'Reunião — Norte Produções', channel:'Reunião' },
  { id:'followup-bl', time:'16:15', title:'Follow-up — BL Eventos', channel:'WhatsApp' },
]

export function CrmDashboard(){
  return <AdminShell area="crm" items={crmNav}>
    <AdminPageHeader eyebrow="CRM / Dashboard" title="Dashboard" description="Visão operacional de relacionamentos, oportunidades e movimentação comercial." action="Novo contato"/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Contatos" value="248" detail="+18 neste mês" icon={<Users size={16}/>}/>
      <AdminKpi label="Leads" value="42" detail="12 qualificados" icon={<UserPlus size={16}/>}/>
      <AdminKpi label="Clientes" value="31" detail="5 em atividade" icon={<BriefcaseBusiness size={16}/>}/>
      <AdminKpi label="Pipeline" value="R$ 82 mil" detail="Valor em negociação" icon={<TrendingUp size={16}/>}/>
    </div>
    <div className="admin-grid">
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Relacionamentos</span><h2>Contatos recentes</h2></div><Link to="/app/crm/contatos" className="button outline">Ver todos</Link></div>
        {contacts.map(contact=><div className="compact-row" key={contact.id}><div className="table-avatar">{contact.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</div><div className="grow"><b>{contact.name}</b><small>{contact.company} · {contact.owner}</small></div><span className={`status ${statusClass(contact.status)}`}>{contact.status}</span><strong>{formatCurrency(contact.relatedValue)}</strong></div>)}
      </section>
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Agenda comercial</span><h2>Próximas atividades</h2></div></div>
        {activities.map(item=><div className="activity-row" key={item.id}><span>{item.time}</span><div><b>{item.title}</b><small>{item.channel}</small></div></div>)}
      </section>
    </div>
  </AdminShell>
}

export function ContactsPage(){
  return <AdminShell area="crm" items={crmNav}>
    <AdminPageHeader eyebrow="CRM / Contatos" title="Contatos" description="Pessoas e empresas relacionadas comercial ou institucionalmente ao portal." action="Novo contato"/>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><div className="searchbox"><Search size={16}/><input placeholder="Buscar por nome, empresa ou responsável..."/></div><button className="admin-filter" type="button">Todos os status</button></div><span className="admin-breadcrumb">{contacts.length} contatos exibidos</span></div>
    <section className="table-card"><table><thead><tr><th>Contato</th><th>Empresa</th><th>Status</th><th>Responsável</th><th>Valor relacionado</th></tr></thead><tbody>{contacts.map(contact=><tr key={contact.id}><td><div className="table-primary"><span className="table-avatar">{contact.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</span><div><b>{contact.name}</b><small>Contato comercial</small></div></div></td><td>{contact.company}</td><td><span className={`status ${statusClass(contact.status)}`}>{contact.status}</span></td><td>{contact.owner}</td><td><strong>{formatCurrency(contact.relatedValue)}</strong></td></tr>)}</tbody></table></section>
  </AdminShell>
}

export function CrmPlaceholder({title}:{title:string}){
  return <AdminShell area="crm" items={crmNav}><AdminPageHeader eyebrow={`CRM / ${title}`} title={title} description="A área já utiliza a nova identidade visual e permanece sem comportamento simulado até a implementação funcional."/><AdminEmpty title={`${title} ainda não implementado`} description="Nenhuma funcionalidade falsa foi adicionada. Este módulo será conectado à infraestrutura real quando sua implementação funcional entrar no escopo."/></AdminShell>
}
