import {portalAvatarMark,portalLogo} from '../../../shared/branding/assets/brandAsset'
import type {CreativeAvatarLayer,CreativeBrandLayer,CreativeMediaSlot,CreativeTextLayer} from '../domain'
import type {CreativeFormat} from './formatRegistry'
import {normalizeNewsCreative} from './templates'

const brandUrl=(layer:CreativeBrandLayer)=>layer.source==='global'?portalLogo:layer.url
const avatarUrl=(layer:CreativeAvatarLayer)=>layer.source==='global'?portalAvatarMark:layer.url

function Media({slot}:{slot?:CreativeMediaSlot}){
 if(!slot)return <div className="marketing-creative-media-slot is-empty"><span>Mídia</span></div>
 const style={objectFit:slot.fit,objectPosition:`${slot.positionX}% ${slot.positionY}%`,transform:`scale(${slot.zoom})`}
 return <div className="marketing-creative-media-slot">{slot.kind==='video'?<video src={slot.url} style={style} autoPlay loop muted playsInline/>:<img src={slot.url} alt={slot.name} style={style}/>}</div>
}

function VisualText({layer,className}:{layer:CreativeTextLayer;className:string}){
 if(!layer.visible||!layer.text.trim())return null
 return <p className={className} style={{fontFamily:layer.fontFamily,fontWeight:layer.fontWeight,color:layer.color,textAlign:layer.align,lineHeight:layer.lineHeight,letterSpacing:layer.letterSpacing}}>{layer.text}</p>
}

function Profile({avatar,name,handle}:{avatar:CreativeAvatarLayer;name:string;handle:string}){
 const url=avatarUrl(avatar)
 return <div className="marketing-news-profile" data-template-part="profile">
  <div className="marketing-news-avatar">{avatar.visible&&url?<img src={url} alt="" style={{objectPosition:`${avatar.positionX}% ${avatar.positionY}%`,transform:`scale(${avatar.zoom})`}}/>:<span aria-hidden="true">PL</span>}</div>
  <div className="marketing-news-profile-text"><strong>{name}</strong><span>{handle}</span></div>
 </div>
}

function Watermark({layer}:{layer:CreativeBrandLayer}){
 const url=brandUrl(layer)
 if(!layer.visible||!url)return null
 return <img className="marketing-creative-watermark" src={url} alt="Marca d'água" style={{left:`${layer.x}%`,top:`${layer.y}%`,width:`${layer.width}%`,opacity:layer.opacity}}/>
}

export function CreativeTemplateSurface({creative,format}:{creative:Parameters<typeof normalizeNewsCreative>[0];format:CreativeFormat}){
 const news=normalizeNewsCreative(creative)
 return <div className={`marketing-creative-surface marketing-news-surface ${format.aspectRatio<.8?'is-vertical':'is-square'}`} data-template={news.templateKey}>
  <section className="marketing-news-header" data-template-part="identity-copy">
   <Profile avatar={news.profile.avatar} name={news.profile.name} handle={news.profile.handle}/>
   <div className="marketing-news-copy" data-template-part="copy">
    <VisualText layer={news.headline} className="marketing-news-headline"/>
    <VisualText layer={news.bodyText} className="marketing-news-body"/>
   </div>
  </section>
  <div className={`marketing-creative-media-region ${news.layout==='split'?'is-split':'is-full'}`} style={{background:news.background}} data-template-part="media">
   <Media slot={news.primarySlot}/>
   {news.layout==='split'&&<Media slot={news.secondarySlot}/>} 
   <Watermark layer={news.watermark}/>
  </div>
 </div>
}
