import { HomeAdEditor } from '../../../pages/home/components/HomeAdEditor'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'

export function HomeAdManagerPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Anúncio da Home',description:'Gerencie o bloco publicitário principal exibido na página inicial.'}}>
    <AdminNotice title="Persistência local do anúncio" description={`Assim como o Hero, este editor ainda salva somente no navegador atual. ${ADMIN_CAPABILITIES.editorialPersistence.description}`}/>
    <HomeAdEditor/>
  </AdminShell>
}
