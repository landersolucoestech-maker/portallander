import {Headphones,Plus,Settings,Users} from 'lucide-react'
import {useEffect,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {AdminShell} from '../../shared/internal/AdminUi'
import {CRM_WORKSPACE_NAV} from '../../shared/internal/adminNavigation'
import type {ChatArea,ChatSeed} from './domain'
import {chatRepository} from './repository'
import InternalChatView from './components/InternalChatView'
import SupportCenterView from './components/SupportCenterView'
import NewSupportConversationModal from './components/NewSupportConversationModal'
import './chat.css'

const load=():ChatSeed=>chatRepository.snapshot()
export default function ChatPage(){const navigate=useNavigate(),[area,setArea]=useState<ChatArea>('support'),[state,setState]=useState(load),[selectedId,setSelectedId]=useState(()=>state.supportConversations[0]?.id??''),[newOpen,setNewOpen]=useState(false);const refresh=()=>setState(load());useEffect(()=>{const handler=()=>refresh();window.addEventListener(chatRepository.eventName,handler);return()=>window.removeEventListener(chatRepository.eventName,handler)},[]);const actions=[{label:'Configurações',icon:Settings,variant:'secondary' as const,onClick:()=>navigate('/app/chat/settings')},...(area==='support'?[{label:'Nova Conversa',icon:Plus,onClick:()=>setNewOpen(true)}]:[])];return <AdminShell area="chat" items={CRM_WORKSPACE_NAV} header={{title:'Chat',description:'Chat interno e central multicanal de atendimento'}} headerActions={actions}><section className="chat-page"><div className="chat-domain-tabs" role="tablist"><button role="tab" aria-selected={area==='internal'} className={area==='internal'?'active':''} onClick={()=>setArea('internal')}><Users size={15}/>Chat Interno</button><button role="tab" aria-selected={area==='support'} className={area==='support'?'active':''} onClick={()=>setArea('support')}><Headphones size={15}/>Central de Atendimento</button></div>{area==='internal'?<InternalChatView conversations={state.internalConversations} members={state.internalMembers} messages={state.internalMessages} onChange={refresh}/>:<SupportCenterView conversations={state.supportConversations} messages={state.supportMessages} quickReplies={state.quickReplies} selectedId={selectedId} onSelect={setSelectedId} onChange={refresh}/>}</section><NewSupportConversationModal open={newOpen} onClose={()=>setNewOpen(false)} onCreate={input=>{const conversation=chatRepository.createSupport(input);setSelectedId(conversation.id);setNewOpen(false);refresh()}}/></AdminShell>}
