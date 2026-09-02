import {ArrowLeft,Save,Trash2} from 'lucide-react'
import {useEffect,useMemo,useState} from 'react'
import {Link,useNavigate,useParams} from 'react-router-dom'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {useAdminAuth} from '../../access/adminAuthState'
import {deleteAdminEditorialContent,getAdminEditorialContent,listAdminEditorialPages,updateAdminEditorialContent} from '../../editorial/adminClient'
import {normalizeSlug,type EditorialContent,type EditorialPage} from '../../editorial/model'
import {editorialReadModel} from '../../editorial/repository'
import {contentDraftRepository} from '../contentDraftRepository'
import {sitePageRepository} from '../pageRepository'
import './site-forms.css'

type PageOption={id:string;title:string;source:'persisted'|'draft'}
const clone=(content:EditorialContent):EditorialContent=>structuredClone(content)
const bodyText=(content:EditorialContent)=>content.body.map(block=>block.text).join('\n\n')
const bodyFromText=(value:string):EditorialContent['body']=>value.split(/\n\s*\n/).map(text=>text.trim()).filter(Boolean).map(text=>({type:'paragraph' as const,text}))

export function SiteContentEditorPage(){
  const {contentId=''}=useParams()
  const navigate=useNavigate()
  const {status}=useAdminAuth()
  const persisted=status==='authenticated'
  const localSource=useMemo(()=>persisted?undefined:contentDraftRepository.get(contentId),[contentId,persisted])
  const [draft,setDraft]=useState<EditorialContent|undefined>(()=>localSource?clone(localSource):undefined)
  const [body,setBody]=useState(()=>localSource?bodyText(localSource):'')
  const [remotePages,setRemotePages]=useState<EditorialPage[]>([])
  const [loadedRemoteId,setLoadedRemoteId]=useState<string|null>(null)
  const [saving,setSaving]=useState(false)
  const [saved,setSaved]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{
    if(!persisted)return
    let active=true
    void Promise.all([getAdminEditorialContent(contentId),listAdminEditorialPages()]).then(([content,pages])=>{
      if(!active)return
      setDraft(clone(content));setBody(bodyText(content));setRemotePages(pages);setSaved(false);setError('')
    }).catch(caught=>{if(active){setDraft(undefined);setError(caught instanceof Error?caught.message:'Não foi possível carregar o conteúdo persistido.')}}).finally(()=>{if(active)setLoadedRemoteId(contentId)})
    return()=>{active=false}
  },[contentId,persisted])

  const pageOptions=useMemo<PageOption[]>(()=>persisted
    ?remotePages.filter(page=>page.type==='editorial').map(page=>({id:page.id,title:page.title,source:'persisted' as const}))
    :[
      ...editorialReadModel.pages.filter(page=>page.type==='editorial').map(page=>({id:page.id,title:page.title,source:'persisted' as const})),
      ...sitePageRepository.listDraftPages().map(page=>({id:page.id,title:`${page.title} · rascunho`,source:'draft' as const})),
    ],[persisted,remotePages])

  const loading=persisted&&loadedRemoteId!==contentId
  if(loading)return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Carregando conteúdo',description:'Sincronizando o editor com a persistência editorial.'}}><AdminNotice title="Sincronizando" description="Carregando conteúdo e páginas diretamente da API do Portal Lander."/></AdminShell>
  if(!draft)return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Conteúdo não encontrado',description:'O conteúdo solicitado não está disponível neste ambiente.'}}>{error&&<AdminNotice title="Falha ao abrir conteúdo" description={error}/>}<Link className="button outline" to="/app/site/conteudos"><ArrowLeft size={15}/>Voltar para Conteúdos</Link></AdminShell>

  const patch=(change:Partial<EditorialContent>)=>{setSaved(false);setError('');setDraft(current=>current&&({...current,...change}))}
  const save=async()=>{
    const title=draft.title.trim(),slug=normalizeSlug(draft.slug||draft.title)
    if(!title){setError('Informe o título do conteúdo.');return}
    if(!draft.pageId||!pageOptions.some(page=>page.id===draft.pageId)){setError('Selecione uma página de conteúdo válida.');return}
    if(!slug){setError('Informe um slug válido.');return}
    if(!persisted&&editorialReadModel.contents.some(content=>content.id!==draft.id&&content.pageId===draft.pageId&&content.slug===slug)){setError('Já existe um conteúdo persistido com este slug nesta página.');return}
    const next={...draft,title,slug,body:bodyFromText(body),updatedAt:new Date().toISOString()}
    setSaving(true);setError('')
    try{
      if(persisted){
        const savedContent=await updateAdminEditorialContent(draft.id,next)
        setDraft(clone(savedContent));setBody(bodyText(savedContent))
      }else{
        const savedContent=contentDraftRepository.save(next)
        setDraft(clone(savedContent))
      }
      setSaved(true)
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível salvar o conteúdo.')}
    finally{setSaving(false)}
  }
  const remove=async()=>{
    if(!window.confirm(`Excluir “${draft.title}”?${persisted?' Esta ação remove o conteúdo persistido.':' '}`))return
    setSaving(true);setError('')
    try{
      if(persisted)await deleteAdminEditorialContent(draft.id)
      else contentDraftRepository.remove(draft.id)
      navigate('/app/site/conteudos')
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível excluir o conteúdo.');setSaving(false)}
  }
  const selectedPage=pageOptions.find(page=>page.id===draft.pageId)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:draft.title||'Novo conteúdo',description:persisted?'Editor conectado à persistência editorial autenticada.':'Editor de rascunho local de desenvolvimento.'}}>
    <div className="site-form-editor">
      <div className="site-form-editor-top"><Link className="button outline" to="/app/site/conteudos"><ArrowLeft size={15}/>Conteúdos</Link><div className="site-form-editor-actions"><button type="button" className="button outline" onClick={()=>void remove()} disabled={saving}><Trash2 size={15}/>{persisted?'Excluir conteúdo':'Excluir rascunho'}</button><button type="button" className="button" onClick={()=>void save()} disabled={saving}><Save size={15}/>{saving?'Salvando…':'Salvar alterações'}</button></div></div>
      <AdminNotice title={persisted?'Persistência editorial conectada':'Rascunho local'} description={persisted?'As alterações desta tela são salvas pela API autenticada. Publicação e retirada do ar continuam controladas na lista de Conteúdos.':'Este conteúdo fica somente neste navegador e nunca entra no site público.'}/>
      {selectedPage?.source==='draft'&&<AdminNotice title="Página também em rascunho" description="Este conteúdo está vinculado a uma página ainda não persistida e não pode ser publicado."/>}
      {saved&&<AdminNotice title="Alterações salvas" description={persisted?'O conteúdo persistido foi atualizado com sucesso.':'O rascunho foi salvo localmente.'}/>} 
      {error&&<AdminNotice title="Não foi possível concluir a operação" description={error}/>} 

      <div className="site-form-editor-layout">
        <div className="site-form-editor-main">
          <section className="site-form-card"><header><div><h2>Publicação</h2><p>Identidade editorial, página e URL do conteúdo.</p></div></header><div className="site-form-grid">
            <label className="site-form-span-2"><span>Título</span><input value={draft.title} onChange={event=>patch({title:event.target.value})}/></label>
            <label><span>Página de conteúdo</span><select value={draft.pageId} onChange={event=>patch({pageId:event.target.value})}>{pageOptions.map(page=><option key={page.id} value={page.id}>{page.title}</option>)}</select></label>
            <label><span>Slug</span><input value={draft.slug} onChange={event=>patch({slug:normalizeSlug(event.target.value)})}/></label>
            <label><span>Status</span><input value={draft.status==='published'?'Publicado':draft.status==='archived'?'Arquivado':'Rascunho'} disabled/></label><label><span>Indexação</span><input value={draft.seo.noIndex?'noIndex':'Indexável'} disabled/></label>
            <label className="site-form-span-2"><span>Resumo</span><textarea rows={4} value={draft.summary} onChange={event=>patch({summary:event.target.value})}/></label>
          </div></section>

          <section className="site-form-card"><header><div><h2>Texto</h2><p>Separe parágrafos com uma linha em branco. O editor converte o texto em blocos editoriais ao salvar.</p></div></header><div className="site-form-grid"><label className="site-form-span-2"><span>Corpo do conteúdo</span><textarea rows={18} value={body} onChange={event=>{setSaved(false);setBody(event.target.value)}} placeholder="Escreva o conteúdo aqui..."/></label></div></section>

          <section className="site-form-card"><header><div><h2>Autoria e organização</h2></div></header><div className="site-form-grid"><label><span>Autor</span><input value={draft.author} onChange={event=>patch({author:event.target.value})}/></label><label><span>Tags / categorias</span><input value={draft.tags.join(', ')} onChange={event=>patch({tags:event.target.value.split(',').map(value=>value.trim()).filter(Boolean)})}/></label></div></section>

          <section className="site-form-card"><header><div><h2>Capa</h2></div></header><div className="site-form-grid"><label className="site-form-span-2"><span>URL da imagem</span><input value={draft.coverImage??''} onChange={event=>patch({coverImage:event.target.value})} placeholder="Cole uma URL ou use um arquivo da biblioteca de Mídias"/></label><label className="site-form-span-2"><span>Texto alternativo</span><input value={draft.coverImageAlt??''} onChange={event=>patch({coverImageAlt:event.target.value})}/></label></div></section>

          <section className="site-form-card"><header><div><h2>SEO</h2><p>A indexação acompanha o estado de publicação definido no CMS.</p></div></header><div className="site-form-grid"><label><span>Meta title</span><input value={draft.seo.metaTitle??''} onChange={event=>patch({seo:{...draft.seo,metaTitle:event.target.value}})}/></label><label><span>Canonical</span><input value={draft.seo.canonical??''} onChange={event=>patch({seo:{...draft.seo,canonical:event.target.value}})}/></label><label className="site-form-span-2"><span>Meta description</span><textarea rows={3} value={draft.seo.metaDescription??''} onChange={event=>patch({seo:{...draft.seo,metaDescription:event.target.value}})}/></label></div></section>
        </div>

        <aside className="site-form-preview-panel" aria-label="Preview do conteúdo"><div className="site-form-preview-sticky"><header><span>PREVIEW DO CONTEÚDO</span><h2>{draft.title||'Conteúdo sem título'}</h2><p>/{selectedPage?.title.replace(' · rascunho','')||'pagina'}/{draft.slug||'slug'}</p></header>{draft.coverImage&&<div style={{padding:20,paddingBottom:0}}><img src={draft.coverImage} alt={draft.coverImageAlt||''} style={{display:'block',width:'100%',aspectRatio:'16/9',objectFit:'cover',borderRadius:10}}/></div>}<article style={{padding:20}}><p style={{fontWeight:700}}>{draft.summary||'O resumo aparecerá aqui.'}</p>{bodyFromText(body).slice(0,6).map((block,index)=><p key={index}>{block.text}</p>)}</article></div></aside>
      </div>
    </div>
  </AdminShell>
}
