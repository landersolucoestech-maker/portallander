import {NavLink,useLocation} from 'react-router-dom'
import {AdminShell} from '../../shared/internal/AdminUi'
import {UNIFIED_ADMIN_NAV} from '../../shared/internal/adminNavigation'
import {EditorialContentsAdmin,EditorialPagesAdmin} from './components/EditorialAdmin'

export default function EditorialAdminPage(){
  const {pathname}=useLocation()
  const contents=pathname==='/app/editorial/content'
  return <AdminShell area="cms" items={UNIFIED_ADMIN_NAV} header={{title:contents?'Conteúdos editoriais':'Editorial',description:contents?'Consulte os conteúdos editoriais disponíveis no runtime atual.':'Consulte páginas, estrutura e publicação editorial disponíveis no runtime atual.'}}>
    <div className="admin-toolbar" aria-label="Navegação do Editorial">
      <div className="admin-toolbar-group">
        <NavLink className="button outline" end to="/app/editorial">Páginas editoriais</NavLink>
        <NavLink className="button outline" to="/app/editorial/content">Conteúdos editoriais</NavLink>
      </div>
    </div>
    {contents?<EditorialContentsAdmin/>:<EditorialPagesAdmin/>}
  </AdminShell>
}
