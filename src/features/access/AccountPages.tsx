import { AdminShell } from '../../shared/internal/AdminUi'
import { CRM_WORKSPACE_NAV } from '../../shared/internal/adminNavigation'

export function ProfilePage(){
  return <AdminShell area="crm" items={CRM_WORKSPACE_NAV} header={{title:'Meu perfil',description:'Dados da conta administrativa'}}>
    <section className="admin-card"><div className="admin-card-head"><div><span>Conta</span><h2>Meu perfil</h2></div></div><p>Área preparada para os dados do perfil do usuário autenticado quando a autenticação real for conectada.</p></section>
  </AdminShell>
}
