import {FileText,Inbox,Newspaper,Pencil,Plus,Trash2} from 'lucide-react'
import {useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminNotice,AdminShell } from '../../../shared/internal/AdminUi'
import { EditorialContentsAdmin } from '../../editorial/components/EditorialAdmin'
import {editorialReadModel} from '../../editorial/repository'
import {contentDraftRepository} from '../contentDraftRepository'
import {sitePageRepository} from '../pageRepository'

export function SiteContentsPage(){
  const navigate=useNavigate()
  const [drafts,setDrafts]=useState(()=>contentDraftRepository.list())
  const persistedPages=editorialReadModel.pages.filter(page=>page.type==='editorial')
  const localPages=sitePageRepository.listDraftPages()
  const defaultPageId=persistedPages[0]?.id??localPages[0]?.id??''
  const pageTitle=(pageId:string)=>editorialReadModel.getPageById(pageId)?.title??localPages.find(page=>page.id===pageId)?.title??pageId
  const createDraft=()=>{if(!defaultPageId)return;const draft=contentDraftRepository.create(defaultPageId);setDrafts(contentDraftRepository.list());navigate(`/app/site/conteudos/${draft.id}`)}
  const removeDraft=(id:string,title:string)=>{if(!window.confirm(`Excluir o rascunho “${title}”?`))return;contentDraftRepository.remove(id);setDrafts(contentDraftRepository.list())}

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Conteúdos',description:'Gerencie publicações, rascunhos editoriais e materiais enviados pelo público sem misturar os fluxos.'}} headerAction={{label:'Novo conteúdo',icon:Plus,onClick:createDraft,disabled:!defaultPageId,disabledReason:!defaultPageId?'Crie primeiro uma página de conteúdo.':undefined}}>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><Link className="button" to="/app/site/conteudos"><Newspaper size={15}/>Publicações</Link><Link className="button outline" to="/app/site/conteudos/colaboracoes"><Inbox size={15}/>Colaborações recebidas</Link></div></div>

    <AdminNotice title="Rascunhos administrativos" description="Novos conteúdos podem ser preparados e salvos localmente sem entrar no site público. Publicação, edição e exclusão de conteúdos já persistidos continuam dependentes do backend editorial compartilhado."/>
    {drafts.length>0&&<div className="tableview-surface cms-tableview-surface" style={{marginBottom:18}}><section className="table-card"><table><thead><tr><th>Rascunho</th><th>Página</th><th>Slug</th><th>Autor</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>{drafts.map(draft=><tr key={draft.id}><td><div className="table-primary"><span className="table-avatar"><FileText size={15}/></span><div><b>{draft.title}</b><small>{draft.summary||'Sem resumo'}</small></div></div></td><td>{pageTitle(draft.pageId)}</td><td>/{draft.slug}</td><td>{draft.author||'—'}</td><td>{new Date(draft.updatedAt).toLocaleDateString('pt-BR')}</td><td><div style={{display:'flex',gap:8}}><Link className="button outline" to={`/app/site/conteudos/${draft.id}`}><Pencil size={14}/>Editar</Link><button type="button" className="button outline" onClick={()=>removeDraft(draft.id,draft.title)}><Trash2 size={14}/>Excluir</button></div></td></tr>)}</tbody></table></section></div>}

    <EditorialContentsAdmin/>
  </AdminShell>
}
