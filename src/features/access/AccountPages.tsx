import { AdminShell } from '../../shared/internal/AdminUi'
import { CRM_WORKSPACE_NAV } from '../../shared/internal/adminNavigation'

export function ProfilePage(){
  return <AdminShell area="crm" items={CRM_WORKSPACE_NAV} header={{title:'Meu perfil',description:'Dados da conta administrativa'}}>
    <section className="admin-card"><div className="admin-card-head"><div><span>Conta</span><h2>Meu perfil</h2></div></div><p>Área preparada para os dados do perfil do usuário autenticado quando a autenticação real for conectada.</p></section>
  </AdminShell>
}

export function SettingsPage(){
  return <AdminShell area="crm" items={CRM_WORKSPACE_NAV} header={{title:'Configurações',description:'Preferências da conta e do ambiente'}}>
    <section className="admin-card"><div className="admin-card-head"><div><span>Conta</span><h2>Configurações</h2></div></div><p>Área preparada para as preferências da conta e do ambiente quando a persistência real for conectada.</p></section>
  </AdminShell>
}
