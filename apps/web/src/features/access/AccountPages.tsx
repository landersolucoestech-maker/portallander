import {appReadModel} from '../../shared/data/appReadModel'
import { AdminShell } from '../../shared/internal/AdminUi'
import { CRM_WORKSPACE_NAV } from '../../shared/internal/adminNavigation'

export function ProfilePage(){
  const user=appReadModel.currentUser()
  return <AdminShell area="crm" items={CRM_WORKSPACE_NAV} header={{title:'Meu perfil',description:'Dados da conta administrativa'}}>
    <section className="admin-card">
      <div className="admin-card-head"><div><span>Conta</span><h2>{user.name}</h2><p>{user.roleLabel}</p></div><strong aria-label={`Iniciais de ${user.name}`}>{user.initials}</strong></div>
      <div className="admin-detail-grid">
        <div><span>Nome</span><strong>{user.name}</strong></div>
        <div><span>E-mail</span><strong>{user.email}</strong></div>
        <div><span>Perfil de acesso</span><strong>{user.roleLabel}</strong></div>
        <div><span>Status</span><strong>{user.active?'Ativo':'Inativo'}</strong></div>
      </div>
      <p>Os dados exibidos vêm da camada de identidade atual e poderão ser substituídos pela autenticação real sem alterar esta interface.</p>
    </section>
  </AdminShell>
}
