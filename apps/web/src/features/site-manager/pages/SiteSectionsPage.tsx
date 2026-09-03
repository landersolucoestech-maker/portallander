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
import {EDITORIAL_PAGE_SECTION_DEFINITIONS,HOME_SECTION_DEFINITIONS,INSTITUTIONAL_PAGE_SECTION_DEFINITIONS,LEGAL_PAGE_SECTION_DEFINITIONS,LEGAL_PAGE_SLUGS,SPECIAL_PAGE_SECTION_DEFINITIONS,type SectionDefinition} from '../sectionConfiguration'
import '../../../styles/site-sections.css'

type PageLayout='editorial'|'institutional'|'legal'|'special'
type PageDialogMode='create'|'edit'|null
type CmsPageOption={id:string;title:string;slug:string;source:'system'|'draft'|'remote';public:boolean;layout:PageLayout;page?:EditorialPage}

const nowIso=()=>new Date().toISOString()
const draftEditorialPage=(title:string,slug:string):EditorialPage=>{const now=nowIso();return{id:`page-${crypto.randomUUID()}`,title,navigationLabel:title,slug,description:'',type:'editorial',status:'draft',active:false,visibility:'private',showInMainMenu:false,menuOrder:0,order:0,parentId:null,seo:{noIndex:true},createdAt:now,updatedAt:now}}
const resolvePageLayout=(page:EditorialPage):PageLayout=>isSpecialLayoutPage(page)||page.type==='special'?'special':page.type==='editorial'?'editorial':LEGAL_PAGE_SLUGS.has(page.slug)?'legal':'institutional'
const layoutLabel=(layout:PageLayout)=>layout==='editorial'?'Editorial':layout==='legal'?'Jurídico / documental':layout==='institutional'?'Institucional':'Especial'

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
  const [title,setTitle]=useState(''),[slug,setSlug]=useState(''),[sectionName,setSectionName]=useState(''),[sectionSlug,setSectionSlug]=useState('')
  const [error,setError]=useState(''),[loading,setLoading]=useState(false),[saving,setSaving]=useState(false)

  useEffect(()=>{sitePageRepository.purgeLegacy()},[])
  const reloadLocal=useCallback(()=>setDraftPages(sitePageRepository.listDraftPages()),[])
  const reloadRemote=useCallback(async()=>{if(!persisted)return;setLoading(true);setError('');try{setRemotePages(await listAdminEditorialPages())}catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível carregar as páginas persistidas.')}finally{setLoading(false)}},[persisted])
  useEffect(()=>{if(!persisted)return;let active=true;void listAdminEditorialPages().then(items=>{if(active)setRemotePages(items)}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar as páginas persistidas.')});return()=>{active=false}},[persisted])

  const pages=useMemo<CmsPageOption[]>(()=>{
    const sourcePages=persisted?remotePages:editorialReadModel.pages
    const hidden=new Set(persisted?[]:sitePageRepository.listHiddenPageIds())
    const overrides=new Map(draftPages.filter(page=>page.overridesSystem).map(page=>[page.id,page]))
    const systemPages=sourcePages.filter(page=>!hidden.has(page.id)).map(page=>{const override=overrides.get(page.id);return{id:page.id,title:override?.title??page.title,slug:override?.slug??page.slug,source:(persisted?'remote':override?'draft':'system') as 'remote'|'draft'|'system',public:isPublishedPage(page),layout:resolvePageLayout(page),page}})
    const local=persisted?[]:draftPages.filter(page=>!page.overridesSystem).map(page=>({...page,source:'draft' as const,public:false,layout:'editorial' as const}))
    return[{id:'home',title:'Página inicial',slug:'',source:'system' as const,public:true,layout:'special' as const},...systemPages,...local]
  },[persisted,remotePages,draftPages])

  const selected=pages.find(page=>page.id===selectedPage)??pages[0]
  const isEditorialLayout=selected.layout==='editorial'
  const selectedRemote=selected.source==='remote'?remotePages.find(page=>page.id===selected.id):undefined
  const selectedSystem=editorialReadModel.pages.find(page=>page.id===selected.id)
  const selectedIsProtected=persisted?(selectedPage==='home'||Boolean(selectedRemote&&isSpecialLayoutPage(selectedRemote))):selectedPage==='home'
  const customSections=storedSections[selectedPage]??[]
  const automaticSections=selectedPage==='home'?HOME_SECTION_DEFINITIONS:selected.layout==='special'?(SPECIAL_PAGE_SECTION_DEFINITIONS[selected.slug]??[]):selected.layout==='legal'?LEGAL_PAGE_SECTION_DEFINITIONS:selected.layout==='institutional'?INSTITUTIONAL_PAGE_SECTION_DEFINITIONS:[]
  const pageSections:SectionDefinition[]=isEditorialLayout?EDITORIAL_PAGE_SECTION_DEFINITIONS:[...automaticSections,...customSections.map(section=>({id:section.id,name:section.name,summary:`Seção própria de ${selected.title}.`,kind:'custom' as const}))]

  useEffect(()=>{if(!persisted||isEditorialLayout)return;let active=true;void listAdminPageSections(selectedPage).then(sections=>{if(active)setStoredSections(current=>({...current,[selectedPage]:sections}))}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar a composição persistida desta página.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[persisted,selectedPage,isEditorialLayout])

  const openCreatePage=()=>{setTitle('');setSlug('');setError('');setPageDialog('create')}
  const openEditPage=()=>{if(selectedPage==='home')return;setTitle(selected.title);setSlug(selected.slug);setError('');setPageDialog('edit')}
  const savePage=async()=>{
    const cleanTitle=title.trim(),cleanSlug=normalizeSiteSlug(slug||title)
    if(!cleanTitle){setError('Informe o nome da página.');return} if(!cleanSlug){setError('Informe um slug válido.');return}
    if(pageDialog==='create'&&RESERVED_PAGE_SLUGS.has(cleanSlug)){setError('Este slug é reservado pelo sistema.');return}
    if(pages.some(page=>page.slug===cleanSlug&&(pageDialog!=='edit'||page.id!==selected.id))){setError('Já existe uma página com este slug.');return}
    if(persisted){setSaving(true);setError('');try{if(pageDialog==='edit'&&selectedRemote){const updated=await updateAdminEditorialPage(selectedRemote.id,{...selectedRemote,title:cleanTitle,navigationLabel:cleanTitle,slug:cleanSlug});setRemotePages(current=>current.map(page=>page.id===updated.id?updated:page))}else{const created=await createAdminEditorialPage(draftEditorialPage(cleanTitle,cleanSlug));setRemotePages(current=>[...current,created]);setSelectedPage(created.id)}setPageDialog(null)}catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível salvar a página.')}finally{setSaving(false)}return}
    if(pageDialog==='edit'){if(selectedSystem)sitePageRepository.upsertSystemOverride({id:selected.id,title:cleanTitle,slug:cleanSlug});else sitePageRepository.saveDraftPages(draftPages.map(page=>page.id===selected.id?{...page,title:cleanTitle,slug:cleanSlug}:page));reloadLocal();setPageDialog(null);setError('');return}
    const template:SitePageTemplate='editorial',page:SitePageDraft={id:`draft-${crypto.randomUUID()}`,title:cleanTitle,slug:cleanSlug,template};sitePageRepository.saveDraftPages([...draftPages,page]);reloadLocal();setSelectedPage(page.id);setPageDialog(null);setError('')
  }

  const deletePage=async()=>{if(selectedIsProtected)return;if(!window.confirm(`Excluir “${selected.title}”?${persisted?' A exclusão será recusada se houver conteúdos vinculados.':' No modo de desenvolvimento o item original fica preservado no código e é ocultado neste navegador.'}`))return;if(persisted&&selectedRemote){setSaving(true);setError('');try{await deleteAdminEditorialPage(selectedRemote.id);await reloadRemote();setSelectedPage('home')}catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível excluir a página.')}finally{setSaving(false)}return}if(selectedSystem){sitePageRepository.hideSystemPage(selected.id);sitePageRepository.removeDraftPage(selected.id)}else sitePageRepository.removeDraftPage(selected.id);const nextSections={...storedSections};delete nextSections[selected.id];setStoredSections(nextSections);sitePageRepository.saveSections(nextSections);reloadLocal();setSelectedPage('home')}
  const togglePublication=async()=>{if(!persisted||!selectedRemote||selectedIsProtected)return;setSaving(true);setError('');const publishing=!isPublishedPage(selectedRemote);try{const updated=await updateAdminEditorialPage(selectedRemote.id,{...selectedRemote,status:publishing?'published':'draft',active:publishing,visibility:publishing?'public':'private',seo:{...selectedRemote.seo,noIndex:!publishing},publishedAt:publishing?(selectedRemote.publishedAt||nowIso()):undefined});setRemotePages(current=>current.map(page=>page.id===updated.id?updated:page))}catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível alterar a publicação da página.')}finally{setSaving(false)}}

  const openCreateSection=()=>{if(isEditorialLayout)return;setEditingSectionId(null);setSectionName('');setSectionSlug('');setError('');setSectionOpen(true)}
  const openEditSection=(section:SitePageSectionDraft)=>{setEditingSectionId(section.id);setSectionName(section.name);setSectionSlug(section.slug);setError('');setSectionOpen(true)}
  const saveSection=async()=>{if(isEditorialLayout){setSectionOpen(false);return}const cleanName=sectionName.trim(),cleanSlug=normalizeSiteSlug(sectionSlug||sectionName);if(!cleanName){setError('Informe o nome da seção.');return}if(!cleanSlug){setError('Informe um identificador válido para a seção.');return}const current=storedSections[selectedPage]??[];if(current.some(section=>section.slug===cleanSlug&&section.id!==editingSectionId)){setError('Já existe uma seção com este identificador nesta página.');return}const nextSections=editingSectionId?current.map(section=>section.id===editingSectionId?{...section,name:cleanName,slug:cleanSlug}:section):[...current,{id:`section-${crypto.randomUUID()}`,name:cleanName,slug:cleanSlug}];setSaving(true);setError('');try{const saved=persisted?await saveAdminPageSections(selectedPage,nextSections):nextSections;const next={...storedSections,[selectedPage]:saved};setStoredSections(next);if(!persisted)sitePageRepository.saveSections(next);setSectionOpen(false);setEditingSectionId(null);setSectionName('');setSectionSlug('')}catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível salvar a seção.')}finally{setSaving(false)}}
  const removeSection=async(id:string)=>{if(isEditorialLayout)return;const nextSections=(storedSections[selectedPage]??[]).filter(section=>section.id!==id);setSaving(true);setError('');try{const saved=persisted?await saveAdminPageSections(selectedPage,nextSections):nextSections;const next={...storedSections,[selectedPage]:saved};setStoredSections(next);if(!persisted)sitePageRepository.saveSections(next)}catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível excluir a seção.')}finally{setSaving(false)}}

  const publicUrl=selected.slug?`${new URL(import.meta.env.BASE_URL,window.location.origin).toString()}#/${selected.slug}`:new URL(import.meta.env.BASE_URL,window.location.origin).toString()
  const canEdit=selectedPage!=='home'&&(persisted?selected.source==='remote':true),canDelete=canEdit&&!selectedIsProtected

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Páginas',description:'Gerencie páginas e configure cada seção com edição e preview em tempo real.'}}>
    {loading&&<AdminNotice title="Sincronizando páginas" description="Carregando páginas e composição diretamente da API."/>}
    {error&&<AdminNotice title="Falha na operação" description={error}/>} 

    <section className="site-pages-management" aria-labelledby="site-pages-management-title">
      <div className="site-pages-management-main">
        <div className="site-pages-management-heading">
          <span className="site-pages-eyebrow" id="site-pages-management-title">Página selecionada</span>
          <strong>{selected.title}</strong>
          <small>{selected.public?'Publicada':'Não publicada'} · {layoutLabel(selected.layout)}</small>
        </div>
        <label className="site-pages-selector">Página<select value={selected.id} onChange={event=>setSelectedPage(event.target.value)}>{pages.map(page=><option key={page.id} value={page.id}>{page.title}{page.source==='draft'?' · editável':''}{` · ${layoutLabel(page.layout)}`}{page.public?' · publicada':''}</option>)}</select></label>
      </div>
      <div className="site-pages-management-actions">
        <button type="button" className="site-sections-configure site-pages-primary-action" onClick={openCreatePage} disabled={saving}><Plus size={15}/> Criar página</button>
        {selected.public?<a className="site-pages-public-link" href={publicUrl} target="_blank" rel="noreferrer"><Eye size={15}/> Ver página pública</a>:<button type="button" className="site-sections-configure" disabled><Eye size={15}/> Página não publicada</button>}
        <button type="button" className="site-sections-configure" onClick={openEditPage} disabled={!canEdit||saving}><Pencil size={15}/> Editar</button>
        <button type="button" className="site-sections-configure site-pages-danger-action" onClick={()=>void deletePage()} disabled={!canDelete||saving}><Trash2 size={15}/> Excluir</button>
        {persisted&&selectedRemote&&!selectedIsProtected&&<button type="button" className="site-sections-configure" onClick={()=>void togglePublication()} disabled={saving}>{isPublishedPage(selectedRemote)?'Retirar do ar':'Publicar'}</button>}
      </div>
    </section>

    {isEditorialLayout&&<div className="site-pages-context"><strong>Estrutura editorial herdada de Notícias</strong><span>As mesmas regiões editoriais são usadas pelas páginas de conteúdo; Hero e conteúdo continuam configuráveis.</span></div>}
    {selected.layout==='institutional'&&<div className="site-pages-context"><strong>Arquitetura institucional global</strong><span>Hero Institucional + MainContent + blocos opcionais + Newsletter + Footer, sem Sidebar artificial.</span></div>}
    {selected.layout==='legal'&&<div className="site-pages-context"><strong>Arquitetura jurídica global</strong><span>Hero Legal + documento com largura de leitura confortável + índice automático quando aplicável + Newsletter + Footer.</span></div>}

    <section className="site-pages-structure" aria-labelledby="site-pages-structure-title">
      <div className="site-pages-structure-header">
        <div><span className="site-pages-eyebrow">Estrutura da página</span><h2 id="site-pages-structure-title">{selected.title}</h2><p>{pageSections.length} {pageSections.length===1?'seção':'seções'} · {layoutLabel(selected.layout)}</p></div>
        <button type="button" className="site-sections-configure site-pages-primary-action" onClick={openCreateSection} disabled={isEditorialLayout||saving} title={isEditorialLayout?'Páginas editoriais herdam a estrutura canônica de Notícias.':'Criar seção complementar na região apropriada'}><Plus size={15}/> Criar seção</button>
      </div>

      <div className="site-sections-list" role="table" aria-label={`Estrutura de ${selected.title}`}>
        <div className="site-sections-head" role="row"><span>SEÇÃO</span><span>STATUS</span><span>AÇÕES</span></div>
        {pageSections.length?pageSections.map((section,index)=><div className="site-sections-row" role="row" key={`${selected.id}-${section.id}`}><div className="site-sections-name"><strong>{String(index+1).padStart(2,'0')}</strong><span><b>{section.name}</b><small>{section.summary}</small></span></div><span className="site-sections-status"><i/> Ativo</span><div className="site-sections-actions"><Link className="site-sections-configure" to={`/app/site/paginas/${encodeURIComponent(selected.id)}/secoes/${encodeURIComponent(section.id)}`}><Settings2 size={15}/> Configurar</Link>{!section.locked&&<><button type="button" className="site-sections-configure" disabled={saving} onClick={()=>{const current=(storedSections[selected.id]??[]).find(item=>item.id===section.id);if(current)openEditSection(current)}}><Pencil size={15}/> Editar</button><button type="button" className="site-sections-configure" disabled={saving} onClick={()=>void removeSection(section.id)}><Trash2 size={15}/> Excluir</button></>}</div></div>):<div className="site-sections-row site-sections-empty" role="row"><div className="site-sections-name"><strong>—</strong><span><b>Nenhuma seção própria criada</b><small>A fundação global permanece ativa; adicione apenas blocos com responsabilidade semântica real.</small></span></div><span className="site-sections-status">—</span><span/></div>}
      </div>
    </section>

    <section className="site-pages-global-settings" aria-labelledby="site-pages-global-title"><div><span className="site-pages-eyebrow">Configurações globais do site</span><h2 id="site-pages-global-title">Cabeçalho, rodapé e identidade</h2><p>Esses elementos são compartilhados entre todas as páginas e ficam fora da composição individual.</p></div><Link className="site-sections-configure" to="/app/settings"><Settings2 size={15}/> Configurar Identidade do Site</Link></section>

    {pageDialog&&<div role="presentation" style={{position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,.55)',display:'grid',placeItems:'center',padding:20}} onMouseDown={event=>{if(event.currentTarget===event.target)setPageDialog(null)}}><section role="dialog" aria-modal="true" aria-labelledby="page-dialog-title" className="section-editor-card" style={{width:'min(560px,100%)',boxShadow:'0 24px 80px rgba(0,0,0,.28)'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><div><h2 id="page-dialog-title" style={{marginBottom:4}}>{pageDialog==='edit'?'Editar página':'Criar página de conteúdo'}</h2><p style={{margin:0}}>{pageDialog==='edit'?'Altere nome e slug preservando a família arquitetural da página.':'Novas páginas criadas por este fluxo continuam editoriais e herdam automaticamente a arquitetura de Notícias.'}</p></div><button type="button" onClick={()=>setPageDialog(null)} aria-label="Fechar"><X size={18}/></button></div><div style={{display:'grid',gap:14,marginTop:20}}><label>Nome da página<input autoFocus value={title} onChange={event=>{const value=event.target.value;setTitle(value);if(pageDialog==='create'&&!slug)setSlug(normalizeSiteSlug(value));setError('')}} placeholder="Ex.: Música"/></label><label>Slug<input value={slug} onChange={event=>{setSlug(normalizeSiteSlug(event.target.value));setError('')}} placeholder="musica"/></label><label>Modelo<input value="Editorial · arquitetura global de Notícias" readOnly aria-readonly="true"/></label>{error&&<div style={{color:'#d00',fontWeight:700,fontSize:13}}>{error}</div>}<div style={{display:'flex',justifyContent:'flex-end',gap:10}}><button type="button" className="button outline" onClick={()=>setPageDialog(null)}>Cancelar</button><button type="button" className="button dark" onClick={()=>void savePage()} disabled={saving}>{pageDialog==='edit'?<Pencil size={15}/>:<Plus size={15}/>} {saving?'Salvando…':pageDialog==='edit'?'Salvar':'Criar rascunho'}</button></div></div></section></div>}

    {sectionOpen&&!isEditorialLayout&&<div role="presentation" style={{position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,.55)',display:'grid',placeItems:'center',padding:20}} onMouseDown={event=>{if(event.currentTarget===event.target)setSectionOpen(false)}}><section role="dialog" aria-modal="true" aria-labelledby="section-dialog-title" className="section-editor-card" style={{width:'min(560px,100%)',boxShadow:'0 24px 80px rgba(0,0,0,.28)'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><div><h2 id="section-dialog-title" style={{marginBottom:4}}>{editingSectionId?'Editar seção':'Criar seção'}</h2><p style={{margin:0}}>A seção pertence à página selecionada e será composta sobre a arquitetura global, sem criar um novo shell.</p></div><button type="button" onClick={()=>setSectionOpen(false)} aria-label="Fechar"><X size={18}/></button></div><div style={{display:'grid',gap:14,marginTop:20}}><label>Nome da seção<input autoFocus value={sectionName} onChange={event=>{const value=event.target.value;setSectionName(value);if(!sectionSlug)setSectionSlug(normalizeSiteSlug(value));setError('')}} placeholder="Ex.: Conteúdo principal"/></label><label>Identificador<input value={sectionSlug} onChange={event=>{setSectionSlug(normalizeSiteSlug(event.target.value));setError('')}} placeholder="conteudo-principal"/></label>{error&&<div style={{color:'#d00',fontWeight:700,fontSize:13}}>{error}</div>}<div style={{display:'flex',justifyContent:'flex-end',gap:10}}><button type="button" className="button outline" onClick={()=>setSectionOpen(false)}>Cancelar</button><button type="button" className="button dark" onClick={()=>void saveSection()} disabled={saving}><Pencil size={15}/> {saving?'Salvando…':'Salvar seção'}</button></div></div></section></div>}
  </AdminShell>
}
