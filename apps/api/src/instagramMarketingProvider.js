import {formatMarketingHashtags,normalizeMarketingHashtag,validateMarketingHashtags} from '../../../packages/shared/marketingHashtags.js'

const config=()=>({accessToken:String(process.env.INSTAGRAM_ACCESS_TOKEN||'').trim(),userId:String(process.env.INSTAGRAM_USER_ID||'').trim(),version:String(process.env.META_GRAPH_API_VERSION||'v24.0').trim()})
export function isInstagramMarketingConfigured(){const value=config();return Boolean(value.accessToken&&value.userId)}
export async function suggestInstagramHashtags(query,{fetchImpl=fetch}={}){
  const normalized=normalizeMarketingHashtag(query)
  if(!normalized)return {available:isInstagramMarketingConfigured(),capability:'exact_lookup',suggestions:[]}
  const value=config()
  if(!value.accessToken||!value.userId)return {available:false,capability:'exact_lookup',suggestions:[]}
  const term=normalized.slice(1)
  const params=new URLSearchParams({user_id:value.userId,q:term,access_token:value.accessToken})
  const response=await fetchImpl(`https://graph.facebook.com/${encodeURIComponent(value.version)}/ig_hashtag_search?${params}`)
  const body=await response.json().catch(()=>null)
  if(!response.ok)throw new Error(`Instagram hashtag search failed (${response.status}).`)
  const data=Array.isArray(body?.data)?body.data:[]
  return {available:true,capability:'exact_lookup',suggestions:data.length?[{tag:normalized,source:'instagram',externalId:String(data[0].id||'')}]:[]}
}
export function buildInstagramPublicationPayload({copy,hashtags}){
  const validation=validateMarketingHashtags(hashtags)
  if(!validation.valid)throw new Error('Invalid hashtags for Instagram publication payload.')
  const caption=[String(copy??'').trim(),formatMarketingHashtags(validation.hashtags)].filter(Boolean).join('\n\n')
  return {caption,hashtags:validation.hashtags}
}
