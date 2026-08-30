import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { EditorialPagesAdmin } from '../../editorial/components/EditorialAdmin'

export function SitePagesPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Páginas',description:'Estrutura editorial, navegação, publicação e relacionamento entre páginas do portal.'}} headerAction={{label:'Nova página',disabled:true,disabledReason:ADMIN_CAPABILITIES.editorialPersistence.description}}><EditorialPagesAdmin/></AdminShell>
}
