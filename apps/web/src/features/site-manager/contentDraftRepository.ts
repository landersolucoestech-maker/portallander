import type {EditorialContent} from '../editorial/model'

const STORAGE_KEY='portal-lander:cms:content-drafts:v1'
const EVENT_NAME='portal-lander:content-drafts:changed'
const clone=(content:EditorialContent):EditorialContent=>structuredClone(content)
const normalizeSlug=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[“”"'’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')

const read=():EditorialContent[]=>{
  try{
    const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]') as unknown
    if(!Array.isArray(value))return []
    return value.filter((item):item is EditorialContent=>Boolean(item&&typeof item==='object'&&'id' in item&&'pageId' in item&&'title' in item&&'slug' in item))
      .map(item=>({...clone(item),status:'draft',active:false,publishedAt:undefined}))
  }catch{return []}
}
const write=(contents:EditorialContent[])=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify(contents.map(content=>({...clone(content),status:'draft',active:false,publishedAt:undefined}))))
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}
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
  get(id:string){return read().find(content=>content.id===id)??null},
  create(pageId:string){
    const contents=read(),now=new Date().toISOString()
    const content:EditorialContent={
      id:`content-draft-${crypto.randomUUID()}`,
      pageId,
      title:'Novo conteúdo',
      slug:uniqueSlug('novo-conteudo',pageId,contents),
      summary:'',
      body:[],
      author:'',
      status:'draft',
      active:false,
      tags:[],
      media:[],
      seo:{noIndex:true},
      createdAt:now,
      updatedAt:now,
    }
    write([...contents,content])
    return clone(content)
  },
  save(input:EditorialContent){
    const contents=read(),now=new Date().toISOString()
    const content:EditorialContent={...clone(input),slug:uniqueSlug(input.slug||input.title,input.pageId,contents,input.id),status:'draft',active:false,publishedAt:undefined,updatedAt:now,seo:{...input.seo,noIndex:true}}
    const next=contents.some(item=>item.id===content.id)?contents.map(item=>item.id===content.id?content:item):[...contents,content]
    write(next)
    return clone(content)
  },
  remove(id:string){write(read().filter(content=>content.id!==id))},
}
