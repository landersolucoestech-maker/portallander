import { HeroEditor } from '../../pages/home/components/HeroEditor'
import { ADMIN_CAPABILITIES } from '../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../shared/internal/adminNavigation'
import { AdminNotice, AdminShell } from '../../shared/internal/AdminUi'

export default function HeroManagerPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminNotice title={ADMIN_CAPABILITIES.heroPersistence.label} description={ADMIN_CAPABILITIES.heroPersistence.description}/>
    <div className="hero-editor-admin-page"><HeroEditor/></div>
  </AdminShell>
}
