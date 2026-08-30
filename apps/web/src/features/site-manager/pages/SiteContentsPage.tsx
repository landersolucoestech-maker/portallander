import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { EditorialContentsAdmin } from '../../editorial/components/EditorialAdmin'

export function SiteContentsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Conteúdos',description:'Gerencie todos os conteúdos editoriais por uma única estrutura, independentemente da página ou categoria.'}} headerAction={{label:'Novo conteúdo',disabled:true,disabledReason:ADMIN_CAPABILITIES.editorialPersistence.description}}><EditorialContentsAdmin/></AdminShell>
}
