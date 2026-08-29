import { useParams } from 'react-router-dom'
import { OPERATIONS_NAV } from '../../shared/internal/adminNavigation'
import { AdminKpi, AdminNotice, AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'
import { operationsModuleByKey } from './modules'

export function OperationsPage(){
  const {moduleKey='accounting'}=useParams()
  const module=operationsModuleByKey(moduleKey)??operationsModuleByKey('accounting')!
  const Icon=module.icon
  return <AdminShell area="operations" items={OPERATIONS_NAV}>
    <AdminPageHeader eyebrow={`Backoffice / ${module.eyebrow}`} title={module.title} description={module.description}/>
    <AdminNotice title="Módulo adaptado do arquivo de referência" description={module.note}/>

    <div className="admin-kpi-grid operations-kpi-grid">
      {module.kpis.map(item=><AdminKpi key={item.label} label={item.label} value={item.value} detail={item.detail} icon={<Icon size={16}/>}/>) }
    </div>

    <div className="admin-grid admin-grid-spaced operations-overview-grid">
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Estrutura</span><h2>Capacidades do módulo</h2></div></div>
        <div className="operations-capability-grid">{module.capabilities.map(item=><div className="operations-capability" key={item}><Icon size={15}/><span>{item}</span></div>)}</div>
      </section>
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Estado atual</span><h2>Limites técnicos</h2></div></div>
        <div className="operations-state"><strong>Interface preparada</strong><p>Este módulo já possui estrutura visual e navegação próprias, mas qualquer operação que exija banco de dados, autenticação, API, OAuth, webhook ou processamento server-side permanece indisponível até esses serviços existirem.</p></div>
      </section>
    </div>

    <section className="table-card operations-table-card">
      <table><thead><tr><th>Registro / fluxo</th><th>Contexto</th><th>Status</th><th>Resumo</th></tr></thead><tbody>{module.rows.map(row=><tr key={`${row.primary}-${row.status}`}><td><strong>{row.primary}</strong></td><td>{row.secondary}</td><td><span className="status">{row.status}</span></td><td>{row.meta}</td></tr>)}</tbody></table>
    </section>
  </AdminShell>
}
