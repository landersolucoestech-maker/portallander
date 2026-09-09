import {Headphones,Plus,Settings,Users} from 'lucide-react'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {AdminShell} from '../../shared/internal/AdminUi'
import {UNIFIED_ADMIN_NAV} from '../../shared/internal/adminNavigation'
import type {ChatArea} from './domain'
import {useChatState,useCreateSupportConversation} from './hooks'
import InternalChatView from './components/InternalChatView'
import SupportCenterView from './components/SupportCenterView'
import NewSupportConversationModal from './components/NewSupportConversationModal'
import './chat.css'
import './support-composer.css'

export default function ChatPage(){
 const navigate=useNavigate(),[area,setArea]=useState<ChatArea>('support'),[selectedId,setSelectedId]=useState(''),[newOpen,setNewOpen]=useState(false)
 const stateQuery=useChatState(),createSupport=useCreateSupportConversation(),state=stateQuery.data
 const effectiveSelectedId=state?.supportConversations.some(item=>item.id===selectedId)?selectedId:(state?.supportConversations[0]?.id??'')
 const refresh=()=>{void stateQuery.refetch()}
 const actions=[{label:'Configurações',icon:Settings,variant:'secondary' as const,onClick:()=>navigate('/app/chat/settings')},...(area==='support'?[{label:'Nova Conversa',icon:Plus,onClick:()=>setNewOpen(true)}]:[])]
 return <AdminShell area="chat" items={UNIFIED_ADMIN_NAV} header={{title:'Chat',description:'Chat interno e central multicanal de atendimento'}} headerActions={actions}>
  <section className="chat-page">
   <div className="chat-domain-tabs" role="tablist"><button role="tab" aria-selected={area==='internal'} className={area==='internal'?'active':''} onClick={()=>setArea('internal')}><Users size={15}/>Chat Interno</button><button role="tab" aria-selected={area==='support'} className={area==='support'?'active':''} onClick={()=>setArea('support')}><Headphones size={15}/>Central de Atendimento</button></div>
   {stateQuery.isLoading&&<div className="chat-card chat-support-empty"><strong>Carregando Chat…</strong></div>}
   {stateQuery.isError&&<div className="chat-card chat-support-empty"><strong>Chat indisponível</strong><span>{stateQuery.error instanceof Error?stateQuery.error.message:'Não foi possível carregar os dados.'}</span><button className="button outline" onClick={refresh}>Tentar novamente</button></div>}
   {state&&!stateQuery.isError&&(area==='internal'?<InternalChatView conversations={state.internalConversations} members={state.internalMembers} messages={state.internalMessages} onChange={refresh}/>:<SupportCenterView conversations={state.supportConversations} messages={state.supportMessages} quickReplies={state.quickReplies} members={state.internalMembers} runtime={state.runtime} selectedId={effectiveSelectedId} onSelect={setSelectedId} onChange={refresh}/>) }
  </section>
  <NewSupportConversationModal open={newOpen} onClose={()=>setNewOpen(false)} onCreate={async input=>{const next=await createSupport.mutateAsync(input);setSelectedId(next.supportConversations[0]?.id??'');setNewOpen(false)}}/>
 </AdminShell>
}
