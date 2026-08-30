import type {ApplicationDataProvider} from './dataProvider'
import type {DataScenario} from './contracts'

export type ApiDataSnapshot={
 identity:ReturnType<ApplicationDataProvider['identity']['users']> extends infer U?{users:U;currentUser:ReturnType<ApplicationDataProvider['identity']['currentUser']>;workspaces:ReturnType<ApplicationDataProvider['identity']['workspaces']>}:never
 notifications:ReturnType<ApplicationDataProvider['notifications']['list']>
 crm:ReturnType<ApplicationDataProvider['crm']['state']>
 contracts:ReturnType<ApplicationDataProvider['contracts']['state']>
 finance:{transactions:ReturnType<ApplicationDataProvider['finance']['transactions']>;invoices:ReturnType<ApplicationDataProvider['finance']['invoices']>;categories:ReturnType<ApplicationDataProvider['finance']['categories']>;rules:ReturnType<ApplicationDataProvider['finance']['rules']>}
 editorial:{pages:ReturnType<ApplicationDataProvider['editorial']['pages']>;contents:ReturnType<ApplicationDataProvider['editorial']['contents']>;media:ReturnType<ApplicationDataProvider['editorial']['media']>}
 home:{stories:ReturnType<ApplicationDataProvider['home']['stories']>;mostRead:ReturnType<ApplicationDataProvider['home']['mostRead']>;releases:ReturnType<ApplicationDataProvider['home']['releases']>;agenda:ReturnType<ApplicationDataProvider['home']['agenda']>;heroArticles:ReturnType<ApplicationDataProvider['home']['heroArticles']>;defaultHeroSlide:ReturnType<ApplicationDataProvider['home']['defaultHeroSlide']>;defaultHeroConfig:ReturnType<ApplicationDataProvider['home']['defaultHeroConfig']>}
 agenda:ReturnType<ApplicationDataProvider['agenda']['items']>
 advertising:{campaigns:ReturnType<ApplicationDataProvider['advertising']['campaigns']>;formats:ReturnType<ApplicationDataProvider['advertising']['formats']>;defaultHomeAdConfig:ReturnType<ApplicationDataProvider['advertising']['defaultHomeAdConfig']>;defaultNewsAdConfig:ReturnType<ApplicationDataProvider['advertising']['defaultNewsAdConfig']>}
 branding:{config:ReturnType<ApplicationDataProvider['branding']['config']>;socialChannels:ReturnType<ApplicationDataProvider['branding']['socialChannels']>}
 collaboration:{types:ReturnType<ApplicationDataProvider['collaboration']['types']>;guidelines:ReturnType<ApplicationDataProvider['collaboration']['guidelines']>}
 dashboard:ReturnType<ApplicationDataProvider['dashboard']['operationalSnapshot']>
}

const clone=<T>(value:T):T=>structuredClone(value)
const apiScenario:DataScenario={name:'success',latencyMs:0,failDomains:[],emptyDomains:[],partialDomains:[],permissionDeniedDomains:[],offline:false,largeDataset:false}

export function createApiDataProvider(snapshot:ApiDataSnapshot):ApplicationDataProvider{
 return {
  kind:'api',getScenario:()=>clone(apiScenario),setScenario:()=>undefined,
  identity:{users:()=>clone(snapshot.identity.users),currentUser:()=>clone(snapshot.identity.currentUser),workspaces:()=>clone(snapshot.identity.workspaces)},
  notifications:{list:()=>clone(snapshot.notifications)},
  crm:{state:()=>clone(snapshot.crm)},contracts:{state:()=>clone(snapshot.contracts)},
  finance:{transactions:()=>clone(snapshot.finance.transactions),invoices:()=>clone(snapshot.finance.invoices),categories:()=>clone(snapshot.finance.categories),rules:()=>clone(snapshot.finance.rules)},
  editorial:{pages:()=>clone(snapshot.editorial.pages),contents:()=>clone(snapshot.editorial.contents),media:()=>clone(snapshot.editorial.media)},
  home:{stories:()=>clone(snapshot.home.stories),mostRead:()=>clone(snapshot.home.mostRead),releases:()=>clone(snapshot.home.releases),agenda:()=>clone(snapshot.home.agenda),heroArticles:()=>clone(snapshot.home.heroArticles),defaultHeroSlide:()=>clone(snapshot.home.defaultHeroSlide),defaultHeroConfig:()=>clone(snapshot.home.defaultHeroConfig)},
  agenda:{items:()=>clone(snapshot.agenda)},
  advertising:{campaigns:()=>clone(snapshot.advertising.campaigns),formats:()=>clone(snapshot.advertising.formats),defaultHomeAdConfig:()=>clone(snapshot.advertising.defaultHomeAdConfig),defaultNewsAdConfig:()=>clone(snapshot.advertising.defaultNewsAdConfig)},
  branding:{config:()=>clone(snapshot.branding.config),socialChannels:()=>clone(snapshot.branding.socialChannels)},
  collaboration:{types:()=>clone(snapshot.collaboration.types),guidelines:()=>clone(snapshot.collaboration.guidelines)},
  dashboard:{operationalSnapshot:()=>clone(snapshot.dashboard)},
 }
}
