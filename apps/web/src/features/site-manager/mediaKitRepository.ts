import {adminApiBase} from '../access/authClient'
import {defaultMediaKitDraft,type MediaKitDraft} from './mediaKitDomain'

const STORAGE_KEY='portal-lander:cms:media-kit-draft:v1'
const EVENT_NAME='portal-lander:media-kit-draft:changed'
const clone=(draft:MediaKitDraft):MediaKitDraft=>structuredClone(draft)

const normalize=(value:unknown):MediaKitDraft=>{
  if(!value||typeof value!=='object')return clone(defaultMediaKitDraft)
  const draft=value as Partial<MediaKitDraft>
  return {
    version:typeof draft.version==='number'&&draft.version>0?draft.version:1,
    status:draft.status==='published'||draft.status==='inactive'?draft.status:'draft',
    institutional:{...defaultMediaKitDraft.institutional,...(draft.institutional??{})},
    audience:{...defaultMediaKitDraft.audience,...(draft.audience??{})},
    adFormats:Array.isArray(draft.adFormats)?draft.adFormats.map(item=>({...item})):[],
    commercial:{...defaultMediaKitDraft.commercial,...(draft.commercial??{})},
  }
}

type ApiErrorBody={message?:string}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const base=adminApiBase()
  if(!base)throw new Error('A API administrativa do Mídia Kit não está configurada.')
  const response=await fetch(`${base}${path}`,{
    ...init,
    credentials:'include',
    headers:{Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...init.headers},
  })
  const body=await response.json().catch(()=>({})) as ApiErrorBody&T
  if(!response.ok)throw new Error(body.message||`A API do Mídia Kit respondeu ${response.status}.`)
  return body
}

interface MediaKitRepository{
  readonly persistent:boolean
  readonly eventName:string
  read():Promise<MediaKitDraft>
  save(input:MediaKitDraft):Promise<MediaKitDraft>
  reset():Promise<MediaKitDraft>
  publish():Promise<MediaKitDraft>
}

class ApiMediaKitRepository implements MediaKitRepository{
  readonly persistent=true
  readonly eventName=EVENT_NAME
  async read(){const result=await request<{mediaKit:MediaKitDraft}>('/api/media-kit');return normalize(result.mediaKit)}
  async save(input:MediaKitDraft){const result=await request<{mediaKit:MediaKitDraft}>('/api/media-kit',{method:'PUT',body:JSON.stringify(input)});return normalize(result.mediaKit)}
  async reset(){const result=await request<{mediaKit:MediaKitDraft}>('/api/media-kit/draft',{method:'DELETE'});return normalize(result.mediaKit)}
  async publish(){const result=await request<{mediaKit:MediaKitDraft}>('/api/media-kit/publish',{method:'POST'});return normalize(result.mediaKit)}
}

class LocalMediaKitRepository implements MediaKitRepository{
  readonly persistent=false
  readonly eventName=EVENT_NAME
  async read(){
    try{return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'))}catch{return clone(defaultMediaKitDraft)}
  }
  async save(input:MediaKitDraft){
    const draft=normalize({...input,status:'draft'})
    localStorage.setItem(STORAGE_KEY,JSON.stringify(draft))
    window.dispatchEvent(new CustomEvent(EVENT_NAME))
    return clone(draft)
  }
  async reset(){
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent(EVENT_NAME))
    return clone(defaultMediaKitDraft)
  }
  async publish():Promise<MediaKitDraft>{throw new Error('A publicação do Mídia Kit exige uma sessão administrativa conectada à API.')}
}

export const mediaKitRepository:MediaKitRepository=adminApiBase()?new ApiMediaKitRepository():new LocalMediaKitRepository()
export const isMediaKitPersistenceConfigured=()=>mediaKitRepository.persistent
