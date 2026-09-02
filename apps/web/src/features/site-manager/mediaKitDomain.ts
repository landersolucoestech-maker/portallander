export type MediaKitAdFormat={id:string;name:string;placement:string;dimensions:string;description:string}
export type MediaKitDraft={
 version:number
 status:'draft'|'published'|'inactive'
 institutional:{title:string;summary:string;positioning:string}
 audience:{monthlyUsers:string;monthlyViews:string;socialReach:string;notes:string}
 adFormats:MediaKitAdFormat[]
 commercial:{name:string;email:string;phone:string;cta:string}
}

export const defaultMediaKitDraft:MediaKitDraft={
 version:1,
 status:'draft',
 institutional:{title:'Portal Lander',summary:'',positioning:''},
 audience:{monthlyUsers:'',monthlyViews:'',socialReach:'',notes:''},
 adFormats:[],
 commercial:{name:'',email:'',phone:'',cta:'Fale com nosso time comercial'},
}
