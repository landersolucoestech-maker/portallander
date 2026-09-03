import {Monitor,Save,Smartphone,Tablet} from 'lucide-react'
import type {ReactNode} from 'react'
import type {SectionHeroViewport} from '../sectionConfiguration'

export type SectionEditorTabId='content'|'appearance'|'behavior'

export function SectionEditorField({label,children,hint,className}:{label:string;children:ReactNode;hint?:string;className?:string}){
  return <label className={`section-config-field${className?` ${className}`:''}`}><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>
}

export function SectionEditorTabButton({active,label,onClick}:{active:boolean;label:string;onClick:()=>void}){
  return <button type="button" className={`section-editor-tab${active?' active':''}`} aria-pressed={active} onClick={onClick}>{label}</button>
}

export function SectionViewportSwitch({viewport,onChange}:{viewport:SectionHeroViewport;onChange:(viewport:SectionHeroViewport)=>void}){
  return <div className="section-editor-devices" aria-label="Viewport do preview">
    <button type="button" className={viewport==='desktop'?'active':''} onClick={()=>onChange('desktop')} aria-label="Desktop" title="Desktop" aria-pressed={viewport==='desktop'}><Monitor size={17}/></button>
    <button type="button" className={viewport==='tablet'?'active':''} onClick={()=>onChange('tablet')} aria-label="Tablet" title="Tablet" aria-pressed={viewport==='tablet'}><Tablet size={17}/></button>
    <button type="button" className={viewport==='mobile'?'active':''} onClick={()=>onChange('mobile')} aria-label="Mobile" title="Mobile" aria-pressed={viewport==='mobile'}><Smartphone size={17}/></button>
  </div>
}

export function SectionEditorSaveBar({dirty,saving=false,saved=false,onDiscard,onSave,dirtyText='O preview já mostra o rascunho; a versão pública só muda após salvar.',cleanText='O estado salvo continua sendo usado pela versão pública.'}:{dirty:boolean;saving?:boolean;saved?:boolean;onDiscard:()=>void;onSave:()=>void;dirtyText?:string;cleanText?:string}){
  return <div className="section-editor-savebar"><div><span className={`section-editor-save-state${dirty?' dirty':''}`}/><strong>{dirty?'Alterações não salvas':saved?'Alterações salvas':'Sem alterações pendentes'}</strong><small>{dirty?dirtyText:cleanText}</small></div><div><button type="button" className="button outline" disabled={!dirty||saving} onClick={onDiscard}>Descartar alterações</button><button type="button" className="button dark" disabled={!dirty||saving} onClick={onSave}><Save size={15}/> {saving?'Salvando...':'Salvar alterações'}</button></div></div>
}

export function SectionEditorSummaryCard({eyebrow,title='Configurações da seção',description,active,onActiveChange}:{eyebrow:string;title?:string;description:string;active:boolean;onActiveChange:(active:boolean)=>void}){
  return <section className="section-editor-card section-editor-summary"><div className="section-editor-summary-head"><div><small>{eyebrow}</small><h2>{title}</h2><p>{description}</p></div><label className="section-editor-active"><input type="checkbox" checked={active} onChange={event=>onActiveChange(event.target.checked)}/><span>Ativa</span></label></div></section>
}
