import {access,readFile} from 'node:fs/promises'
import {constants} from 'node:fs'

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const exists=async path=>{try{await access(new URL(`../${path}`,import.meta.url),constants.F_OK);return true}catch{return false}}
const failures=[]
const requireTokens=(path,source,tokens)=>{for(const token of tokens)if(!source.includes(token))failures.push(`${path} deve preservar: ${token}`)}
const forbidTokens=(path,source,tokens)=>{for(const token of tokens)if(source.includes(token))failures.push(`${path} não pode reintroduzir arquitetura removida: ${token}`)}

const publicStyles=await read('src/styles/public-styles.css')
for(const forbidden of ['admin-system','admin-entry','admin-header','admin-dashboard','admin-brand','admin-responsive','admin-accessibility','admin-access.css','header-brand-manager.css','brand-assets-manager.css'])if(publicStyles.includes(forbidden))failures.push(`public-styles.css não pode carregar stylesheet administrativo: ${forbidden}`)

const main=await read('src/main.tsx')
requireTokens('main.tsx',main,['QueryClientProvider','<HashRouter><App/></HashRouter>','purgeRemovedModuleStorage'])

const internalApp=await read('src/app/InternalApp.tsx')
requireTokens('InternalApp.tsx',internalApp,[
 "from '../features/access/LoginPage'",
 "from '../features/access/CrmModuleRoutes'",
 "from '../features/dashboard/DashboardPage'",
 "from '../features/contracts/ContractsPage'",
 "from '../features/finance/FinanceMainPage'",
 "from '../features/finance/FinanceInvoicesPage'",
 "from '../features/finance/FinanceAccountingPage'",
 "from '../features/finance/FinanceRegistryPage'",
 "from '../features/settings/SettingsPage'",
 "from '../features/site-manager/SiteManagerRoutes'",
 'path="/app/login"','path="/app/dashboard"','path="/app/crm/*"','path="/app/contracts"','path="/app/finance"','path="/app/finance/invoices"','path="/app/finance/accounting"','path="/app/finance/rules"','path="/app/finance/categories"','path="/app/settings"','path="/app/site/*"'
])
forbidTokens('InternalApp.tsx',internalApp,['WorkspacePage','CrmWorkspace','/app/workspaces','workspace selection'])

const crmModuleRoutes=await read('src/features/access/CrmModuleRoutes.tsx')
requireTokens('CrmModuleRoutes.tsx',crmModuleRoutes,["from '../crm/CrmPage'",'<Route index element={<CrmPage/>}/>','path="leads" element={<CrmPage/>}','path="contatos" element={<CrmPage/>}'])
forbidTokens('CrmModuleRoutes.tsx',crmModuleRoutes,['Workspace','workspace'])

for(const removed of [
 'src/features/access/WorkspacePage.tsx',
 'src/features/access/CrmWorkspace.tsx',
 'src/styles/admin-workspaces.css',
])if(await exists(removed))failures.push(`${removed} pertence à arquitetura antiga de múltiplos workspaces e deve permanecer removido.`)

const adminNavigation=await read('src/shared/internal/adminNavigation.ts')
requireTokens('adminNavigation.ts',adminNavigation,[
 'UNIFIED_ADMIN_NAV',
 "['Dashboard',LayoutDashboard,'/app/dashboard']",
 "['CRM',ContactRound,'/app/crm']",
 "label:'Financeiro'",
 "['Transações',Landmark,'/app/finance']",
 "['Notas Fiscais',ReceiptText,'/app/finance/invoices']",
 "['Contabilidade',BookOpen,'/app/finance/accounting']",
 "['Agenda',CalendarDays,'/app/agenda']",
 "['Chat',MessageCircle,'/app/chat']",
 "['RH',UsersRound,'/app/rh']",
 "label:'Site'",
 "['Conteúdos',FileText,'/app/site/conteudos']",
 "['Mídias',Images,'/app/site/midia']",
 "['Páginas',Layers3,'/app/site/paginas']",
 "['Formulários',ClipboardList,'/app/site/formularios']",
 "['Mídia Kit',Newspaper,'/app/site/midia-kit']",
 "label:'Marketing'",
 "['Configurações',Settings,'/app/settings']"
])
forbidTokens('adminNavigation.ts',adminNavigation,['CRM_WORKSPACE_NAV','WORKSPACE_NAV','/app/workspaces'])
for(const forbidden of ["['Dashboard',LayoutDashboard,'/app/crm']",'/app/crm/dashboard','/app/crm/integrations','Integrações','PlugZap',"['Categorias',Tags,'/app/finance/categories']","/app/finance/automations","['Contratos',FileText,'/app/contracts']","['Relatórios'"])if(adminNavigation.includes(forbidden))failures.push(`adminNavigation contém item proibido ou removido: ${forbidden}`)

const crmPage=await read('src/features/crm/CrmPage.tsx')
requireTokens('CrmPage.tsx',crmPage,['UNIFIED_ADMIN_NAV',"title:'CRM'",'Gerencie contatos, leads e relacionamentos comerciais do Portal Lander.','crm-tabs','role="tablist"','Novo Contato','Novo Lead','LeadFormModal','ContactFormModal','Total de Leads','Total de Contatos'])
forbidTokens('CrmPage.tsx',crmPage,['CRM_WORKSPACE_NAV','CrmWorkspace'])
for(const forbidden of ['crm-page-toolbar','Gravadora/Selo','Distribuição Digital','Gestão Artística','Contratação de Artistas'])if(crmPage.includes(forbidden))failures.push(`CRM não pode manter cabeçalho duplicado ou domínio musical: ${forbidden}`)

const contracts=await read('src/shared/data/contracts.ts')
forbidTokens('contracts.ts',contracts,['WorkspaceDescriptor'])
const dataProvider=await read('src/shared/data/dataProvider.ts')
forbidTokens('dataProvider.ts',dataProvider,['WorkspaceDescriptor','workspaces()'])
const apiDataProvider=await read('src/shared/data/apiDataProvider.ts')
forbidTokens('apiDataProvider.ts',apiDataProvider,["['identity']['workspaces']",'snapshot.identity.workspaces','workspaces:'])
const mockDataProvider=await read('src/shared/data/mockDataProvider.ts')
forbidTokens('mockDataProvider.ts',mockDataProvider,['mockWorkspaces','workspaces:'])
const appReadModel=await read('src/shared/data/appReadModel.ts')
forbidTokens('appReadModel.ts',appReadModel,['workspaces()','.identity.workspaces'])
const identityMocks=await read('src/mocks/identity/index.ts')
forbidTokens('mocks/identity/index.ts',identityMocks,['WorkspaceDescriptor','mockWorkspaces','workspace_admin','workspace_site','workspace_archive','/app/workspaces'])

const loginPage=await read('src/features/access/LoginPage.tsx')
forbidTokens('LoginPage.tsx',loginPage,['workspace administrativo','WORKSPACE ÚNICO','workspace unificado','/app/workspaces'])
requireTokens('LoginPage.tsx',loginPage,['ADMINISTRAÇÃO UNIFICADA','/app/dashboard'])

const accountPage=await read('src/features/access/AccountPages.tsx')
requireTokens('AccountPages.tsx',accountPage,['UNIFIED_ADMIN_NAV','useAdminAuth','sessionUser.displayName'])
forbidTokens('AccountPages.tsx',accountPage,['CRM_WORKSPACE_NAV'])

const adminUi=await read('src/shared/internal/AdminUi.tsx')
requireTokens('AdminUi.tsx',adminUi,['export type PageHeaderConfig','function HeaderActionButton','function PageHeader','<PageHeader context={context} header={header} actions={actions}/>','workspace-header-polished-action','notification-button','sidebar-brand-row','cms-sidebar-toggle','account-button','expandedGroups','aria-expanded={expanded}','<NavLink end className="sidebar-subnav-link"','to="/app/settings" role="menuitem"','<span>Configurações</span>','admin-sidebar-collapsed','portal-lander:admin-sidebar-collapsed','Recolher menu'])
if(adminUi.includes('notification-count'))failures.push('AdminUi não pode reintroduzir contador numérico de notificações no cabeçalho.')
if(adminUi.includes('AdminPageHeader'))failures.push('AdminUi não pode reintroduzir o cabeçalho duplicado AdminPageHeader.')

const settingsPage=await read('src/features/settings/SettingsPage.tsx')
const siteIdentity=await read('src/features/settings/SiteIdentitySettings.tsx')
requireTokens('SettingsPage.tsx',settingsPage,["'identidade_site'",'Identidade do Site','<SiteIdentitySettings/>'])
requireTokens('SiteIdentitySettings.tsx',siteIdentity,['Cabeçalho global','Rodapé global','HeaderBrandEditor'])

const financeMain=await read('src/features/finance/FinanceMainPage.tsx')
requireTokens('FinanceMainPage.tsx',financeMain,['Financeiro','Nova Transação','Importar OFX'])
if(financeMain.includes("label:'Automações'"))failures.push('Financeiro principal não pode reintroduzir ação Automações.')
const financeInvoices=await read('src/features/finance/FinanceInvoicesPage.tsx')
requireTokens('FinanceInvoicesPage.tsx',financeInvoices,['Notas Fiscais','Registrar Nota','setInvoiceModal(null)','function InvoiceModal','writeInvoices'])
const financeAccounting=await read('src/features/finance/FinanceAccountingPage.tsx')
requireTokens('FinanceAccountingPage.tsx',financeAccounting,['Contabilidade','Receita Total','Despesa Total','Lucro Líquido','Margem Líquida','Demonstrativo de Resultado'])
const financeRegistry=await read('src/features/finance/FinanceRegistryPage.tsx')
requireTokens('FinanceRegistryPage.tsx',financeRegistry,['Categorias Financeiras','Regras Financeiras','financeRepository.listCategories','financeRepository.listRules','financeRepository.saveCategories','financeRepository.saveRules'])

const mockArchitectureFiles=[
 'src/mocks/README.md','src/mocks/index.ts','src/mocks/manifest.ts',
 'src/mocks/identity/index.ts','src/mocks/notifications/index.ts','src/mocks/crm/index.ts','src/mocks/contracts/index.ts','src/mocks/finance/index.ts','src/mocks/editorial/index.ts','src/mocks/home/index.ts','src/mocks/advertising/index.ts','src/mocks/agenda/index.ts','src/mocks/dashboard/index.ts','src/mocks/collaboration/index.ts','src/mocks/branding/index.ts','src/mocks/shared/index.ts','src/mocks/scenarios/index.ts'
]
for(const path of mockArchitectureFiles)if(!(await exists(path)))failures.push(`Arquitetura global de mock data exige ${path}.`)
const mockManifest=await read('src/mocks/manifest.ts')
for(const domain of ['identity','notifications','crm','contracts','finance','editorial','home','advertising','agenda','dashboard','collaboration','branding','shared','scenarios'])if(!mockManifest.includes(`'${domain}'`))failures.push(`Manifesto global de mocks deve registrar domínio: ${domain}`)
for(const required of ['uiMayImportRawMocks:false','crossDomainIds:true','metricsMustBeDerived:true','scenariosCentralized:true','providerBoundaryRequired:true'])if(!mockManifest.includes(required))failures.push(`Manifesto global de mocks deve preservar regra: ${required}`)

if(failures.length){console.error('Falha nos boundaries da aplicação:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Application boundaries OK — administração unificada sem arquitetura de workspaces')
