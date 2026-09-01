import { ExternalLink } from 'lucide-react'
import { HeroEditor } from '../../../pages/home/components/HeroEditor'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'

export function HeroSectionAppearancePage() {
  const openPublicSite = () => {
    const publicUrl = `${window.location.origin}${window.location.pathname}#/`
    window.open(publicUrl, '_blank', 'noopener,noreferrer')
  }

  return <AdminShell
    area="cms"
    items={SITE_MANAGER_NAV}
    header={{
      title: 'Configurar seção: Hero Editorial',
      description: 'Edite os destaques, aparência e comportamento do Hero sem duplicar a implementação usada pela Home.',
      backTo: '/app/site/secoes',
      backLabel: 'Seções das Páginas',
    }}
    headerAction={{
      label: 'Ver no site',
      icon: ExternalLink,
      variant: 'secondary',
      className: 'hero-header-site-action',
      onClick: openPublicSite,
    }}
  >
    <HeroEditor />
  </AdminShell>
}
