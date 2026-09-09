import type {EditorialContent} from '../editorial/model'

const STORAGE_KEY='portal-lander:cms:content-drafts:v2'
const LEGACY_STORAGE_KEY='portal-lander:cms:content-drafts:v1'
const HIDDEN_KEY='portal-lander:cms:content-hidden:v1'
const EVENT_NAME='portal-lander:content-drafts:changed'
const clone=(content:EditorialContent):EditorialContent=>structuredClone(content)
const normalizeSlug=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[“”"'’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')

const parseContents=(raw:string|null):EditorialContent[]=>{
  try{
    const value=JSON.parse(raw||'[]') as unknown
    if(!Array.isArray(value))return []
    return value.filter((item):item is EditorialContent=>Boolean(item&&typeof item==='object'&&'id' in item&&'pageId' in item&&'title' in item&&'slug' in item)).map(clone)
  }catch{return []}
}
const read=():EditorialContent[]=>{
  const current=parseContents(localStorage.getItem(STORAGE_KEY))
  if(current.length)return current
  const legacy=parseContents(localStorage.getItem(LEGACY_STORAGE_KEY))
  if(legacy.length)localStorage.setItem(STORAGE_KEY,JSON.stringify(legacy))
  return legacy
}
const hidden=()=>new Set<string>((()=>{try{const value=JSON.parse(localStorage.getItem(HIDDEN_KEY)||'[]') as unknown;return Array.isArray(value)?value.filter((item):item is string=>typeof item==='string'):[]}catch{return []}})())
const emit=()=>window.dispatchEvent(new CustomEvent(EVENT_NAME))
const write=(contents:EditorialContent[])=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(contents.map(clone)));emit()}
const writeHidden=(ids:Set<string>)=>{localStorage.setItem(HIDDEN_KEY,JSON.stringify([...ids]));emit()}
const uniqueSlug=(base:string,pageId:string,contents:readonly EditorialContent[],currentId?:string)=>{
  const clean=normalizeSlug(base||'novo-conteudo')||'novo-conteudo'
  if(!contents.some(content=>content.id!==currentId&&content.pageId===pageId&&content.slug===clean))return clean
  let index=2
  while(contents.some(content=>content.id!==currentId&&content.pageId===pageId&&content.slug===`${clean}-${index}`))index+=1
  return `${clean}-${index}`
}

export const contentDraftRepository={
  eventName:EVENT_NAME,
  list:()=>read().map(clone),
  listHiddenIds:()=>[...hidden()],
  get(id:string){return read().find(content=>content.id===id)??null},
  listEffective(seed:readonly EditorialContent[]){
    const local=read(),hiddenIds=hidden(),seedIds=new Set(seed.map(content=>content.id)),overrides=new Map(local.filter(content=>seedIds.has(content.id)).map(content=>[content.id,content]))
    return [...seed.filter(content=>!hiddenIds.has(content.id)).map(content=>clone(overrides.get(content.id)??content)),...local.filter(content=>!seedIds.has(content.id)).map(clone)]
  },
  create(pageId:string){
    const contents=read(),now=new Date().toISOString()
    const content:EditorialContent={id:`content-draft-${crypto.randomUUID()}`,pageId,title:'Novo conteúdo',slug:uniqueSlug('novo-conteudo',pageId,contents),summary:'',body:[],author:'',status:'draft',active:false,tags:[],media:[],seo:{noIndex:true},createdAt:now,updatedAt:now}
    write([...contents,content]);return clone(content)
  },
  save(input:EditorialContent){
    const contents=read(),now=new Date().toISOString()
    const content:EditorialContent={...clone(input),slug:uniqueSlug(input.slug||input.title,input.pageId,contents,input.id),status:'draft',active:false,publishedAt:undefined,updatedAt:now,seo:{...input.seo,noIndex:true}}
    const next=contents.some(item=>item.id===content.id)?contents.map(item=>item.id===content.id?content:item):[...contents,content]
    write(next)
    const hiddenIds=hidden();hiddenIds.delete(content.id);writeHidden(hiddenIds)
    return clone(content)
  },
  remove(id:string,seed=false){
    write(read().filter(content=>content.id!==id))
    if(seed){const hiddenIds=hidden();hiddenIds.add(id);writeHidden(hiddenIds)}
  },
  restore(id:string){const hiddenIds=hidden();hiddenIds.delete(id);writeHidden(hiddenIds)},
}
