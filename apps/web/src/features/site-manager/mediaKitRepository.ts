import {adminApiBase} from '../access/authClient'
import {hasRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import {defaultMediaKitDraft,type MediaKitDraft} from './mediaKitDomain'
import {mediaKitReadModel} from './mediaKitReadModel'

const STORAGE_KEY='portal-lander:cms:media-kit-draft:v1'
const EVENT_NAME='portal-lander:media-kit-draft:changed'
const clone=(draft:MediaKitDraft):MediaKitDraft=>structuredClone(draft)

const normalize=(value:unknown):MediaKitDraft=>{
  if(!value||typeof value!=='object')return clone(defaultMediaKitDraft)
  const draft=value as Partial<MediaKitDraft>
  const audience=draft.audience??defaultMediaKitDraft.audience
  return {
    version:typeof draft.version==='number'&&draft.version>0?draft.version:1,
    status:draft.status==='published'||draft.status==='inactive'?draft.status:'draft',
    identity:{...defaultMediaKitDraft.identity,...(draft.identity??{})},
    institutional:{...defaultMediaKitDraft.institutional,...(draft.institutional??{})},
    audience:{...defaultMediaKitDraft.audience,...audience,metrics:Array.isArray(audience.metrics)?audience.metrics.map(item=>({...item})):[],snapshot:Array.isArray(audience.snapshot)?audience.snapshot.map(item=>({...item,provenance:{...(item.provenance??{})}})):[]},
    inventory:{placements:Array.isArray(draft.inventory?.placements)?draft.inventory.placements.map(item=>({...item})):clone(defaultMediaKitDraft).inventory.placements},
    newsletter:{...defaultMediaKitDraft.newsletter,...(draft.newsletter??{})},
    social:{channelIds:Array.isArray(draft.social?.channelIds)?[...draft.social.channelIds]:[]},
    adFormats:Array.isArray(draft.adFormats)?draft.adFormats.map(item=>({...item})):[],
    commercial:{...defaultMediaKitDraft.commercial,...(draft.commercial??{})},
    roadmap:{currentCapabilities:Array.isArray(draft.roadmap?.currentCapabilities)?[...draft.roadmap.currentCapabilities]:[],futureOpportunities:Array.isArray(draft.roadmap?.futureOpportunities)?[...draft.roadmap.futureOpportunities]:[]},
    generationMetadata:{...defaultMediaKitDraft.generationMetadata,...(draft.generationMetadata??{})},
  }
}
const hydrate=async(draft:MediaKitDraft)=>hasRuntimeDataProvider()?mediaKitReadModel.snapshot(draft):draft

type ApiErrorBody={message?:string}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const base=adminApiBase()
  if(!base)throw new Error('A API administrativa do Mídia Kit não está configurada.')
  const response=await fetch(`${base}${path}`,{...init,credentials:'include',headers:{Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...init.headers}})
  const body=await response.json().catch(()=>({})) as ApiErrorBody&T
  if(!response.ok)throw new Error(body.message||`A API do Mídia Kit respondeu ${response.status}.`)
  return body
}

interface MediaKitRepository{readonly persistent:boolean;readonly eventName:string;read():Promise<MediaKitDraft>;save(input:MediaKitDraft):Promise<MediaKitDraft>;reset():Promise<MediaKitDraft>;publish():Promise<MediaKitDraft>}

class ApiMediaKitRepository implements MediaKitRepository{
  readonly persistent=true
  readonly eventName=EVENT_NAME
  async read(){const result=await request<{mediaKit:MediaKitDraft}>('/api/media-kit');return hydrate(normalize(result.mediaKit))}
  async save(input:MediaKitDraft){const result=await request<{mediaKit:MediaKitDraft}>('/api/media-kit',{method:'PUT',body:JSON.stringify(input)});return hydrate(normalize(result.mediaKit))}
  async reset(){const result=await request<{mediaKit:MediaKitDraft}>('/api/media-kit/draft',{method:'DELETE'});return hydrate(normalize(result.mediaKit))}
  async publish(){const result=await request<{mediaKit:MediaKitDraft}>('/api/media-kit/publish',{method:'POST'});return hydrate(normalize(result.mediaKit))}
}

class LocalMediaKitRepository implements MediaKitRepository{
  readonly persistent=false
  readonly eventName=EVENT_NAME
  async read(){try{return hydrate(normalize(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')))}catch{return hydrate(clone(defaultMediaKitDraft))}}
  async save(input:MediaKitDraft){const draft=normalize({...input,status:'draft'});localStorage.setItem(STORAGE_KEY,JSON.stringify(draft));window.dispatchEvent(new CustomEvent(EVENT_NAME));return hydrate(clone(draft))}
  async reset(){localStorage.removeItem(STORAGE_KEY);window.dispatchEvent(new CustomEvent(EVENT_NAME));return hydrate(clone(defaultMediaKitDraft))}
  async publish():Promise<MediaKitDraft>{throw new Error('A publicação do Mídia Kit exige uma sessão administrativa conectada à API.')}
}

export const mediaKitRepository:MediaKitRepository=adminApiBase()?new ApiMediaKitRepository():new LocalMediaKitRepository()
export const isMediaKitPersistenceConfigured=()=>mediaKitRepository.persistent
