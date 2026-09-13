const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()

const platformKey=value=>{
  const normalized=normalize(value)
  if(normalized.includes('instagram'))return 'instagram'
  if(normalized.includes('facebook'))return 'facebook'
  if(normalized.includes('tiktok'))return 'tiktok'
  if(normalized.includes('youtube'))return 'youtube'
  if(normalized.includes('threads'))return 'threads'
  if(normalized==='x'||normalized.includes('twitter'))return 'x'
  return 'generic'
}

export const MARKETING_CREATION_CONTENT_TYPES=Object.freeze(['Stories','Reels','Carrossel','Feed'])
export const DEFAULT_MARKETING_CREATION_CONTENT_TYPE='Feed'

const SQUARE_GEOMETRY=Object.freeze({key:'square',width:1080,height:1080,aspectRatio:1})
const VERTICAL_GEOMETRY=Object.freeze({key:'vertical',width:1080,height:1920,aspectRatio:9/16})

export const MARKETING_CONTENT_FORMATS=Object.freeze({
  Stories:Object.freeze({contentType:'Stories',kind:'story',geometry:VERTICAL_GEOMETRY,staticTemplateSupported:true,supportsImage:true,supportsVideo:true}),
  Reels:Object.freeze({contentType:'Reels',kind:'reel',geometry:VERTICAL_GEOMETRY,staticTemplateSupported:true,supportsImage:true,supportsVideo:true}),
  Carrossel:Object.freeze({contentType:'Carrossel',kind:'carousel',geometry:SQUARE_GEOMETRY,staticTemplateSupported:false,supportsImage:true,supportsVideo:true}),
  Feed:Object.freeze({contentType:'Feed',kind:'feed',geometry:SQUARE_GEOMETRY,staticTemplateSupported:true,supportsImage:true,supportsVideo:true}),
})

export function isMarketingCreationContentType(value){return typeof value==='string'&&Object.prototype.hasOwnProperty.call(MARKETING_CONTENT_FORMATS,value)}
export function resolveMarketingContentFormat(contentType){return isMarketingCreationContentType(contentType)?MARKETING_CONTENT_FORMATS[contentType]:null}

const square=(id,label)=>({id,label,...SQUARE_GEOMETRY,supportsImage:true,supportsVideo:true,staticTemplateSupported:true})
const vertical=(id,label,{staticTemplateSupported=true,supportsImage=true}={})=>({id,label,...VERTICAL_GEOMETRY,supportsImage,supportsVideo:true,staticTemplateSupported})
const landscape=(id,label)=>({id,label,key:'landscape',width:1920,height:1080,aspectRatio:16/9,supportsImage:true,supportsVideo:true,staticTemplateSupported:true})

export function resolveMarketingCreativeFormat(platform,contentType){
  const platformId=platformKey(platform),creationFormat=resolveMarketingContentFormat(contentType)
  if(creationFormat){
    const {kind,geometry,staticTemplateSupported,supportsImage,supportsVideo}=creationFormat
    const ratio=geometry.key==='vertical'?'9x16':'1x1'
    const label=kind==='story'?'Stories · vertical 9:16':kind==='reel'?'Reels · vertical 9:16':kind==='carousel'?'Carrossel · 1:1':'Feed · 1:1'
    return {id:`${platformId}:${kind}:${ratio}`,label,...geometry,supportsImage,supportsVideo,staticTemplateSupported}
  }

  // Historical values remain readable with the geometry they used before the creation contract was narrowed.
  const type=normalize(contentType)
  if(type.includes('carross'))return {...square(`${platformId}:carousel:1x1`,'Carrossel · mídia simples'),staticTemplateSupported:false}
  if(platformId==='tiktok')return vertical('tiktok:video:9x16','TikTok · vertical 9:16',{staticTemplateSupported:false,supportsImage:false})
  if(type.includes('reel'))return vertical(`${platformId}:reel:9x16`,'Reels · vertical 9:16',{staticTemplateSupported:false,supportsImage:false})
  if(type.includes('short'))return vertical(`${platformId}:short:9x16`,'Shorts · vertical 9:16',{staticTemplateSupported:false,supportsImage:false})
  if(type.includes('stor'))return vertical(`${platformId}:story:9x16`,'Stories · vertical 9:16')
  if(platformId==='youtube')return landscape('youtube:video:16x9','YouTube · landscape 16:9')
  if(platformId==='instagram')return square('instagram:feed:1x1','Instagram · feed 1:1')
  if(platformId==='facebook')return square('facebook:feed:1x1','Facebook · feed 1:1')
  if(platformId==='threads')return square('threads:feed:1x1','Threads · feed 1:1')
  if(platformId==='x')return square('x:feed:1x1','X · feed 1:1')
  return square('generic:feed:1x1','Quadrado 1:1')
}

export function creativeOutputMatchesFormat(output,format){
  if(!output||!format)return false
  return Number(output.width)===format.width&&Number(output.height)===format.height
}
