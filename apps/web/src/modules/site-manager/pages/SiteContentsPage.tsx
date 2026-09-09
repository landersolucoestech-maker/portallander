import {FileText,Inbox,Newspaper,Plus} from 'lucide-react'
import {useEffect,useMemo,useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {useAdminAuth} from '../../access/adminAuthState'
import {createAdminEditorialContent,deleteAdminEditorialContent,listAdminEditorialContents,listAdminEditorialPages,updateAdminEditorialContent} from '../../editorial/adminClient'
import {isPublicContent,type EditorialContent,type EditorialPage} from '../../editorial/model'
import {editorialReadModel} from '../../editorial/repository'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {TableRowActionMenu} from '../../../shared/internal/TableRowActionMenu'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {ImportCandidatesPanel} from '../components/ImportCandidatesPanel'
import {contentDraftRepository} from '../contentDraftRepository'
import {sitePageRepository} from '../pageRepository'

const nowIso=()=>new Date().toISOString()
const blankContent=(pageId:string):EditorialContent=>{
  const now=nowIso()
  return {id:`content-${crypto.randomUUID()}`,pageId,title:'Novo conteúdo',slug:`novo-conteudo-${crypto.randomUUID().slice(0,8)}`,summary:'',body:[],author:'',status:'draft',active:false,tags:[],media:[],seo:{noIndex:true},createdAt:now,updatedAt:now}
}

export function SiteContentsPage(){
  const navigate=useNavigate()
  const {status}=useAdminAuth()
  const persisted=status==='authenticated'
  const development=status==='development'
  const [localRevision,setLocalRevision]=useState(0)
  const [remotePages,setRemotePages]=useState<EditorialPage[]>([])
  const [remoteContents,setRemoteContents]=useState<EditorialContent[]>([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  const reload=async()=>{
    if(!persisted){setLocalRevision(value=>value+1);return}
    setLoading(true);setError('')
    try{const [pages,contents]=await Promise.all([listAdminEditorialPages(),listAdminEditorialContents()]);setRemotePages(pages);setRemoteContents(contents)}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível carregar o conteúdo editorial.')}
    finally{setLoading(false)}
  }

  useEffect(()=>{
    if(!persisted)return
    let active=true
    void Promise.all([listAdminEditorialPages(),listAdminEditorialContents()]).then(([pages,contents])=>{if(!active)return;setRemotePages(pages);setRemoteContents(contents)}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar o conteúdo editorial.')})
    return()=>{active=false}
  },[persisted])

  useEffect(()=>{
    if(persisted)return
    const refresh=()=>setLocalRevision(value=>value+1)
    window.addEventListener(contentDraftRepository.eventName,refresh)
    window.addEventListener(sitePageRepository.eventName,refresh)
    return()=>{window.removeEventListener(contentDraftRepository.eventName,refresh);window.removeEventListener(sitePageRepository.eventName,refresh)}
  },[persisted])

  const localPageDrafts=useMemo(()=>{void localRevision;return sitePageRepository.listDraftPages()},[localRevision])
  const hiddenPageIds=useMemo(()=>{void localRevision;return new Set(sitePageRepository.listHiddenPageIds())},[localRevision])
  const pageOverrides=useMemo(()=>new Map(localPageDrafts.filter(page=>page.overridesSystem).map(page=>[page.id,page])),[localPageDrafts])
  const localSystemPages=useMemo(()=>persisted?[]:editorialReadModel.pages.filter(page=>page.type==='editorial'&&!hiddenPageIds.has(page.id)),[persisted,hiddenPageIds])
  const persistedPages=persisted?remotePages.filter(page=>page.type==='editorial'):localSystemPages
  const newLocalPages=localPageDrafts.filter(page=>!page.overridesSystem)
  const defaultPageId=persistedPages[0]?.id??(!persisted?newLocalPages[0]?.id:'')??''
  const pageTitle=(pageId:string)=>{
    if(persisted)return remotePages.find(page=>page.id===pageId)?.title??pageId
    return pageOverrides.get(pageId)?.title??editorialReadModel.getPageById(pageId)?.title??newLocalPages.find(page=>page.id===pageId)?.title??pageId
  }

  const contents=useMemo(()=>{void localRevision;return persisted?remoteContents:contentDraftRepository.listEffective(editorialReadModel.contents)},[persisted,remoteContents,localRevision])

  const createDraft=async()=>{
    if(!defaultPageId)return
    setError('')
    if(!persisted){const draft=contentDraftRepository.create(defaultPageId);setLocalRevision(value=>value+1);navigate(`/app/site/conteudos/${draft.id}`);return}
    try{const created=await createAdminEditorialContent(blankContent(defaultPageId));navigate(`/app/site/conteudos/${created.id}`)}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível criar o conteúdo.')}
  }

  const removeLocal=(content:EditorialContent)=>{
    if(!window.confirm(`Excluir “${content.title}”? No modo de desenvolvimento, conteúdos originais são apenas ocultados e podem ser restaurados limpando os dados locais.`))return
    const isSeed=editorialReadModel.contents.some(item=>item.id===content.id)
    contentDraftRepository.remove(content.id,isSeed);setLocalRevision(value=>value+1)
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
      await updateAdminEditorialContent(content.id,{...content,status:publishing?'published':'draft',active:publishing,seo:{...content.seo,noIndex:!publishing},publishedAt:publishing?(content.publishedAt||nowIso()):undefined})
      await reload()
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível alterar a publicação do conteúdo.')}
  }

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Conteúdos',description:'Gerencie publicações, rascunhos editoriais e materiais enviados pelo público sem misturar os fluxos.'}} headerAction={{label:'Novo conteúdo',icon:Plus,onClick:()=>void createDraft(),disabled:!defaultPageId,disabledReason:!defaultPageId?'Crie primeiro uma página de conteúdo.':undefined}}>
    <div className="admin-toolbar"><div className="admin-toolbar-group"><Link className="button" to="/app/site/conteudos"><Newspaper size={15}/>Publicações</Link><Link className="button outline" to="/app/site/conteudos/colaboracoes"><Inbox size={15}/>Colaborações recebidas</Link></div></div>

    <AdminNotice title={persisted?'Persistência editorial conectada':development?'Modo de desenvolvimento liberado':'Conteúdo local'} description={persisted?'Conteúdos são criados, editados, publicados e excluídos pela API. O runtime público exibe apenas registros publicados e ativos.':development?'Você pode criar, abrir, editar e excluir tanto conteúdos novos quanto conteúdos já existentes. Alterações sobre seeds são overrides locais reversíveis.':'As alterações ficam isoladas neste navegador.'}/>
    {loading&&<AdminNotice title="Sincronizando conteúdos" description="Carregando páginas e conteúdos diretamente da API do Portal Lander."/>}
    {error&&<AdminNotice title="Falha na operação" description={error}/>} 

    <div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Conteúdo</th><th>Página</th><th>Slug</th><th>Status</th><th>Autor</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>{contents.map(content=><tr key={content.id}><td><div className="table-primary"><span className="table-avatar"><FileText size={15}/></span><div><b>{content.title}</b><small>{content.summary||'Sem resumo'}</small></div></div></td><td>{pageTitle(content.pageId)}</td><td>/{content.slug}</td><td><span className={`status ${content.status}`}>{content.status}</span></td><td>{content.author||'—'}</td><td>{new Date(content.updatedAt).toLocaleDateString('pt-BR')}</td><td><TableRowActionMenu label={content.title} onEdit={()=>navigate(`/app/site/conteudos/${content.id}`)} onView={persisted?()=>void togglePublication(content):undefined} viewLabel={isPublicContent(content)?'Retirar do ar':'Publicar'} onDelete={()=>persisted?void removeRemote(content):removeLocal(content)}/></td></tr>)}</tbody></table></section></div>
    <ImportCandidatesPanel enabled={persisted}/>
  </AdminShell>
}
