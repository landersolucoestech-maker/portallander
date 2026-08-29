import { HeroEditor } from '../../pages/home/components/HeroEditor'
import { AdminShell } from '../../shared/internal/AdminUi'
import { SITE_MANAGER_NAV } from '../../shared/internal/adminNavigation'

export default function HeroManagerPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <div className="admin-notice"><div><strong>Editor local do Hero</strong><p>Este editor preserva o comportamento existente e salva somente no estado frontend deste navegador. Ele ainda não faz parte da persistência editorial compartilhada do Gerenciador do Site.</p></div></div>
    <div className="hero-editor-admin-page"><HeroEditor/></div>
  </AdminShell>
}
