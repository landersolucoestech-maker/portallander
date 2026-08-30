import {mockAdvertisingCampaigns,mockAgendaItems,mockBrandingConfig,mockCollaborationGuidelines,mockCollaborationTypes,mockContractCategories,mockContracts,mockContractTemplates,mockContractVariables,mockCurrentUserId,mockDashboardOperationalSnapshot,mockDataScenarios,mockEditorialContents,mockEditorialMedia,mockEditorialPages,mockFinanceCategories,mockFinanceInvoices,mockFinanceRules,mockFinanceTransactions,mockHomeAgenda,mockHomeMostRead,mockHomeReleases,mockHomeStories,mockNotifications,mockSocialChannels,mockUsers,mockWorkspaces,mockCrmState} from '../../mocks'
import type {DataScenarioName} from './contracts'
import type {ApplicationDataProvider,DataDomain} from './dataProvider'

const SCENARIO_STORAGE_KEY='portal-lander:data-scenario:v1'
const clone=<T>(value:T):T=>structuredClone(value)
const readScenario=():DataScenarioName=>{try{const value=localStorage.getItem(SCENARIO_STORAGE_KEY) as DataScenarioName|null;return value&&value in mockDataScenarios?value:'success'}catch{return 'success'}}
let scenarioName:DataScenarioName=readScenario()

const scenario=()=>mockDataScenarios[scenarioName]
const guard=(domain:DataDomain)=>{const current=scenario();if(current.permissionDeniedDomains.includes(domain))throw new Error(`Permission denied for data domain: ${domain}`);if(current.failDomains.includes(domain))throw new Error(`Mock data failure for domain: ${domain}`)}
const list=<T>(domain:DataDomain,items:readonly T[]):T[]=>{guard(domain);const current=scenario();if(current.emptyDomains.includes(domain))return[];const source=current.partialDomains.includes(domain)?items.slice(0,Math.max(1,Math.ceil(items.length/3))):items;return clone(source as T[])}

export const mockDataProvider:ApplicationDataProvider={
 kind:'mock',
 getScenario:()=>clone(scenario()),
 setScenario(name){scenarioName=name;try{localStorage.setItem(SCENARIO_STORAGE_KEY,name)}catch{/* storage unavailable: runtime scenario remains active */}},
 identity:{
  users:()=>list('identity',mockUsers),
  currentUser:()=>{guard('identity');const user=mockUsers.find(item=>item.id===mockCurrentUserId);if(!user)throw new Error('Mock current user does not exist.');return clone(user)},
  workspaces:()=>list('identity',mockWorkspaces),
 },
 notifications:{list:()=>list('notifications',mockNotifications)},
 crm:{state:()=>{guard('crm');const current=scenario();if(current.emptyDomains.includes('crm'))return{version:1,leads:[],contacts:[]};if(current.partialDomains.includes('crm'))return{version:1,leads:clone(mockCrmState.leads.slice(0,12)),contacts:clone(mockCrmState.contacts.slice(0,12))};return clone(mockCrmState)}},
 contracts:{state:()=>{guard('contracts');const current=scenario();return{contracts:current.emptyDomains.includes('contracts')?[]:clone(current.partialDomains.includes('contracts')?mockContracts.slice(0,8):mockContracts),templates:clone(mockContractTemplates),categories:clone(mockContractCategories),variables:clone(mockContractVariables)}} ,
 finance:{transactions:()=>list('finance',mockFinanceTransactions),invoices:()=>list('finance',mockFinanceInvoices),categories:()=>list('finance',mockFinanceCategories),rules:()=>list('finance',mockFinanceRules)},
 editorial:{pages:()=>list('editorial',mockEditorialPages),contents:()=>list('editorial',mockEditorialContents),media:()=>list('editorial',mockEditorialMedia)},
 home:{stories:()=>list('home',mockHomeStories),mostRead:()=>list('home',mockHomeMostRead),releases:()=>list('home',mockHomeReleases),agenda:()=>list('home',mockHomeAgenda)},
 agenda:{items:()=>list('agenda',mockAgendaItems)},
 advertising:{campaigns:()=>list('advertising',mockAdvertisingCampaigns)},
 branding:{config:()=>{guard('branding');return clone(mockBrandingConfig)},socialChannels:()=>list('branding',mockSocialChannels)},
 collaboration:{types:()=>list('collaboration',mockCollaborationTypes),guidelines:()=>list('collaboration',mockCollaborationGuidelines)},
 dashboard:{operationalSnapshot:()=>{guard('dashboard');return clone(mockDashboardOperationalSnapshot)}},
}
