import {CheckCircle2,Send,Upload} from 'lucide-react'
import {useEffect,useMemo,useRef,useState,type CSSProperties,type FormEvent} from 'react'
import {normalizeFormAppearance} from './appearance'
import type {FormAppearance,FormFieldDefinition,SiteFormDefinition} from './domain'
import './site-form-appearance.css'

export type SiteFormOption={value:string;label:string}
export type SiteFormOptionSets=Record<string,readonly SiteFormOption[]>
export type SiteFormFile={fieldKey:string;file:File}
export type SiteFormSubmitPayload={payload:Record<string,unknown>;acceptedConsentIds:string[];files:SiteFormFile[];antiSpam:{honeypot:string;startedAt:number}}

type RendererState={kind:'idle'|'sending'|'success'|'error';message:string}
type FieldBlock={kind:'compact';fields:FormFieldDefinition[]}|{kind:'expanded';field:FormFieldDefinition}

type SiteFormRendererProps={
  form:SiteFormDefinition
  mode:'preview'|'public'
  optionSets?:SiteFormOptionSets
  onSubmit?:(value:SiteFormSubmitPayload)=>Promise<string|void>|string|void
  submitLabel?:string
  note?:string
}

const isCompactField=(field:FormFieldDefinition)=>!['hidden','textarea','file','checkbox','radio'].includes(field.type)

function buildFieldBlocks(fields:readonly FormFieldDefinition[]):FieldBlock[]{
  const blocks:FieldBlock[]=[]
  for(const field of [...fields].sort((a,b)=>a.order-b.order)){
    if(field.type==='hidden')continue
    if(isCompactField(field)){
      const last=blocks.at(-1)
      if(last?.kind==='compact')last.fields.push(field)
      else blocks.push({kind:'compact',fields:[field]})
    }else blocks.push({kind:'expanded',field})
  }
  return blocks
}

function appearanceStyle(appearance:FormAppearance):CSSProperties{
  const shadow=appearance.container.shadow==='strong'?'0 24px 70px rgba(0,0,0,.18)':appearance.container.shadow==='soft'?'0 14px 40px rgba(0,0,0,.08)':'none'
  const font=appearance.typography.font==='montserrat'?"'Montserrat',system-ui,sans-serif":"system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
  return {
    '--form-container-width':`${appearance.container.width}%`,'--form-container-max':`${appearance.container.maxWidth}px`,'--form-container-padding':`${appearance.container.padding}px`,'--form-container-bg':appearance.container.background,'--form-container-border-style':appearance.container.border,'--form-container-border-color':appearance.container.borderColor,'--form-container-border-width':`${appearance.container.borderWidth}px`,'--form-container-radius':`${appearance.container.borderRadius}px`,'--form-container-shadow':shadow,
    '--form-columns':String(appearance.layout.columns),'--form-column-gap':`${appearance.layout.columnGap}px`,'--form-row-gap':`${appearance.layout.rowGap}px`,'--form-font-family':font,
    '--form-label-size':`${appearance.typography.labelSize}px`,'--form-label-weight':String(appearance.typography.labelWeight),'--form-label-color':appearance.typography.labelColor,'--form-help-size':`${appearance.typography.helpSize}px`,'--form-help-color':appearance.typography.helpColor,
    '--form-field-height':`${appearance.fields.height}px`,'--form-field-bg':appearance.fields.background,'--form-field-text':appearance.fields.textColor,'--form-field-placeholder':appearance.fields.placeholderColor,'--form-field-border-color':appearance.fields.borderColor,'--form-field-border-width':`${appearance.fields.borderWidth}px`,'--form-field-radius':`${appearance.fields.borderRadius}px`,'--form-field-padding-x':`${appearance.fields.paddingX}px`,'--form-focus-color':appearance.fields.focusColor,'--form-focus-ring':`${appearance.fields.focusRing}px`,
    '--form-textarea-min':`${appearance.textarea.minHeight}px`,'--form-textarea-resize':appearance.textarea.resize,
    '--form-button-height':`${appearance.button.height}px`,'--form-button-width':appearance.button.width==='full'?'100%':'auto','--form-button-bg':appearance.button.background,'--form-button-fg':appearance.button.foreground,'--form-button-border-color':appearance.button.borderColor,'--form-button-border-width':`${appearance.button.borderWidth}px`,'--form-button-radius':`${appearance.button.borderRadius}px`,'--form-button-size':`${appearance.button.fontSize}px`,'--form-button-weight':String(appearance.button.fontWeight),'--form-button-hover':appearance.button.hoverBackground,
    '--form-consent-color':appearance.consents.color,'--form-consent-gap':`${appearance.consents.gap}px`,'--form-consent-size':`${appearance.consents.fontSize}px`,
    '--form-upload-bg':appearance.upload.background,'--form-upload-border-color':appearance.upload.borderColor,'--form-upload-border-width':`${appearance.upload.borderWidth}px`,'--form-upload-radius':`${appearance.upload.borderRadius}px`,'--form-upload-fg':appearance.upload.foreground,
    '--form-success-bg':appearance.states.successBackground,'--form-success-fg':appearance.states.successForeground,'--form-error-bg':appearance.states.errorBackground,'--form-error-fg':appearance.states.errorForeground,'--form-state-border':appearance.states.borderColor,'--form-state-radius':`${appearance.states.borderRadius}px`,
  } as CSSProperties
}

export function SiteFormRenderer({form,mode,optionSets={},onSubmit,submitLabel='Enviar',note}:SiteFormRendererProps){
  const ordered=useMemo(()=>[...form.fields].sort((a,b)=>a.order-b.order),[form.fields])
  const blocks=useMemo(()=>buildFieldBlocks(form.fields),[form.fields])
  const appearance=useMemo(()=>normalizeFormAppearance(form.appearance),[form.appearance])
  const startedAt=useRef(0)
  const [selectValues,setSelectValues]=useState<Record<string,string>>({})
  const [openSelect,setOpenSelect]=useState<string|null>(null)
  const [fileNames,setFileNames]=useState<Record<string,string>>({})
  const [state,setState]=useState<RendererState>({kind:'idle',message:''})

  useEffect(()=>{startedAt.current=Date.now()},[])

  const optionsFor=(field:FormFieldDefinition):readonly SiteFormOption[]=>optionSets[field.key]??(field.options??[]).map(value=>({value,label:value}))
  const selectedLabel=(field:FormFieldDefinition)=>optionsFor(field).find(option=>option.value===selectValues[field.key])?.label

  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    if(mode==='preview'||!onSubmit)return
    const formElement=event.currentTarget
    const data=new FormData(formElement)
    const payload:Record<string,unknown>={}
    const files:SiteFormFile[]=[]
    const acceptedConsentIds:string[]=[]

    for(const field of ordered){
      if(field.type==='file'){
        for(const value of data.getAll(field.key))if(value instanceof File&&value.size>0)files.push({fieldKey:field.key,file:value})
        continue
      }
      if(field.type==='checkbox')payload[field.key]=data.has(field.key)
      else payload[field.key]=String(data.get(field.key)??'')
    }
    for(const consent of form.consents)if(data.has(`consent:${consent.id}`))acceptedConsentIds.push(consent.id)

    const missingSelect=ordered.find(field=>field.required&&field.type==='select'&&!String(payload[field.key]??'').trim())
    if(missingSelect){setState({kind:'error',message:`Preencha o campo obrigatório: ${missingSelect.label}.`});return}

    setState({kind:'sending',message:'Enviando...'})
    try{
      const message=await onSubmit({payload,acceptedConsentIds,files,antiSpam:{honeypot:String(data.get('_portal_hp')??''),startedAt:startedAt.current}})
      setState({kind:'success',message:message||form.successMessage})
      formElement.reset();setSelectValues({});setFileNames({});setOpenSelect(null);startedAt.current=Date.now()
    }catch(error){setState({kind:'error',message:error instanceof Error?error.message:'Não foi possível enviar o formulário.'})}
  }

  const renderCompact=(field:FormFieldDefinition)=>{
    if(field.type==='select'){
      const options=optionsFor(field),value=selectValues[field.key]??''
      return <label key={field.id}>{field.label}{!field.required&&<small> (opcional)</small>}<div className={`colabore-type-select${openSelect===field.id?' open':''}`}><button type="button" className={`colabore-type-trigger${value?' has-value':''}`} aria-haspopup="listbox" aria-expanded={openSelect===field.id} onClick={()=>setOpenSelect(current=>current===field.id?null:field.id)}><span>{selectedLabel(field)||field.placeholder||'Selecione uma opção'}</span><i aria-hidden="true"/></button>{openSelect===field.id&&<div className="colabore-type-menu" role="listbox" aria-label={field.label}>{options.map(option=><button key={option.value} type="button" role="option" aria-selected={value===option.value} className={value===option.value?'selected':''} onClick={()=>{setSelectValues(current=>({...current,[field.key]:option.value}));setOpenSelect(null)}}>{option.label}</button>)}</div>}<input type="hidden" name={field.key} value={value}/></div>{field.helpText&&<small>{field.helpText}</small>}</label>
    }
    return <label key={field.id}>{field.label}{!field.required&&<small> (opcional)</small>}<input required={field.required} type={field.type} name={field.key} placeholder={field.placeholder||''}/>{field.helpText&&<small>{field.helpText}</small>}</label>
  }

  const renderExpanded=(field:FormFieldDefinition)=>{
    if(field.type==='textarea')return <label key={field.id}>{field.label}{!field.required&&<small> (opcional)</small>}<textarea required={field.required} name={field.key} rows={7} placeholder={field.placeholder||''}/>{field.helpText&&<small>{field.helpText}</small>}</label>
    if(field.type==='file')return <label className="colabore-upload" key={field.id}><Upload size={22}/><div><b>{fileNames[field.key]||field.label}</b><span>{field.helpText||'Selecione um arquivo.'}</span></div><button type="button" onClick={event=>{event.preventDefault();const input=event.currentTarget.parentElement?.querySelector<HTMLInputElement>('input[type="file"]');input?.click()}}>SELECIONAR</button><input hidden required={field.required} type="file" name={field.key} onChange={event=>setFileNames(current=>({...current,[field.key]:event.target.files?.[0]?.name||''}))}/></label>
    if(field.type==='radio')return <fieldset className="site-form-runtime-options" key={field.id}><legend>{field.label}{field.required?' *':''}</legend>{optionsFor(field).map(option=><label key={option.value}><input required={field.required} type="radio" name={field.key} value={option.value}/><span>{option.label}</span></label>)}</fieldset>
    return <label className="colabore-consent" key={field.id}><input required={field.required} type="checkbox" name={field.key}/><span>{field.label}{field.helpText?` — ${field.helpText}`:''}</span></label>
  }

  const buttonText=(appearance.button.text.trim()||submitLabel).toUpperCase()
  return <form className={`colabore-form site-form-runtime site-form-appearance site-form-runtime-${form.purpose} site-form-collapse-${appearance.layout.responsiveCollapseAt}${mode==='preview'?' is-preview':''}`} data-form-align={appearance.container.align} data-form-shadow={appearance.container.shadow} data-button-align={appearance.button.align} style={appearanceStyle(appearance)} onSubmit={submit}>
    <div aria-hidden="true" style={{position:'absolute',left:'-10000px',width:1,height:1,overflow:'hidden'}}><label>Deixe este campo vazio<input name="_portal_hp" tabIndex={-1} autoComplete="off"/></label></div>
    {state.kind==='error'&&<div className="colabore-success is-error" role="alert"><div><b>Não foi possível enviar.</b><span>{state.message}</span></div></div>}
    {state.kind==='success'&&<div className="colabore-success is-success" role="status"><CheckCircle2 size={18}/><div><b>Formulário enviado.</b><span>{state.message}</span></div></div>}
    {blocks.map((block,index)=>block.kind==='compact'?<div className="colabore-field-grid" key={`compact-${index}`}>{block.fields.map(renderCompact)}</div>:renderExpanded(block.field))}
    {form.consents.map(consent=><label className="colabore-consent" key={consent.id}><input required={consent.required} type="checkbox" name={`consent:${consent.id}`}/><span>{consent.text||consent.label}</span></label>)}
    <button className="colabore-submit" type="submit" disabled={state.kind==='sending'||mode==='preview'} style={{outlineColor:appearance.button.focusColor}}><Send size={17}/> {mode==='preview'?buttonText:state.kind==='sending'?'ENVIANDO...':buttonText}</button>
    {mode==='preview'&&<p className="site-form-preview-success">Após o envio: {form.successMessage||'Nenhuma mensagem configurada.'}</p>}
    {note&&<p className="colabore-note">{note}</p>}
  </form>
}
