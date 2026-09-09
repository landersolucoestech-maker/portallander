export type MediaKitAdFormat={id:string;name:string;placement:string;dimensions:string;description:string}
export type MediaKitMetricStatus='LIVE'|'CACHED'|'MANUAL'|'STALE'|'UNAVAILABLE'|'SYNC_ERROR'
export type MediaKitMetricBinding={
 id:string
 label:string
 metricKey:string
 unit:string
 sourceMode:'analytics'|'manual'
 provider:string
 providerAccountId:string
 providerPropertyId:string
 scopeType:string
 scopeId:string
 manualValue:string
 manualPeriodStart:string
 manualPeriodEnd:string
}
export type MediaKitResolvedMetric={
 id:string
 label:string
 metricKey:string
 value:number|null
 unit:string
 provider:string|null
 providerAccountId:string|null
 providerPropertyId:string|null
 periodStart:string|null
 periodEnd:string|null
 granularity:string|null
 sourceType:'provider'|'manual'|'derived'|'unavailable'
 sourceReference:string|null
 collectedAt:string|null
 providerUpdatedAt:string|null
 normalizedAt:string|null
 freshnessStatus:'FRESH'|'STALE'|'UNKNOWN'
 dataStatus:MediaKitMetricStatus
 syncId:string|null
 provenance:Record<string,unknown>
 isEstimated:boolean
 isManual:boolean
}
export type MediaKitInventoryItem={
 placementId:'home-sidebar'|'editorial-sidebar'|'advertise-here'
 commercialAvailability:'AVAILABLE'|'UNAVAILABLE'|'UNKNOWN'
 notes:string
}
export type MediaKitDraft={
 version:number
 status:'draft'|'published'|'inactive'
 identity:{title:string;subtitle:string;versionLabel:string}
 institutional:{title:string;summary:string;positioning:string}
 audience:{monthlyUsers:string;monthlyViews:string;socialReach:string;notes:string;metrics:MediaKitMetricBinding[];snapshot:MediaKitResolvedMetric[];snapshotResolvedAt:string|null}
 inventory:{placements:MediaKitInventoryItem[]}
 newsletter:{enabled:boolean;description:string}
 social:{channelIds:string[]}
 adFormats:MediaKitAdFormat[]
 commercial:{name:string;email:string;phone:string;cta:string}
 roadmap:{currentCapabilities:string[];futureOpportunities:string[]}
 generationMetadata:{lastGeneratedAt:string|null}
}

export const defaultMediaKitDraft:MediaKitDraft={
 version:1,
 status:'draft',
 identity:{title:'Portal Lander',subtitle:'Mídia Kit',versionLabel:'2026'},
 institutional:{title:'Portal Lander',summary:'',positioning:''},
 audience:{monthlyUsers:'',monthlyViews:'',socialReach:'',notes:'',metrics:[],snapshot:[],snapshotResolvedAt:null},
 inventory:{placements:[
  {placementId:'home-sidebar',commercialAvailability:'UNKNOWN',notes:''},
  {placementId:'editorial-sidebar',commercialAvailability:'UNKNOWN',notes:''},
  {placementId:'advertise-here',commercialAvailability:'UNKNOWN',notes:''},
 ]},
 newsletter:{enabled:true,description:''},
 social:{channelIds:[]},
 adFormats:[],
 commercial:{name:'',email:'',phone:'',cta:'Fale com nosso time comercial'},
 roadmap:{currentCapabilities:[],futureOpportunities:[]},
 generationMetadata:{lastGeneratedAt:null},
}
