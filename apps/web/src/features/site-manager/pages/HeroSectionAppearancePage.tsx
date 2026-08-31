import { HeroEditor } from '../../../pages/home/components/HeroEditor'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'

export function HeroSectionAppearancePage() {
  return <AdminShell
    area="cms"
    items={SITE_MANAGER_NAV}
    header={{
      title: 'Configurar seção: Hero Editorial',
      description: 'Edite os destaques, aparência e comportamento do Hero sem duplicar a implementação usada pela Home.',
    }}
  >
    <HeroEditor />
  </AdminShell>
}
