export type MarketingTab='overview'|'campaigns'|'calendar'|'tasks'|'metrics'|'briefings'|'ai'
export type CampaignStatus='rascunho'|'agendada'|'ativa'|'pausada'|'concluida'|'cancelada'
export type TaskStatus='backlog'|'a_fazer'|'em_andamento'|'revisao'|'concluida'|'bloqueada'
export type BriefingStatus='rascunho'|'em_revisao'|'aprovado'|'arquivado'
export type ContentStatus='ideia'|'producao'|'revisao'|'agendado'|'publicado'|'falhou'|'atrasado'
export type ApprovalStatus='pendente'|'aprovado'|'reprovado'|'ajustes_solicitados'
export type Priority='baixa'|'media'|'alta'|'urgente'
export interface MarketingCampaign{id:string;name:string;description:string;context:string;platforms:string[];status:CampaignStatus;budget:number;spend:number;clicks:number;impressions:number;conversions:number;startDate:string;endDate:string;owner:string;notes:string;objective?:string;expectedOutcome?:string;campaignType?:string;audience?:string;placements?:string[];creatives?:string[];destinationUrl?:string;targetType?:string;promotedEntityType?:string;promotedEntityName?:string;projectId?:string;contentId?:string;phase?:string;tags?:string;audienceCountries?:string[];audienceLocations?:string[];audienceLanguages?:string[];audienceGender?:string;audienceAgeMin?:number;audienceAgeMax?:number;createdAt:string;updatedAt:string}
export interface MarketingContent{id:string;title:string;context:string;subject:string;channels:string[];type:string;publishDate:string;publishTime:string;copy:string;campaign:string;hashtags:string;location:string;status:ContentStatus;approval:ApprovalStatus;owner:string;createdAt:string;updatedAt:string}
export interface MarketingTask{id:string;title:string;type:string;owner:string;department:string;deadline:string;status:TaskStatus;priority:Priority;context:string;classification:string;notes:string;createdAt:string;updatedAt:string}
export interface MarketingBriefing{id:string;title:string;type:string;objective:string;context:string;audience:string;positioning:string;tone:string;owners:string[];deadline:string;deliverables:string[];channels:string[];status:BriefingStatus;references:string;requirements?:string;creativeDirection?:string;visualGuidelines?:string;textGuidelines?:string;market?:string;competitors?:string;trends?:string;restrictions?:string;resources?:string;expectations?:string;timeline?:string;executionPlan?:string;aiRecommendations?:string;createdAt:string;updatedAt:string}
export interface MarketingMetric{id:string;platform:string;period:string;reach:number;impressions:number;clicks:number;engagement:number;followers:number;conversions:number;spend:number;revenue:number}
export interface MarketingAiHistory{id:string;kind:string;title:string;context:string;result:string;createdAt:string}
export interface MarketingActivity{id:string;label:string;detail:string;createdAt:string}
export interface MarketingSeed{campaigns:MarketingCampaign[];contents:MarketingContent[];tasks:MarketingTask[];briefings:MarketingBriefing[];metrics:MarketingMetric[];aiHistory:MarketingAiHistory[];activities:MarketingActivity[];platforms:string[];contentTypes:string[];taskTypes:string[];briefingTypes:string[];owners:string[];departments:string[]}
export const uid=(prefix:string)=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
export const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value)
export const dateLabel=(value:string)=>value?new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR'):'—'
export const compact=(value:number)=>new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1}).format(value)
