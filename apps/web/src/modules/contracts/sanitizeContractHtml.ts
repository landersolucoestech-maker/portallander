const blockedTags=new Set(['script','iframe','object','embed','link','meta','base','form','input','button','textarea','select','option'])
const allowedProtocols=new Set(['http:','https:','mailto:','tel:'])
const safeUrlBase='https://portal.invalid'

function safeUrl(value:string){
 const trimmed=value.trim()
 if(!trimmed||trimmed.startsWith('#')||trimmed.startsWith('/'))return trimmed
 try{
  const parsed=new URL(trimmed,safeUrlBase)
  return allowedProtocols.has(parsed.protocol)?trimmed:''
 }catch{return ''}
}

export function sanitizeContractHtml(input:string){
 if(!input.trim())return ''
 const documentNode=new DOMParser().parseFromString(input,'text/html')
 for(const element of Array.from(documentNode.body.querySelectorAll<HTMLElement>('*'))){
  const tag=element.tagName.toLowerCase()
  if(blockedTags.has(tag)){
   element.remove()
   continue
  }
  for(const attribute of Array.from(element.attributes)){
   const name=attribute.name.toLowerCase()
   if(name.startsWith('on')||name==='srcdoc'){
    element.removeAttribute(attribute.name)
    continue
   }
   if(name==='href'||name==='src'||name==='xlink:href'){
    const next=safeUrl(attribute.value)
    if(next)element.setAttribute(attribute.name,next)
    else element.removeAttribute(attribute.name)
   }
   if(name==='style'){
    const value=attribute.value.toLowerCase()
    if(value.includes('url(')||value.includes('expression(')||value.includes('javascript:'))element.removeAttribute(attribute.name)
   }
  }
  if(tag==='a'){
   element.setAttribute('rel','noopener noreferrer')
   if(element.getAttribute('target')==='_blank')element.setAttribute('target','_blank')
  }
 }
 return documentNode.body.innerHTML
}
