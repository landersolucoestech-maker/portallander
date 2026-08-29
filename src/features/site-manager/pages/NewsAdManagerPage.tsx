import { NewsAdEditor } from '../../../pages/noticias/components/NewsAdEditor'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'

export function NewsAdManagerPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminNotice title="Publicidade local de Notícias" description={`A campanha lateral de Notícias ainda é salva somente neste navegador. ${ADMIN_CAPABILITIES.editorialPersistence.description}`}/>
    <NewsAdEditor/>
  </AdminShell>
}
