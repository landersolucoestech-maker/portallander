import {ArrowDown,ArrowLeft,ArrowUp,Copy,Plus,Save,Trash2} from 'lucide-react'
import {useMemo,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {siteFormRegistry} from '../forms/catalog'
import {formDraftRepository} from '../forms/draftRepository'
import type {CollaborationPriority,FormConsentDefinition,FormDestination,FormFieldDefinition,FormFieldType,FormPurpose,FormStatus,SiteFormDefinition} from '../forms/domain'
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
const statusOptions:readonly [FormStatus,string][]=[['draft','Rascunho'],['active','Ativo'],['inactive','Inativo']]

const cloneForm=(form:SiteFormDefinition):SiteFormDefinition=>({
  ...form,
  fields:form.fields.map(field=>({...field,options:field.options?[...field.options]:undefined})),
  consents:form.consents.map(consent=>({...consent})),
  routing:{...form.routing,crm:form.routing.crm?{...form.routing.crm,tags:form.routing.crm.tags?[...form.routing.crm.tags]:undefined}:undefined,collaboration:form.routing.collaboration?{...form.routing.collaboration}:undefined},
})
const uid=(prefix:string)=>`${prefix}-${crypto.randomUUID()}`

function PreviewField({field}:{field:FormFieldDefinition}){
  if(field.type==='hidden')return null
  const required=field.required?<b aria-label="obrigatório"> *</b>:null
  if(field.type==='textarea')return <label className="site-form-preview-field"><span>{field.label}{required}</span><textarea rows={4} placeholder={field.placeholder||''} readOnly/></label>
  if(field.type==='select')return <label className="site-form-preview-field"><span>{field.label}{required}</span><select defaultValue=""><option value="" disabled>{field.placeholder||'Selecione uma opção'}</option>{(field.options??[]).map(option=><option key={option}>{option}</option>)}</select></label>
  if(field.type==='radio')return <fieldset className="site-form-preview-choice"><legend>{field.label}{required}</legend>{(field.options??[]).map(option=><label key={option}><input type="radio" name={`preview-${field.id}`}/><span>{option}</span></label>)}</fieldset>
  if(field.type==='checkbox')return <label className="site-form-preview-checkbox"><input type="checkbox"/><span>{field.label}{required}</span></label>
  if(field.type==='file')return <label className="site-form-preview-field"><span>{field.label}{required}</span><input type="file" disabled/></label>
  return <label className="site-form-preview-field"><span>{field.label}{required}</span><input type={field.type} placeholder={field.placeholder||''} readOnly/>{field.helpText&&<small>{field.helpText}</small>}</label>
}

function FormPreview({form}:{form:SiteFormDefinition}){
  const visibleFields=[...form.fields].sort((a,b)=>a.order-b.order).filter(field=>field.type!=='hidden')
  return <aside className="site-form-preview-panel" aria-label="Preview do formulário em tempo real">
    <div className="site-form-preview-sticky">
      <header><span>PREVIEW EM TEMPO REAL</span><h2>{form.name||'Formulário sem nome'}</h2><p>Visualização da experiência pública. Alterações feitas no editor aparecem aqui imediatamente.</p></header>
      <div className="site-form-preview-meta"><span className={`status ${form.status}`}>{form.status==='active'?'Ativo':form.status==='draft'?'Rascunho':'Inativo'}</span><small>/{form.slug||'slug-do-formulario'}</small></div>
      <form className="site-form-public-preview" onSubmit={event=>event.preventDefault()}>
        {visibleFields.length?visibleFields.map(field=><PreviewField key={field.id} field={field}/>):<div className="site-form-preview-empty">Adicione campos para visualizar o formulário.</div>}
        {form.consents.map(consent=><label className="site-form-preview-consent" key={consent.id}><input type="checkbox"/><span>{consent.text||consent.label}{consent.required?<b> *</b>:null}</span></label>)}
        <button type="submit">Enviar</button>
        <p className="site-form-preview-success">Após o envio: {form.successMessage||'Nenhuma mensagem configurada.'}</p>
      </form>
    </div>
  </aside>
}

export function SiteFormEditorPage(){
  const {formId=''}=useParams()
  const source=useMemo(()=>siteFormRegistry.find(form=>form.id===formId||form.slug===formId)??formDraftRepository.get(formId),[formId])
  const [draft,setDraft]=useState<SiteFormDefinition|undefined>(()=>source?cloneForm(source):undefined)
  const [saved,setSaved]=useState(false)
  if(!source||!draft)return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Formulário não encontrado',description:'O formulário solicitado não existe no registro do Site nem nos rascunhos locais.'}}><Link className="button outline" to="/app/site/formularios"><ArrowLeft size={15}/>Voltar para Formulários</Link></AdminShell>

  const isLocalDraft=source.source==='custom'
  const resetDraft=()=>{const latest=isLocalDraft?formDraftRepository.get(source.id):source;if(latest)setDraft(cloneForm(latest));setSaved(false)}
  const saveLocalDraft=()=>{if(!isLocalDraft)return;const next=formDraftRepository.save({...draft,status:'draft',source:'custom'});setDraft(cloneForm(next));setSaved(true)}
  const updateField=(id:string,patch:Partial<FormFieldDefinition>)=>{setSaved(false);setDraft(current=>current&&({...current,fields:current.fields.map(field=>field.id===id?{...field,...patch}:field)}))}
  const moveField=(id:string,direction:-1|1)=>{setSaved(false);setDraft(current=>{
    if(!current)return current
    const fields=[...current.fields],index=fields.findIndex(field=>field.id===id),target=index+direction
    if(index<0||target<0||target>=fields.length)return current
    ;[fields[index],fields[target]]=[fields[target],fields[index]]
    return {...current,fields:fields.map((field,order)=>({...field,order:order+1}))}
  })}
  const duplicateField=(field:FormFieldDefinition)=>{setSaved(false);setDraft(current=>current&&({...current,fields:[...current.fields,{...field,id:uid('field'),key:`${field.key}_copia`,label:`${field.label} (cópia)`,order:current.fields.length+1,options:field.options?[...field.options]:undefined}]}))}
  const removeField=(id:string)=>{setSaved(false);setDraft(current=>current&&({...current,fields:current.fields.filter(field=>field.id!==id).map((field,order)=>({...field,order:order+1}))}))}
  const addField=()=>{setSaved(false);setDraft(current=>current&&({...current,fields:[...current.fields,{id:uid('field'),key:`campo_${current.fields.length+1}`,label:'Novo campo',type:'text',required:false,placeholder:'',helpText:'',order:current.fields.length+1}]}))}
  const updateConsent=(id:string,patch:Partial<FormConsentDefinition>)=>{setSaved(false);setDraft(current=>current&&({...current,consents:current.consents.map(consent=>consent.id===id?{...consent,...patch}:consent)}))}
  const addConsent=()=>{setSaved(false);setDraft(current=>current&&({...current,consents:[...current.consents,{id:uid('consent'),kind:'privacy',label:'Novo consentimento',required:false,version:'1.0',text:''}]}))}
  const removeConsent=(id:string)=>{setSaved(false);setDraft(current=>current&&({...current,consents:current.consents.filter(consent=>consent.id!==id)}))}
  const changeDestination=(destination:FormDestination)=>{setSaved(false);setDraft(current=>{
    if(!current)return current
    if(destination==='crm')return {...current,routing:{destination,crm:current.routing.crm??{origin:'formulario_portal',tags:['site','formulario']}}}
    if(destination==='content_collaborations')return {...current,routing:{destination,collaboration:current.routing.collaboration??{defaultStatus:'received',defaultPriority:'normal'}}}
    return {...current,routing:{destination}}
  })}
  const patchDraft=(patch:Partial<SiteFormDefinition>)=>{setSaved(false);setDraft(current=>current&&({...current,...patch}))}

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:draft.name,description:`Definição do formulário do Site · versão ${draft.version}.`}}>
    <div className="site-form-editor">
      <div className="site-form-editor-top"><Link className="button outline" to="/app/site/formularios"><ArrowLeft size={15}/>Formulários</Link><div className="site-form-editor-actions"><button type="button" className="button outline" onClick={resetDraft}>Descartar alterações</button>{isLocalDraft?<button type="button" className="button" onClick={saveLocalDraft}><Save size={15}/>Salvar rascunho</button>:<button type="button" className="button" disabled title="Formulários do sistema dependem da persistência compartilhada do Portal Lander"><Save size={15}/>Salvar alterações</button>}</div></div>
      {isLocalDraft?<AdminNotice title="Rascunho local editável" description="Este formulário pode ser salvo como rascunho neste navegador e validado no preview em tempo real. Ele não entra no site público nem no endpoint de submissão até existir publicação persistente no backend."/>:<AdminNotice title="Formulário do sistema" description="Você pode testar alterações no preview, mas a gravação deste formulário permanece bloqueada até existir persistência compartilhada. Para criar uma versão editável sem afetar produção, duplique-o na lista de Formulários."/>}
      {saved&&<AdminNotice title="Rascunho salvo" description="As alterações administrativas deste rascunho foram salvas localmente. Nenhuma publicação pública foi realizada."/>}

      <div className="site-form-editor-layout">
        <div className="site-form-editor-main">
          <section className="site-form-card"><header><div><h2>Configurações gerais</h2><p>Identidade, finalidade, destino e estado do formulário.</p></div></header><div className="site-form-grid">
            <label><span>Nome</span><input value={draft.name} onChange={event=>patchDraft({name:event.target.value})}/></label>
            <label><span>Slug</span><input value={draft.slug} onChange={event=>patchDraft({slug:event.target.value})}/></label>
            <label><span>Finalidade</span><select value={draft.purpose} onChange={event=>patchDraft({purpose:event.target.value as FormPurpose})}>{purposeOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>Destino operacional</span><select value={draft.routing.destination} onChange={event=>changeDestination(event.target.value as FormDestination)}>{destinationOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>Status</span><select value={isLocalDraft?'draft':draft.status} disabled={isLocalDraft} onChange={event=>patchDraft({status:event.target.value as FormStatus})}>{statusOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>Versão atual</span><input value={`v${draft.version}`} disabled/></label>
            <label className="site-form-span-2"><span>Mensagem após envio</span><input value={draft.successMessage} onChange={event=>patchDraft({successMessage:event.target.value})}/></label>
          </div></section>

          <section className="site-form-card"><header><div><h2>Roteamento</h2><p>Defina para onde cada submissão deve ser encaminhada depois da validação.</p></div></header><div className="site-form-grid">
            {draft.routing.destination==='crm'&&<><label><span>Origem do lead</span><input value={draft.routing.crm?.origin??'formulario_portal'} onChange={event=>{setSaved(false);setDraft({...draft,routing:{destination:'crm',crm:{...(draft.routing.crm??{origin:'formulario_portal'}),origin:event.target.value}}})}}/></label><label><span>Responsável padrão</span><input value={draft.routing.crm?.responsible??''} onChange={event=>{setSaved(false);setDraft({...draft,routing:{destination:'crm',crm:{...(draft.routing.crm??{origin:'formulario_portal'}),responsible:event.target.value}}})}} placeholder="Opcional"/></label><label className="site-form-span-2"><span>Tags automáticas</span><input value={(draft.routing.crm?.tags??[]).join(', ')} onChange={event=>{setSaved(false);setDraft({...draft,routing:{destination:'crm',crm:{...(draft.routing.crm??{origin:'formulario_portal'}),tags:event.target.value.split(',').map(value=>value.trim()).filter(Boolean)}}})}} placeholder="site, formulario, campanha"/></label></>}
            {draft.routing.destination==='content_collaborations'&&<label><span>Prioridade inicial</span><select value={draft.routing.collaboration?.defaultPriority??'normal'} onChange={event=>{setSaved(false);setDraft({...draft,routing:{destination:'content_collaborations',collaboration:{defaultStatus:'received',defaultPriority:event.target.value as CollaborationPriority}}})}}><option value="low">Baixa</option><option value="normal">Normal</option><option value="high">Alta</option></select></label>}
            {!['crm','content_collaborations'].includes(draft.routing.destination)&&<div className="site-form-routing-note">Este destino ainda não possui regras adicionais específicas. O formulário continuará registrando sua finalidade e destino no contrato de submissão.</div>}
          </div></section>

          <section className="site-form-card"><header><div><h2>Campos</h2><p>Defina conteúdo, tipo, obrigatoriedade e ordem de exibição.</p></div><button type="button" className="button outline" onClick={addField}><Plus size={15}/>Adicionar campo</button></header><div className="site-form-fields">{draft.fields.map((field,index)=><article className="site-form-field" key={field.id}>
            <div className="site-form-field-order"><strong>{index+1}</strong><button type="button" aria-label="Mover campo para cima" disabled={index===0} onClick={()=>moveField(field.id,-1)}><ArrowUp size={14}/></button><button type="button" aria-label="Mover campo para baixo" disabled={index===draft.fields.length-1} onClick={()=>moveField(field.id,1)}><ArrowDown size={14}/></button></div>
            <div className="site-form-field-grid"><label><span>Rótulo</span><input value={field.label} onChange={event=>updateField(field.id,{label:event.target.value})}/></label><label><span>Chave</span><input value={field.key} onChange={event=>updateField(field.id,{key:event.target.value})}/></label><label><span>Tipo</span><select value={field.type} onChange={event=>updateField(field.id,{type:event.target.value as FormFieldType})}>{fieldTypeOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label><span>Placeholder</span><input value={field.placeholder??''} onChange={event=>updateField(field.id,{placeholder:event.target.value})}/></label><label className="site-form-span-2"><span>Texto de ajuda</span><input value={field.helpText??''} onChange={event=>updateField(field.id,{helpText:event.target.value})} placeholder="Orientação opcional exibida junto ao campo"/></label>{(field.type==='select'||field.type==='radio')&&<label className="site-form-span-2"><span>Opções</span><input value={(field.options??[]).join(', ')} onChange={event=>updateField(field.id,{options:event.target.value.split(',').map(value=>value.trim()).filter(Boolean)})} placeholder="Opção 1, Opção 2, Opção 3"/></label>}<label className="site-form-required"><input type="checkbox" checked={field.required} onChange={event=>updateField(field.id,{required:event.target.checked})}/><span>Campo obrigatório</span></label></div>
            <div className="site-form-field-actions"><button type="button" title="Duplicar campo" onClick={()=>duplicateField(field)}><Copy size={15}/></button><button type="button" title="Excluir campo" onClick={()=>removeField(field.id)}><Trash2 size={15}/></button></div>
          </article>)}</div></section>

          <section className="site-form-card"><header><div><h2>Consentimentos</h2><p>Registre textos que precisam ser aceitos e versionados.</p></div><button type="button" className="button outline" onClick={addConsent}><Plus size={15}/>Adicionar consentimento</button></header><div className="site-form-consents">{draft.consents.map(consent=><article key={consent.id} className="site-form-consent"><div className="site-form-field-grid"><label><span>Nome</span><input value={consent.label} onChange={event=>updateConsent(consent.id,{label:event.target.value})}/></label><label><span>Tipo</span><select value={consent.kind} onChange={event=>updateConsent(consent.id,{kind:event.target.value as FormConsentDefinition['kind']})}><option value="privacy">Privacidade</option><option value="marketing">Marketing</option><option value="terms">Termos</option><option value="content_rights">Direitos sobre conteúdo</option></select></label><label><span>Versão</span><input value={consent.version} onChange={event=>updateConsent(consent.id,{version:event.target.value})}/></label><label className="site-form-span-2"><span>Texto apresentado ao usuário</span><textarea rows={3} value={consent.text} onChange={event=>updateConsent(consent.id,{text:event.target.value})}/></label><label className="site-form-required"><input type="checkbox" checked={consent.required} onChange={event=>updateConsent(consent.id,{required:event.target.checked})}/><span>Aceite obrigatório</span></label></div><button type="button" className="site-form-delete" title="Excluir consentimento" onClick={()=>removeConsent(consent.id)}><Trash2 size={15}/></button></article>)}</div></section>

          <section className="site-form-card"><header><div><h2>Resumo de publicação</h2><p>Validação estrutural do rascunho atual.</p></div></header><div className="site-form-summary"><span><b>v{draft.version}</b> versão</span><span><b>{draft.fields.length}</b> campos</span><span><b>{draft.fields.filter(field=>field.required).length}</b> obrigatórios</span><span><b>{draft.consents.length}</b> consentimentos</span><span><b>{draft.routing.destination}</b> destino</span></div></section>
        </div>
        <FormPreview form={isLocalDraft?{...draft,status:'draft'}:draft}/>
      </div>
    </div>
  </AdminShell>
}
