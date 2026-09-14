import type {CreativeAvatarLayer,CreativeBrandLayer,CreativeConfig,CreativeTextLayer} from '../domain'

const text=(value:string,fontSize:number,fontWeight:number):CreativeTextLayer=>({text:value,visible:true,fontFamily:'Montserrat',fontWeight,fontSize,lineHeight:1.08,letterSpacing:0,color:'#FFFFFF',align:'left',x:0,y:0,width:100})
const avatar=(source:'global'|'custom'='global'):CreativeAvatarLayer=>({source,visible:true,size:11,zoom:1,positionX:50,positionY:50})
const watermark=():CreativeBrandLayer=>({source:'global',visible:true,opacity:.2,x:50,y:50,width:26,align:'center'})
const handle=(value:string)=>{const normalized=value.trim();return normalized?normalized.startsWith('@')?normalized:`@${normalized}`:'@portallander'}

export const simpleCreative=():CreativeConfig=>({version:1,mode:'simple',renderState:{status:'clean'}})

export function createNewsCreative(title=''):CreativeConfig{
 return {
  version:1,
  mode:'template',
  templateKey:'news-portal-lander',
  category:'news',
  layout:'full',
  profile:{avatar:avatar(),name:'Portal Lander',handle:'@portallander'},
  headline:text(title,54,800),
  bodyText:text('',29,500),
  watermark:watermark(),
  background:'#050505',
  renderState:{status:'dirty'},
 }
}

export function normalizeNewsCreative(input:CreativeConfig,title=''):CreativeConfig{
 if(input.mode!=='template')return input
 const legacyLogo=input.logo
 const legacyAvatar:CreativeAvatarLayer=legacyLogo?.source==='custom'&&legacyLogo.url&&legacyLogo.assetId
  ?{...avatar('custom'),assetId:legacyLogo.assetId,url:legacyLogo.url}
  :avatar()
 const profile=input.profile?{
  avatar:{...avatar(input.profile.avatar.source),...input.profile.avatar},
  name:input.profile.name.trim()||'Portal Lander',
  handle:handle(input.profile.handle),
 }:{avatar:legacyAvatar,name:'Portal Lander',handle:'@portallander'}
 const headline=input.headline??text(title,54,800)
 const bodyText=input.bodyText??input.subtitle??text('',29,500)
 const nextWatermark=input.watermark??watermark()
 const {logo:legacyLogoField,subtitle:legacySubtitleField,...rest}=input
 void legacyLogoField
 void legacySubtitleField
 return {
  ...rest,
  templateKey:input.templateKey||'news-portal-lander',
  category:input.category||'news',
  layout:input.layout||'full',
  profile,
  headline,
  bodyText,
  watermark:{...watermark(),...nextWatermark},
  background:input.background||'#050505',
 }
}

export function markCreativeDirty(creative:CreativeConfig):CreativeConfig{
 if(creative.mode!=='template')return creative
 return {...creative,output:undefined,renderState:{status:'dirty'}}
}
