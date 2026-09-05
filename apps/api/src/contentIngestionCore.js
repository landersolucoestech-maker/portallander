import {createHash} from 'node:crypto'
import dns from 'node:dns/promises'
import net from 'node:net'
import {HttpError} from './editorialService.js'

export const MUSIC_RELEVANCE_TERMS=Object.freeze([
  'música','musica','music','mercado musical','music industry','indústria musical','industria musical','artista','artist','cantor','singer','rapper','funk','trap','gravadora','record label','selo','label','distribuidora','distributor','editora musical','music publisher','streaming','spotify','youtube','tiktok','deezer','direitos autorais','copyright','royalties','royalty','show','festival','turnê','turne','tour','lançamento','lancamento','release','álbum','album','single','playlist','charts','billboard','tecnologia musical','music technology','ia e música','ai music'
])

const TRACKING_PARAMS=new Set(['fbclid','gclid','dclid','msclkid','mc_cid','mc_eid','ref','ref_src'])
const htmlEntities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}
const clean=value=>String(value??'').trim()
const cap=(value,max)=>clean(value).slice(0,max)

export function decodeXml(value){
  return clean(value).replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i,'$1').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,code)=>{const n=code[0].toLowerCase()==='x'?parseInt(code.slice(1),16):parseInt(code,10);return Number.isFinite(n)?String.fromCodePoint(n):_}).replace(/&([a-z]+);/gi,(match,name)=>htmlEntities[name.toLowerCase()]??match)
}
export function stripMarkup(value){return decodeXml(value).replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
export function normalizeTitle(value){return stripMarkup(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ')}
export function titleHash(value){return createHash('sha256').update(normalizeTitle(value)).digest('hex')}
export function stableHash(value){return createHash('sha256').update(String(value??'')).digest('hex')}

export function normalizeExternalUrl(value){
  const url=new URL(clean(value))
  if(!['http:','https:'].includes(url.protocol))throw new HttpError(400,'URL externa deve utilizar HTTP ou HTTPS.','EXTERNAL_URL_PROTOCOL_INVALID')
  url.hash=''
  if((url.protocol==='https:'&&url.port==='443')||(url.protocol==='http:'&&url.port==='80'))url.port=''
  for(const key of [...url.searchParams.keys()])if(key.toLowerCase().startsWith('utm_')||TRACKING_PARAMS.has(key.toLowerCase()))url.searchParams.delete(key)
  url.hostname=url.hostname.toLowerCase()
  if(url.pathname.length>1)url.pathname=url.pathname.replace(/\/+$/,'')
  return url.toString()
}

function tokens(value){return new Set(normalizeTitle(value).split(' ').filter(token=>token.length>=3))}
export function titleSimilarity(a,b){
  const left=tokens(a),right=tokens(b)
  if(!left.size||!right.size)return 0
  let shared=0;for(const token of left)if(right.has(token))shared+=1
  return (2*shared)/(left.size+right.size)
}
export function likelySameStory(a,b){
  const similarity=titleSimilarity(a?.title,b?.title)
  const left=tokens(a?.title),right=tokens(b?.title)
  const publishedA=a?.publishedAt?new Date(a.publishedAt).getTime():0,publishedB=b?.publishedAt?new Date(b.publishedAt).getTime():0
  const withinWindow=!publishedA||!publishedB||Math.abs(publishedA-publishedB)<=72*60*60*1000
  return withinWindow&&Math.min(left.size,right.size)>=4&&similarity>=0.88
}

function contains(text,term){return text.includes(term.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase())}
export function classifyCandidate(input={}){
  const text=normalizeTitle(`${input.title||''} ${input.description||''}`)
  const rules=[
    ['Direitos Autorais',['direitos autorais','copyright','royalt','ecad','ubc','abramus']],
    ['Lançamentos',['lancamento','release','album','single','playlist','clipe','video musical']],
    ['Shows / Festivais',['show','festival','turne','tour','concert']],
    ['Tecnologia',['tecnologia','technology','inteligencia artificial','artificial intelligence',' ia ',' ai ','streaming','plataforma']],
    ['Negócios',['negocio','business','receita','revenue','gravadora','record label','distribuidora','publisher','aquisicao','acquisition']],
    ['Charts / Rankings',['chart','ranking','billboard','mais tocad','most streamed']],
    ['Oportunidades',['inscricoes','inscrições','edital','oportunidade','concurso','festival abre']],
    ['Artistas',['artista','artist','cantor','rapper','banda','singer']],
  ]
  for(const [category,terms] of rules)if(terms.some(term=>text.includes(normalizeTitle(term))))return category
  return input.sourceCategory||'Mercado Musical'
}

export function scoreCandidate(input={}){
  const text=normalizeTitle(`${input.title||''} ${input.description||''}`)
  let score=0;const reasons=[]
  const matches=MUSIC_RELEVANCE_TERMS.filter(term=>contains(text,normalizeTitle(term)))
  if(matches.length){const value=Math.min(35,8+matches.length*5);score+=value;reasons.push(`music-domain:${value}`)}
  const country=clean(input.country).toUpperCase(),language=clean(input.language).toLowerCase()
  if(country==='BR'||text.includes('brasil')||text.includes('brazil')){score+=15;reasons.push('brazil-relevance:15')}
  if(language.startsWith('pt')){score+=5;reasons.push('pt-language:5')}
  if(input.sourceType==='official_news'||input.provider==='official_source'){score+=15;reasons.push('official-source:15')}
  if(input.provider==='gdelt'){score+=8;reasons.push('gdelt-signal:8')}
  const published=input.publishedAt?new Date(input.publishedAt).getTime():0
  if(published&&Number.isFinite(published)){
    const ageHours=Math.max(0,(Date.now()-published)/3_600_000)
    const freshness=ageHours<=6?20:ageHours<=24?15:ageHours<=72?10:ageHours<=168?5:0
    if(freshness){score+=freshness;reasons.push(`freshness:${freshness}`)}
  }
  const views=Number(input.statistics?.viewCount||0)
  if(input.provider==='youtube'&&views>0){const popularity=Math.min(20,Math.max(1,Math.round(Math.log10(views+1)*3)));score+=popularity;reasons.push(`youtube-relative-signal:${popularity}`)}
  return {score:Math.min(100,score),reasons,matches:[...new Set(matches.map(normalizeTitle))].slice(0,12)}
}

function tagText(block,names){
  for(const name of names){const escaped=name.replace(':','\\:');const match=block.match(new RegExp(`<${escaped}\\b[^>]*>([\\s\\S]*?)<\\/${escaped}>`,'i'));if(match)return stripMarkup(match[1])}
  return ''
}
function attr(tag,name){const match=tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,'i'));return decodeXml(match?.[1]??match?.[2]??'')}
function absoluteUrl(value,base){if(!value)return '';try{return new URL(value,base).toString()}catch{return ''}}
function imageFromBlock(block,base){
  const media=block.match(/<(?:media:thumbnail|media:content)\b[^>]*>/i);if(media){const url=attr(media[0],'url');if(url)return absoluteUrl(url,base)}
  const enclosure=[...block.matchAll(/<enclosure\b[^>]*>/gi)].find(match=>/^image\//i.test(attr(match[0],'type')));if(enclosure){const url=attr(enclosure[0],'url');if(url)return absoluteUrl(url,base)}
  return ''
}
function atomLink(block,base){const tags=[...block.matchAll(/<link\b[^>]*>/gi)];const preferred=tags.find(match=>!attr(match[0],'rel')||attr(match[0],'rel')==='alternate')||tags[0];return preferred?absoluteUrl(attr(preferred[0],'href'),base):''}
function dateValue(value){if(!value)return null;const date=new Date(value);return Number.isFinite(date.getTime())?date.toISOString():null}

export function parseSyndicationFeed(xml,{feedUrl='',sourceName=''}={}){
  const text=String(xml??'')
  const isAtom=/<feed\b[^>]*[\s>]/i.test(text),isRss=/<rss\b[^>]*[\s>]/i.test(text)||/<rdf:RDF\b/i.test(text)
  if(!isAtom&&!isRss)throw new HttpError(422,'O documento não é um RSS/Atom reconhecido.','FEED_XML_INVALID')
  const blocks=isAtom?[...text.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)]:[...text.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
  if(!blocks.length)throw new HttpError(422,'O feed não contém itens válidos.','FEED_ITEMS_EMPTY')
  return blocks.map((match,index)=>{
    const block=match[1],title=tagText(block,['title'])
    const link=isAtom?atomLink(block,feedUrl):absoluteUrl(tagText(block,['link']),feedUrl)
    const externalId=tagText(block,isAtom?['id']:['guid'])||link||`${sourceName}:${index}:${title}`
    const description=cap(tagText(block,isAtom?['summary','content']:['description','content:encoded']),1200)
    const publishedAt=dateValue(tagText(block,isAtom?['published','updated']:['pubDate','dc:date','date']))
    const author=tagText(block,isAtom?['author','name']:['author','dc:creator'])
    return {externalId,title,canonicalUrl:link,description,author,publishedAt,imageUrl:imageFromBlock(block,feedUrl),rawMetadata:{feedKind:isAtom?'atom':'rss'}}
  }).filter(item=>item.title&&item.canonicalUrl)
}

function privateIpv4(address){const parts=address.split('.').map(Number);if(parts.length!==4||parts.some(n=>!Number.isInteger(n)||n<0||n>255))return true;const [a,b]=parts;return a===0||a===10||a===127||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===100&&b>=64&&b<=127)||a>=224}
export function isPrivateAddress(address){
  const version=net.isIP(address);if(version===4)return privateIpv4(address);if(version!==6)return true
  const value=address.toLowerCase();if(value==='::'||value==='::1'||value.startsWith('fc')||value.startsWith('fd')||value.startsWith('fe8')||value.startsWith('fe9')||value.startsWith('fea')||value.startsWith('feb'))return true
  const mapped=value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);return mapped?privateIpv4(mapped[1]):false
}
export async function assertSafeExternalUrl(value,{lookup=dns.lookup}={}){
  let url;try{url=new URL(clean(value))}catch{throw new HttpError(400,'URL externa inválida.','EXTERNAL_URL_INVALID')}
  if(!['http:','https:'].includes(url.protocol))throw new HttpError(400,'Apenas HTTP/HTTPS são permitidos para fontes externas.','EXTERNAL_URL_PROTOCOL_INVALID')
  if(url.username||url.password)throw new HttpError(400,'Credenciais embutidas na URL não são permitidas.','EXTERNAL_URL_CREDENTIALS_FORBIDDEN')
  const host=url.hostname.toLowerCase();if(host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host.endsWith('.internal'))throw new HttpError(400,'Destino de rede privada não é permitido.','EXTERNAL_URL_PRIVATE_DESTINATION')
  if(net.isIP(host)&&isPrivateAddress(host))throw new HttpError(400,'Destino de rede privada não é permitido.','EXTERNAL_URL_PRIVATE_DESTINATION')
  let records;try{records=await lookup(host,{all:true,verbatim:true})}catch{throw new HttpError(400,'Não foi possível resolver o host da fonte.','EXTERNAL_URL_DNS_FAILED')}
  if(!records?.length||records.some(record=>isPrivateAddress(record.address)))throw new HttpError(400,'Destino de rede privada não é permitido.','EXTERNAL_URL_PRIVATE_DESTINATION')
  return url
}

async function readLimitedBody(response,maxBytes){
  const declared=Number(response.headers?.get?.('content-length')||0);if(declared&&declared>maxBytes)throw new HttpError(413,'Resposta externa excede o limite permitido.','EXTERNAL_RESPONSE_TOO_LARGE')
  if(!response.body)return ''
  const reader=response.body.getReader();const chunks=[];let total=0
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>maxBytes){await reader.cancel().catch(()=>undefined);throw new HttpError(413,'Resposta externa excede o limite permitido.','EXTERNAL_RESPONSE_TOO_LARGE')}chunks.push(Buffer.from(value))}
  return Buffer.concat(chunks).toString('utf8')
}

export function createSafeExternalFetcher({lookup=dns.lookup,fetchImpl=fetch}={}){
  return async function safeExternalFetch(value,{timeoutMs=10_000,maxBytes=2*1024*1024,accept='application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9'}={}){
    let current=await assertSafeExternalUrl(value,{lookup})
    for(let redirect=0;redirect<=3;redirect+=1){
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);timer.unref?.()
      let response
      try{response=await fetchImpl(current,{method:'GET',redirect:'manual',signal:controller.signal,headers:{accept,'user-agent':'PortalLanderEditorialIngestion/1.0'}})}catch(error){clearTimeout(timer);if(error?.name==='AbortError')throw new HttpError(504,'A fonte excedeu o tempo limite.','EXTERNAL_FETCH_TIMEOUT');throw new HttpError(503,'Não foi possível acessar a fonte externa.','EXTERNAL_FETCH_NETWORK_ERROR')}
      clearTimeout(timer)
      if(response.status>=300&&response.status<400){const location=response.headers.get('location');if(!location)throw new HttpError(502,'Redirect externo sem destino.','EXTERNAL_REDIRECT_INVALID');if(redirect===3)throw new HttpError(502,'A fonte excedeu o limite de redirects.','EXTERNAL_REDIRECT_LIMIT');current=await assertSafeExternalUrl(new URL(location,current).toString(),{lookup});continue}
      if(!response.ok)throw new HttpError(response.status>=500?503:502,`Fonte externa respondeu HTTP ${response.status}.`,'EXTERNAL_FETCH_HTTP_ERROR',{externalStatus:response.status})
      const body=await readLimitedBody(response,maxBytes)
      return {body,url:current.toString(),contentType:clean(response.headers.get('content-type')).toLowerCase(),status:response.status}
    }
    throw new HttpError(502,'Redirect externo inválido.','EXTERNAL_REDIRECT_INVALID')
  }
}
export const safeExternalFetch=createSafeExternalFetcher()

async function fixedJson(url,{timeoutMs=10_000,maxBytes=2*1024*1024}={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);timer.unref?.();let response
  try{response=await fetch(url,{signal:controller.signal,headers:{accept:'application/json','user-agent':'PortalLanderEditorialIngestion/1.0'}})}catch(error){clearTimeout(timer);if(error?.name==='AbortError')throw new HttpError(504,'Provider excedeu o tempo limite.','PROVIDER_TIMEOUT');throw new HttpError(503,'Provider externo indisponível.','PROVIDER_NETWORK_ERROR')}
  clearTimeout(timer);if(!response.ok)throw new HttpError(response.status===429?429:response.status>=500?503:502,`Provider respondeu HTTP ${response.status}.`,'PROVIDER_HTTP_ERROR',{externalStatus:response.status})
  const text=await readLimitedBody(response,maxBytes);try{return JSON.parse(text)}catch{throw new HttpError(502,'Provider retornou JSON inválido.','PROVIDER_RESPONSE_INVALID')}
}

export async function fetchGdeltItems(configuration={}){
  const params=new URLSearchParams({query:clean(configuration.query)||'(music OR streaming OR Spotify OR YouTube OR "record label" OR copyright OR royalties) (Brazil OR Brasil)',mode:'ArtList',format:'json',sort:'DateDesc',maxrecords:String(Math.min(75,Math.max(1,Number(configuration.maxRecords)||50))),timespan:clean(configuration.timespan)||'24h'})
  const payload=await fixedJson(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`)
  const articles=Array.isArray(payload?.articles)?payload.articles:[]
  return articles.map(article=>({externalId:stableHash(article.url||`${article.title}|${article.seendate}`),title:clean(article.title),canonicalUrl:clean(article.url),description:'',author:clean(article.domain),publishedAt:dateValue(article.seendate),imageUrl:clean(article.socialimage),language:clean(article.language),country:clean(article.sourcecountry),rawMetadata:{domain:clean(article.domain),language:clean(article.language),sourceCountry:clean(article.sourcecountry)}})).filter(item=>item.title&&item.canonicalUrl)
}

export async function fetchYouTubeItems(configuration={},apiKey=process.env.YOUTUBE_API_KEY){
  const key=clean(apiKey);if(!key)throw new HttpError(503,'YouTube Data API key não configurada no backend.','YOUTUBE_NOT_CONFIGURED')
  const searchParams=new URLSearchParams({part:'snippet',type:'video',order:'date',q:clean(configuration.query)||'música lançamento Brasil',regionCode:clean(configuration.regionCode)||'BR',relevanceLanguage:clean(configuration.relevanceLanguage)||'pt',maxResults:String(Math.min(25,Math.max(1,Number(configuration.maxResults)||25))),key})
  const search=await fixedJson(`https://www.googleapis.com/youtube/v3/search?${searchParams}`)
  const ids=(Array.isArray(search?.items)?search.items:[]).map(item=>clean(item?.id?.videoId)).filter(Boolean)
  if(!ids.length)return []
  const videoParams=new URLSearchParams({part:'snippet,statistics',id:ids.join(','),key})
  const videos=await fixedJson(`https://www.googleapis.com/youtube/v3/videos?${videoParams}`),byId=new Map((Array.isArray(videos?.items)?videos.items:[]).map(item=>[clean(item.id),item]))
  return ids.map(id=>{const item=byId.get(id),snippet=item?.snippet||{},statistics=item?.statistics||{};return {externalId:id,title:clean(snippet.title),canonicalUrl:`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,description:cap(snippet.description,1000),author:clean(snippet.channelTitle),publishedAt:dateValue(snippet.publishedAt),imageUrl:clean(snippet.thumbnails?.high?.url||snippet.thumbnails?.medium?.url||snippet.thumbnails?.default?.url),language:clean(snippet.defaultLanguage||snippet.defaultAudioLanguage||configuration.relevanceLanguage||'pt'),country:clean(configuration.regionCode||'BR'),statistics:{viewCount:Number(statistics.viewCount)||0,likeCount:Number(statistics.likeCount)||0},rawMetadata:{videoId:id,channelId:clean(snippet.channelId),channelTitle:clean(snippet.channelTitle),categoryId:clean(snippet.categoryId),statistics:{viewCount:Number(statistics.viewCount)||0,likeCount:Number(statistics.likeCount)||0}}}}).filter(item=>item.title)
}
