import {appReadModel} from '../../shared/data/appReadModel'
import {AdminShell} from '../../shared/internal/AdminUi'
import {UNIFIED_ADMIN_NAV} from '../../shared/internal/adminNavigation'
import {useAdminAuth} from './adminAuthState'

const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()??'').join('')||'PL'
const roleLabel=(role:'owner'|'admin'|'editor')=>role==='owner'?'Proprietário':role==='admin'?'Administrador':'Editor'

export function ProfilePage(){
  const {status,user:sessionUser}=useAdminAuth()
  const mockUser=appReadModel.currentUser()
  const user=status==='authenticated'&&sessionUser?{
    name:sessionUser.displayName,
    email:sessionUser.email,
    initials:initials(sessionUser.displayName),
    roleLabel:roleLabel(sessionUser.role),
    active:true,
    lastLoginAt:sessionUser.lastLoginAt,
  }:{...mockUser,lastLoginAt:null}

  return <AdminShell area="settings" items={UNIFIED_ADMIN_NAV} header={{title:'Meu perfil',description:'Dados da conta administrativa'}}>
    <section className="admin-card">
      <div className="admin-card-head"><div><span>Conta</span><h2>{user.name}</h2><p>{user.roleLabel}</p></div><strong aria-label={`Iniciais de ${user.name}`}>{user.initials}</strong></div>
      <div className="admin-detail-grid">
        <div><span>Nome</span><strong>{user.name}</strong></div>
        <div><span>E-mail</span><strong>{user.email}</strong></div>
        <div><span>Perfil de acesso</span><strong>{user.roleLabel}</strong></div>
        <div><span>Status</span><strong>{user.active?'Ativo':'Inativo'}</strong></div>
        {user.lastLoginAt&&<div><span>Último acesso</span><strong>{new Date(user.lastLoginAt).toLocaleString('pt-BR')}</strong></div>}
      </div>
      <p>{status==='authenticated'?'Os dados exibidos vêm da sessão administrativa autenticada da API.':'Em desenvolvimento sem API configurada, esta tela usa a identidade mock do Data Provider.'}</p>
    </section>
  </AdminShell>
}
