import {FileText,Inbox,Newspaper,Pencil,Plus,Trash2} from 'lucide-react'
import {useEffect,useMemo,useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {useAdminAuth} from '../../access/adminAuthState'
import {createAdminEditorialContent,deleteAdminEditorialContent,listAdminEditorialContents,listAdminEditorialPages,updateAdminEditorialContent} from '../../editorial/adminClient'
import {isPublicContent,type EditorialContent,type EditorialPage} from '../../editorial/model'
import {editorialReadModel} from '../../editorial/repository'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {contentDraftRepository} from '../contentDraftRepository'
import {sitePageRepository} from '../pageRepository'

const nowIso=()=>new Date().toISOString()
const blankContent=(pageId:string):EditorialContent=>{
  const now=nowIso()
  return {
    id:`content-${crypto.randomUUID()}`,
    pageId,
    title:'Novo conteúdo',
    slug:`novo-conteudo-${crypto.randomUUID().slice(0,8)}`,
    summary:'',
    body:[],
    author:'',
    status:'draft',
    active:false,
    tags:[],
    media:[],
    seo:{noIndex:true},
    createdAt:now,
    updatedAt:now,
  }
}

export function SiteContentsPage(){
  const navigate=useNavigate()
  const {status}=useAdminAuth()
  const persisted=status==='authenticated'
  const [drafts,setDrafts]=useState(()=>contentDraftRepository.list())
  const [remotePages,setRemotePages]=useState<EditorialPage[]>([])
  const [remoteContents,setRemoteContents]=useState<EditorialContent[]>([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  const reload=async()=>{
    if(!persisted)return
    setLoading(true);setError('')
    try{
      const [pages,contents]=await Promise.all([listAdminEditorialPages(),listAdminEditorialContents()])
      setRemotePages(pages);setRemoteContents(contents)
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível carregar o conteúdo editorial.')}
    finally{setLoading(false)}
  }

  useEffect(()=>{
    if(!persisted)return
    let active=true
    void Promise.all([listAdminEditorialPages(),listAdminEditorialContents()]).then(([pages,contents])=>{if(!active)return;setRemotePages(pages);setRemoteContents(contents)}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar o conteúdo editorial.')})
    return()=>{active=false}
  },[persisted])

  const persistedPages=persisted?remotePages.filter(page=>page.type==='editorial'):editorialReadModel.pages.filter(page=>page.type==='editorial')
  const localPages=sitePageRepository.listDraftPages()
  const defaultPageId=persistedPages[0]?.id??(!persisted?localPages[0]?.id:'')??''
  const pageTitle=(pageId:string)=>persisted?remotePages.find(page=>page.id===pageId)?.title??pageId:editorialReadModel.getPageById(pageId)?.title??localPages.find(page=>page.id===pageId)?.title??pageId

  const contents=useMemo(()=>persisted?remoteContents:editorialReadModel.contents,[persisted,remoteContents])

  const createDraft=async()=>{
    if(!defaultPageId)return
    setError('')
    if(!persisted){const draft=contentDraftRepository.create(defaultPageId);setDrafts(contentDraftRepository.list());navigate(`/app/site/conteudos/${draft.id}`);return}
    try{const created=await createAdminEditorialContent(blankContent(defaultPageId));navigate(`/app/site/conteudos/${created.id}`)}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível criar o conteúdo.')}
  }

  const removeDraft=(id:string,title:string)=>{
    if(!window.confirm(`Excluir o rascunho “${title}”?`))return
    contentDraftRepository.remove(id);setDrafts(contentDraftRepository.list())
  }

  const removeRemote=async(content:EditorialContent)=>{
    if(!window.confirm(`Excluir “${content.title}”? Esta ação remove o conteúdo persistido.`))return
    setError('')
    try{await deleteAdminEditorialContent(content.id);await reload()}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível excluir o conteúdo.')}
  }

  const togglePublication=async(content:EditorialContent)=>{
    const publishing=!isPublicContent(content)
    setError('')
    try{
      await updateAdminEditorialContent(content.id,{
        ...content,
        status:publishing?'published':'draft',
        active:publishing,
        seo:{...content.seo,noIndex:!publishing},
        publishedAt:publishing?(content.publishedAt||nowIso()):undefined,
      })
      await reload()
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível alterar a publicação do conteúdo.')}
  }

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Conteúdos',description:'Gerencie publicações, rascunhos editoriais e materiais enviados pelo público sem misturar os fluxos.'}} headerAction={{label:'Novo conteúdo',icon:Plus,onClick:()=>void createDraft(),disabled:!defaultPageId,disabledReason:!defaultPageId?'Crie primeiro uma página de conteúdo.':undefined}}>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><Link className="button" to="/app/site/conteudos"><Newspaper size={15}/>Publicações</Link><Link className="button outline" to="/app/site/conteudos/colaboracoes"><Inbox size={15}/>Colaborações recebidas</Link></div></div>

    <AdminNotice title={persisted?'Persistência editorial conectada':'Rascunhos administrativos locais'} description={persisted?'Conteúdos são criados, editados, publicados e excluídos pela API autenticada. O runtime público continua exibindo apenas registros publicados e ativos.':'Sem sessão da API, novos conteúdos podem ser preparados localmente sem entrar no site público.'}/>
    {loading&&<AdminNotice title="Sincronizando conteúdos" description="Carregando páginas e conteúdos diretamente da API do Portal Lander."/>}
    {error&&<AdminNotice title="Falha na operação" description={error}/>} 

    {!persisted&&drafts.length>0&&<div className="tableview-surface cms-tableview-surface" style={{marginBottom:18}}><section className="table-card"><table><thead><tr><th>Rascunho</th><th>Página</th><th>Slug</th><th>Autor</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>{drafts.map(draft=><tr key={draft.id}><td><div className="table-primary"><span className="table-avatar"><FileText size={15}/></span><div><b>{draft.title}</b><small>{draft.summary||'Sem resumo'}</small></div></div></td><td>{pageTitle(draft.pageId)}</td><td>/{draft.slug}</td><td>{draft.author||'—'}</td><td>{new Date(draft.updatedAt).toLocaleDateString('pt-BR')}</td><td><div style={{display:'flex',gap:8}}><Link className="button outline" to={`/app/site/conteudos/${draft.id}`}><Pencil size={14}/>Editar</Link><button type="button" className="button outline" onClick={()=>removeDraft(draft.id,draft.title)}><Trash2 size={14}/>Excluir</button></div></td></tr>)}</tbody></table></section></div>}

    <div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Conteúdo</th><th>Página</th><th>Slug</th><th>Status</th><th>Autor</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>{contents.map(content=><tr key={content.id}><td><div className="table-primary"><span className="table-avatar"><FileText size={15}/></span><div><b>{content.title}</b><small>{content.summary||'Sem resumo'}</small></div></div></td><td>{pageTitle(content.pageId)}</td><td>/{content.slug}</td><td><span className={`status ${content.status}`}>{content.status}</span></td><td>{content.author||'—'}</td><td>{new Date(content.updatedAt).toLocaleDateString('pt-BR')}</td><td><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{persisted&&<Link className="button outline" to={`/app/site/conteudos/${content.id}`}><Pencil size={14}/>Editar</Link>}{persisted&&<button type="button" className="button outline" onClick={()=>void togglePublication(content)}>{isPublicContent(content)?'Retirar do ar':'Publicar'}</button>}{persisted&&<button type="button" className="button outline" onClick={()=>void removeRemote(content)}><Trash2 size={14}/>Excluir</button>}</div></td></tr>)}</tbody></table></section></div>
  </AdminShell>
}
