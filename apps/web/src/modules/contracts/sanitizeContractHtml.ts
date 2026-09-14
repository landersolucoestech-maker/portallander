const ALLOWED_TAGS=new Set(['A','B','BLOCKQUOTE','BR','DIV','EM','H1','H2','H3','H4','H5','H6','HR','I','IMG','LI','OL','P','SPAN','STRONG','TABLE','TBODY','TD','TH','THEAD','TR','U','UL'])
const DROP_CONTENT_TAGS=new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','SVG','MATH','NOSCRIPT','TEMPLATE'])
const SAFE_DATA_IMAGE=/^data:image\/(?:png|gif|jpe?g|webp);base64,/i

const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]??char))

function safeUrl(value:string,kind:'href'|'src'){
 const normalized=value.trim()
 if(!normalized)return''
 if(kind==='src'&&SAFE_DATA_IMAGE.test(normalized))return normalized
 if(normalized.startsWith('#')||normalized.startsWith('/')||normalized.startsWith('./')||normalized.startsWith('../'))return normalized
 try{
  const url=new URL(normalized,window.location.origin)
  if(['http:','https:'].includes(url.protocol))return normalized
  if(kind==='href'&&['mailto:','tel:'].includes(url.protocol))return normalized
 }catch{return''}
 return''
}

function sanitizeElement(element:Element){
 const tag=element.tagName.toUpperCase()
 if(DROP_CONTENT_TAGS.has(tag)){element.remove();return}
 if(!ALLOWED_TAGS.has(tag)){
  const parent=element.parentNode
  if(!parent)return
  while(element.firstChild)parent.insertBefore(element.firstChild,element)
  element.remove()
  return
 }
 const values=new Map<string,string>()
 for(const attribute of Array.from(element.attributes)){
  const name=attribute.name.toLowerCase()
  if(tag==='A'&&name==='href'){const value=safeUrl(attribute.value,'href');if(value)values.set('href',value)}
  if(tag==='A'&&name==='target'&&attribute.value==='_blank')values.set('target','_blank')
  if(tag==='IMG'&&name==='src'){const value=safeUrl(attribute.value,'src');if(value)values.set('src',value)}
  if(tag==='IMG'&&name==='alt')values.set('alt',attribute.value.slice(0,500))
  if(['TD','TH'].includes(tag)&&['colspan','rowspan'].includes(name)&&/^\d{1,2}$/.test(attribute.value))values.set(name,attribute.value)
 }
 for(const attribute of Array.from(element.attributes))element.removeAttribute(attribute.name)
 for(const [name,value] of values)element.setAttribute(name,value)
 if(tag==='A'&&element.getAttribute('target')==='_blank')element.setAttribute('rel','noopener noreferrer')
 for(const child of Array.from(element.children))sanitizeElement(child)
}

export function sanitizeContractHtml(input:string){
 if(!input.trim())return''
 if(typeof DOMParser==='undefined'||typeof window==='undefined')return escapeHtml(input)
 const document=new DOMParser().parseFromString(input,'text/html')
 for(const child of Array.from(document.body.children))sanitizeElement(child)
 return document.body.innerHTML
}

export function plainTextToContractHtml(input:string){
 return escapeHtml(input).replace(/\r?\n/g,'<br>')
}
