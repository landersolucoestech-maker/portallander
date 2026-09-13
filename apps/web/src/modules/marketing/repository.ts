import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import {DEFAULT_MARKETING_CREATION_CONTENT_TYPE,MARKETING_CREATION_CONTENT_TYPES,isMarketingCreationContentType} from '../../../../../packages/shared/marketingCreativeFormats.js'
import {isMarketingApiConfigured,marketingAdminClient,type MarketingContentDraft} from './adminClient'
import {uid,type MarketingBriefing,type MarketingCampaign,type MarketingContent,type MarketingSeed,type MarketingTask} from './domain'
const STORAGE_KEY='portal-lander:marketing:v2'
const LEGACY_STORAGE_KEY='portal-lander:marketing:v1'
const EVENT='portal-lander:marketing:changed'
const clone=<T>(value:T):T=>structuredClone(value)
const demoRuntime=()=>import.meta.env.DEV||import.meta.env.VITE_ENABLE_DEMO_DATA==='true'
const fallbackSeed=():MarketingSeed=>({campaigns:[],contents:[],tasks:[],briefings:[],metrics:[],aiHistory:[],activities:[],platforms:['Instagram','Facebook','TikTok','YouTube','Threads','X'],contentTypes:[...MARKETING_CREATION_CONTENT_TYPES],taskTypes:[],briefingTypes:[],owners:['Marketing'],departments:['Marketing']})
const seed=():MarketingSeed=>{try{return getRuntimeDataProvider().marketing.seed()}catch{return fallbackSeed()}}
const clearLegacy=()=>{try{localStorage.removeItem(LEGACY_STORAGE_KEY)}catch{/* storage unavailable */}}
const withCreationMetadata=(state:MarketingSeed):MarketingSeed=>({...state,contentTypes:[...MARKETING_CREATION_CONTENT_TYPES]})
const readLocal=():MarketingSeed=>{clearLegacy();try{const raw=localStorage.getItem(STORAGE_KEY);return withCreationMetadata(raw?JSON.parse(raw) as MarketingSeed:seed())}catch{return withCreationMetadata(seed())}}
let remoteContents:MarketingContent[]|null=null
const read=():MarketingSeed=>{if(!isMarketingApiConfigured()&&!demoRuntime())return fallbackSeed();const state=readLocal();if(remoteContents)state.contents=remoteContents;return state}
const dispatch=()=>window.dispatchEvent(new CustomEvent(EVENT))
const write=(state:MarketingSeed)=>{clearLegacy();localStorage.setItem(STORAGE_KEY,JSON.stringify(withCreationMetadata(state)));dispatch();return clone(withCreationMetadata(state))}
const stamp=()=>new Date().toISOString()
const requireDemoFallback=()=>{if(!demoRuntime())throw new Error('A API administrativa de Marketing é obrigatória neste runtime. Persistência local é permitida somente no modo de demonstração.')}
const assertWritableContentType=(type:string,currentType?:string)=>{if(isMarketingCreationContentType(type))return;if(currentType&&type===currentType)return;throw new Error(`Tipo de conteúdo inválido para novos agendamentos. Use ${MARKETING_CREATION_CONTENT_TYPES.join(', ')}.`)}
export const marketingRepository={
 eventName:EVENT,
 snapshot:()=>clone(read()),
 async hydrateContents(){if(!isMarketingApiConfigured()){requireDemoFallback();return clone(read().contents)}remoteContents=await marketingAdminClient.listContents();dispatch();return clone(remoteContents)},
 saveCampaign(input:Omit<MarketingCampaign,'id'|'createdAt'|'updatedAt'>,id?:string){const state=readLocal(),now=stamp();if(id)state.campaigns=state.campaigns.map(x=>x.id===id?{...x,...input,updatedAt:now}:x);else state.campaigns.unshift({...input,id:uid('mkt_cmp'),createdAt:now,updatedAt:now});return write(state)},
 deleteCampaign(id:string){const state=readLocal();state.campaigns=state.campaigns.filter(x=>x.id!==id);return write(state)},
 async saveContent(input:MarketingContentDraft,id?:string,expectedUpdatedAt?:string){if(isMarketingApiConfigured()){const saved=id?await marketingAdminClient.updateContent(id,input,expectedUpdatedAt):await marketingAdminClient.createContent(input);remoteContents=id?(remoteContents??[]).map(x=>x.id===id?saved:x):[saved,...(remoteContents??[])];dispatch();return saved}requireDemoFallback();const state=readLocal(),now=stamp();let saved:MarketingContent;if(id){const current=state.contents.find(x=>x.id===id);if(!current)throw new Error('Conteúdo de Marketing não encontrado.');assertWritableContentType(input.type,current.type);saved={...current,...input,updatedAt:now};state.contents=state.contents.map(x=>x.id===id?saved:x)}else{assertWritableContentType(input.type);saved={...input,type:input.type||DEFAULT_MARKETING_CREATION_CONTENT_TYPE,id:uid('mkt_cnt'),createdAt:now,updatedAt:now};state.contents.unshift(saved)}write(state);return saved},
 async deleteContent(id:string){if(isMarketingApiConfigured()){await marketingAdminClient.deleteContent(id);remoteContents=(remoteContents??[]).filter(x=>x.id!==id);dispatch();return}requireDemoFallback();const state=readLocal();state.contents=state.contents.filter(x=>x.id!==id);write(state)},
 saveTask(input:Omit<MarketingTask,'id'|'createdAt'|'updatedAt'>,id?:string){const state=readLocal(),now=stamp();if(id)state.tasks=state.tasks.map(x=>x.id===id?{...x,...input,updatedAt:now}:x);else state.tasks.unshift({...input,id:uid('mkt_tsk'),createdAt:now,updatedAt:now});return write(state)},
 deleteTask(id:string){const state=readLocal();state.tasks=state.tasks.filter(x=>x.id!==id);return write(state)},
 saveBriefing(input:Omit<MarketingBriefing,'id'|'createdAt'|'updatedAt'>,id?:string){const state=readLocal(),now=stamp();if(id)state.briefings=state.briefings.map(x=>x.id===id?{...x,...input,updatedAt:now}:x);else state.briefings.unshift({...input,id:uid('mkt_brf'),createdAt:now,updatedAt:now});return write(state)},
 deleteBriefing(id:string){const state=readLocal();state.briefings=state.briefings.filter(x=>x.id!==id);return write(state)},
 addAiHistory(input:{kind:string;title:string;context:string;result:string}){const state=readLocal();state.aiHistory.unshift({...input,id:uid('mkt_ai'),createdAt:stamp()});return write(state)},
 reset(){try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_STORAGE_KEY)}catch{/* storage unavailable */}remoteContents=null;dispatch()},
}
