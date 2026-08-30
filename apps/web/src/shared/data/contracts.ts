export type EntityId=string
export type IsoDateTime=string

export type AppRole='admin'|'editor'|'commercial'|'finance'|'viewer'
export interface AppUser{
 id:EntityId
 name:string
 email:string
 initials:string
 role:AppRole
 roleLabel:string
 active:boolean
 avatarUrl:string
}

export interface WorkspaceDescriptor{
 id:EntityId
 name:string
 slug:string
 description:string
 eyebrow:string
 route:string
 capabilities:readonly string[]
 active:boolean
}

export type NotificationSeverity='info'|'success'|'warning'|'error'
export type NotificationStatus='unread'|'read'|'archived'
export interface AppNotification{
 id:EntityId
 userId:EntityId
 title:string
 message:string
 severity:NotificationSeverity
 status:NotificationStatus
 entityType:string
 entityId:string
 createdAt:IsoDateTime
}

export type AgendaItemStatus='scheduled'|'confirmed'|'completed'|'cancelled'
export interface AgendaItem{
 id:EntityId
 title:string
 description:string
 startsAt:IsoDateTime
 endsAt:IsoDateTime
 location:string
 status:AgendaItemStatus
 ownerUserId:EntityId
 relatedEntityType:string
 relatedEntityId:string
}

export type AdvertisingPlacement='home-main'|'home-sidebar'|'news-inline'|'news-sidebar'
export interface AdvertisingCampaign{
 id:EntityId
 name:string
 advertiserContactId:EntityId
 placement:AdvertisingPlacement
 title:string
 subtitle:string
 ctaLabel:string
 ctaUrl:string
 imageUrl:string
 startsAt:IsoDateTime
 endsAt:IsoDateTime
 active:boolean
}

export interface SocialChannel{
 id:EntityId
 network:'instagram'|'tiktok'|'youtube'|'x'|'spotify'|'facebook'|'linkedin'
 label:string
 url:string
 active:boolean
 order:number
}

export type CollaborationSubmissionType='noticia'|'video'|'foto'|'pauta'
export interface CollaborationTypeOption{
 value:CollaborationSubmissionType
 label:string
 active:boolean
}

export interface BrandingConfig{
 headerImage:string
 headerImageAlt:string
 footerImage:string
 footerImageAlt:string
}

export type DataScenarioName='success'|'loading'|'empty'|'error'|'partial'|'large'|'permission-denied'|'offline'
export interface DataScenario{
 name:DataScenarioName
 latencyMs:number
 failDomains:readonly string[]
 emptyDomains:readonly string[]
 partialDomains:readonly string[]
 permissionDeniedDomains:readonly string[]
 offline:boolean
 largeDataset:boolean
}

export interface DashboardOperationalSnapshot{
 period:string
 alerts:readonly string[]
 pendingActions:number
}
