import {ArrowDown,ArrowLeft,ArrowUp,Copy,Plus,Save,Trash2} from 'lucide-react'
import {useEffect,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {useAdminAuth} from '../../access/AdminAuthContext'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {getAdminSiteForm,publishAdminSiteForm,saveAdminSiteForm} from '../forms/adminClient'
import {normalizeFormAppearance} from '../forms/appearance'
import {listRuntimeSiteForms} from '../forms/catalog'
import {formDraftRepository} from '../forms/draftRepository'
import type {CollaborationPriority,FormConsentDefinition,FormDestination,FormFieldDefinition,FormFieldType,FormPurpose,SiteFormDefinition} from '../forms/domain'
import {FormAppearanceEditor} from '../forms/FormAppearanceEditor'
import {bootstrapPublishedSiteForms} from '../forms/runtimeClient'
import {resolveSiteFormOptionSets} from '../forms/runtimeOptions'
import {SiteFormRenderer} from '../forms/SiteFormRenderer'
import './site-forms.css'

const purposeOptions:readonly [FormPurpose,string][]=[
  ['lead_capture','Captação comercial'],['contact','Contato'],['advertising','Publicidade'],['editorial_submission','Submissão editorial'],['newsletter','Newsletter'],['survey','Pesquisa'],['event_registration','Inscrição'],['custom','Personalizado'],
]
const destinationOptions:readonly [FormDestination,string][]=[
  ['crm','CRM → Leads'],['content_collaborations','Site → Conteúdos → Colaborações recebidas'],['marketing','Marketing'],['internal','Interno'],['none','Sem destino'],
]
const fieldTypeOptions:readonly [FormFieldType,string][]=[
  ['text','Texto'],['email','E-mail'],['tel','Telefone'],['textarea','Texto longo'],['select','Seleção'],['radio','Opções'],['checkbox','Checkbox'],['url','URL'],['file','Arquivo'],['date','Data'],['number','Número'],['hidden','Oculto'],
]

const cloneForm=(form:SiteFormDefinition):SiteFormDefinition=>({
  ...form,
  fields:form.fields.map(field=>({...field,options:field.options?[...field.options]:undefined})),
  consents:form.consents.map(consent=>({...consent})),
  routing:{...form.routing,crm:form.routing.crm?{...form.routing.crm,tags:form.routing.crm.tags?[...form.routing.crm.tags]:undefined}:undefined,collaboration:form.routing.collaboration?{...form.routing.collaboration}:undefined},
  appearance:normalizeFormAppearance(form.appearance),
})
const uid=(prefix:string)=>`${prefix}-${crypto.randomUUID()}`

function FormPreview({form,forceDraft=false}:{form:SiteFormDefinition;forceDraft?:boolean}){
  const previewForm=forceDraft?{...form,status:'draft' as const}:form
  return <aside className="site-form-preview-panel" aria-label="Preview do formulário em tempo real">
    <div className="site-form-preview-sticky">
      <header><span>PREVIEW EM TEMPO REAL</span><h2>{previewForm.name||'Formulário sem nome'}</h2><p>Este painel usa o mesmo renderer do formulário público e reage diretamente ao estado atual do editor, inclusive à aparência ainda não salva.</p></header>
      <div className="site-form-preview-meta"><span className={`status ${previewForm.status}`}>{previewForm.status==='active'?'Ativo':previewForm.status==='draft'?'Rascunho':'Inativo'}</span><small>/{previewForm.slug||'slug-do-formulario'}</small></div>
      <SiteFormRenderer form={previewForm} mode="preview" optionSets={resolveSiteFormOptionSets(previewForm)} submitLabel="Enviar"/>
    </div>
  </aside>
}

export function SiteFormEditorPage(){
  const {formId=''}=useParams()
  const {status}=useAdminAuth()
  const persisted=status==='authenticated'
  const [source,setSource]=useState<SiteFormDefinition>()
  const [draft,setDraft]=useState<SiteFormDefinition>()
  const [loading,setLoading]=useState(true)
  const [dirty,setDirty]=useState(false)
  const [operation,setOperation]=useState('')
  const [notice,setNotice]=useState('')
  const [error,setError]=useState('')

  useEffect(()=>{
    let active=true
    const load=async()=>{
      setLoading(true);setError('');setNotice('');setDirty(false)
      try{
        let form:SiteFormDefinition|undefined
        if(persisted)form=await getAdminSiteForm(formId)
        else form=listRuntimeSiteForms().find(item=>item.id===formId||item.slug===formId)??formDraftRepository.get(formId)??undefined
        if(active){setSource(form?cloneForm(form):undefined);setDraft(form?cloneForm(form):undefined)}
      }catch(caught){if(active){setSource(undefined);setDraft(undefined);setError(caught instanceof Error?caught.message:'Não foi possível carregar o formulário.')}}
      finally{if(active)setLoading(false)}
    }
    void load()
    return()=>{active=false}
  },[formId,persisted])

  if(loading)return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Carregando formulário',description:'Sincronizando a definição administrativa.'}}><AdminNotice title="Sincronizando" description="Aguarde enquanto o Portal Lander carrega a versão atual do formulário."/></AdminShell>
  if(!source||!draft)return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Formulário não encontrado',description:'O formulário solicitado não existe na fonte administrativa disponível.'}}>{error&&<AdminNotice title="Falha ao carregar" description={error}/>}<Link className="button outline" to="/app/site/formularios"><ArrowLeft size={15}/>Voltar para Formulários</Link></AdminShell>

  const isLocalDraft=!persisted&&source.source==='custom'
  const markDirty=()=>{setDirty(true);setNotice('');setError('')}
  const resetDraft=async()=>{
    setOperation('reset');setError('');setNotice('')
    try{
      let latest:SiteFormDefinition|null|undefined
      if(persisted)latest=await getAdminSiteForm(source.id)
      else latest=isLocalDraft?formDraftRepository.get(source.id):source
      if(latest){setSource(cloneForm(latest));setDraft(cloneForm(latest));setDirty(false)}
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível restaurar a versão salva.')}
    finally{setOperation('')}
  }
  const saveDraft=async()=>{
    setOperation('save');setError('');setNotice('')
    try{
      const next=persisted?await saveAdminSiteForm(source.id,draft):isLocalDraft?formDraftRepository.save({...draft,status:'draft',source:'custom'}):draft
      setSource(cloneForm(next));setDraft(cloneForm(next));setDirty(false)
      setNotice(persisted?'Rascunho persistente salvo. Aparência e estrutura permanecem versionadas sem alterar o runtime público até a publicação.':'Rascunho salvo somente neste navegador.')
      return next
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível salvar o rascunho.');return undefined}
    finally{setOperation('')}
  }
  const publishDraft=async()=>{
    if(!persisted)return
    setOperation('publish');setError('');setNotice('')
    try{
      if(dirty||draft.status!=='draft')await saveAdminSiteForm(source.id,draft)
      const published=await publishAdminSiteForm(source.id)
      setSource(cloneForm(published));setDraft(cloneForm(published));setDirty(false)
      setNotice(`Versão v${published.version} publicada e ativada no runtime do Portal Lander.`)
      try{await bootstrapPublishedSiteForms()}catch{ /* a publicação já foi concluída; o próximo bootstrap recupera a versão */ }
    }catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível publicar o formulário.')}
    finally{setOperation('')}
  }
  const updateField=(id:string,patch:Partial<FormFieldDefinition>)=>{markDirty();setDraft(current=>current&&({...current,fields:current.fields.map(field=>field.id===id?{...field,...patch}:field)}))}
  const moveField=(id:string,direction:-1|1)=>{markDirty();setDraft(current=>{
    if(!current)return current
    const fields=[...current.fields],index=fields.findIndex(field=>field.id===id),target=index+direction
    if(index<0||target<0||target>=fields.length)return current
    ;[fields[index],fields[target]]=[fields[target],fields[index]]
    return {...current,fields:fields.map((field,order)=>({...field,order:order+1}))}
  })}
  const duplicateField=(field:FormFieldDefinition)=>{markDirty();setDraft(current=>current&&({...current,fields:[...current.fields,{...field,id:uid('field'),key:`${field.key}_copia`,label:`${field.label} (cópia)`,order:current.fields.length+1,options:field.options?[...field.options]:undefined}]}))}
  const removeField=(id:string)=>{markDirty();setDraft(current=>current&&({...current,fields:current.fields.filter(field=>field.id!==id).map((field,order)=>({...field,order:order+1}))}))}
  const addField=()=>{markDirty();setDraft(current=>current&&({...current,fields:[...current.fields,{id:uid('field'),key:`campo_${current.fields.length+1}`,label:'Novo campo',type:'text',required:false,placeholder:'',helpText:'',order:current.fields.length+1}]}))}
  const updateConsent=(id:string,patch:Partial<FormConsentDefinition>)=>{markDirty();setDraft(current=>current&&({...current,consents:current.consents.map(consent=>consent.id===id?{...consent,...patch}:consent)}))}
  const addConsent=()=>{markDirty();setDraft(current=>current&&({...current,consents:[...current.consents,{id:uid('consent'),kind:'privacy',label:'Novo consentimento',required:false,version:'1.0',text:''}]}))}
  const removeConsent=(id:string)=>{markDirty();setDraft(current=>current&&({...current,consents:current.consents.filter(consent=>consent.id!==id)}))}
  const changeDestination=(destination:FormDestination)=>{markDirty();setDraft(current=>{
    if(!current)return current
    if(destination==='crm')return {...current,routing:{destination,crm:current.routing.crm??{origin:'formulario_portal',tags:['site','formulario']}}}
    if(destination==='content_collaborations')return {...current,routing:{destination,collaboration:current.routing.collaboration??{defaultStatus:'received',defaultPriority:'normal'}}}
    return {...current,routing:{destination}}
  })}
  const patchDraft=(patch:Partial<SiteFormDefinition>)=>{markDirty();setDraft(current=>current&&({...current,...patch}))}
  const patchAppearance=(appearance:NonNullable<SiteFormDefinition['appearance']>)=>{markDirty();setDraft(current=>current&&({...current,appearance}))}
  const busy=Boolean(operation)
  const canPublish=persisted&&(dirty||draft.status==='draft')

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:draft.name,description:`Definição do formulário do Site · versão ${draft.version}.`}}>
    <div className="site-form-editor">
      <div className="site-form-editor-top"><Link className="button outline" to="/app/site/formularios"><ArrowLeft size={15}/>Formulários</Link><div className="site-form-editor-actions"><button type="button" className="button outline" onClick={()=>void resetDraft()} disabled={busy||!dirty}>Descartar alterações</button><button type="button" className="button outline" onClick={()=>void saveDraft()} disabled={busy||(!persisted&&!isLocalDraft)}><Save size={15}/>{operation==='save'?'Salvando…':'Salvar rascunho'}</button>{persisted&&<button type="button" className="button" onClick={()=>void publishDraft()} disabled={busy||!canPublish}>{operation==='publish'?'Publicando…':'Publicar versão'}</button>}</div></div>
      <AdminNotice title={persisted?'Editor persistente e versionado':isLocalDraft?'Rascunho local editável':'Definição de runtime'} description={persisted?'Alterações estruturais e visuais são salvas na mesma versão de rascunho. Publicar torna essa versão imutável e ativa no runtime público; salvar sozinho nunca altera produção.':isLocalDraft?'Este formulário existe apenas neste navegador. O preview pode ser validado, mas nenhuma publicação é permitida sem uma sessão administrativa real.':'Esta definição vem do runtime público. Sem uma sessão administrativa, ela pode ser visualizada e testada, mas não é gravada no backend.'}/>
      {notice&&<AdminNotice title="Operação concluída" description={notice}/>} 
      {error&&<AdminNotice title="Falha na operação" description={error}/>} 

      <div className="site-form-editor-layout">
        <div className="site-form-editor-main">
          <section className="site-form-card"><header><div><h2>Configurações gerais</h2><p>Identidade, finalidade, destino e estado do formulário.</p></div></header><div className="site-form-grid">
            <label><span>Nome</span><input value={draft.name} onChange={event=>patchDraft({name:event.target.value})}/></label>
            <label><span>Slug</span><input value={draft.slug} onChange={event=>patchDraft({slug:event.target.value})}/></label>
            <label><span>Finalidade</span><select value={draft.purpose} onChange={event=>patchDraft({purpose:event.target.value as FormPurpose})}>{purposeOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>Destino operacional</span><select value={draft.routing.destination} onChange={event=>changeDestination(event.target.value as FormDestination)}>{destinationOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>Status público</span><input value={draft.status==='active'?'Ativo':draft.status==='inactive'?'Inativo':'Rascunho não publicado'} disabled/></label>
            <label><span>Versão atual</span><input value={`v${draft.version}`} disabled/></label>
            <label className="site-form-span-2"><span>Mensagem após envio</span><input value={draft.successMessage} onChange={event=>patchDraft({successMessage:event.target.value})}/></label>
          </div></section>

          <FormAppearanceEditor appearance={draft.appearance} onChange={patchAppearance}/>

          <section className="site-form-card"><header><div><h2>Roteamento</h2><p>Defina para onde cada submissão deve ser encaminhada depois da validação.</p></div></header><div className="site-form-grid">
            {draft.routing.destination==='crm'&&<><label><span>Origem do lead</span><input value={draft.routing.crm?.origin??'formulario_portal'} onChange={event=>{markDirty();setDraft({...draft,routing:{destination:'crm',crm:{...(draft.routing.crm??{origin:'formulario_portal'}),origin:event.target.value}}})}}/></label><label><span>Responsável padrão</span><input value={draft.routing.crm?.responsible??''} onChange={event=>{markDirty();setDraft({...draft,routing:{destination:'crm',crm:{...(draft.routing.crm??{origin:'formulario_portal'}),responsible:event.target.value}}})}} placeholder="Opcional"/></label><label className="site-form-span-2"><span>Tags automáticas</span><input value={(draft.routing.crm?.tags??[]).join(', ')} onChange={event=>{markDirty();setDraft({...draft,routing:{destination:'crm',crm:{...(draft.routing.crm??{origin:'formulario_portal'}),tags:event.target.value.split(',').map(value=>value.trim()).filter(Boolean)}}})}} placeholder="site, formulario, campanha"/></label></>}
            {draft.routing.destination==='content_collaborations'&&<label><span>Prioridade inicial</span><select value={draft.routing.collaboration?.defaultPriority??'normal'} onChange={event=>{markDirty();setDraft({...draft,routing:{destination:'content_collaborations',collaboration:{defaultStatus:'received',defaultPriority:event.target.value as CollaborationPriority}}})}}><option value="low">Baixa</option><option value="normal">Normal</option><option value="high">Alta</option></select></label>}
            {!['crm','content_collaborations'].includes(draft.routing.destination)&&<div className="site-form-routing-note">Este destino ainda não possui regras adicionais específicas. O formulário continuará registrando sua finalidade e destino no contrato de submissão.</div>}
          </div></section>

          <section className="site-form-card"><header><div><h2>Campos</h2><p>Defina conteúdo, tipo, obrigatoriedade e ordem de exibição.</p></div><button type="button" className="button outline" onClick={addField}><Plus size={15}/>Adicionar campo</button></header><div className="site-form-fields">{draft.fields.map((field,index)=><article className="site-form-field" key={field.id}>
            <div className="site-form-field-order"><strong>{index+1}</strong><button type="button" aria-label="Mover campo para cima" disabled={index===0} onClick={()=>moveField(field.id,-1)}><ArrowUp size={14}/></button><button type="button" aria-label="Mover campo para baixo" disabled={index===draft.fields.length-1} onClick={()=>moveField(field.id,1)}><ArrowDown size={14}/></button></div>
            <div className="site-form-field-grid"><label><span>Rótulo</span><input value={field.label} onChange={event=>updateField(field.id,{label:event.target.value})}/></label><label><span>Chave</span><input value={field.key} onChange={event=>updateField(field.id,{key:event.target.value})}/></label><label><span>Tipo</span><select value={field.type} onChange={event=>updateField(field.id,{type:event.target.value as FormFieldType})}>{fieldTypeOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label><span>Placeholder</span><input value={field.placeholder??''} onChange={event=>updateField(field.id,{placeholder:event.target.value})}/></label><label className="site-form-span-2"><span>Texto de ajuda</span><input value={field.helpText??''} onChange={event=>updateField(field.id,{helpText:event.target.value})} placeholder="Orientação opcional exibida junto ao campo"/></label>{(field.type==='select'||field.type==='radio')&&<label className="site-form-span-2"><span>Opções</span><input value={(field.options??[]).join(', ')} onChange={event=>updateField(field.id,{options:event.target.value.split(',').map(value=>value.trim()).filter(Boolean)})} placeholder="Opção 1, Opção 2, Opção 3"/></label>}<label className="site-form-required"><input type="checkbox" checked={field.required} onChange={event=>updateField(field.id,{required:event.target.checked})}/><span>Campo obrigatório</span></label></div>
            <div className="site-form-field-actions"><button type="button" title="Duplicar campo" onClick={()=>duplicateField(field)}><Copy size={15}/></button><button type="button" title="Excluir campo" onClick={()=>removeField(field.id)}><Trash2 size={15}/></button></div>
          </article>)}</div></section>

          <section className="site-form-card"><header><div><h2>Consentimentos</h2><p>Registre textos que precisam ser aceitos e versionados.</p></div><button type="button" className="button outline" onClick={addConsent}><Plus size={15}/>Adicionar consentimento</button></header><div className="site-form-consents">{draft.consents.map(consent=><article key={consent.id} className="site-form-consent"><div className="site-form-field-grid"><label><span>Nome</span><input value={consent.label} onChange={event=>updateConsent(consent.id,{label:event.target.value})}/></label><label><span>Tipo</span><select value={consent.kind} onChange={event=>updateConsent(consent.id,{kind:event.target.value as FormConsentDefinition['kind']})}><option value="privacy">Privacidade</option><option value="marketing">Marketing</option><option value="terms">Termos</option><option value="content_rights">Direitos sobre conteúdo</option></select></label><label><span>Versão</span><input value={consent.version} onChange={event=>updateConsent(consent.id,{version:event.target.value})}/></label><label className="site-form-span-2"><span>Texto apresentado ao usuário</span><textarea rows={3} value={consent.text} onChange={event=>updateConsent(consent.id,{text:event.target.value})}/></label><label className="site-form-required"><input type="checkbox" checked={consent.required} onChange={event=>updateConsent(consent.id,{required:event.target.checked})}/><span>Aceite obrigatório</span></label></div><button type="button" className="site-form-delete" title="Excluir consentimento" onClick={()=>removeConsent(consent.id)}><Trash2 size={15}/></button></article>)}</div></section>

          <section className="site-form-card"><header><div><h2>Resumo de publicação</h2><p>Validação estrutural e visual do rascunho atual.</p></div></header><div className="site-form-summary"><span><b>v{draft.version}</b> versão</span><span><b>{draft.fields.length}</b> campos</span><span><b>{draft.fields.filter(field=>field.required).length}</b> obrigatórios</span><span><b>{draft.consents.length}</b> consentimentos</span><span><b>{draft.routing.destination}</b> destino</span><span><b>{normalizeFormAppearance(draft.appearance).preset}</b> aparência</span></div></section>
        </div>
        <FormPreview form={draft} forceDraft={!persisted&&draft.source==='custom'}/>
      </div>
    </div>
  </AdminShell>
}