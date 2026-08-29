import { HeaderBrandEditor } from '../../../shared/branding/components/HeaderBrandEditor'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'

export function HeaderBrandManagerPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminNotice title="Configuração local do cabeçalho" description={`A logo do cabeçalho ainda é salva somente neste navegador. ${ADMIN_CAPABILITIES.editorialPersistence.description}`}/>
    <HeaderBrandEditor/>
  </AdminShell>
}
