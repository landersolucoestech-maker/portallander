import { Database, Download, Upload } from 'lucide-react'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'

const entities=[
  ['Contatos','crm_contacts','Pessoas e organizações relacionadas ao CRM'],
  ['Leads','crm_leads','Oportunidades, origem, interesse e estágio'],
  ['Contratos','contracts','Contratos e documentação jurídica'],
  ['Transações','transactions','Movimentações financeiras'],
  ['Notas fiscais','invoices','Documentos fiscais e seus status'],
  ['Agenda','events','Eventos, reuniões e compromissos'],
  ['Campanhas','marketing_campaigns','Campanhas e execução de marketing'],
  ['Tarefas de marketing','marketing_tasks','Demandas operacionais do setor'],
] as const

export function ReportsReferencePage(){
  return <AdminShell area="crm" items={CRM_NAV}>
    <AdminPageHeader eyebrow="CRM / RELATÓRIOS" title="Relatórios" description="Exportação e importação por entidade — dirigida pelo backend."/>
    <div className="zip-stack reference-reports-page">
      <section className="reference-entity-list" aria-label="Entidades disponíveis para importação e exportação">
        {entities.map(([label,tableName,description])=><article key={tableName} className="reference-entity-row">
          <div className="reference-entity-icon"><Database size={15}/></div>
          <div className="reference-entity-copy"><strong>{label}</strong><span>{description}</span><small>{tableName}</small></div>
          <div className="reference-entity-actions">
            <button className="zip-button secondary" type="button" disabled title="Importação depende do backend"><Upload size={13}/> Importar</button>
            <button className="zip-button secondary" type="button" disabled title="Exportação depende do backend"><Download size={13}/> Exportar</button>
          </div>
        </article>)}
      </section>
    </div>
  </AdminShell>
}
