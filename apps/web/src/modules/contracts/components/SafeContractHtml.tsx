import {Fragment,createElement,type ReactNode} from 'react'

const ALLOWED_TAGS=new Set(['p','br','strong','b','em','i','u','s','h1','h2','h3','h4','h5','h6','ul','ol','li','blockquote','table','thead','tbody','tfoot','tr','th','td','a','span','div','hr','small','sub','sup','img'])
const BLOCKED_TAGS=new Set(['script','style','noscript','iframe','object','embed','svg','math','form','input','button','textarea','select','option','video','audio','source','canvas','meta','link','base'])

const safeUrl=(value:string,kind:'link'|'image')=>{
 const url=value.trim()
 if(!url)return''
 if(kind==='image'&&/^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[a-z0-9+/=]+$/i.test(url))return url
 if(url.startsWith('#'))return kind==='link'?url:''
 if(url.startsWith('/')&&!url.startsWith('//'))return url
 if(kind==='link'&&/^(?:mailto:|tel:)/i.test(url))return url
 if(/^https:\/\//i.test(url))return url
 return''
}

const positiveInt=(value:string)=>{
 const parsed=Number.parseInt(value,10)
 return Number.isFinite(parsed)&&parsed>0&&parsed<=20?parsed:undefined
}

function renderNode(node:Node,key:string):ReactNode{
 if(node.nodeType===3)return node.textContent
 if(node.nodeType!==1)return null
 const element=node as HTMLElement
 const tag=element.tagName.toLowerCase()
 if(BLOCKED_TAGS.has(tag))return null
 const children=Array.from(element.childNodes).map((child,index)=>renderNode(child,`${key}-${index}`))
 if(!ALLOWED_TAGS.has(tag))return <Fragment key={key}>{children}</Fragment>
 const props:Record<string,unknown>={key}
 const title=element.getAttribute('title')?.trim()
 if(title)props.title=title
 if(tag==='a'){
  const href=safeUrl(element.getAttribute('href')??'','link')
  if(href){props.href=href;if(/^https:\/\//i.test(href)){props.target='_blank';props.rel='noopener noreferrer'}}
 }
 if(tag==='img'){
  const src=safeUrl(element.getAttribute('src')??'','image')
  if(!src)return null
  props.src=src
  props.alt=element.getAttribute('alt')?.trim()??''
 }
 if(tag==='th'||tag==='td'){
  const colSpan=positiveInt(element.getAttribute('colspan')??'')
  const rowSpan=positiveInt(element.getAttribute('rowspan')??'')
  if(colSpan)props.colSpan=colSpan
  if(rowSpan)props.rowSpan=rowSpan
 }
 return createElement(tag,props,...children)
}

const textFallback=(html:string)=>html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()

export function SafeContractHtml({html}:{html:string}){
 if(!html.trim())return null
 if(typeof DOMParser==='undefined')return <>{textFallback(html)}</>
 const document=new DOMParser().parseFromString(html,'text/html')
 return <>{Array.from(document.body.childNodes).map((node,index)=>renderNode(node,String(index)))}</>
}
