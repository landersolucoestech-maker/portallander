import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { EditorialContentsAdmin } from '../../editorial/components/EditorialAdmin'

export function SiteContentsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV}><EditorialContentsAdmin/></AdminShell>
}
