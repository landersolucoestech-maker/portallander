import {Eye,Pencil,Plus,Settings2,Trash2,X} from 'lucide-react'
import {useCallback,useEffect,useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import {useAdminAuth} from '../../access/adminAuthState'
import {createAdminEditorialPage,deleteAdminEditorialPage,listAdminEditorialPages,listAdminPageSections,saveAdminPageSections,updateAdminEditorialPage} from '../../editorial/adminClient'
import {isPublishedPage,isSpecialLayoutPage,RESERVED_PAGE_SLUGS,type EditorialPage} from '../../editorial/model'
import {editorialReadModel} from '../../editorial/repository'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {normalizeSiteSlug,sitePageRepository,type SitePageDraft,type SitePageSectionDraft,type SitePageSections,type SitePageTemplate} from '../pageRepository'
import '../../../styles/site-sections.css'

type PageLayout='editorial'|'custom'
type PageDialogMode='create'|'edit'|null
type SiteSection={id:string;name:string;summary:string;target?:string;kind:'section';locked?:boolean}
type CmsPageOption={id:string;title:string;slug:string;source:'system'|'draft'|'remote';public:boolean;layout:PageLayout;page?:EditorialPage}

const HOME_SECTIONS:SiteSection[]=[{id:'hero',name:'Hero Section',summary:'Hero oficial da Homepage, incluindo o Ticker integrado.',target:'/app/site/paginas/home/hero',kind:'section',locked:true}]
const EDITORIAL_TEMPLATE_SECTION:SiteSection={id:'editorial-template',name:'Template editorial de Notícias',summary:'Layout compartilhado pela listagem e pelas páginas de conteúdo. Alterações estruturais são herdadas por todas as páginas editoriais.',kind:'section',locked:true}
const nowIso=()=>new Date().toISOString()

const draftEditorialPage=(title:string,slug:string):EditorialPage=>{
  const now=nowIso()
  return {
    id:`page-${crypto.randomUUID()}`,
    title,
    navigationLabel:title,
    slug,
    description:'',
    type:'editorial',
    status:'draft',
    active:false,
    visibility:'private',
    showInMainMenu:false,
    menuOrder:0,
    order:0,
    parentId:null,
    seo:{noIndex:true},
    createdAt:now,
    updatedAt:now,
  }
}

export function SiteSectionsPage(){
  const {status}=useAdminAuth()
  const persisted=status==='authenticated'
  const [draftPages,setDraftPages]=useState<SitePageDraft[]>(()=>sitePageRepository.listDraftPages())
  const [remotePages,setRemotePages]=useState<EditorialPage[]>([])
  const [storedSections,setStoredSections]=useState<SitePageSections>(()=>sitePageRepository.listSections())
  const [selectedPage,setSelectedPage]=useState('home')
  const [pageDialog,setPageDialog]=useState<PageDialogMode>(null)
  const [sectionOpen,setSectionOpen]=useState(false)
  const [editingSectionId,setEditingSectionId]=useState<string|null>(null)
  const [title,setTitle]=useState('')
  const [slug,setSlug]=useState('')
  const [sectionName,setSectionName]=useState('')
  const [sectionSlug,setSectionSlug]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const [saving,setSaving]=useState(false)

  useEffect(()=>{sitePageRepository.purgeLegacy()},[])

  const reloadRemote=useCallback(async()=>{
    if(!persisted)return
    setLoading(true);setError('')
    try{setRemotePages(await listAdminEditorialPages())}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível carregar as páginas persistidas.')}
    finally{setLoading(false)}
  },[persisted])

  useEffect(()=>{
    if(!persisted)return
    let active=true
    void listAdminEditorialPages().then(items=>{if(active)setRemotePages(items)}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar as páginas persistidas.')})
    return()=>{active=false}
  },[persisted])

  const pages=useMemo<CmsPageOption[]>(()=>{
    const sourcePages=persisted?remotePages:editorialReadModel.pages
    const systemPages=sourcePages.map(page=>({id:page.id,title:page.title,slug:page.slug,source:(persisted?'remote':'system') as 'remote'|'system',public:isPublishedPage(page),layout:isSpecialLayoutPage(page)?'custom' as const:'editorial' as const,page}))
    const local=persisted?[]:draftPages.map(page=>({...page,source:'draft' as const,public:false,layout:'editorial' as const}))
    return [{id:'home',title:'Página inicial',slug:'',source:'system' as const,public:true,layout:'custom' as const},...systemPages,...local]
  },[persisted,remotePages,draftPages])

  const selected=pages.find(page=>page.id===selectedPage)??pages[0]
  const isEditorialLayout=selected.layout==='editorial'
  const selectedRemote=selected.source==='remote'?remotePages.find(page=>page.id===selected.id):undefined
  const selectedIsProtected=selectedPage==='home'||Boolean(selectedRemote&&isSpecialLayoutPage(selectedRemote))
  const customSections=storedSections[selectedPage]??[]
  const pageSections:SiteSection[]=isEditorialLayout?[EDITORIAL_TEMPLATE_SECTION]:[...(selectedPage==='home'?HOME_SECTIONS:[]),...customSections.map(section=>({id:section.id,name:section.name,summary:`Seção própria de ${selected.title}.`,kind:'section' as const}))]

  useEffect(()=>{
    if(!persisted||isEditorialLayout)return
    let active=true
    void listAdminPageSections(selectedPage)
      .then(sections=>{if(active)setStoredSections(current=>({...current,[selectedPage]:sections}))})
      .catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar a composição persistida desta página.')})
      .finally(()=>{if(active)setLoading(false)})
    return()=>{active=false}
  },[persisted,selectedPage,isEditorialLayout])

  const openCreatePage=()=>{setTitle('');setSlug('');setError('');setPageDialog('create')}
  const openEditPage=()=>{
    if(selectedPage==='home'||selected.source==='system')return
    setTitle(selected.title);setSlug(selected.slug);setError('');setPageDialog('edit')
  }

  const savePage=async()=>{
    const cleanTitle=title.trim(),cleanSlug=normalizeSiteSlug(slug||title)
    if(!cleanTitle){setError('Informe o nome da página.');return}
    if(!cleanSlug){setError('Informe um slug válido.');return}
    if(pageDialog==='create'&&RESERVED_PAGE_SLUGS.has(cleanSlug)){setError('Este slug é reservado pelo sistema.');return}
    if(pages.some(page=>page.slug===cleanSlug&&(pageDialog!=='edit'||page.id!==selected.id))){setError('Já existe uma página com este slug.');return}

    if(persisted){
      setSaving(true);setError('')
      try{
        if(pageDialog==='edit'&&selectedRemote){
          const updated=await updateAdminEditorialPage(selectedRemote.id,{...selectedRemote,title:cleanTitle,navigationLabel:cleanTitle,slug:cleanSlug})
          setRemotePages(current=>current.map(page=>page.id===updated.id?updated:page))
        }else{
          const created=await createAdminEditorialPage(draftEditorialPage(cleanTitle,cleanSlug))
          setRemotePages(current=>[...current,created]);setSelectedPage(created.id)
        }
        setPageDialog(null)
      }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível salvar a página.')}
      finally{setSaving(false)}
      return
    }

    if(pageDialog==='edit'&&selected.source==='draft'){
      const next=draftPages.map(page=>page.id===selected.id?{...page,title:cleanTitle,slug:cleanSlug}:page)
      setDraftPages(next);sitePageRepository.saveDraftPages(next);setPageDialog(null);setError('');return
    }
    const template:SitePageTemplate='editorial'
    const page:SitePageDraft={id:`draft-${crypto.randomUUID()}`,title:cleanTitle,slug:cleanSlug,template}
    const next=[...draftPages,page]
    setDraftPages(next);sitePageRepository.saveDraftPages(next);setSelectedPage(page.id);setPageDialog(null);setError('')
  }

  const deletePage=async()=>{
    if(selectedIsProtected)return
    if(!window.confirm(`Excluir “${selected.title}”? A exclusão será recusada se houver conteúdos vinculados.`))return
    if(persisted&&selectedRemote){
      setSaving(true);setError('')
      try{await deleteAdminEditorialPage(selectedRemote.id);await reloadRemote();setSelectedPage('home')}
      catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível excluir a página.')}
      finally{setSaving(false)}
      return
    }
    if(selected.source!=='draft')return
    const nextPages=draftPages.filter(page=>page.id!==selected.id)
    const nextSections={...storedSections};delete nextSections[selected.id]
    setDraftPages(nextPages);sitePageRepository.saveDraftPages(nextPages);setStoredSections(nextSections);sitePageRepository.saveSections(nextSections);setSelectedPage('home')
  }

  const togglePublication=async()=>{
    if(!persisted||!selectedRemote||selectedIsProtected)return
    setSaving(true);setError('')
    const publishing=!isPublishedPage(selectedRemote)
    try{
      const updated=await updateAdminEditorialPage(selectedRemote.id,{
        ...selectedRemote,
        status:publishing?'published':'draft',
        active:publishing,
        visibility:publishing?'public':'private',
        seo:{...selectedRemote.seo,noIndex:!publishing},
        publishedAt:publishing?(selectedRemote.publishedAt||nowIso()):undefined,
      })
      setRemotePages(current=>current.map(page=>page.id===updated.id?updated:page))
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível alterar a publicação da página.')}
    finally{setSaving(false)}
  }

  const openCreateSection=()=>{if(isEditorialLayout)return;setEditingSectionId(null);setSectionName('');setSectionSlug('');setError('');setSectionOpen(true)}
  const openEditSection=(section:SitePageSectionDraft)=>{setEditingSectionId(section.id);setSectionName(section.name);setSectionSlug(section.slug);setError('');setSectionOpen(true)}
  const saveSection=async()=>{
    if(isEditorialLayout){setSectionOpen(false);return}
    const cleanName=sectionName.trim(),cleanSlug=normalizeSiteSlug(sectionSlug||sectionName)
    if(!cleanName){setError('Informe o nome da seção.');return}
    if(!cleanSlug){setError('Informe um identificador válido para a seção.');return}
    const current=storedSections[selectedPage]??[]
    if(current.some(section=>section.slug===cleanSlug&&section.id!==editingSectionId)){setError('Já existe uma seção com este identificador nesta página.');return}
    const nextSections=editingSectionId?current.map(section=>section.id===editingSectionId?{...section,name:cleanName,slug:cleanSlug}:section):[...current,{id:`section-${crypto.randomUUID()}`,name:cleanName,slug:cleanSlug}]
    setSaving(true);setError('')
    try{
      const saved=persisted?await saveAdminPageSections(selectedPage,nextSections):nextSections
      const next={...storedSections,[selectedPage]:saved}
      setStoredSections(next)
      if(!persisted)sitePageRepository.saveSections(next)
      setSectionOpen(false);setEditingSectionId(null);setSectionName('');setSectionSlug('')
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível salvar a seção.')}
    finally{setSaving(false)}
  }
  const removeSection=async(id:string)=>{
    if(isEditorialLayout)return
    const nextSections=(storedSections[selectedPage]??[]).filter(section=>section.id!==id)
    setSaving(true);setError('')
    try{
      const saved=persisted?await saveAdminPageSections(selectedPage,nextSections):nextSections
      const next={...storedSections,[selectedPage]:saved}
      setStoredSections(next)
      if(!persisted)sitePageRepository.saveSections(next)
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível excluir a seção.')}
    finally{setSaving(false)}
  }

  const publicUrl=selected.slug?`${new URL(import.meta.env.BASE_URL,window.location.origin).toString()}#/${selected.slug}`:new URL(import.meta.env.BASE_URL,window.location.origin).toString()
  const canEdit=selectedPage!=='home'&&(persisted?selected.source==='remote':selected.source==='draft')
  const canDelete=canEdit&&!selectedIsProtected

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Páginas',description:'Gerencie páginas próprias e páginas editoriais sem quebrar a herança visual do site.'}}>
    <AdminNotice title="Regra de layout" description="Home, Sobre, Colabore e Contato possuem layout próprio. Notícias e todas as demais páginas de conteúdo usam o mesmo template editorial, inclusive as páginas de conteúdo por slug."/>
    <AdminNotice title={persisted?'Persistência editorial conectada':'Modo local de desenvolvimento'} description={persisted?'Criação, edição, publicação, exclusão e composição própria de páginas especiais usam a sessão administrativa e a API do Portal Lander.':'Sem uma sessão real da API, novos rascunhos e seções continuam isolados neste navegador e nunca são publicados por engano.'}/>
    {loading&&<AdminNotice title="Sincronizando páginas" description="Carregando páginas e composição diretamente da API."/>}
    {error&&<AdminNotice title="Falha na operação" description={error}/>} 
    {isEditorialLayout&&<AdminNotice title="Template compartilhado" description="A estrutura desta página não é editada isoladamente. Ela herda o template editorial de Notícias para manter listagem e página de conteúdo consistentes em todas as categorias presentes e futuras."/>}

    <div className="site-sections-toolbar">
      <div style={{display:'flex',alignItems:'flex-end',gap:10,flexWrap:'wrap'}}>
        <label>Página<select value={selected.id} onChange={event=>setSelectedPage(event.target.value)}>{pages.map(page=><option key={page.id} value={page.id}>{page.title}{page.source==='draft'?' · rascunho local':''}{page.layout==='editorial'?' · conteúdo':''}{page.public?' · publicada':''}</option>)}</select></label>
        <button type="button" className="site-sections-configure" onClick={openCreatePage} disabled={saving}><Plus size={15}/> Criar página</button>
        <button type="button" className="site-sections-configure" onClick={openEditPage} disabled={!canEdit||saving}><Pencil size={15}/> Editar página</button>
        <button type="button" className="site-sections-configure" onClick={()=>void deletePage()} disabled={!canDelete||saving}><Trash2 size={15}/> Excluir página</button>
        {persisted&&selectedRemote&&!selectedIsProtected&&<button type="button" className="site-sections-configure" onClick={()=>void togglePublication()} disabled={saving}>{isPublishedPage(selectedRemote)?'Retirar do ar':'Publicar'}</button>}
        <button type="button" className="site-sections-configure" onClick={openCreateSection} disabled={isEditorialLayout||saving} title={isEditorialLayout?'Páginas de conteúdo herdam o template de Notícias.':'Criar seção própria'}><Plus size={15}/> Criar seção</button>
      </div>
      {selected.public?<a href={publicUrl} target="_blank" rel="noreferrer"><Eye size={15}/> Ver página pública</a>:<button type="button" className="site-sections-configure" disabled><Eye size={15}/> Página não publicada</button>}
    </div>

    <div className="section-editor-card" style={{marginBottom:16}}><strong>Estrutura global automática</strong><p style={{margin:'6px 0 0'}}>Cabeçalho e Rodapé são globais e ficam fora da composição individual de páginas.</p><Link className="site-sections-configure" style={{marginTop:10,display:'inline-flex'}} to="/app/settings"><Settings2 size={15}/> Configurar Identidade do Site</Link></div>

    <div className="site-sections-list" role="table" aria-label={`Estrutura de ${selected.title}`}>
      <div className="site-sections-head" role="row"><span>SEÇÃO</span><span>ESTRUTURA</span><span>STATUS</span><span>AÇÕES</span></div>
      {pageSections.length?pageSections.map((section,index)=><div className="site-sections-row" role="row" key={`${selected.id}-${section.id}`}>
        <div className="site-sections-name"><strong>{String(index+1).padStart(2,'0')}</strong><span><b>{section.name}</b><small>{section.summary}</small></span></div>
        <span className="site-sections-structure">{isEditorialLayout?'Herdada de Notícias':`Seção de ${selected.title}`}</span><span className="site-sections-status"><i/> Ativo</span>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',alignItems:'center'}}>{section.target&&<Link className="site-sections-configure" to={section.target}><Settings2 size={15}/> Configurar</Link>}{!section.locked&&<><button type="button" className="site-sections-configure" disabled={saving} onClick={()=>{const current=(storedSections[selected.id]??[]).find(item=>item.id===section.id);if(current)openEditSection(current)}}><Pencil size={15}/> Editar</button><button type="button" className="site-sections-configure" disabled={saving} onClick={()=>void removeSection(section.id)}><Trash2 size={15}/> Excluir</button></>}</div>
      </div>):<div className="site-sections-row" role="row"><div className="site-sections-name"><strong>—</strong><span><b>Nenhuma seção própria criada</b><small>Crie a primeira seção desta página especial. Cabeçalho e Rodapé globais serão aplicados automaticamente.</small></span></div><span className="site-sections-structure">Sem seções próprias</span><span className="site-sections-status">—</span><span/></div>}
    </div>

    {pageDialog&&<div role="presentation" style={{position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,.55)',display:'grid',placeItems:'center',padding:20}} onMouseDown={event=>{if(event.currentTarget===event.target)setPageDialog(null)}}><section role="dialog" aria-modal="true" aria-labelledby="page-dialog-title" className="section-editor-card" style={{width:'min(560px,100%)',boxShadow:'0 24px 80px rgba(0,0,0,.28)'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><div><h2 id="page-dialog-title" style={{marginBottom:4}}>{pageDialog==='edit'?'Editar página':'Criar página de conteúdo'}</h2><p style={{margin:0}}>{pageDialog==='edit'?'Altere nome e slug. O template editorial permanece herdado de Notícias.':'Toda nova página criada aqui herda automaticamente o layout de Notícias e o mesmo template da página de conteúdo por slug.'}</p></div><button type="button" onClick={()=>setPageDialog(null)} aria-label="Fechar"><X size={18}/></button></div><div style={{display:'grid',gap:14,marginTop:20}}><label>Nome da página<input autoFocus value={title} onChange={event=>{const value=event.target.value;setTitle(value);if(pageDialog==='create'&&!slug)setSlug(normalizeSiteSlug(value));setError('')}} placeholder="Ex.: Música"/></label><label>Slug<input value={slug} onChange={event=>{setSlug(normalizeSiteSlug(event.target.value));setError('')}} placeholder="musica"/></label><label>Modelo<input value="Conteúdo · herda Notícias" readOnly aria-readonly="true"/></label>{error&&<div style={{color:'#d00',fontWeight:700,fontSize:13}}>{error}</div>}<div style={{display:'flex',justifyContent:'flex-end',gap:10}}><button type="button" className="button outline" onClick={()=>setPageDialog(null)}>Cancelar</button><button type="button" className="button dark" onClick={()=>void savePage()} disabled={saving}>{pageDialog==='edit'?<Pencil size={15}/>:<Plus size={15}/>} {saving?'Salvando…':pageDialog==='edit'?'Salvar':'Criar rascunho'}</button></div></div></section></div>}

    {sectionOpen&&!isEditorialLayout&&<div role="presentation" style={{position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,.55)',display:'grid',placeItems:'center',padding:20}} onMouseDown={event=>{if(event.currentTarget===event.target)setSectionOpen(false)}}><section role="dialog" aria-modal="true" aria-labelledby="section-dialog-title" className="section-editor-card" style={{width:'min(560px,100%)',boxShadow:'0 24px 80px rgba(0,0,0,.28)'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><div><h2 id="section-dialog-title" style={{marginBottom:4}}>{editingSectionId?'Editar seção':'Criar seção'}</h2><p style={{margin:0}}>Esta seção pertence somente à página especial selecionada.</p></div><button type="button" onClick={()=>setSectionOpen(false)} aria-label="Fechar"><X size={18}/></button></div><div style={{display:'grid',gap:14,marginTop:20}}><label>Nome da seção<input autoFocus value={sectionName} onChange={event=>{const value=event.target.value;setSectionName(value);if(!sectionSlug)setSectionSlug(normalizeSiteSlug(value));setError('')}} placeholder="Ex.: Conteúdo principal"/></label><label>Identificador<input value={sectionSlug} onChange={event=>{setSectionSlug(normalizeSiteSlug(event.target.value));setError('')}} placeholder="conteudo-principal"/></label>{error&&<div style={{color:'#d00',fontWeight:700,fontSize:13}}>{error}</div>}<div style={{display:'flex',justifyContent:'flex-end',gap:10}}><button type="button" className="button outline" onClick={()=>setSectionOpen(false)}>Cancelar</button><button type="button" className="button dark" onClick={()=>void saveSection()} disabled={saving}><Pencil size={15}/> {saving?'Salvando…':'Salvar seção'}</button></div></div></section></div>}
  </AdminShell>
}
