import {CheckCircle2,Send,Upload} from 'lucide-react'
import {useMemo,useState} from 'react'
import type {FormFieldDefinition,SiteFormDefinition} from './domain'

export type SiteFormOption={value:string;label:string}
export type SiteFormOptionSets=Record<string,readonly SiteFormOption[]>
export type SiteFormSubmitPayload={payload:Record<string,unknown>;acceptedConsentIds:string[];files:File[]}

type RendererState={kind:'idle'|'sending'|'success'|'error';message:string}

type SiteFormRendererProps={
  form:SiteFormDefinition
  mode:'preview'|'public'
  optionSets?:SiteFormOptionSets
  onSubmit?:(value:SiteFormSubmitPayload)=>Promise<string|void>|string|void
  submitLabel?:string
  note?:string
}

const isCompactField=(field:FormFieldDefinition)=>!['hidden','textarea','file','checkbox','radio'].includes(field.type)

export function SiteFormRenderer({form,mode,optionSets={},onSubmit,submitLabel='Enviar',note}:SiteFormRendererProps){
  const ordered=useMemo(()=>[...form.fields].sort((a,b)=>a.order-b.order),[form.fields])
  const compact=ordered.filter(isCompactField)
  const expanded=ordered.filter(field=>!isCompactField(field)&&field.type!=='hidden')
  const [selectValues,setSelectValues]=useState<Record<string,string>>({})
  const [openSelect,setOpenSelect]=useState<string|null>(null)
  const [fileNames,setFileNames]=useState<Record<string,string>>({})
  const [state,setState]=useState<RendererState>({kind:'idle',message:''})

  const optionsFor=(field:FormFieldDefinition):readonly SiteFormOption[]=>optionSets[field.key]??(field.options??[]).map(value=>({value,label:value}))
  const selectedLabel=(field:FormFieldDefinition)=>optionsFor(field).find(option=>option.value===selectValues[field.key])?.label

  const submit=async(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    if(mode==='preview'||!onSubmit)return
    const formElement=event.currentTarget
    const data=new FormData(formElement)
    const payload:Record<string,unknown>={}
    const files:File[]=[]
    const acceptedConsentIds:string[]=[]

    for(const field of ordered){
      if(field.type==='file'){
        for(const value of data.getAll(field.key))if(value instanceof File&&value.size>0)files.push(value)
        continue
      }
      if(field.type==='checkbox')payload[field.key]=data.has(field.key)
      else if(field.type==='radio')payload[field.key]=String(data.get(field.key)??'')
      else payload[field.key]=String(data.get(field.key)??'')
    }
    for(const consent of form.consents)if(data.has(`consent:${consent.id}`))acceptedConsentIds.push(consent.id)

    const missingSelect=ordered.find(field=>field.required&&field.type==='select'&&!String(payload[field.key]??'').trim())
    if(missingSelect){setState({kind:'error',message:`Preencha o campo obrigatório: ${missingSelect.label}.`});return}

    setState({kind:'sending',message:'Enviando...'})
    try{
      const message=await onSubmit({payload,acceptedConsentIds,files})
      setState({kind:'success',message:message||form.successMessage})
      formElement.reset();setSelectValues({});setFileNames({});setOpenSelect(null)
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

  return <form className={`colabore-form site-form-runtime site-form-runtime-${form.purpose}${mode==='preview'?' is-preview':''}`} onSubmit={submit}>
    {state.kind==='error'&&<div className="colabore-success" role="alert"><div><b>Não foi possível enviar.</b><span>{state.message}</span></div></div>}
    {state.kind==='success'&&<div className="colabore-success" role="status"><CheckCircle2 size={18}/><div><b>Formulário enviado.</b><span>{state.message}</span></div></div>}
    {compact.length>0&&<div className="colabore-field-grid">{compact.map(renderCompact)}</div>}
    {expanded.map(renderExpanded)}
    {form.consents.map(consent=><label className="colabore-consent" key={consent.id}><input required={consent.required} type="checkbox" name={`consent:${consent.id}`}/><span>{consent.text||consent.label}</span></label>)}
    <button className="colabore-submit" type="submit" disabled={state.kind==='sending'||mode==='preview'}><Send size={17}/> {mode==='preview'?submitLabel.toUpperCase():state.kind==='sending'?'ENVIANDO...':submitLabel.toUpperCase()}</button>
    {mode==='preview'&&<p className="site-form-preview-success">Após o envio: {form.successMessage||'Nenhuma mensagem configurada.'}</p>}
    {note&&<p className="colabore-note">{note}</p>}
  </form>
}
