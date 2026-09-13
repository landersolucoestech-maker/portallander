export interface MarketingCreativeFormat{
  id:string
  label:string
  width:number
  height:number
  aspectRatio:number
  supportsImage:boolean
  supportsVideo:boolean
  staticTemplateSupported:boolean
}

export interface MarketingCreativeOutputDimensions{width:number;height:number}

export declare function resolveMarketingCreativeFormat(platform:string,contentType:string):MarketingCreativeFormat
export declare function creativeOutputMatchesFormat(output:MarketingCreativeOutputDimensions|undefined|null,format:MarketingCreativeFormat|undefined|null):boolean
