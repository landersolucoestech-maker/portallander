import {ArrowLeft,Save,Trash2} from 'lucide-react'
import {useMemo,useState} from 'react'
import {Link,useNavigate,useParams} from 'react-router-dom'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {normalizeSlug,type EditorialContent} from '../../editorial/model'
import {editorialReadModel} from '../../editorial/repository'
import {contentDraftRepository} from '../contentDraftRepository'
import {sitePageRepository} from '../pageRepository'
import './site-forms.css'

type PageOption={id:string;title:string;source:'published'|'draft'}
const clone=(content:EditorialContent):EditorialContent=>structuredClone(content)
const bodyText=(content:EditorialContent)=>content.body.map(block=>block.type==='quote'?block.text:block.text).join('\n\n')
const bodyFromText=(value:string):EditorialContent['body']=>value.split(/\n\s*\n/).map(text=>text.trim()).filter(Boolean).map(text=>({type:'paragraph' as const,text}))

export function SiteContentEditorPage(){
  const {contentId=''}=useParams()
  const navigate=useNavigate()
  const source=useMemo(()=>contentDraftRepository.get(contentId),[contentId])
  const [draft,setDraft]=useState<EditorialContent|undefined>(()=>source?clone(source):undefined)
  const [body,setBody]=useState(()=>source?bodyText(source):'')
  const [saved,setSaved]=useState(false)
  const [error,setError]=useState('')
  const pageOptions=useMemo<PageOption[]>(()=>[
    ...editorialReadModel.pages.filter(page=>page.type==='editorial').map(page=>({id:page.id,title:page.title,source:'published' as const})),
    ...sitePageRepository.listDraftPages().map(page=>({id:page.id,title:`${page.title} · rascunho`,source:'draft' as const})),
  ],[])

  if(!source||!draft)return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Rascunho não encontrado',description:'O conteúdo solicitado não existe entre os rascunhos administrativos do Site.'}}><Link className="button outline" to="/app/site/conteudos"><ArrowLeft size={15}/>Voltar para Conteúdos</Link></AdminShell>

  const patch=(change:Partial<EditorialContent>)=>{setSaved(false);setError('');setDraft(current=>current&&({...current,...change}))}
  const save=()=>{
    const title=draft.title.trim(),slug=normalizeSlug(draft.slug||draft.title)
    if(!title){setError('Informe o título do conteúdo.');return}
    if(!draft.pageId||!pageOptions.some(page=>page.id===draft.pageId)){setError('Selecione uma página de conteúdo válida.');return}
    if(!slug){setError('Informe um slug válido.');return}
    if(editorialReadModel.contents.some(content=>content.pageId===draft.pageId&&content.slug===slug)){setError('Já existe um conteúdo persistido com este slug nesta página.');return}
    const next=contentDraftRepository.save({...draft,title,slug,body:bodyFromText(body)})
    setDraft(clone(next));setSaved(true)
  }
  const remove=()=>{if(!window.confirm(`Excluir o rascunho “${draft.title}”?`))return;contentDraftRepository.remove(draft.id);navigate('/app/site/conteudos')}
  const selectedPage=pageOptions.find(page=>page.id===draft.pageId)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:draft.title||'Novo conteúdo',description:'Editor de rascunho editorial. A publicação permanece separada da edição local.'}}>
    <div className="site-form-editor">
      <div className="site-form-editor-top"><Link className="button outline" to="/app/site/conteudos"><ArrowLeft size={15}/>Conteúdos</Link><div className="site-form-editor-actions"><button type="button" className="button outline" onClick={remove}><Trash2 size={15}/>Excluir rascunho</button><button type="button" className="button" onClick={save}><Save size={15}/>Salvar rascunho</button></div></div>
      <AdminNotice title="Rascunho local" description="Este conteúdo fica somente no fluxo administrativo deste navegador. Ele não aparece no site público, não entra em busca e não pode ser publicado enquanto a persistência editorial compartilhada não estiver conectada."/>
      {selectedPage?.source==='draft'&&<AdminNotice title="Página também em rascunho" description="Este conteúdo está vinculado a uma página ainda não publicada. Ambos precisarão ser persistidos no backend antes de qualquer publicação pública."/>}
      {saved&&<AdminNotice title="Rascunho salvo" description="As alterações foram salvas localmente, mantendo status Rascunho, active=false e noIndex=true."/>}
      {error&&<AdminNotice title="Não foi possível salvar" description={error}/>} 

      <div className="site-form-editor-layout">
        <div className="site-form-editor-main">
          <section className="site-form-card"><header><div><h2>Publicação</h2><p>Identidade editorial, página e URL futura do conteúdo.</p></div></header><div className="site-form-grid">
            <label className="site-form-span-2"><span>Título</span><input value={draft.title} onChange={event=>patch({title:event.target.value})}/></label>
            <label><span>Página de conteúdo</span><select value={draft.pageId} onChange={event=>patch({pageId:event.target.value})}>{pageOptions.map(page=><option key={page.id} value={page.id}>{page.title}</option>)}</select></label>
            <label><span>Slug</span><input value={draft.slug} onChange={event=>patch({slug:normalizeSlug(event.target.value)})}/></label>
            <label><span>Status</span><input value="Rascunho" disabled/></label><label><span>Indexação</span><input value="noIndex" disabled/></label>
            <label className="site-form-span-2"><span>Resumo</span><textarea rows={4} value={draft.summary} onChange={event=>patch({summary:event.target.value})}/></label>
          </div></section>

          <section className="site-form-card"><header><div><h2>Texto</h2><p>Separe parágrafos com uma linha em branco. O rascunho é convertido em blocos editoriais ao salvar.</p></div></header><div className="site-form-grid"><label className="site-form-span-2"><span>Corpo do conteúdo</span><textarea rows={18} value={body} onChange={event=>{setSaved(false);setBody(event.target.value)}} placeholder="Escreva o conteúdo aqui..."/></label></div></section>

          <section className="site-form-card"><header><div><h2>Autoria e organização</h2></div></header><div className="site-form-grid"><label><span>Autor</span><input value={draft.author} onChange={event=>patch({author:event.target.value})}/></label><label><span>Tags / categorias</span><input value={draft.tags.join(', ')} onChange={event=>patch({tags:event.target.value.split(',').map(value=>value.trim()).filter(Boolean)})}/></label></div></section>

          <section className="site-form-card"><header><div><h2>Capa</h2></div></header><div className="site-form-grid"><label className="site-form-span-2"><span>URL da imagem</span><input value={draft.coverImage??''} onChange={event=>patch({coverImage:event.target.value})} placeholder="Selecione futuramente pela biblioteca de Mídias"/></label><label className="site-form-span-2"><span>Texto alternativo</span><input value={draft.coverImageAlt??''} onChange={event=>patch({coverImageAlt:event.target.value})}/></label></div></section>

          <section className="site-form-card"><header><div><h2>SEO</h2><p>O rascunho permanece noIndex até publicação persistente.</p></div></header><div className="site-form-grid"><label><span>Meta title</span><input value={draft.seo.metaTitle??''} onChange={event=>patch({seo:{...draft.seo,metaTitle:event.target.value,noIndex:true}})}/></label><label><span>Canonical</span><input value={draft.seo.canonical??''} onChange={event=>patch({seo:{...draft.seo,canonical:event.target.value,noIndex:true}})}/></label><label className="site-form-span-2"><span>Meta description</span><textarea rows={3} value={draft.seo.metaDescription??''} onChange={event=>patch({seo:{...draft.seo,metaDescription:event.target.value,noIndex:true}})}/></label></div></section>
        </div>

        <aside className="site-form-preview-panel" aria-label="Preview do conteúdo"><div className="site-form-preview-sticky"><header><span>PREVIEW DO RASCUNHO</span><h2>{draft.title||'Conteúdo sem título'}</h2><p>/{selectedPage?.title.replace(' · rascunho','')||'pagina'}/{draft.slug||'slug'}</p></header>{draft.coverImage&&<div style={{padding:20,paddingBottom:0}}><img src={draft.coverImage} alt={draft.coverImageAlt||''} style={{display:'block',width:'100%',aspectRatio:'16/9',objectFit:'cover',borderRadius:10}}/></div>}<article style={{padding:20}}><p style={{fontWeight:700}}>{draft.summary||'O resumo aparecerá aqui.'}</p>{bodyFromText(body).slice(0,6).map((block,index)=><p key={index}>{block.text}</p>)}</article></div></aside>
      </div>
    </div>
  </AdminShell>
}
