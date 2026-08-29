import { FileText, Globe2, Images, LayoutDashboard, Newspaper, Search, Tags } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EditorialContentsAdmin, EditorialPagesAdmin } from '../editorial/components/EditorialAdmin'
import { editorialReadModel } from '../editorial/repository'
import { AdminEmpty, AdminKpi, AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'
import { SITE_MANAGER_NAV } from '../../shared/internal/adminNavigation'

function PersistenceNotice(){
  return <div className="admin-notice"><div><strong>Gerenciamento em modo leitura</strong><p>O Gerenciador do Site ainda não possui backend ou banco conectado. Os dados abaixo vêm do snapshot editorial atual; criação, edição e exclusão continuam bloqueadas.</p></div></div>
}

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

export function SiteCategories(){
  const tagMap=new Map<string,number>()
  editorialReadModel.contents.forEach(content=>content.tags.forEach(tag=>tagMap.set(tag,(tagMap.get(tag)||0)+1)))
  const categories=[...tagMap.entries()].sort((a,b)=>b[1]-a[1])
  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminPageHeader eyebrow="Gerenciador do Site / Categorias" title="Categorias" description="Visão consolidada das tags editoriais utilizadas pelos conteúdos atuais." action="Nova categoria" disabled/>
    <PersistenceNotice/>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><div className="searchbox"><Search size={16}/><input placeholder="Buscar categoria..." aria-label="Buscar categorias"/></div></div><span className="admin-breadcrumb">{categories.length} categorias encontradas</span></div>
    {categories.length?<section className="table-card"><table><thead><tr><th>Categoria</th><th>Conteúdos relacionados</th><th>Origem</th></tr></thead><tbody>{categories.map(([tag,count])=><tr key={tag}><td><div className="table-primary"><span className="table-avatar"><Tags size={14}/></span><div><b>{tag}</b><small>Tag editorial existente</small></div></div></td><td><strong>{count}</strong></td><td>Snapshot editorial</td></tr>)}</tbody></table></section>:<AdminEmpty title="Nenhuma categoria encontrada" description="Os conteúdos atuais não possuem tags cadastradas no snapshot editorial."/>}
  </AdminShell>
}

export function SiteMedia(){
  const items=editorialReadModel.contents.flatMap(content=>[
    ...(content.coverImage?[{id:`cover-${content.id}`,content:content.title,type:'Capa',url:content.coverImage,caption:content.coverImageAlt||'Imagem de capa'}]:[]),
    ...content.media.map((media,index)=>({id:`media-${content.id}-${index}`,content:content.title,type:media.type,url:media.url,caption:media.caption||'—'})),
  ])
  return <AdminShell area="cms" items={SITE_MANAGER_NAV}>
    <AdminPageHeader eyebrow="Gerenciador do Site / Mídia" title="Mídia" description="Inventário dos arquivos e referências de mídia já associados aos conteúdos editoriais." action="Adicionar mídia" disabled/>
    <PersistenceNotice/>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><div className="searchbox"><Search size={16}/><input placeholder="Buscar mídia ou conteúdo..." aria-label="Buscar mídia"/></div><button className="admin-filter" type="button">Todos os tipos</button></div><span className="admin-breadcrumb">{items.length} referências</span></div>
    {items.length?<section className="table-card"><table><thead><tr><th>Mídia</th><th>Conteúdo</th><th>Tipo</th><th>Legenda</th><th>Origem</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><div className="table-primary"><span className="table-avatar"><Images size={14}/></span><div><b>{item.url.split('/').pop()||item.url}</b><small>{item.url}</small></div></div></td><td>{item.content}</td><td><span className="status">{item.type}</span></td><td>{item.caption}</td><td>Snapshot editorial</td></tr>)}</tbody></table></section>:<AdminEmpty title="Nenhuma mídia encontrada" description="O snapshot editorial atual ainda não possui capas ou itens de mídia associados aos conteúdos."/>}
  </AdminShell>
}

export function SiteManagerPlaceholder({title}:{title:string}){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV}><AdminPageHeader eyebrow={`Gerenciador do Site / ${title}`} title={title} description="A área já utiliza a nova identidade visual e permanece sem comportamento simulado até a implementação funcional."/><AdminEmpty title={`${title} ainda não implementado`} description="Nenhuma funcionalidade falsa foi adicionada. Este módulo será conectado à infraestrutura real quando sua implementação funcional entrar no escopo."/></AdminShell>
}
