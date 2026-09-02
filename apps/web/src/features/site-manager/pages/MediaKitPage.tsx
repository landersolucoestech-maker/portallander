import {FileText,Globe2,Images,Newspaper,Plus,RotateCcw,Save,Trash2} from 'lucide-react'
import {useEffect,useState} from 'react'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {AdminKpi,AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {type MediaKitAdFormat,type MediaKitDraft} from '../mediaKitDomain'
import {isMediaKitPersistenceConfigured,mediaKitRepository} from '../mediaKitRepository'
import {siteManagerReadModel} from '../readModel'
import './site-forms.css'

const uid=()=>`format-${crypto.randomUUID()}`

export function MediaKitPage(){
  const persistent=isMediaKitPersistenceConfigured()
  const [draft,setDraft]=useState<MediaKitDraft>()
  const [saved,setSaved]=useState(false)
  const [notice,setNotice]=useState('')
  const [error,setError]=useState('')
  const [operation,setOperation]=useState('')
  const pages=siteManagerReadModel.pages.filter(page=>page.active).length
  const published=siteManagerReadModel.publishedContents.length
  const assets=siteManagerReadModel.media.length

  useEffect(()=>{
    let active=true
    mediaKitRepository.read().then(value=>{if(active){setDraft(value);setError('')}}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar o Mídia Kit.')})
    return()=>{active=false}
  },[])

  if(!draft)return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Mídia Kit',description:'Gerencie a apresentação comercial do Portal Lander.'}}>{error?<AdminNotice title="Falha ao carregar o Mídia Kit" description={error}/>:<AdminNotice title="Carregando Mídia Kit" description="Sincronizando a versão administrativa disponível."/>}</AdminShell>

  const patch=(next:MediaKitDraft)=>{setDraft({...next,status:'draft'});setSaved(false);setNotice('');setError('')}
  const patchFormat=(id:string,change:Partial<MediaKitAdFormat>)=>patch({...draft,adFormats:draft.adFormats.map(format=>format.id===id?{...format,...change}:format)})
  const addFormat=()=>patch({...draft,adFormats:[...draft.adFormats,{id:uid(),name:'Novo formato',placement:'',dimensions:'',description:''}]})
  const removeFormat=(id:string)=>patch({...draft,adFormats:draft.adFormats.filter(format=>format.id!==id)})
  const saveDraft=async()=>{
    setOperation('save');setError('');setNotice('')
    try{const next=await mediaKitRepository.save(draft);setDraft(next);setSaved(true);setNotice(persistent?'Rascunho persistente salvo na API. Nenhuma alteração pública foi feita.':'Rascunho salvo somente neste navegador.')}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível salvar o Mídia Kit.')}
    finally{setOperation('')}
  }
  const resetDraft=async()=>{
    if(!window.confirm(persistent?'Descartar o rascunho atual e restaurar a última versão publicada do Mídia Kit?':'Descartar o rascunho local e restaurar a estrutura padrão?'))return
    setOperation('reset');setError('');setNotice('')
    try{const next=await mediaKitRepository.reset();setDraft(next);setSaved(false);setNotice(persistent?(next.status==='published'?`Rascunho descartado. Versão publicada v${next.version} restaurada no editor.`:'Rascunho descartado. Estrutura inicial restaurada.'):'Rascunho local removido.')}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível restaurar o Mídia Kit.')}
    finally{setOperation('')}
  }
  const publish=async()=>{
    if(!persistent)return
    setOperation('publish');setError('');setNotice('')
    try{
      const savedDraft=draft.status==='draft'?await mediaKitRepository.save(draft):await mediaKitRepository.save({...draft,status:'draft'})
      const publishedKit=await mediaKitRepository.publish()
      setDraft(publishedKit);setSaved(false);setNotice(`Mídia Kit v${publishedKit.version} publicado com sucesso. A versão anterior foi arquivada automaticamente.`)
      void savedDraft
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível publicar o Mídia Kit.')}
    finally{setOperation('')}
  }
  const busy=Boolean(operation)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Mídia Kit',description:'Gerencie a apresentação comercial, audiência, formatos publicitários e canais de contato do Portal Lander.'}}>
    <AdminNotice title={persistent?'Mídia Kit versionado e persistente':'Rascunho administrativo local'} description={persistent?'O editor usa a API autenticada. Salvar mantém uma versão de rascunho; Publicar ativa essa versão e arquiva a publicação anterior.':'Sem API administrativa configurada, este build mantém apenas um rascunho local de desenvolvimento e não permite publicação.'}/>
    {saved&&<AdminNotice title="Rascunho salvo" description={persistent?'As alterações estão persistidas no backend e ainda não foram publicadas.':'As alterações foram salvas neste navegador.'}/>} 
    {notice&&<AdminNotice title="Operação concluída" description={notice}/>} 
    {error&&<AdminNotice title="Falha na operação" description={error}/>} 
    <div className="admin-kpi-grid"><AdminKpi label="Páginas ativas" value={String(pages)} detail="Estrutura atual do Site" icon={<Globe2 size={16}/>}/><AdminKpi label="Publicações" value={String(published)} detail="Conteúdos públicos" icon={<Newspaper size={16}/>}/><AdminKpi label="Mídias" value={String(assets)} detail="Arquivos da biblioteca" icon={<Images size={16}/>}/><AdminKpi label="Versão do kit" value={`v${draft.version}`} detail={draft.status==='published'?'Publicada':draft.status==='inactive'?'Arquivada':'Rascunho'} icon={<FileText size={16}/>}/></div>

    <div className="site-form-editor site-media-kit-editor">
      <section className="site-form-card"><header><div><h2>Apresentação institucional</h2><p>Posicionamento e apresentação do Portal Lander para anunciantes e parceiros.</p></div></header><div className="site-form-grid"><label><span>Título</span><input value={draft.institutional.title} onChange={event=>patch({...draft,institutional:{...draft.institutional,title:event.target.value}})}/></label><label><span>Status</span><input value={draft.status==='published'?'Publicado':draft.status==='inactive'?'Arquivado':'Rascunho'} disabled/></label><label className="site-form-span-2"><span>Resumo institucional</span><textarea rows={4} value={draft.institutional.summary} onChange={event=>patch({...draft,institutional:{...draft.institutional,summary:event.target.value}})}/></label><label className="site-form-span-2"><span>Posicionamento comercial</span><textarea rows={4} value={draft.institutional.positioning} onChange={event=>patch({...draft,institutional:{...draft.institutional,positioning:event.target.value}})}/></label></div></section>

      <section className="site-form-card"><header><div><h2>Audiência e métricas</h2><p>Campos preparados para receber dados reais de analytics; valores não são inventados automaticamente.</p></div></header><div className="site-form-grid"><label><span>Usuários mensais</span><input value={draft.audience.monthlyUsers} onChange={event=>patch({...draft,audience:{...draft.audience,monthlyUsers:event.target.value}})} placeholder="Ex.: fonte de analytics"/></label><label><span>Visualizações mensais</span><input value={draft.audience.monthlyViews} onChange={event=>patch({...draft,audience:{...draft.audience,monthlyViews:event.target.value}})}/></label><label><span>Alcance social</span><input value={draft.audience.socialReach} onChange={event=>patch({...draft,audience:{...draft.audience,socialReach:event.target.value}})}/></label><label className="site-form-span-2"><span>Observações / fonte dos dados</span><textarea rows={3} value={draft.audience.notes} onChange={event=>patch({...draft,audience:{...draft.audience,notes:event.target.value}})}/></label></div></section>

      <section className="site-form-card"><header><div><h2>Formatos publicitários</h2><p>Cadastre os espaços e formatos comercializados pelo Portal Lander.</p></div><button type="button" className="button outline" onClick={addFormat}><Plus size={15}/>Adicionar formato</button></header><div className="site-form-fields">{draft.adFormats.length?draft.adFormats.map(format=><article className="site-form-field" key={format.id}><div className="site-form-field-grid"><label><span>Nome</span><input value={format.name} onChange={event=>patchFormat(format.id,{name:event.target.value})}/></label><label><span>Posição</span><input value={format.placement} onChange={event=>patchFormat(format.id,{placement:event.target.value})} placeholder="Ex.: Homepage / lateral"/></label><label><span>Dimensões</span><input value={format.dimensions} onChange={event=>patchFormat(format.id,{dimensions:event.target.value})} placeholder="Ex.: 300 × 350 px"/></label><label className="site-form-span-2"><span>Descrição</span><textarea rows={2} value={format.description} onChange={event=>patchFormat(format.id,{description:event.target.value})}/></label></div><div className="site-form-field-actions"><button type="button" title="Excluir formato" onClick={()=>removeFormat(format.id)}><Trash2 size={15}/></button></div></article>):<div className="site-form-preview-empty">Nenhum formato cadastrado no Mídia Kit.</div>}</div></section>

      <section className="site-form-card"><header><div><h2>Contato comercial</h2><p>Informações exibidas para anunciantes e parceiros interessados.</p></div></header><div className="site-form-grid"><label><span>Responsável / equipe</span><input value={draft.commercial.name} onChange={event=>patch({...draft,commercial:{...draft.commercial,name:event.target.value}})}/></label><label><span>E-mail</span><input type="email" value={draft.commercial.email} onChange={event=>patch({...draft,commercial:{...draft.commercial,email:event.target.value}})}/></label><label><span>Telefone / WhatsApp</span><input value={draft.commercial.phone} onChange={event=>patch({...draft,commercial:{...draft.commercial,phone:event.target.value}})}/></label><label><span>CTA</span><input value={draft.commercial.cta} onChange={event=>patch({...draft,commercial:{...draft.commercial,cta:event.target.value}})}/></label></div></section>

      <div className="site-form-editor-top site-media-kit-actions"><button type="button" className="button outline" onClick={()=>void resetDraft()} disabled={busy}><RotateCcw size={15}/>{operation==='reset'?'Restaurando…':'Restaurar'}</button><button type="button" className="button outline" onClick={()=>void saveDraft()} disabled={busy}><Save size={15}/>{operation==='save'?'Salvando…':'Salvar rascunho'}</button><button type="button" className="button" onClick={()=>void publish()} disabled={!persistent||busy} title={persistent?'Publicar a versão atual do Mídia Kit':'A publicação exige a API administrativa'}>{operation==='publish'?'Publicando…':'Publicar'}</button></div>
    </div>
  </AdminShell>
}
