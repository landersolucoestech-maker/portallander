import { FileText, Globe2, Images, LayoutDashboard, Newspaper, Settings, Tags } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EditorialContentsAdmin, EditorialPagesAdmin } from '../editorial/components/EditorialAdmin'
import { editorialReadModel } from '../editorial/repository'
import { AdminEmpty, AdminKpi, AdminPageHeader, AdminShell, type AdminNavItem } from '../../shared/internal/AdminUi'

export const siteManagerNav: readonly AdminNavItem[] = [
  ['Dashboard',LayoutDashboard,'/app/site'],
  ['Páginas',Globe2,'/app/site/paginas'],
  ['Conteúdos',FileText,'/app/site/conteudos'],
  ['Categorias',Tags,'/app/site/categorias'],
  ['Mídia',Images,'/app/site/midia'],
  ['Mídia Kit',Newspaper,'/app/site/midia-kit'],
  ['Configurações',Settings,'/app/site/configuracoes'],
]

export function SiteManagerDashboard(){
  const pages=editorialReadModel.pages
  const contents=editorialReadModel.contents
  const published=contents.filter(item=>item.status==='published'&&item.active).length
  const menuPages=pages.filter(page=>page.showInMainMenu).length

  return <AdminShell area="cms" items={siteManagerNav}>
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

export function SitePages(){return <AdminShell area="cms" items={siteManagerNav}><EditorialPagesAdmin/></AdminShell>}
export function SiteContents(){return <AdminShell area="cms" items={siteManagerNav}><EditorialContentsAdmin/></AdminShell>}

export function SiteManagerPlaceholder({title}:{title:string}){
  return <AdminShell area="cms" items={siteManagerNav}><AdminPageHeader eyebrow={`Gerenciador do Site / ${title}`} title={title} description="A área já utiliza a nova identidade visual e permanece sem comportamento simulado até a implementação funcional."/><AdminEmpty title={`${title} ainda não implementado`} description="Nenhuma funcionalidade falsa foi adicionada. Este módulo será conectado à infraestrutura real quando sua implementação funcional entrar no escopo."/></AdminShell>
}
