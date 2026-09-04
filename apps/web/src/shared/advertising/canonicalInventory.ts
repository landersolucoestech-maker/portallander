export type PortalPlacementStatus='IMPLEMENTED'|'ACTIVE'|'UNAVAILABLE'|'UNKNOWN'
export type CommercialAvailability='AVAILABLE'|'UNAVAILABLE'|'UNKNOWN'

export type PortalAdvertisingPlacement={
  id:'home-sidebar'|'editorial-sidebar'|'advertise-here'
  name:string
  component:string
  contexts:readonly string[]
  description:string
  implementationStatus:PortalPlacementStatus
  commercialAvailability:CommercialAvailability
}

export const PORTAL_ADVERTISING_INVENTORY:readonly PortalAdvertisingPlacement[]=[
  {id:'home-sidebar',name:'Publicidade Lateral — Homepage',component:'PublicAdvertisementModule',contexts:['Homepage · coluna lateral'],description:'Área publicitária lateral implementada na página inicial, com suporte a imagem, link, target e fallback configurável.',implementationStatus:'IMPLEMENTED',commercialAvailability:'UNKNOWN'},
  {id:'editorial-sidebar',name:'Publicidade Lateral — Conteúdo Editorial',component:'PublicAdvertisementModule',contexts:['Página individual de matéria · sidebar'],description:'Área publicitária lateral implementada junto ao conteúdo editorial, usando a mesma infraestrutura configurável com contexto editorial explícito.',implementationStatus:'IMPLEMENTED',commercialAvailability:'UNKNOWN'},
  {id:'advertise-here',name:'Anuncie Aqui',component:'AdvertiseHereSection',contexts:['Homepage','Página individual de matéria'],description:'Região promocional configurável do Portal com suporte a creative, imagem, link e conteúdo institucional. Implementação não implica disponibilidade comercial.',implementationStatus:'IMPLEMENTED',commercialAvailability:'UNKNOWN'},
] as const

export const portalAdvertisingPlacementById=(id:string)=>PORTAL_ADVERTISING_INVENTORY.find(placement=>placement.id===id)??null
