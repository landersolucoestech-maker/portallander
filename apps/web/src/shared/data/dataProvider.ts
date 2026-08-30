import type {CrmState} from '../../features/crm/domain'
import type {ContractsState} from '../../features/contracts/domain'
import type {FinanceCategory,FinanceInvoice,FinanceRule,FinanceTransaction} from '../../features/finance/domain'
import type {AgendaEvent,AgendaLocation,AgendaParticipant} from '../../features/agenda/domain'
import type {EditorialContent,EditorialPage} from '../../features/editorial/model'
import type {HomeAgendaItem,HomeRelease,HomeStory} from '../../pages/home/models/homeReadModel'
import type {HeroArticleSource,HeroCarouselConfig,HeroSlide} from '../../pages/home/models/heroModel'
import type {HomeAdConfig} from '../../pages/home/models/adModel'
import type {NewsAdConfig} from '../../pages/noticias/models/newsAdModel'
import type {AgendaItem,AdvertisingCampaign,AdvertisingFormat,AppNotification,AppUser,BrandingConfig,CollaborationTypeOption,DashboardOperationalSnapshot,DataScenario,DataScenarioName,SocialChannel,WorkspaceDescriptor} from './contracts'

export type DataDomain='identity'|'notifications'|'crm'|'contracts'|'finance'|'editorial'|'home'|'agenda'|'advertising'|'branding'|'collaboration'|'dashboard'
export type EditorialMediaItem={id:string;type:string;name:string;url:string;size:number;createdAt:string}

export interface ApplicationDataProvider{
 readonly kind:'mock'|'api'
 getScenario():DataScenario
 setScenario(name:DataScenarioName):void
 identity:{users():AppUser[];currentUser():AppUser;workspaces():WorkspaceDescriptor[]}
 notifications:{list():AppNotification[]}
 crm:{state():CrmState}
 contracts:{state():ContractsState}
 finance:{transactions():FinanceTransaction[];invoices():FinanceInvoice[];categories():FinanceCategory[];rules():FinanceRule[]}
 editorial:{pages():EditorialPage[];contents():EditorialContent[];media():EditorialMediaItem[]}
 home:{stories():HomeStory[];mostRead():string[];releases():HomeRelease[];agenda():HomeAgendaItem[];heroArticles():HeroArticleSource[];defaultHeroSlide():HeroSlide;defaultHeroConfig():HeroCarouselConfig}
 agenda:{items():AgendaItem[];events():AgendaEvent[];participants():AgendaParticipant[];locations():AgendaLocation[]}
 advertising:{campaigns():AdvertisingCampaign[];formats():AdvertisingFormat[];defaultHomeAdConfig():HomeAdConfig;defaultNewsAdConfig():NewsAdConfig}
 branding:{config():BrandingConfig;socialChannels():SocialChannel[]}
 collaboration:{types():CollaborationTypeOption[];guidelines():ReadonlyArray<{id:string;order:number;title:string}>}
 dashboard:{operationalSnapshot():DashboardOperationalSnapshot}
}

let provider:ApplicationDataProvider|null=null
export const registerDataProvider=(next:ApplicationDataProvider)=>{provider=next}
export const getDataProvider=():ApplicationDataProvider=>{if(!provider)throw new Error('Application data provider is not registered.');return provider}
