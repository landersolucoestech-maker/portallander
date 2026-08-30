import {MessageCircle,Plus,Search,Send,Users} from 'lucide-react'
import {useMemo,useState} from 'react'
import type {InternalConversation,InternalMember,InternalMessage} from '../domain'
import {chatRepository} from '../repository'
import NewInternalConversationModal from './NewInternalConversationModal'

const SELECTED='musicchat-interno:selected-id'
const draftKey=(id:string)=>`musicchat-interno:draft:${id}`
const title=(conversation:InternalConversation,self:string)=>{if(conversation.type==='group')return conversation.name||'Grupo';const other=conversation.participants.find(p=>p.authUserId!==self);return other?.fullName||other?.email||'Conversa'}
const initials=(value:string)=>value.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()
const time=(iso:string)=>new Date(iso).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
const persistedSelection=()=>{try{return sessionStorage.getItem(SELECTED)??''}catch{return''}}
const persistedDraft=(id:string)=>{if(!id)return'';try{return sessionStorage.getItem(draftKey(id))??''}catch{return''}}

type Props={conversations:InternalConversation[];members:InternalMember[];messages:InternalMessage[];onChange:()=>void}
export default function InternalChatView({conversations,members,messages,onChange}:Props){
 const self=members[0]?.authUserId??'', [selectedId,setSelectedId]=useState(persistedSelection),[search,setSearch]=useState(''),[drafts,setDrafts]=useState<Record<string,string>>({}),[newOpen,setNewOpen]=useState(false)
 const effectiveSelectedId=conversations.some(c=>c.id===selectedId)?selectedId:(conversations[0]?.id??'')
 const selected=conversations.find(c=>c.id===effectiveSelectedId)??null,filtered=useMemo(()=>{const q=search.trim().toLowerCase();return q?conversations.filter(c=>title(c,self).toLowerCase().includes(q)):conversations},[conversations,search,self]),conversationMessages=selected?messages.filter(m=>m.conversationId===selected.id):[]
 const draft=effectiveSelectedId?(drafts[effectiveSelectedId]??persistedDraft(effectiveSelectedId)):''
 const selectConversation=(id:string)=>{setSelectedId(id);try{sessionStorage.setItem(SELECTED,id)}catch{/* noop */}}
 const changeDraft=(value:string)=>{if(!selected)return;setDrafts(current=>({...current,[selected.id]:value}));try{if(value)sessionStorage.setItem(draftKey(selected.id),value);else sessionStorage.removeItem(draftKey(selected.id))}catch{/* noop */}}
 const send=()=>{if(!selected||!draft.trim())return;chatRepository.sendInternal(selected.id,draft);changeDraft('');onChange()}
 return <div className="chat-internal-layout">
  <section className="chat-card chat-internal-list"><header><div><Users size={16}/><strong>Chat Interno</strong></div><button className="button outline chat-compact-btn" onClick={()=>setNewOpen(true)}><Plus size={13}/>Nova</button></header><label className="chat-search-field"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar conversa..."/></label><div className="chat-scroll-list">{filtered.length===0?<div className="chat-list-empty"><MessageCircle size={34}/><strong>Nenhuma conversa ainda</strong><p>O chat interno continua isolado da Central de Atendimento.</p><button className="button outline" onClick={()=>setNewOpen(true)}><Plus size={13}/>Iniciar nova conversa</button></div>:filtered.map(c=>{const t=title(c,self),last=messages.filter(m=>m.conversationId===c.id).at(-1);return <button key={c.id} className={`chat-internal-item${c.id===effectiveSelectedId?' active':''}`} onClick={()=>selectConversation(c.id)}><i>{initials(t)}</i><div><strong>{t}</strong>{c.type==='group'&&<small>{c.participants.length} participantes</small>}<span>{last?.body??'Sem mensagens'}</span></div><time>{last?time(last.createdAt):''}</time></button>})}</div></section>
  <section className="chat-card chat-internal-thread">{!selected?<div className="chat-thread-empty"><MessageCircle size={42}/><strong>Selecione uma conversa interna</strong><p>Escolha uma conversa da lista ou inicie uma nova.</p><button className="button dark" onClick={()=>setNewOpen(true)}><Plus size={13}/>Nova conversa</button></div>:<><header className="chat-thread-head"><i>{initials(title(selected,self))}</i><div><strong>{title(selected,self)}</strong><span>{selected.type==='group'?`${selected.participants.length} participantes`:'Conversa direta'}</span></div></header><div className="chat-message-stream">{conversationMessages.length===0?<div className="chat-thread-empty compact"><MessageCircle size={32}/><strong>Nenhuma mensagem ainda</strong></div>:conversationMessages.map(m=>{const own=m.senderAuthUserId===self,sender=members.find(x=>x.authUserId===m.senderAuthUserId);return <div key={m.id} className={`chat-internal-message${own?' own':''}`}>{!own&&<b>{sender?.fullName??sender?.email}</b>}<p>{m.body}</p><time>{time(m.createdAt)}</time></div>})}</div><div className="chat-internal-composer"><textarea value={draft} onChange={e=>changeDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Digite uma mensagem..." rows={2}/><button className="button dark" disabled={!draft.trim()} onClick={send}><Send size={14}/>Enviar</button></div></>}</section>
  <NewInternalConversationModal open={newOpen} members={members.filter(m=>m.authUserId!==self)} onClose={()=>setNewOpen(false)} onCreate={ids=>{const c=chatRepository.createInternal(ids);selectConversation(c.id);setNewOpen(false);onChange()}}/>
 </div>
}
