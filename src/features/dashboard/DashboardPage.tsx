import { Activity, Calendar, DollarSign, FileText, Users } from 'lucide-react'
import { AdminShell } from '../../shared/internal/AdminUi'
import { CRM_WORKSPACE_NAV } from '../../shared/internal/adminNavigation'

function DashboardEmpty({icon:Icon,title,description}:{icon:typeof Activity;title:string;description:string}){
  return <div className="dashboard-empty"><Icon size={25} aria-hidden="true"/><strong>{title}</strong><p>{description}</p></div>
}

export default function DashboardPage(){
  return <AdminShell area="crm" items={CRM_WORKSPACE_NAV} header={{title:'Dashboard',description:'Visão geral do seu negócio musical'}}>
    <section className="dashboard-reference-page">
      <div className="dashboard-reference-kpis">
        <article className="dashboard-stat-card">
          <div><span>Artistas Cadastrados</span><strong>—</strong><small>Aguardando dados</small></div>
          <Users size={17} aria-hidden="true"/>
        </article>
        <article className="dashboard-stat-card">
          <div><span>Contratos Vigentes</span><strong>—</strong><small>Aguardando dados</small></div>
          <FileText size={17} aria-hidden="true"/>
        </article>
        <article className="dashboard-stat-card">
          <div><span>Receita Total</span><strong>—</strong><small>Período atual</small></div>
          <DollarSign size={17} aria-hidden="true"/>
        </article>
        <article className="dashboard-stat-card">
          <div><span>Eventos do Mês</span><strong>—</strong><small>Mês atual</small></div>
          <Calendar size={17} aria-hidden="true"/>
        </article>
      </div>

      <div className="dashboard-reference-split">
        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Atividades Recentes</h2><p>Todas as ações realizadas no sistema</p></div><Activity size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body"><DashboardEmpty icon={Activity} title="Nenhuma atividade registrada" description="As atividades mais recentes aparecerão aqui conforme o sistema for utilizado."/></div>
        </section>

        <section className="dashboard-reference-panel">
          <div className="dashboard-section-heading"><div><h2>Próximos Compromissos</h2><p>Compromissos agendados em ordem cronológica</p></div><Calendar size={18} aria-hidden="true"/></div>
          <div className="dashboard-panel-body"><DashboardEmpty icon={Calendar} title="Nenhum compromisso agendado" description="Seus próximos compromissos aparecerão aqui quando houver itens na agenda."/></div>
        </section>
      </div>

      <section className="dashboard-reference-panel dashboard-artists-panel">
        <div className="dashboard-section-heading"><div><h2>Artistas em Destaque</h2><p>Artistas com maior relevância no período</p></div><Users size={18} aria-hidden="true"/></div>
        <div className="dashboard-panel-body"><DashboardEmpty icon={Users} title="Nenhum artista em destaque" description="Os artistas em destaque aparecerão aqui conforme os dados do módulo forem adicionados."/></div>
      </section>
    </section>
  </AdminShell>
}
