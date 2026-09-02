import { AlertTriangle, CheckCircle2, Send, ShieldCheck, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { PublicFooter, PublicHeader } from '../../shared/public/PublicChrome'
import {publicSiteReadModel} from '../../shared/data/publicSiteReadModel'
import type {CollaborationSubmissionType} from '../../shared/data/contracts'
import {submitSiteForm} from '../../features/site-manager/forms/client'
import {getSystemFormBySlug} from '../../features/site-manager/forms/catalog'

type SubmissionType=CollaborationSubmissionType|''
type SubmitState={kind:'idle'|'sending'|'success'|'error';message:string}

export function ColaborePage(){
  const [type,setType]=useState<SubmissionType>('')
  const [typeOpen,setTypeOpen]=useState(false)
  const [fileName,setFileName]=useState('')
  const [submitState,setSubmitState]=useState<SubmitState>({kind:'idle',message:''})
  const fileRef=useRef<HTMLInputElement>(null)
  const submissionTypes=publicSiteReadModel.collaborationTypes()
  const guidelines=publicSiteReadModel.collaborationGuidelines()
  const selectedTypeLabel=submissionTypes.find(item=>item.value===type)?.label
  const formDefinition=getSystemFormBySlug('colabore')

  const submit=async(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    if(!type){setTypeOpen(true);return}
    const form=event.currentTarget
    const data=new FormData(form)
    const payload:Record<string,unknown>={}
    for(const [key,value] of data.entries())if(!(value instanceof File))payload[key]=value
    payload.tipo=type
    const files=fileRef.current?.files?Array.from(fileRef.current.files):[]
    setSubmitState({kind:'sending',message:'Enviando material...'})
    try{
      await submitSiteForm('colabore',{payload,acceptedConsentIds:['collab-rights'],files,source:{page:window.location.pathname,referrer:document.referrer||undefined}})
      setSubmitState({kind:'success',message:formDefinition?.successMessage||'Material recebido para análise editorial.'})
      form.reset();setType('');setFileName('')
    }catch(error){
      setSubmitState({kind:'error',message:error instanceof Error?error.message:'Não foi possível enviar o material.'})
    }
  }

  return <div className="public-page colabore-page">
    <PublicHeader/>
    <main>
      <section className="colabore-hero public-standard-page-hero"><div className="public-shell colabore-hero-grid"><div className="colabore-hero-copy"><span className="colabore-eyebrow">PARTICIPE DO PORTAL</span><h1>SUA HISTÓRIA<br/><em>PODE VIRAR NOTÍCIA.</em></h1><p>Tem uma pauta, vídeo, foto, denúncia, lançamento ou história relevante? Prepare seu material para análise editorial do Portal Lander.</p><div className="colabore-hero-points"><span><ShieldCheck size={17}/> Material sujeito à análise da equipe editorial</span><span><CheckCircle2 size={17}/> Envio não garante publicação</span></div></div></div></section>
      <section className="public-shell colabore-content">
        <div className="colabore-guidelines"><div className="colabore-guidelines-copy"><span>ANTES DE ENVIAR</span><h2>O QUE PROCURAMOS</h2><p>Conteúdo relevante para funk, rap, trap, cultura urbana, entretenimento, bastidores, lançamentos e acontecimentos da cena.</p></div>{guidelines.map(item=><div className="colabore-guideline" key={item.id}><b>{String(item.order).padStart(2,'0')}</b><span>{item.title}</span></div>)}</div>
        <div className="colabore-layout"><form className="colabore-form" onSubmit={submit}>
          {submitState.kind==='error'&&<div className="colabore-success" role="alert"><AlertTriangle size={18}/><div><b>Não foi possível enviar.</b><span>{submitState.message}</span></div></div>}
          {submitState.kind==='success'&&<div className="colabore-success" role="status"><CheckCircle2 size={18}/><div><b>Material recebido.</b><span>{submitState.message}</span></div></div>}
          <div className="colabore-field-grid"><label>Seu nome<input required name="nome" placeholder="Nome completo"/></label><label>E-mail<input required type="email" name="email" placeholder="voce@email.com"/></label><label>WhatsApp <small>(opcional)</small><input name="whatsapp" placeholder="(00) 00000-0000"/></label><label>Cidade / Estado<input name="local" placeholder="Ex.: Rio de Janeiro, RJ"/></label></div>
          <div className="colabore-field-grid colabore-title-type-grid"><label>Título<input required name="titulo" placeholder="Resuma o assunto em uma frase"/></label><label>Assunto / Tipo de conteúdo<div className={`colabore-type-select${typeOpen?' open':''}`}><button type="button" className={`colabore-type-trigger${type?' has-value':''}`} aria-haspopup="listbox" aria-expanded={typeOpen} onClick={()=>setTypeOpen(open=>!open)}><span>{selectedTypeLabel||'Selecione o tipo de conteúdo'}</span><i aria-hidden="true"/></button>{typeOpen&&<div className="colabore-type-menu" role="listbox" aria-label="Assunto / Tipo de conteúdo">{submissionTypes.map(item=><button key={item.value} type="button" role="option" aria-selected={type===item.value} className={type===item.value?'selected':''} onClick={()=>{setType(item.value);setTypeOpen(false)}}>{item.label}</button>)}</div>}<input type="hidden" name="tipo" value={type}/></div></label></div>
          <label>Conte a história<textarea required name="mensagem" rows={7} placeholder="Explique o que aconteceu, quem está envolvido, quando, onde e por que isso é relevante."/></label>
          <label>Fonte ou link de referência <small>(opcional)</small><input type="url" name="fonte" placeholder="https://"/></label>
          <div className="colabore-upload" onClick={()=>fileRef.current?.click()} role="button" tabIndex={0} onKeyDown={event=>{if(event.key==='Enter'||event.key===' ')fileRef.current?.click()}}><Upload size={22}/><div><b>{fileName||'Anexar arquivo'}</b><span>Imagem, vídeo ou documento de apoio.</span></div><button type="button">SELECIONAR</button><input ref={fileRef} hidden type="file" name="arquivo" accept="image/*,video/*,.pdf,.doc,.docx" onChange={event=>setFileName(event.target.files?.[0]?.name||'')}/></div>
          <label className="colabore-consent"><input required type="checkbox" name="consentimento" value="aceito"/><span>{formDefinition?.consents[0]?.text||'Confirmo que as informações preparadas são verdadeiras e que possuo autorização para compartilhar os materiais anexados quando necessário.'}</span></label>
          <button className="colabore-submit" type="submit" disabled={submitState.kind==='sending'}><Send size={17}/> {submitState.kind==='sending'?'ENVIANDO...':'ENVIAR MATERIAL'}</button>
          <p className="colabore-note">Os materiais enviados são encaminhados ao fluxo editorial de Colaborações recebidas e não são convertidos automaticamente em Leads do CRM.</p>
        </form></div>
      </section>
    </main>
    <PublicFooter/>
  </div>
}
