import {Inbox,Newspaper} from 'lucide-react'
import {Link} from 'react-router-dom'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { EditorialContentsAdmin } from '../../editorial/components/EditorialAdmin'

export function SiteContentsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Conteúdos',description:'Gerencie publicações e materiais enviados pelo público sem misturar os dois fluxos editoriais.'}} headerAction={{label:'Novo conteúdo',disabled:true,disabledReason:ADMIN_CAPABILITIES.editorialPersistence.description}}>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><Link className="button" to="/app/site/conteudos"><Newspaper size={15}/>Publicações</Link><Link className="button outline" to="/app/site/conteudos/colaboracoes"><Inbox size={15}/>Colaborações recebidas</Link></div></div>
    <EditorialContentsAdmin/>
  </AdminShell>
}
