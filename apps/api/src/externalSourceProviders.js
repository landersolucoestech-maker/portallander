import {lookup} from 'node:dns/promises'
import {isIP} from 'node:net'
import {HttpError} from './editorialService.js'

const MAX_BYTES=2*1024*1024
const MAX_REDIRECTS=3
const DEFAULT_TIMEOUT_MS=12_000
const clean=value=>String(value??'').trim()
const stripHtml=value=>clean(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
const decodeXml=value=>stripHtml(value).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")

function blockedIp(value){
  if(!isIP(value))return false
  if(value==='0.0.0.0'||value==='::'||value==='::1')return true
  if(value.startsWith('127.')||value.startsWith('10.')||value.startsWith('169.254.')||value.startsWith('192.168.'))return true
  const parts=value.split('.').map(Number)
  if(parts.length===4&&parts[0]===172&&parts[1]>=16&&parts[1]<=31)return true
  if(value.toLowerCase().startsWith('fc')||value.toLowerCase().startsWith('fd')||value.toLowerCase().startsWith('fe80:'))return true
  return false
}

export async function assertSafeExternalUrl(value,{allowedHosts=[]}={}){
  let url
  try{url=new URL(clean(value))}catch{throw new HttpError(400,'URL externa inválida.','EXTERNAL_SOURCE_URL_INVALID')}
  if(!['http:','https:'].includes(url.protocol))throw new HttpError(400,'Somente URLs HTTP/HTTPS são permitidas.','EXTERNAL_SOURCE_PROTOCOL_FORBIDDEN')
  if(url.username||url.password)throw new HttpError(400,'Credenciais embutidas na URL não são permitidas.','EXTERNAL_SOURCE_URL_CREDENTIALS_FORBIDDEN')
  const hostname=url.hostname.toLowerCase()
  if(!hostname||hostname==='localhost'||hostname.endsWith('.localhost')||hostname.endsWith('.local'))throw new HttpError(400,'Destino local não é permitido.','EXTERNAL_SOURCE_HOST_FORBIDDEN')
  if(allowedHosts.length&&!allowedHosts.map(x=>x.toLowerCase()).includes(hostname))throw new HttpError(400,'Host externo não permitido para este provider.','EXTERNAL_SOURCE_HOST_FORBIDDEN')
  if(blockedIp(hostname))throw new HttpError(400,'Endereços privados ou reservados não são permitidos.','EXTERNAL_SOURCE_HOST_FORBIDDEN')
  if(!isIP(hostname)){
    let records
    try{records=await lookup(hostname,{all:true,verbatim:true})}catch{throw new HttpError(400,'Não foi possível resolver o host configurado.','EXTERNAL_SOURCE_HOST_UNRESOLVED')}
    if(!records.length||records.some(record=>blockedIp(record.address)))throw new HttpError(400,'O host resolve para endereço privado ou reservado.','EXTERNAL_SOURCE_HOST_FORBIDDEN')
  }
  return url
}

async function readLimitedBody(response,maxBytes=MAX_BYTES){
  const reader=response.body?.getReader()
  if(!reader)return ''
  let total=0,chunks=[]
  while(true){
    const {done,value}=await reader.read()
    if(done)break
    total+=value.byteLength
    if(total>maxBytes)throw new HttpError(413,'Resposta externa excede o limite permitido.','EXTERNAL_SOURCE_RESPONSE_TOO_LARGE')
    chunks.push(value)
  }
  const merged=new Uint8Array(total);let offset=0
  for(const chunk of chunks){merged.set(chunk,offset);offset+=chunk.byteLength}
  return new TextDecoder('utf-8',{fatal:false}).decode(merged)
}

export async function safeExternalFetch(value,{allowedHosts=[],timeoutMs=DEFAULT_TIMEOUT_MS,accept='application/xml,text/xml,application/rss+xml,application/atom+xml,text/plain;q=0.8,*/*;q=0.2'}={}){
  let url=await assertSafeExternalUrl(value,{allowedHosts})
  for(let redirect=0;redirect<=MAX_REDIRECTS;redirect+=1){
    let response
    try{response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(timeoutMs),headers:{Accept:accept,'User-Agent':'PortalLander-EditorialIngestion/1.0'}})}
    catch(error){if(error?.name==='TimeoutError')throw new HttpError(504,'A fonte excedeu o timeout.','EXTERNAL_SOURCE_TIMEOUT');throw new HttpError(503,'Não foi possível conectar à fonte externa.','EXTERNAL_SOURCE_NETWORK_ERROR')}
    if([301,302,303,307,308].includes(response.status)){
      if(redirect===MAX_REDIRECTS)throw new HttpError(502,'A fonte excedeu o limite de redirects.','EXTERNAL_SOURCE_REDIRECT_LIMIT')
      const location=response.headers.get('location')
      if(!location)throw new HttpError(502,'Redirect externo sem destino.','EXTERNAL_SOURCE_REDIRECT_INVALID')
      url=await assertSafeExternalUrl(new URL(location,url).toString(),{allowedHosts})
      continue
    }
    const body=await readLimitedBody(response)
    if(!response.ok)throw new HttpError(response.status>=500?503:502,`Fonte externa respondeu HTTP ${response.status}.`,'EXTERNAL_SOURCE_HTTP_ERROR',{status:response.status})
    return {response,body,url:url.toString()}
  }
  throw new HttpError(502,'Falha ao seguir redirects da fonte.','EXTERNAL_SOURCE_REDIRECT_LIMIT')
}

function tag(xml,names){for(const name of names){const match=xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i'));if(match)return decodeXml(match[1])}return ''}
function attr(xml,name,attrName){const match=xml.match(new RegExp(`<${name}[^>]*\\s${attrName}=["']([^"']+)["'][^>]*>`,'i'));return match?clean(match[1]):''}
function isoDate(value){const date=new Date(clean(value));return Number.isNaN(date.getTime())?null:date.toISOString()}

export function parseRssAtom(xml){
  const raw=clean(xml)
  if(!raw||(!/<rss\b/i.test(raw)&&!/<feed\b/i.test(raw)))throw new HttpError(422,'XML não é RSS 2.0 nem Atom reconhecível.','FEED_XML_INVALID')
  const atom=/<feed\b/i.test(raw)&&!/<rss\b/i.test(raw)
  const blocks=atom?[...raw.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)]:[...raw.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
  const sourceTitle=tag(raw,['title'])
  return {sourceTitle,items:blocks.map(match=>{
    const block=match[1]
    const link=atom?(attr(block,'link','href')||tag(block,['link'])):tag(block,['link'])
    const externalId=tag(block,atom?['id']:['guid'])||link
    const imageUrl=attr(block,'media:thumbnail','url')||attr(block,'media:content','url')||attr(block,'enclosure','url')
    return {externalId,title:tag(block,['title']),url:link,description:tag(block,['description','summary','content','content:encoded']),author:tag(block,['author','dc:creator']),publishedAt:isoDate(tag(block,['pubDate','dc:date','published','updated'])),imageUrl,metadata:{feedFormat:atom?'atom':'rss2'}}
  }).filter(item=>item.title&&item.url)}
}

export async function fetchRssSource(source){
  const target=clean(source.feedUrl||source.url)
  if(!target)throw new HttpError(409,'A fonte não possui feed URL configurada.','FEED_URL_REQUIRED')
  const {body}=await safeExternalFetch(target)
  return parseRssAtom(body).items
}

export async function fetchGdeltSource(source){
  const cfg=source.configuration||{},query=clean(cfg.query)||'(music OR musician OR streaming OR spotify OR "music industry") (Brazil OR Brasil)'
  const params=new URLSearchParams({query,mode:'artlist',format:'json',sort:'datedesc',maxrecords:String(Math.min(75,Math.max(1,Number(cfg.maxRecords)||50))),timespan:clean(cfg.timespan)||'24h'})
  const endpoint=`https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`
  const {body}=await safeExternalFetch(endpoint,{allowedHosts:['api.gdeltproject.org'],accept:'application/json'})
  let payload
  try{payload=JSON.parse(body)}catch{throw new HttpError(502,'GDELT retornou JSON inválido.','GDELT_RESPONSE_INVALID')}
  return (Array.isArray(payload?.articles)?payload.articles:[]).map(article=>({externalId:clean(article.url),title:clean(article.title),url:clean(article.url),description:'',imageUrl:clean(article.socialimage),author:'',publishedAt:isoDate(article.seendate),language:clean(article.language),country:clean(article.sourcecountry),metadata:{domain:clean(article.domain),sourceCountry:clean(article.sourcecountry),language:clean(article.language),provider:'gdelt'}})).filter(item=>item.title&&item.url)
}

export async function fetchYoutubeSource(source){
  const apiKey=clean(process.env.YOUTUBE_API_KEY)
  if(!apiKey)throw new HttpError(503,'YouTube Data API ainda não está configurada no backend.','YOUTUBE_NOT_CONFIGURED')
  const cfg=source.configuration||{},regionCode=clean(cfg.regionCode||source.country||'BR').toUpperCase(),maxResults=Math.min(50,Math.max(1,Number(cfg.maxResults)||25))
  const params=new URLSearchParams({part:'snippet,statistics',chart:'mostPopular',regionCode,maxResults:String(maxResults),key:apiKey})
  const endpoint=`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`
  const {body}=await safeExternalFetch(endpoint,{allowedHosts:['www.googleapis.com'],accept:'application/json'})
  let payload
  try{payload=JSON.parse(body)}catch{throw new HttpError(502,'YouTube retornou JSON inválido.','YOUTUBE_RESPONSE_INVALID')}
  if(payload?.error)throw new HttpError(payload.error.code===403?429:502,clean(payload.error.message)||'YouTube Data API retornou erro.','YOUTUBE_API_ERROR')
  return (Array.isArray(payload?.items)?payload.items:[]).map(video=>{
    const views=Number(video.statistics?.viewCount)||0,likes=Number(video.statistics?.likeCount)||0
    const momentumScore=views>0?Math.min(12,Math.log10(views+1)*1.5+(likes/views)*20):0
    return {externalId:clean(video.id),title:clean(video.snippet?.title),url:`https://www.youtube.com/watch?v=${encodeURIComponent(video.id||'')}`,description:clean(video.snippet?.description).slice(0,1000),imageUrl:clean(video.snippet?.thumbnails?.high?.url||video.snippet?.thumbnails?.medium?.url||video.snippet?.thumbnails?.default?.url),author:clean(video.snippet?.channelTitle),publishedAt:isoDate(video.snippet?.publishedAt),language:clean(video.snippet?.defaultLanguage||video.snippet?.defaultAudioLanguage),country:regionCode,metadata:{channelId:clean(video.snippet?.channelId),views,likes,momentumScore,regionCode,provider:'youtube'}}
  }).filter(item=>item.externalId&&item.title)
}

export async function collectSourceItems(source){
  if(source.provider==='rss'||source.provider==='official_source')return fetchRssSource(source)
  if(source.provider==='gdelt')return fetchGdeltSource(source)
  if(source.provider==='youtube')return fetchYoutubeSource(source)
  throw new HttpError(400,'Provider não suporta ingestão editorial.','EDITORIAL_SOURCE_PROVIDER_UNSUPPORTED')
}
