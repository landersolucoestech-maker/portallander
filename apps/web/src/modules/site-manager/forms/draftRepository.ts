import type {SiteFormDefinition} from './domain'

const STORAGE_KEY='portal-lander:cms:form-drafts:v1'
const EVENT_NAME='portal-lander:site-form-drafts:changed'

const clone=<T>(value:T):T=>structuredClone(value)
const read=():SiteFormDefinition[]=>{
  try{
    const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]') as unknown
    if(!Array.isArray(value))return []
    return value.filter((item):item is SiteFormDefinition=>Boolean(item&&typeof item==='object'&&'id' in item&&'slug' in item&&'fields' in item))
      .map(item=>({...clone(item),source:'custom' as const,status:'draft' as const}))
  }catch{return []}
}
const write=(forms:SiteFormDefinition[])=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify(forms.map(form=>({...clone(form),source:'custom',status:'draft'}))))
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}
const uniqueSlug=(base:string,forms:readonly SiteFormDefinition[])=>{
  const clean=(base||'novo-formulario').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'novo-formulario'
  if(!forms.some(form=>form.slug===clean))return clean
  let index=2
  while(forms.some(form=>form.slug===`${clean}-${index}`))index+=1
  return `${clean}-${index}`
}

export const formDraftRepository={
  eventName:EVENT_NAME,
  list:()=>read().map(clone),
  get(idOrSlug:string){return read().find(form=>form.id===idOrSlug||form.slug===idOrSlug)??null},
  create(input?:Partial<SiteFormDefinition>){
    const forms=read()
    const id=`form-draft-${crypto.randomUUID()}`
    const form:SiteFormDefinition={
      id,
      name:input?.name?.trim()||'Novo formulário',
      slug:uniqueSlug(input?.slug||input?.name||'novo-formulario',forms),
      version:1,
      purpose:input?.purpose||'custom',
      status:'draft',
      source:'custom',
      fields:clone(input?.fields??[]),
      consents:clone(input?.consents??[]),
      routing:clone(input?.routing??{destination:'none'}),
      successMessage:input?.successMessage||'Recebemos suas informações com sucesso.',
    }
    write([...forms,form])
    return clone(form)
  },
  duplicate(source:SiteFormDefinition){
    return this.create({...clone(source),id:undefined,name:`${source.name} — cópia`,slug:`${source.slug}-copia`,version:1,status:'draft',source:'custom'})
  },
  save(input:SiteFormDefinition){
    const forms=read()
    const draft:{source:'custom';status:'draft'}&SiteFormDefinition={...clone(input),source:'custom',status:'draft'}
    const next=forms.some(form=>form.id===draft.id)?forms.map(form=>form.id===draft.id?draft:form):[...forms,draft]
    write(next)
    return clone(draft)
  },
  remove(id:string){write(read().filter(form=>form.id!==id))},
}
