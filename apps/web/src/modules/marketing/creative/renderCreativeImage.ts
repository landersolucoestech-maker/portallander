import {portalAvatarMark,portalLogo} from '../../../shared/branding/assets/brandAsset'
import type {CreativeAvatarLayer,CreativeBrandLayer,CreativeMediaSlot,CreativeTextLayer} from '../domain'
import type {CreativeFormat} from './formatRegistry'
import {normalizeNewsCreative} from './templates'

const image=async(url:string)=>{const response=await fetch(url);if(!response.ok)throw new Error('Não foi possível carregar um asset do criativo.');const blob=await response.blob();return createImageBitmap(blob)}
const avatarUrl=(layer:CreativeAvatarLayer)=>layer.source==='global'?portalAvatarMark:layer.url
const brandUrl=(layer:CreativeBrandLayer)=>layer.source==='global'?portalLogo:layer.url
const handle=(value:string)=>{const normalized=value.trim();return normalized.startsWith('@')?normalized:`@${normalized}`}

function drawMedia(ctx:CanvasRenderingContext2D,source:ImageBitmap,slot:CreativeMediaSlot,x:number,y:number,width:number,height:number){
 const scaleBase=slot.fit==='contain'?Math.min(width/source.width,height/source.height):Math.max(width/source.width,height/source.height),scale=scaleBase*slot.zoom,drawW=source.width*scale,drawH=source.height*scale,freeX=width-drawW,freeY=height-drawH,dx=x+freeX*(slot.positionX/100),dy=y+freeY*(slot.positionY/100)
 ctx.save();ctx.beginPath();ctx.rect(x,y,width,height);ctx.clip();ctx.drawImage(source,dx,dy,drawW,drawH);ctx.restore()
}

function wrapText(ctx:CanvasRenderingContext2D,value:string,maxWidth:number){
 const words=value.trim().split(/\s+/).filter(Boolean),lines:string[]=[];let line=''
 for(const word of words){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word}else line=next}
 if(line)lines.push(line)
 return lines
}

function drawFlowText(ctx:CanvasRenderingContext2D,layer:CreativeTextLayer,x:number,y:number,maxWidth:number,canvasWidth:number,maxLines:number){
 if(!layer.visible||!layer.text.trim())return y
 const scale=canvasWidth/1080,size=layer.fontSize*scale,lineHeight=size*layer.lineHeight
 ctx.save();ctx.fillStyle=layer.color;ctx.font=`${layer.fontWeight} ${size}px ${layer.fontFamily}, Arial, sans-serif`;ctx.textAlign='left';ctx.textBaseline='top'
 const lines=wrapText(ctx,layer.text,maxWidth).slice(0,maxLines)
 for(const [index,line] of lines.entries())ctx.fillText(line,x,y+index*lineHeight,maxWidth)
 ctx.restore()
 return y+lines.length*lineHeight
}

async function drawAvatar(ctx:CanvasRenderingContext2D,layer:CreativeAvatarLayer,x:number,y:number,size:number){
 const url=avatarUrl(layer);if(!layer.visible||!url)return
 const source=await image(url),scaleBase=Math.max(size/source.width,size/source.height),scale=scaleBase*layer.zoom,drawW=source.width*scale,drawH=source.height*scale,freeX=size-drawW,freeY=size-drawH,dx=x+freeX*(layer.positionX/100),dy=y+freeY*(layer.positionY/100)
 ctx.save();ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);ctx.clip();ctx.drawImage(source,dx,dy,drawW,drawH);ctx.restore();source.close()
}

async function drawWatermark(ctx:CanvasRenderingContext2D,layer:CreativeBrandLayer,width:number,mediaY:number,mediaHeight:number){
 const url=brandUrl(layer);if(!layer.visible||!url)return
 const source=await image(url),targetW=width*layer.width/100,targetH=targetW*(source.height/source.width),centerX=width*layer.x/100,centerY=mediaY+mediaHeight*layer.y/100
 ctx.save();ctx.globalAlpha=layer.opacity;ctx.drawImage(source,centerX-targetW/2,centerY-targetH/2,targetW,targetH);ctx.restore();source.close()
}

export async function renderCreativeImage(creative:Parameters<typeof normalizeNewsCreative>[0],format:CreativeFormat){
 const news=normalizeNewsCreative(creative)
 if(!news.primarySlot)throw new Error('Template incompleto: selecione a mídia principal.')
 if(news.primarySlot.kind!=='image'||(news.layout==='split'&&news.secondarySlot?.kind!=='image'))throw new Error('O renderer PNG atual exige imagens nos slots do template.')
 if(news.layout==='split'&&!news.secondarySlot)throw new Error('Mídia secundária obrigatória para Split.')
 const canvas=document.createElement('canvas');canvas.width=format.width;canvas.height=format.height
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas indisponível.')
 const square=format.aspectRatio>=.8,headerRatio=square?.42:.34,headerHeight=Math.round(canvas.height*headerRatio),mediaY=headerHeight,mediaHeight=canvas.height-mediaY
 ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,canvas.width,headerHeight)
 ctx.fillStyle=news.background;ctx.fillRect(0,mediaY,canvas.width,mediaHeight)
 const padding=Math.round(canvas.width*.038),avatarSize=Math.round(canvas.width*(news.profile.avatar.size/100)),identityTop=Math.round(canvas.width*.034)
 await drawAvatar(ctx,news.profile.avatar,padding,identityTop,avatarSize)
 const profileX=padding+avatarSize+Math.round(canvas.width*.025),nameSize=Math.max(18,Math.round(canvas.width*.034)),handleSize=Math.max(14,Math.round(canvas.width*.024))
 ctx.save();ctx.fillStyle='#111111';ctx.font=`800 ${nameSize}px Montserrat, Arial, sans-serif`;ctx.textBaseline='top';ctx.fillText(news.profile.name,profileX,identityTop,canvas.width-profileX-padding);ctx.fillStyle='#667085';ctx.font=`600 ${handleSize}px Montserrat, Arial, sans-serif`;ctx.fillText(handle(news.profile.handle),profileX,identityTop+nameSize+Math.round(canvas.width*.006),canvas.width-profileX-padding);ctx.restore()
 const copyTop=identityTop+avatarSize+Math.round(canvas.width*.022),copyWidth=canvas.width-padding*2
 ctx.save();ctx.beginPath();ctx.rect(0,0,canvas.width,headerHeight);ctx.clip()
 let flowY=drawFlowText(ctx,news.headline,padding,copyTop,copyWidth,canvas.width,2)
 flowY+=Math.round(canvas.width*.01)
 drawFlowText(ctx,news.bodyText,padding,flowY,copyWidth,canvas.width,square?4:6)
 ctx.restore()
 const primary=await image(news.primarySlot.url)
 if(news.layout==='split'){
  const secondarySlot=news.secondarySlot
  if(!secondarySlot)throw new Error('Mídia secundária obrigatória para Split.')
  const secondary=await image(secondarySlot.url),half=canvas.width/2
  drawMedia(ctx,primary,news.primarySlot,0,mediaY,half,mediaHeight);drawMedia(ctx,secondary,secondarySlot,half,mediaY,half,mediaHeight);secondary.close()
 }else drawMedia(ctx,primary,news.primarySlot,0,mediaY,canvas.width,mediaHeight)
 primary.close()
 await drawWatermark(ctx,news.watermark,canvas.width,mediaY,mediaHeight)
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Falha ao gerar PNG.')),'image/png'))
 return new File([blob],`portal-lander-${Date.now()}.png`,{type:'image/png'})
}
