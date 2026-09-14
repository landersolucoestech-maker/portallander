import {HttpError} from './editorialService.js'
import {formatMarketingHashtags,normalizeMarketingHashtag,validateMarketingHashtags} from '../../../packages/shared/marketingHashtags.js'

const GRAPH_BASE='https://graph.facebook.com'
const DEFAULT_VERSION='v24.0'
const REQUEST_TIMEOUT_MS=20_000
const CONTAINER_POLL_ATTEMPTS=8
const CONTAINER_POLL_DELAY_MS=1_500
const clean=value=>String(value??'').trim()

export function instagramMarketingConfig(env=process.env){
  const accessToken=clean(env.INSTAGRAM_ACCESS_TOKEN),userId=clean(env.INSTAGRAM_USER_ID),version=clean(env.META_GRAPH_API_VERSION)||DEFAULT_VERSION
  return {accessToken,userId,version,configured:Boolean(accessToken&&userId)}
}

export function isInstagramMarketingConfigured(env=process.env){return instagramMarketingConfig(env).configured}

function configuredOrThrow(env){
  const config=instagramMarketingConfig(env)
  if(!config.configured)throw new HttpError(503,'Instagram ainda não está configurado no backend. Defina INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_USER_ID.','INSTAGRAM_NOT_CONFIGURED')
  return config
}

function providerError(response,payload){
  const detail=clean(payload?.error?.message||payload?.message)
  return new HttpError(response.status>=500?502:response.status,detail||`Instagram respondeu ${response.status}.`,'INSTAGRAM_REQUEST_FAILED',{providerStatus:response.status,providerCode:payload?.error?.code??null,providerSubcode:payload?.error?.error_subcode??null})
}

async function graphJson(path,{method='GET',body,env=process.env,fetchImpl=globalThis.fetch,timeoutMs=REQUEST_TIMEOUT_MS}={}){
  if(typeof fetchImpl!=='function')throw new TypeError('Instagram fetch implementation is required.')
  const config=configuredOrThrow(env)
  let response
  try{
    response=await fetchImpl(`${GRAPH_BASE}/${encodeURIComponent(config.version)}/${path}`,{method,headers:{Authorization:`Bearer ${config.accessToken}`,Accept:'application/json',...(body?{'Content-Type':'application/x-www-form-urlencoded'}:{})},...(body?{body}:{}) ,signal:AbortSignal.timeout(timeoutMs)})
  }catch(error){
    if(error?.name==='TimeoutError'||error?.name==='AbortError')throw new HttpError(504,'Instagram excedeu o tempo limite.','INSTAGRAM_TIMEOUT')
    throw new HttpError(503,'Não foi possível conectar ao Instagram.','INSTAGRAM_NETWORK_ERROR')
  }
  const payload=await response.json().catch(()=>({}))
  if(!response.ok||payload?.error)throw providerError(response,payload)
  return payload
}

export async function suggestInstagramHashtags(query,options={}){
  const normalized=normalizeMarketingHashtag(query)
  if(!normalized)return {available:isInstagramMarketingConfigured(options.env),capability:'exact_lookup',matched:false,suggestions:[]}
  if(!isInstagramMarketingConfigured(options.env))return {available:false,capability:'exact_lookup',matched:false,suggestions:[]}
  const config=instagramMarketingConfig(options.env),params=new URLSearchParams({user_id:config.userId,q:normalized.slice(1)})
  const payload=await graphJson(`ig_hashtag_search?${params}`,options),data=Array.isArray(payload?.data)?payload.data:[]
  return {available:true,capability:'exact_lookup',matched:data.length>0,suggestions:data.length?[{tag:normalized,source:'instagram',externalId:clean(data[0]?.id)}]:[]}
}

export function buildInstagramPublicationPayload({copy,hashtags}){
  const validation=validateMarketingHashtags(hashtags)
  if(!validation.valid)throw new HttpError(400,'Hashtags inválidas para publicação no Instagram.','INSTAGRAM_HASHTAGS_INVALID',{invalid:validation.invalid,duplicates:validation.duplicates,tooMany:validation.tooMany})
  const caption=[clean(copy),formatMarketingHashtags(validation.hashtags)].filter(Boolean).join('\n\n')
  if(!caption)throw new HttpError(400,'A publicação no Instagram exige legenda/copy.','INSTAGRAM_CAPTION_REQUIRED')
  if(caption.length>2200)throw new HttpError(400,'Legenda/copy e hashtags excedem o limite de 2200 caracteres do Instagram.','INSTAGRAM_CAPTION_TOO_LONG',{max:2200,length:caption.length})
  return {caption,hashtags:validation.hashtags}
}

export async function createInstagramImageContainer({imageUrl,caption},options={}){
  const url=clean(imageUrl)
  if(!/^https:\/\//i.test(url))throw new HttpError(400,'A publicação exige uma URL HTTPS persistente para a imagem final.','INSTAGRAM_IMAGE_URL_INVALID')
  const config=configuredOrThrow(options.env),body=new URLSearchParams({image_url:url,caption:clean(caption)})
  const payload=await graphJson(`${encodeURIComponent(config.userId)}/media`,{...options,method:'POST',body})
  const creationId=clean(payload?.id)
  if(!creationId)throw new HttpError(502,'Instagram não retornou o ID do container de mídia.','INSTAGRAM_CONTAINER_RESPONSE_INVALID')
  return {creationId}
}

export async function waitInstagramMediaContainer(creationId,{sleepImpl=(ms)=>new Promise(resolve=>setTimeout(resolve,ms)),pollAttempts=CONTAINER_POLL_ATTEMPTS,pollDelayMs=CONTAINER_POLL_DELAY_MS,...options}={}){
  const id=clean(creationId)
  if(!id)throw new HttpError(400,'Container do Instagram é obrigatório.','INSTAGRAM_CONTAINER_REQUIRED')
  for(let attempt=1;attempt<=pollAttempts;attempt+=1){
    const payload=await graphJson(`${encodeURIComponent(id)}?fields=status_code,status`,options),status=clean(payload?.status_code||payload?.status).toUpperCase()
    if(status==='FINISHED'||status==='PUBLISHED')return {creationId:id,status}
    if(status==='ERROR'||status==='EXPIRED')throw new HttpError(502,'O Instagram não conseguiu processar a mídia.','INSTAGRAM_CONTAINER_FAILED',{status})
    if(attempt<pollAttempts)await sleepImpl(pollDelayMs)
  }
  throw new HttpError(504,'O Instagram não concluiu o processamento da mídia dentro do tempo esperado.','INSTAGRAM_CONTAINER_TIMEOUT')
}

export async function publishInstagramMediaContainer(creationId,options={}){
  const id=clean(creationId),config=configuredOrThrow(options.env)
  if(!id)throw new HttpError(400,'Container do Instagram é obrigatório.','INSTAGRAM_CONTAINER_REQUIRED')
  const payload=await graphJson(`${encodeURIComponent(config.userId)}/media_publish`,{...options,method:'POST',body:new URLSearchParams({creation_id:id})})
  const mediaId=clean(payload?.id)
  if(!mediaId)throw new HttpError(502,'Instagram não retornou o ID da publicação.','INSTAGRAM_PUBLISH_RESPONSE_INVALID')
  return {mediaId}
}

export async function getInstagramPublishedMedia(mediaId,options={}){
  const id=clean(mediaId)
  if(!id)throw new HttpError(400,'ID da mídia publicada é obrigatório.','INSTAGRAM_MEDIA_ID_REQUIRED')
  const payload=await graphJson(`${encodeURIComponent(id)}?fields=id,permalink,timestamp,media_type`,options)
  return {mediaId:clean(payload?.id)||id,permalink:clean(payload?.permalink),publishedAt:payload?.timestamp?new Date(payload.timestamp).toISOString():null,mediaType:clean(payload?.media_type)}
}
