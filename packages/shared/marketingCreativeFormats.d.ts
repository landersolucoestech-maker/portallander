export type MarketingCreationContentType='Stories'|'Reels'|'Carrossel'|'Feed'
export type MarketingContentGeometryKey='square'|'vertical'

export interface MarketingContentGeometry{
  key:MarketingContentGeometryKey
  width:number
  height:number
  aspectRatio:number
}

export interface MarketingContentFormatDefinition{
  contentType:MarketingCreationContentType
  kind:'story'|'reel'|'carousel'|'feed'
  geometry:MarketingContentGeometry
  supportsImage:boolean
  supportsVideo:boolean
  staticTemplateSupported:boolean
}

export interface MarketingCreativeFormat{
  id:string
  label:string
  key:string
  width:number
  height:number
  aspectRatio:number
  supportsImage:boolean
  supportsVideo:boolean
  staticTemplateSupported:boolean
}

export interface MarketingCreativeOutputDimensions{width:number;height:number}

export declare const MARKETING_CREATION_CONTENT_TYPES:readonly MarketingCreationContentType[]
export declare const DEFAULT_MARKETING_CREATION_CONTENT_TYPE:MarketingCreationContentType
export declare const MARKETING_CONTENT_FORMATS:Readonly<Record<MarketingCreationContentType,MarketingContentFormatDefinition>>
export declare function isMarketingCreationContentType(value:unknown):value is MarketingCreationContentType
export declare function resolveMarketingContentFormat(contentType:string):MarketingContentFormatDefinition|null
export declare function resolveMarketingCreativeFormat(platform:string,contentType:string):MarketingCreativeFormat
export declare function creativeOutputMatchesFormat(output:MarketingCreativeOutputDimensions|undefined|null,format:MarketingCreativeFormat|undefined|null):boolean
