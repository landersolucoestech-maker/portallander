import type {CrmState} from '../../modules/crm/domain'
import type {ContractsState} from '../../modules/contracts/domain'
import type {FinanceCategory,FinanceInvoice,FinanceRule,FinanceTransaction} from '../../modules/finance/domain'
import type {AgendaEvent,AgendaLocation,AgendaParticipant} from '../../modules/agenda/domain'
import type {ChatSeed} from '../../modules/chat/domain'
import type {RhSeed} from '../../modules/rh/domain'
import type {MarketingSeed} from '../../modules/marketing/domain'
import type {ReportsSeed} from '../../modules/reports/domain'
import type {SettingsSeed} from '../../modules/settings/domain'
import type {EditorialContent,EditorialPage} from '../../modules/editorial/model'
import type {HomeAgendaItem,HomeStory} from '../../pages/home/models/homeReadModel'
import type {HeroArticleSource,HeroCarouselConfig,HeroSlide} from '../../pages/home/models/heroModel'
import type {HomeAdConfig} from '../../pages/home/models/adModel'
import type {AgendaItem,AdvertisingCampaign,AdvertisingFormat,AppNotification,AppUser,BrandingConfig,CollaborationTypeOption,DashboardOperationalSnapshot,DataScenario,DataScenarioName,EditorialAdConfig,SocialChannel} from './contracts'
export type DataDomain='identity'|'notifications'|'crm'|'contracts'|'finance'|'editorial'|'home'|'agenda'|'chat'|'rh'|'marketing'|'reports'|'settings'|'advertising'|'branding'|'collaboration'|'dashboard'
export type EditorialMediaItem={id:string;type:string;name:string;url:string;size:number;createdAt:string}
export interface ApplicationDataProvider{readonly kind:'mock'|'api';getScenario():DataScenario;setScenario(name:DataScenarioName):void;identity:{users():AppUser[];currentUser():AppUser};notifications:{list():AppNotification[]};crm:{state():CrmState};contracts:{state():ContractsState};finance:{transactions():FinanceTransaction[];invoices():FinanceInvoice[];categories():FinanceCategory[];rules():FinanceRule[]};editorial:{pages():EditorialPage[];contents():EditorialContent[];media():EditorialMediaItem[]};home:{stories():HomeStory[];mostRead():string[];agenda():HomeAgendaItem[];heroArticles():HeroArticleSource[];defaultHeroSlide():HeroSlide;defaultHeroConfig():HeroCarouselConfig};agenda:{items():AgendaItem[];events():AgendaEvent[];participants():AgendaParticipant[];locations():AgendaLocation[]};chat:{seed():ChatSeed};rh:{seed():RhSeed};marketing:{seed():MarketingSeed};reports:{seed():ReportsSeed};settings:{seed():SettingsSeed};advertising:{campaigns():AdvertisingCampaign[];formats():AdvertisingFormat[];defaultHomeAdConfig():HomeAdConfig;defaultNewsAdConfig():EditorialAdConfig};branding:{config():BrandingConfig;socialChannels():SocialChannel[]};collaboration:{types():CollaborationTypeOption[];guidelines():ReadonlyArray<{id:string;order:number;title:string}>};dashboard:{operationalSnapshot():DashboardOperationalSnapshot}}
let provider:ApplicationDataProvider|null=null
export const registerDataProvider=(next:ApplicationDataProvider)=>{provider=next}
export const getDataProvider=():ApplicationDataProvider=>{if(!provider)throw new Error('Application data provider is not registered.');return provider}
