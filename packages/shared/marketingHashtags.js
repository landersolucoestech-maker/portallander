export const MAX_MARKETING_HASHTAGS=5
const PARTS=/[\s,]+/u
const VALID_BODY=/^[\p{L}\p{N}_]+$/u
export function normalizeMarketingHashtag(value){
  const body=String(value??'').normalize('NFKC').trim().replace(/^#+/u,'')
  if(!body)return ''
  if(!VALID_BODY.test(body))return null
  return `#${body.toLocaleLowerCase('pt-BR')}`
}
export function parseMarketingHashtags(value){
  const input=Array.isArray(value)?value:String(value??'').split(PARTS)
  const hashtags=[],invalid=[],duplicates=[],seen=new Set()
  for(const raw of input){
    if(String(raw??'').trim()==='')continue
    const normalized=normalizeMarketingHashtag(raw)
    if(normalized===null){invalid.push(String(raw));continue}
    if(!normalized)continue
    const key=normalized.toLocaleLowerCase('pt-BR')
    if(seen.has(key)){duplicates.push(normalized);continue}
    seen.add(key);hashtags.push(normalized)
  }
  return {hashtags,invalid,duplicates,tooMany:hashtags.length>MAX_MARKETING_HASHTAGS}
}
export function validateMarketingHashtags(value){
  const result=parseMarketingHashtags(value)
  return {...result,valid:!result.invalid.length&&!result.duplicates.length&&!result.tooMany}
}
export function normalizeMarketingHashtags(value){
  const result=parseMarketingHashtags(value)
  return result.hashtags.slice(0,MAX_MARKETING_HASHTAGS)
}
export function formatMarketingHashtags(value){return normalizeMarketingHashtags(value).join(' ')}
