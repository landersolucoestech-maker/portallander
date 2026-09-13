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

const square=(id,label)=>({id,label,width:1080,height:1080,aspectRatio:1,supportsImage:true,supportsVideo:true,staticTemplateSupported:true})
const vertical=(id,label,{staticTemplateSupported=true,supportsImage=true}={})=>({id,label,width:1080,height:1920,aspectRatio:9/16,supportsImage,supportsVideo:true,staticTemplateSupported})
const landscape=(id,label)=>({id,label,width:1920,height:1080,aspectRatio:16/9,supportsImage:true,supportsVideo:true,staticTemplateSupported:true})

export function resolveMarketingCreativeFormat(platform,contentType){
  const platformId=platformKey(platform),type=normalize(contentType)
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
