import type {FormAppearance,FormAppearancePreset} from './domain'

const color=(value:unknown,fallback:string)=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value.trim())?value.trim().toLowerCase():fallback
const number=(value:unknown,fallback:number,min:number,max:number)=>{const parsed=Number(value);return Number.isFinite(parsed)?Math.min(max,Math.max(min,parsed)):fallback}
const choice=<T extends string>(value:unknown,allowed:readonly T[],fallback:T):T=>allowed.includes(value as T)?value as T:fallback
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{}

export const DEFAULT_FORM_APPEARANCE:FormAppearance={
  preset:'portal',
  container:{maxWidth:960,width:100,align:'center',padding:28,background:'#ffffff',border:'solid',borderColor:'#e5e7eb',borderWidth:1,borderRadius:18,shadow:'soft'},
  layout:{columns:2,responsiveCollapseAt:'tablet',columnGap:18,rowGap:18},
  typography:{font:'montserrat',labelSize:14,labelWeight:600,labelColor:'#171717',helpSize:12,helpColor:'#666666'},
  fields:{height:48,background:'#ffffff',textColor:'#171717',placeholderColor:'#7a7a7a',borderColor:'#cfcfcf',borderWidth:1,borderRadius:10,paddingX:14,focusColor:'#e50914',focusRing:3},
  textarea:{minHeight:150,resize:'vertical'},
  button:{text:'',align:'left',width:'auto',height:48,background:'#e50914',foreground:'#ffffff',borderColor:'#e50914',borderWidth:1,borderRadius:10,fontSize:14,fontWeight:700,hoverBackground:'#c90812',focusColor:'#171717'},
  consents:{color:'#3f3f46',gap:10,fontSize:12},
  upload:{background:'#fafafa',borderColor:'#cfcfcf',borderWidth:1,borderRadius:12,foreground:'#242424'},
  states:{successBackground:'#edf8f0',successForeground:'#176b32',errorBackground:'#fff0f0',errorForeground:'#a31313',borderColor:'#d9d9d9',borderRadius:10},
}

const PRESETS:Record<FormAppearancePreset,FormAppearance>={
  portal:DEFAULT_FORM_APPEARANCE,
  minimal:{...DEFAULT_FORM_APPEARANCE,preset:'minimal',container:{...DEFAULT_FORM_APPEARANCE.container,padding:20,border:'none',borderWidth:0,borderRadius:0,shadow:'none'},fields:{...DEFAULT_FORM_APPEARANCE.fields,borderRadius:4},button:{...DEFAULT_FORM_APPEARANCE.button,borderRadius:4}},
  editorial:{...DEFAULT_FORM_APPEARANCE,preset:'editorial',container:{...DEFAULT_FORM_APPEARANCE.container,maxWidth:880,padding:32,borderRadius:0,shadow:'none',borderColor:'#111111'},layout:{...DEFAULT_FORM_APPEARANCE.layout,columnGap:24,rowGap:22},typography:{...DEFAULT_FORM_APPEARANCE.typography,labelWeight:700,labelColor:'#111111'},fields:{...DEFAULT_FORM_APPEARANCE.fields,borderRadius:0,borderColor:'#111111'},button:{...DEFAULT_FORM_APPEARANCE.button,borderRadius:0}},
  compact:{...DEFAULT_FORM_APPEARANCE,preset:'compact',container:{...DEFAULT_FORM_APPEARANCE.container,maxWidth:760,padding:20,borderRadius:12},layout:{...DEFAULT_FORM_APPEARANCE.layout,columnGap:12,rowGap:12},typography:{...DEFAULT_FORM_APPEARANCE.typography,labelSize:12,helpSize:11},fields:{...DEFAULT_FORM_APPEARANCE.fields,height:42,borderRadius:8,paddingX:12},textarea:{...DEFAULT_FORM_APPEARANCE.textarea,minHeight:110},button:{...DEFAULT_FORM_APPEARANCE.button,height:42,fontSize:13}},
  highlight:{...DEFAULT_FORM_APPEARANCE,preset:'highlight',container:{...DEFAULT_FORM_APPEARANCE.container,background:'#111111',borderColor:'#2b2b2b',shadow:'strong'},typography:{...DEFAULT_FORM_APPEARANCE.typography,labelColor:'#ffffff',helpColor:'#b5b5b5'},fields:{...DEFAULT_FORM_APPEARANCE.fields,background:'#1b1b1b',textColor:'#ffffff',placeholderColor:'#9b9b9b',borderColor:'#3b3b3b'},consents:{...DEFAULT_FORM_APPEARANCE.consents,color:'#d7d7d7'},upload:{...DEFAULT_FORM_APPEARANCE.upload,background:'#1b1b1b',borderColor:'#444444',foreground:'#ffffff'},states:{...DEFAULT_FORM_APPEARANCE.states,borderColor:'#3b3b3b'}},
}

export const getFormAppearancePreset=(preset:FormAppearancePreset):FormAppearance=>structuredClone(PRESETS[preset])

export function normalizeFormAppearance(input:unknown):FormAppearance{
  const raw=object(input),preset=choice(raw.preset,['portal','minimal','editorial','compact','highlight'] as const,'portal')
  const base=getFormAppearancePreset(preset)
  const container=object(raw.container),layout=object(raw.layout),typography=object(raw.typography),fields=object(raw.fields),textarea=object(raw.textarea),button=object(raw.button),consents=object(raw.consents),upload=object(raw.upload),states=object(raw.states)
  return {
    preset,
    container:{
      maxWidth:number(container.maxWidth,base.container.maxWidth,320,1440),width:number(container.width,base.container.width,40,100),align:choice(container.align,['left','center','right'] as const,base.container.align),padding:number(container.padding,base.container.padding,0,64),background:color(container.background,base.container.background),border:choice(container.border,['none','solid'] as const,base.container.border),borderColor:color(container.borderColor,base.container.borderColor),borderWidth:number(container.borderWidth,base.container.borderWidth,0,4),borderRadius:number(container.borderRadius,base.container.borderRadius,0,40),shadow:choice(container.shadow,['none','soft','strong'] as const,base.container.shadow),
    },
    layout:{columns:number(layout.columns,base.layout.columns,1,2)===1?1:2,responsiveCollapseAt:choice(layout.responsiveCollapseAt,['mobile','tablet'] as const,base.layout.responsiveCollapseAt),columnGap:number(layout.columnGap,base.layout.columnGap,0,48),rowGap:number(layout.rowGap,base.layout.rowGap,0,48)},
    typography:{font:choice(typography.font,['montserrat','system'] as const,base.typography.font),labelSize:number(typography.labelSize,base.typography.labelSize,11,22),labelWeight:number(typography.labelWeight,base.typography.labelWeight,400,700) as 400|500|600|700,labelColor:color(typography.labelColor,base.typography.labelColor),helpSize:number(typography.helpSize,base.typography.helpSize,10,18),helpColor:color(typography.helpColor,base.typography.helpColor)},
    fields:{height:number(fields.height,base.fields.height,36,72),background:color(fields.background,base.fields.background),textColor:color(fields.textColor,base.fields.textColor),placeholderColor:color(fields.placeholderColor,base.fields.placeholderColor),borderColor:color(fields.borderColor,base.fields.borderColor),borderWidth:number(fields.borderWidth,base.fields.borderWidth,0,4),borderRadius:number(fields.borderRadius,base.fields.borderRadius,0,32),paddingX:number(fields.paddingX,base.fields.paddingX,8,28),focusColor:color(fields.focusColor,base.fields.focusColor),focusRing:number(fields.focusRing,base.fields.focusRing,1,6)},
    textarea:{minHeight:number(textarea.minHeight,base.textarea.minHeight,80,420),resize:choice(textarea.resize,['none','vertical','both'] as const,base.textarea.resize)},
    button:{text:typeof button.text==='string'?button.text.slice(0,80):base.button.text,align:choice(button.align,['left','center','right'] as const,base.button.align),width:choice(button.width,['auto','full'] as const,base.button.width),height:number(button.height,base.button.height,36,72),background:color(button.background,base.button.background),foreground:color(button.foreground,base.button.foreground),borderColor:color(button.borderColor,base.button.borderColor),borderWidth:number(button.borderWidth,base.button.borderWidth,0,4),borderRadius:number(button.borderRadius,base.button.borderRadius,0,32),fontSize:number(button.fontSize,base.button.fontSize,11,22),fontWeight:number(button.fontWeight,base.button.fontWeight,500,700) as 500|600|700,hoverBackground:color(button.hoverBackground,base.button.hoverBackground),focusColor:color(button.focusColor,base.button.focusColor)},
    consents:{color:color(consents.color,base.consents.color),gap:number(consents.gap,base.consents.gap,4,24),fontSize:number(consents.fontSize,base.consents.fontSize,10,18)},
    upload:{background:color(upload.background,base.upload.background),borderColor:color(upload.borderColor,base.upload.borderColor),borderWidth:number(upload.borderWidth,base.upload.borderWidth,0,4),borderRadius:number(upload.borderRadius,base.upload.borderRadius,0,32),foreground:color(upload.foreground,base.upload.foreground)},
    states:{successBackground:color(states.successBackground,base.states.successBackground),successForeground:color(states.successForeground,base.states.successForeground),errorBackground:color(states.errorBackground,base.states.errorBackground),errorForeground:color(states.errorForeground,base.states.errorForeground),borderColor:color(states.borderColor,base.states.borderColor),borderRadius:number(states.borderRadius,base.states.borderRadius,0,32)},
  }
}
