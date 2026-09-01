import { ExternalLink } from 'lucide-react'
import { HeaderBrandEditor } from '../../../shared/branding/components/HeaderBrandEditor'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'

export function HeaderManagerPage(){
  const openPublicSite=()=>{const publicUrl=`${window.location.origin}${window.location.pathname}#/`;window.open(publicUrl,'_blank','noopener,noreferrer')}

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Cabeçalho',description:'Configuração do cabeçalho utilizado nas páginas do Portal Lander.',backTo:'/app/site/paginas',backLabel:'Páginas'}} headerAction={{label:'Ver no site',icon:ExternalLink,variant:'secondary',onClick:openPublicSite}}>
    <HeaderBrandEditor/>
  </AdminShell>
}
