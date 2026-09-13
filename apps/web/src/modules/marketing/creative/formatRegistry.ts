import {resolveMarketingCreativeFormat,type MarketingCreativeFormat} from '../../../../../../packages/shared/marketingCreativeFormats.js'
import type {CreativeConfig} from '../domain'

export type CreativeFormat=MarketingCreativeFormat

export const resolveCreativeFormat=(platform:string,contentType:string):CreativeFormat=>resolveMarketingCreativeFormat(platform,contentType)

export function validateCreativeForFormat(creative:CreativeConfig|undefined,format:CreativeFormat){
  if(!creative||creative.mode==='simple')return null
  if(!format.staticTemplateSupported)return 'Este formato exige um fluxo de vídeo/carrossel que o renderer atual não produz. Use Mídia simples.'
  if(creative.primarySlot?.kind==='video'||creative.secondarySlot?.kind==='video')return 'Templates com vídeo exigem encoder audiovisual real, indisponível neste runtime.'
  if(!creative.primarySlot)return 'Selecione a mídia principal antes de gerar a arte.'
  if(creative.layout==='split'&&!creative.secondarySlot)return 'O layout Split exige mídia secundária.'
  return null
}
