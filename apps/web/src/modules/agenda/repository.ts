import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import type {AgendaEvent,AgendaEventDraft,AgendaLocation,AgendaParticipant} from './domain'

const STORAGE_KEY='portal-lander:agenda:events:v1'
const clone=<T>(value:T):T=>structuredClone(value)
const provider=()=>getRuntimeDataProvider().agenda
const read=():AgendaEvent[]=>{try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw) as AgendaEvent[]:provider().events()}catch{return provider().events()}}
const write=(items:AgendaEvent[])=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(items))}catch{/* storage indisponível: runtime provider segue como fallback */}window.dispatchEvent(new CustomEvent('portal-lander:agenda:changed'))}
const now=()=>new Date().toISOString()
const id=()=>`agenda_evt_${Date.now()}_${Math.random().toString(36).slice(2,7)}`

export const agendaRepository={
 list:():AgendaEvent[]=>clone(read()),
 participants:():AgendaParticipant[]=>provider().participants(),
 locations:():AgendaLocation[]=>provider().locations(),
 scenario:()=>getRuntimeDataProvider().getScenario(),
 create(draft:AgendaEventDraft){const item:AgendaEvent={...draft,id:id(),createdAt:now(),updatedAt:now()};write([...read(),item]);return item},
 update(eventId:string,draft:AgendaEventDraft){const current=read();const index=current.findIndex(item=>item.id===eventId);if(index<0)return null;const nextItem:AgendaEvent={...current[index],...draft,id:eventId,updatedAt:now()};current[index]=nextItem;write(current);return nextItem},
 remove(eventId:string){write(read().filter(item=>item.id!==eventId))},
 reset(){try{localStorage.removeItem(STORAGE_KEY)}catch{/* noop */}window.dispatchEvent(new CustomEvent('portal-lander:agenda:changed'))},
}
