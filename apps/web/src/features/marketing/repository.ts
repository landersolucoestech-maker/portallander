import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import {uid,type MarketingBriefing,type MarketingCampaign,type MarketingContent,type MarketingSeed,type MarketingTask} from './domain'
const STORAGE_KEY='portal-lander:marketing:v1'
const EVENT='portal-lander:marketing:changed'
const clone=<T>(value:T):T=>structuredClone(value)
const seed=():MarketingSeed=>getRuntimeDataProvider().marketing.seed()
const read=():MarketingSeed=>{try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw) as MarketingSeed:seed()}catch{return seed()}}
const write=(state:MarketingSeed)=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent(EVENT));return clone(state)}
const stamp=()=>new Date().toISOString()
export const marketingRepository={
 eventName:EVENT,
 snapshot:()=>clone(read()),
 saveCampaign(input:Omit<MarketingCampaign,'id'|'createdAt'|'updatedAt'>,id?:string){const state=read(),now=stamp();if(id)state.campaigns=state.campaigns.map(x=>x.id===id?{...x,...input,updatedAt:now}:x);else state.campaigns.unshift({...input,id:uid('mkt_cmp'),createdAt:now,updatedAt:now});return write(state)},
 deleteCampaign(id:string){const state=read();state.campaigns=state.campaigns.filter(x=>x.id!==id);return write(state)},
 saveContent(input:Omit<MarketingContent,'id'|'createdAt'|'updatedAt'>,id?:string){const state=read(),now=stamp();if(id)state.contents=state.contents.map(x=>x.id===id?{...x,...input,updatedAt:now}:x);else state.contents.unshift({...input,id:uid('mkt_cnt'),createdAt:now,updatedAt:now});return write(state)},
 deleteContent(id:string){const state=read();state.contents=state.contents.filter(x=>x.id!==id);return write(state)},
 saveTask(input:Omit<MarketingTask,'id'|'createdAt'|'updatedAt'>,id?:string){const state=read(),now=stamp();if(id)state.tasks=state.tasks.map(x=>x.id===id?{...x,...input,updatedAt:now}:x);else state.tasks.unshift({...input,id:uid('mkt_tsk'),createdAt:now,updatedAt:now});return write(state)},
 deleteTask(id:string){const state=read();state.tasks=state.tasks.filter(x=>x.id!==id);return write(state)},
 saveBriefing(input:Omit<MarketingBriefing,'id'|'createdAt'|'updatedAt'>,id?:string){const state=read(),now=stamp();if(id)state.briefings=state.briefings.map(x=>x.id===id?{...x,...input,updatedAt:now}:x);else state.briefings.unshift({...input,id:uid('mkt_brf'),createdAt:now,updatedAt:now});return write(state)},
 deleteBriefing(id:string){const state=read();state.briefings=state.briefings.filter(x=>x.id!==id);return write(state)},
 addAiHistory(input:{kind:string;title:string;context:string;result:string}){const state=read();state.aiHistory.unshift({...input,id:uid('mkt_ai'),createdAt:stamp()});return write(state)},
 reset(){localStorage.removeItem(STORAGE_KEY);window.dispatchEvent(new CustomEvent(EVENT))},
}
