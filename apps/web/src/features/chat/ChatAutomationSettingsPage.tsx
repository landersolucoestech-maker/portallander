import {Plus,Save,Trash2,Zap} from 'lucide-react'
import {useMemo,useState} from 'react'
import {AdminShell} from '../../shared/internal/AdminUi'
import {CRM_WORKSPACE_NAV} from '../../shared/internal/adminNavigation'
import {AUTOMATION_TABS} from './constants'
import type {ChatAutomationSettings,ChatMenuOption} from './domain'
import {chatRepository} from './repository'
import './chat.css'

const id=(prefix:string)=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
function Switch({checked,onChange}:{checked:boolean;onChange:(value:boolean)=>void}){return <button type="button" className={`chat-switch${checked?' on':''}`} aria-pressed={checked} onClick={()=>onChange(!checked)}><span/></button>}
export default function ChatAutomationSettingsPage(){
 const [draft,setDraft]=useState(()=>chatRepository.automation()),[tab,setTab]=useState('mensagens'),[saved,setSaved]=useState(false),[feedback,setFeedback]=useState('')
 const patch=(value:Partial<ChatAutomationSettings>)=>{setDraft(current=>({...current,...value}));setSaved(false)}
 const previewMenu=useMemo(()=>draft.menuOptions.filter(item=>item.active).sort((a,b)=>a.order-b.order).map(item=>`${item.order}. ${item.label}`).join('\n'),[draft.menuOptions])
 const save=()=>{chatRepository.saveAutomation({...draft,mainMenuMessage:draft.mainMenuMessage||previewMenu});setSaved(true)}
 const addMenu=()=>{const option:ChatMenuOption={id:id('menu'),order:Math.max(0,...draft.menuOptions.map(item=>item.order))+1,label:'Nova opção',responseTemplateId:'',queue:'Atendimento',sector:'Triagem',defaultAssignee:null,tags:[],priority:'media',active:true};patch({menuOptions:[...draft.menuOptions,option]})}
 return <AdminShell area="chat" items={CRM_WORKSPACE_NAV} header={{title:'Automações do Chat',description:'Configure mensagens automáticas, triagem, filas, notificações e escalonamentos.'}} headerActions={[{label:'Testar escalonamento',icon:Zap,variant:'secondary',onClick:()=>setFeedback('Teste executado com as regras ativas.')},{label:'Salvar configuração',icon:Save,onClick:save}]}>
  <section className="chat-settings-page">
   {(saved||feedback)&&<div className="chat-settings-feedback">{saved?'Configuração salva localmente.':feedback}</div>}
   <div className="chat-settings-tabs">{AUTOMATION_TABS.map(([value,label])=><button key={value} className={tab===value?'active':''} onClick={()=>setTab(value)}>{label}</button>)}</div>
   {tab==='mensagens'&&<><section className="chat-settings-card"><header><h3>Fluxo inicial</h3><label className="chat-switch-with-label"><Switch checked={draft.enabled} onChange={enabled=>patch({enabled})}/><span>Automação ativa</span></label></header><div className="chat-settings-stack"><label>Mensagem inicial de boas-vindas<textarea rows={4} value={draft.welcomeMessage} onChange={event=>patch({welcomeMessage:event.target.value})}/></label><label>Menu principal de triagem<textarea rows={8} value={draft.mainMenuMessage||previewMenu} onChange={event=>patch({mainMenuMessage:event.target.value})}/></label></div></section><section className="chat-settings-card"><header><h3>Mensagens de exceção e encerramento</h3></header><div className="chat-settings-grid two"><label>Opção inválida<textarea rows={4} value={draft.invalidOptionMessage} onChange={event=>patch({invalidOptionMessage:event.target.value})}/></label><label>Ausência de resposta<textarea rows={4} value={draft.absenceMessage} onChange={event=>patch({absenceMessage:event.target.value})}/></label><label>Fora do horário<textarea rows={4} value={draft.outOfHoursMessage} onChange={event=>patch({outOfHoursMessage:event.target.value})}/></label><label>Encerramento<textarea rows={4} value={draft.closingMessage} onChange={event=>patch({closingMessage:event.target.value})}/></label></div></section></>}
   {tab==='menu'&&<section className="chat-settings-card"><header><div><h3>Menu principal de triagem</h3><p>Configure as opções gerais de atendimento.</p></div><button className="button outline" onClick={addMenu}><Plus size={13}/>Adicionar opção</button></header><div className="chat-settings-stack">{[...draft.menuOptions].sort((a,b)=>a.order-b.order).map(option=><article className="chat-inline-editor" key={option.id}><input value={option.label} onChange={event=>patch({menuOptions:draft.menuOptions.map(item=>item.id===option.id?{...item,label:event.target.value}:item)})}/><button aria-label="Excluir opção" onClick={()=>patch({menuOptions:draft.menuOptions.filter(item=>item.id!==option.id)})}><Trash2 size={14}/></button></article>)}</div></section>}
   {tab==='escalonamento'&&<section className="chat-settings-card"><header><h3>Regras de escalonamento</h3></header><div className="chat-settings-stack">{draft.escalationRules.map(rule=><article className="chat-accordion" key={rule.id}><div className="chat-accordion-trigger"><div><b>{rule.afterMinutes} min · {rule.level}</b><span>Destino: {rule.recipientRole}</span></div><span>{rule.active?'Ativo':'Inativo'}</span></div></article>)}</div></section>}
   {tab==='templates'&&<section className="chat-settings-card"><header><h3>Templates de atendimento</h3></header><div className="chat-settings-stack">{draft.templates.map(template=><label key={template.id}>{template.title}<textarea rows={4} value={template.body} onChange={event=>patch({templates:draft.templates.map(item=>item.id===template.id?{...item,body:event.target.value}:item)})}/></label>)}</div></section>}
  </section>
 </AdminShell>
}
