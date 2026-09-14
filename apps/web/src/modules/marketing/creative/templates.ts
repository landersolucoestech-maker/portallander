import type {CreativeAvatarLayer,CreativeBrandLayer,CreativeConfig,CreativeProfile,CreativeTextLayer} from '../domain'

export type NewsCreativeConfig=CreativeConfig&{mode:'template';profile:CreativeProfile;headline:CreativeTextLayer;bodyText:CreativeTextLayer;watermark:CreativeBrandLayer;layout:'full'|'split';background:string}

const headerTextColor='#111111'
const text=(value:string,fontSize:number,fontWeight:number):CreativeTextLayer=>({text:value,visible:true,fontFamily:'Montserrat',fontWeight,fontSize,lineHeight:1.12,letterSpacing:0,color:headerTextColor,align:'left',x:0,y:0,width:100})
const avatar=(source:'global'|'custom'='global'):CreativeAvatarLayer=>({source,visible:true,size:13,zoom:1,positionX:50,positionY:50})
const watermark=():CreativeBrandLayer=>({source:'global',visible:true,opacity:.2,x:50,y:50,width:26,align:'center'})
const handle=(value:string)=>{const normalized=value.trim();return normalized?normalized.startsWith('@')?normalized:`@${normalized}`:'@portallander'}
const readableHeaderLayer=(layer:CreativeTextLayer,fallback:CreativeTextLayer):CreativeTextLayer=>{const next={...fallback,...layer};return {...next,color:next.color.trim().toUpperCase()==='#FFFFFF'?headerTextColor:next.color}}

export const simpleCreative=():CreativeConfig=>({version:1,mode:'simple',renderState:{status:'clean'}})

export function createNewsCreative(title=''):NewsCreativeConfig{
 return {
  version:1,
  mode:'template',
  templateKey:'news-portal-lander',
  category:'news',
  layout:'full',
  profile:{avatar:avatar(),name:'Portal Lander',handle:'@portallander'},
  headline:text(title,40,800),
  bodyText:text('',30,600),
  watermark:watermark(),
  background:'#0B0B0B',
  renderState:{status:'dirty'},
 }
}

export function normalizeNewsCreative(input:CreativeConfig,title=''):NewsCreativeConfig{
 const source=input.mode==='template'?input:createNewsCreative(title)
 const legacyLogo=source.logo
 const legacyAvatar:CreativeAvatarLayer=legacyLogo?.source==='custom'&&legacyLogo.url&&legacyLogo.assetId
  ?{...avatar('custom'),assetId:legacyLogo.assetId,url:legacyLogo.url}
  :avatar()
 const profile=source.profile?{
  avatar:{...avatar(source.profile.avatar.source),...source.profile.avatar},
  name:source.profile.name.trim()||'Portal Lander',
  handle:handle(source.profile.handle),
 }:{avatar:legacyAvatar,name:'Portal Lander',handle:'@portallander'}
 const headline=readableHeaderLayer(source.headline??text(title,40,800),text(title,40,800))
 const bodyText=readableHeaderLayer(source.bodyText??source.subtitle??text('',30,600),text('',30,600))
 const nextWatermark=source.watermark??watermark()
 const {logo:legacyLogoField,subtitle:legacySubtitleField,...rest}=source
 void legacyLogoField
 void legacySubtitleField
 return {
  ...rest,
  mode:'template',
  templateKey:source.templateKey||'news-portal-lander',
  category:source.category||'news',
  layout:source.layout||'full',
  profile,
  headline,
  bodyText,
  watermark:{...watermark(),...nextWatermark},
  background:source.background||'#0B0B0B',
 }
}

export function markCreativeDirty(creative:CreativeConfig):CreativeConfig{
 if(creative.mode!=='template')return creative
 return {...creative,output:undefined,renderState:{status:'dirty'}}
}
