import {Plus,Save,Trash2,Zap} from 'lucide-react'
import {useEffect,useMemo,useState} from 'react'
import {AdminShell} from '../../shared/internal/AdminUi'
import {UNIFIED_ADMIN_NAV} from '../../shared/internal/adminNavigation'
import {AUTOMATION_TABS} from './constants'
import type {ChatAutomationSettings,ChatMenuOption} from './domain'
import {useChatState,useSaveChatAutomation} from './hooks'
import './chat.css'

const id=(prefix:string)=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
const empty:ChatAutomationSettings={enabled:false,welcomeMessage:'',mainMenuMessage:'',menuOptions:[],templates:[],requiredFields:[],optionalFields:[],invalidOptionMessage:'',absenceMessage:'',outOfHoursMessage:'',closingMessage:'',returnToMenuRule:{enabled:false,commands:[]},escalationRules:[],notificationChannels:{in_app:true,whatsapp:false,sms:false},supervisorUserId:null,managerUserId:null,updatedAt:''}
function Switch({checked,onChange,disabled=false}:{checked:boolean;onChange:(value:boolean)=>void;disabled?:boolean}){return <button type="button" disabled={disabled} className={`chat-switch${checked?' on':''}`} aria-pressed={checked} onClick={()=>onChange(!checked)}><span/></button>}
export default function ChatAutomationSettingsPage(){
 const stateQuery=useChatState(),saveMutation=useSaveChatAutomation(),[draft,setDraft]=useState<ChatAutomationSettings>(empty),[tab,setTab]=useState('mensagens'),[saved,setSaved]=useState(false)
 useEffect(()=>{if(stateQuery.data)setDraft({...stateQuery.data.automation,enabled:false})},[stateQuery.data])
 const runtimeAvailable=Boolean(stateQuery.data?.runtime?.escalation?.configured)
 const patch=(value:Partial<ChatAutomationSettings>)=>{setDraft(current=>({...current,...value,enabled:false}));setSaved(false)}
 const previewMenu=useMemo(()=>draft.menuOptions.filter(item=>item.active).sort((a,b)=>a.order-b.order).map(item=>`${item.order}. ${item.label}`).join('\n'),[draft.menuOptions])
 const save=()=>{void saveMutation.mutateAsync({...draft,enabled:false,mainMenuMessage:draft.mainMenuMessage||previewMenu}).then(()=>setSaved(true))}
 const addMenu=()=>{const option:ChatMenuOption={id:id('menu'),order:Math.max(0,...draft.menuOptions.map(item=>item.order))+1,label:'Nova opção',responseTemplateId:'',queue:'Atendimento',sector:'Triagem',defaultAssignee:null,tags:[],priority:'media',active:true};patch({menuOptions:[...draft.menuOptions,option]})}
 const saveError=saveMutation.error
 return <AdminShell area="chat" items={UNIFIED_ADMIN_NAV} header={{title:'Automações do Chat',description:'Configure rascunhos de mensagens, triagem, filas e escalonamentos.'}} headerActions={[{label:'Testar escalonamento',icon:Zap,variant:'secondary',disabled:!runtimeAvailable,onClick:()=>undefined},{label:'Salvar configuração',icon:Save,onClick:save,disabled:saveMutation.isPending||stateQuery.isLoading}]}>
  <section className="chat-settings-page">
   {stateQuery.isLoading&&<div className="chat-settings-feedback">Carregando configuração…</div>}
   {stateQuery.isError&&<div className="chat-settings-feedback">Configuração indisponível: {stateQuery.error instanceof Error?stateQuery.error.message:'falha ao carregar.'}</div>}
   {!runtimeAvailable&&<div className="chat-settings-feedback">Runtime de automação não configurado. As regras podem ser preservadas como rascunho, mas não serão executadas. Teste de escalonamento indisponível enquanto não houver runtime configurado.</div>}
   {saved&&<div className="chat-settings-feedback">Configuração salva como rascunho persistente. Automação permanece desativada até existir runtime compatível.</div>}
   {saveError&&<div className="chat-settings-feedback">Falha ao salvar: {saveError instanceof Error?saveError.message:'erro desconhecido.'}</div>}
   <div className="chat-settings-tabs">{AUTOMATION_TABS.map(([value,label])=><button key={value} className={tab===value?'active':''} onClick={()=>setTab(value)}>{label}</button>)}</div>
   {tab==='mensagens'&&<><section className="chat-settings-card"><header><h3>Fluxo inicial</h3><label className="chat-switch-with-label"><Switch checked={false} disabled onChange={()=>undefined}/><span>Automação indisponível neste ambiente</span></label></header><div className="chat-settings-stack"><label>Mensagem inicial de boas-vindas<textarea rows={4} value={draft.welcomeMessage} onChange={event=>patch({welcomeMessage:event.target.value})}/></label><label>Menu principal de triagem<textarea rows={8} value={draft.mainMenuMessage||previewMenu} onChange={event=>patch({mainMenuMessage:event.target.value})}/></label></div></section><section className="chat-settings-card"><header><h3>Mensagens de exceção e encerramento</h3></header><div className="chat-settings-grid two"><label>Opção inválida<textarea rows={4} value={draft.invalidOptionMessage} onChange={event=>patch({invalidOptionMessage:event.target.value})}/></label><label>Ausência de resposta<textarea rows={4} value={draft.absenceMessage} onChange={event=>patch({absenceMessage:event.target.value})}/></label><label>Fora do horário<textarea rows={4} value={draft.outOfHoursMessage} onChange={event=>patch({outOfHoursMessage:event.target.value})}/></label><label>Encerramento<textarea rows={4} value={draft.closingMessage} onChange={event=>patch({closingMessage:event.target.value})}/></label></div></section></>}
   {tab==='menu'&&<section className="chat-settings-card"><header><div><h3>Menu principal de triagem</h3><p>Rascunho das opções gerais de atendimento.</p></div><button className="button outline" onClick={addMenu}><Plus size={13}/>Adicionar opção</button></header><div className="chat-settings-stack">{[...draft.menuOptions].sort((a,b)=>a.order-b.order).map(option=><article className="chat-inline-editor" key={option.id}><input value={option.label} onChange={event=>patch({menuOptions:draft.menuOptions.map(item=>item.id===option.id?{...item,label:event.target.value}:item)})}/><button aria-label="Excluir opção" onClick={()=>patch({menuOptions:draft.menuOptions.filter(item=>item.id!==option.id)})}><Trash2 size={14}/></button></article>)}</div></section>}
   {tab==='escalonamento'&&<section className="chat-settings-card"><header><h3>Regras de escalonamento</h3></header><div className="chat-settings-stack">{draft.escalationRules.length===0?<p>Nenhuma regra configurada.</p>:draft.escalationRules.map(rule=><article className="chat-accordion" key={rule.id}><div className="chat-accordion-trigger"><div><b>{rule.afterMinutes} min · {rule.level}</b><span>Destino: {rule.recipientRole}</span></div><span>Rascunho — runtime indisponível</span></div></article>)}</div></section>}
   {tab==='templates'&&<section className="chat-settings-card"><header><h3>Templates de atendimento</h3></header><div className="chat-settings-stack">{draft.templates.map(template=><label key={template.id}>{template.title}<textarea rows={4} value={template.body} onChange={event=>patch({templates:draft.templates.map(item=>item.id===template.id?{...item,body:event.target.value}:item)})}/></label>)}</div></section>}
  </section>
 </AdminShell>
}
