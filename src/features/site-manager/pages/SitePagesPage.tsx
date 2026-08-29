import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { EditorialPagesAdmin } from '../../editorial/components/EditorialAdmin'

export function SitePagesPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV}><EditorialPagesAdmin/></AdminShell>
}
