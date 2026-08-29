import { FileText, Globe2, LayoutDashboard, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EditorialContentsAdmin, EditorialPagesAdmin } from '../editorial/components/EditorialAdmin'
import { editorialReadModel } from '../editorial/repository'
import { AdminKpi, AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'
import { SITE_MANAGER_NAV } from '../../shared/internal/adminNavigation'

export function SiteManagerDashboard(){
  const pages=editorialReadModel.pages
  const contents=editorialReadModel.contents
  const published=contents.filter(item=>item.status==='published'&&item.active).length
  const menuPages=pages.filter(page=>page.showInMainMenu).length

  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminPageHeader eyebrow="Gerenciador do Site / Dashboard" title="Dashboard" description="Arquitetura editorial, publicação e estrutura das páginas que alimentam o portal público."/>
    <div className="admin-kpi-grid">
      <AdminKpi label="Páginas" value={String(pages.length)} detail="Estruturas cadastradas" icon={<Globe2 size={16}/>}/>
      <AdminKpi label="Conteúdos" value={String(contents.length)} detail="Itens no catálogo atual" icon={<FileText size={16}/>}/>
      <AdminKpi label="Publicados" value={String(published)} detail="Visíveis no portal" icon={<Newspaper size={16}/>}/>
      <AdminKpi label="No menu" value={String(menuPages)} detail="Entradas editoriais" icon={<LayoutDashboard size={16}/>}/>
    </div>
    <div className="admin-grid">
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Arquitetura editorial</span><h2>Estrutura consolidada</h2></div></div>
        <p>Páginas e conteúdos utilizam o mesmo modelo e o mesmo contrato de leitura. A estrutura pública consome essa fonte editorial única.</p>
        <div className="admin-actions-row"><Link className="button dark" to="/app/site/paginas">Gerenciar páginas</Link><Link className="button outline" to="/app/site/conteudos">Gerenciar conteúdos</Link></div>
      </section>
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Infraestrutura</span><h2>Persistência editorial</h2></div></div>
        <p>O projeto ainda não possui backend, banco ou API editorial. Escritas continuam bloqueadas para não simular persistência.</p>
      </section>
    </div>
  </AdminShell>
}

export function SitePages(){return <AdminShell area="cms" items={SITE_MANAGER_NAV}><EditorialPagesAdmin/></AdminShell>}
export function SiteContents(){return <AdminShell area="cms" items={SITE_MANAGER_NAV}><EditorialContentsAdmin/></AdminShell>}
