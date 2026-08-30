import { Search, Tags } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ADMIN_CAPABILITIES } from '../../../shared/internal/adminCapabilities'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminEmpty, AdminNotice, AdminShell } from '../../../shared/internal/AdminUi'
import { TableViewPagination, type TablePageSize } from '../../../shared/internal/TableViewPagination'
import { siteManagerReadModel } from '../readModel'

const readOnlyDescription='Busca e filtros funcionam sobre o snapshot editorial atual. Escritas continuam bloqueadas enquanto não existir uma camada persistente conectada.'

export function SiteCategoriesPage(){
  const [query,setQuery]=useState('')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState<TablePageSize>(10)
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const categories=useMemo(()=>siteManagerReadModel.categories.filter(item=>!normalized||item.name.toLocaleLowerCase('pt-BR').includes(normalized)),[normalized])
  const totalPages=Math.max(1,Math.ceil(categories.length/pageSize));const safePage=Math.min(page,totalPages);const visibleCategories=categories.slice((safePage-1)*pageSize,safePage*pageSize)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Categorias',description:'Visão consolidada das tags editoriais utilizadas pelos conteúdos atuais.'}} headerAction={{label:'Nova categoria',disabled:true,disabledReason:ADMIN_CAPABILITIES.editorialPersistence.description}}>
    <AdminNotice title="Gerenciamento em modo leitura" description={readOnlyDescription}/>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">Buscar categorias</span><Search size={16} aria-hidden="true"/><input value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}} placeholder="Buscar categoria..."/></label></div><span className="admin-breadcrumb">{categories.length} categorias encontradas</span></div>
    {categories.length?<div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Categoria</th><th>Conteúdos relacionados</th><th>Origem</th></tr></thead><tbody>{visibleCategories.map(item=><tr key={item.name}><td><div className="table-primary"><span className="table-avatar"><Tags size={14} aria-hidden="true"/></span><div><b>{item.name}</b><small>Tag editorial existente</small></div></div></td><td><strong>{item.contentCount}</strong></td><td>Snapshot editorial</td></tr>)}</tbody></table></section><TableViewPagination page={safePage} totalPages={totalPages} totalRecords={categories.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/></div>:<AdminEmpty title="Nenhuma categoria encontrada" description={query?'Nenhuma categoria corresponde à busca atual.':'Os conteúdos atuais não possuem tags cadastradas no snapshot editorial.'}/>} 
  </AdminShell>
}
