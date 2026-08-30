import { FileText, Globe2, LayoutDashboard, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminKpi, AdminShell } from '../../../shared/internal/AdminUi'
import { siteManagerReadModel } from '../readModel'

const formatDate=(value:string)=>new Date(value).toLocaleDateString('pt-BR')

export function SiteManagerDashboardPage(){
  const pages=siteManagerReadModel.pages
  const contents=siteManagerReadModel.contents
  const published=siteManagerReadModel.publishedContents.length
  const menuPages=siteManagerReadModel.menuPages.length
  const recentContents=[...contents].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5)
  const orderedPages=[...pages].sort((a,b)=>a.menuOrder-b.menuOrder).slice(0,6)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Dashboard',description:'Arquitetura editorial, publicação e estrutura das páginas que alimentam o portal público.'}}>
    <div className="admin-kpi-grid">
      <AdminKpi label="Páginas" value={String(pages.length)} detail="Estruturas cadastradas" icon={<Globe2 size={16}/>}/>
      <AdminKpi label="Conteúdos" value={String(contents.length)} detail="Itens no catálogo atual" icon={<FileText size={16}/>}/>
      <AdminKpi label="Publicados" value={String(published)} detail="Visíveis no portal" icon={<Newspaper size={16}/>}/>
      <AdminKpi label="No menu" value={String(menuPages)} detail="Entradas editoriais" icon={<LayoutDashboard size={16}/>}/>
    </div>
    <div className="dashboard-wide-grid">
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Editorial</span><h2>Conteúdos atualizados recentemente</h2></div><Link className="dashboard-card-link" to="/app/site/conteudos">VER CONTEÚDOS</Link></div>
        <div className="dashboard-summary-list">{recentContents.map(content=><div className="dashboard-summary-row" key={content.id}><div><b>{content.title}</b><small>{siteManagerReadModel.getPageById(content.pageId)?.title||content.pageId} · {formatDate(content.updatedAt)}</small></div><span className={`status ${content.status}`}>{content.status}</span><strong>{content.author}</strong></div>)}</div>
      </section>
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Navegação</span><h2>Páginas e menu</h2></div><Link className="dashboard-card-link" to="/app/site/paginas">VER PÁGINAS</Link></div>
        <div className="dashboard-summary-list">{orderedPages.map(page=><div className="dashboard-summary-row" key={page.id}><div><b>{page.navigationLabel}</b><small>/{page.slug} · ordem {page.menuOrder}</small></div><span className={`status ${page.status}`}>{page.status}</span><strong>{page.showInMainMenu?'Menu':'Fora do menu'}</strong></div>)}</div>
      </section>
    </div>
    <div className="admin-grid admin-grid-spaced">
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Arquitetura editorial</span><h2>Estrutura consolidada</h2></div></div>
        <p>Páginas e conteúdos utilizam o mesmo modelo e o mesmo contrato de leitura. A estrutura pública consome essa fonte editorial única.</p>
        <div className="admin-actions-row"><Link className="button dark" to="/app/site/paginas">Gerenciar páginas</Link><Link className="button outline" to="/app/site/conteudos">Gerenciar conteúdos</Link></div>
      </section>
      <section className="admin-card">
        <div className="admin-card-head"><div><span>Infraestrutura</span><h2>{ADMIN_CAPABILITIES.editorialPersistence.label}</h2></div></div>
        <p>{ADMIN_CAPABILITIES.editorialPersistence.description} Escritas continuam bloqueadas para não simular persistência.</p>
      </section>
    </div>
  </AdminShell>
}
