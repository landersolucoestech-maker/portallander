import {access,readFile} from 'node:fs/promises'
import {constants} from 'node:fs'

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const exists=async path=>{try{await access(new URL(`../${path}`,import.meta.url),constants.F_OK);return true}catch{return false}}
const failures=[]

const publicStyles=await read('src/styles/public-styles.css')
for(const forbidden of ['admin-system','admin-workspaces','admin-entry','admin-header','admin-dashboard','admin-brand','admin-responsive','admin-accessibility','admin-access.css','header-brand-manager.css','brand-assets-manager.css'])if(publicStyles.includes(forbidden))failures.push(`public-styles.css não pode carregar stylesheet administrativo: ${forbidden}`)

const main=await read('src/main.tsx')
for(const required of ['QueryClientProvider','<HashRouter><App/></HashRouter>','purgeRemovedModuleStorage'])if(!main.includes(required))failures.push(`main.tsx deve manter runtime: ${required}`)

const internalApp=await read('src/app/InternalApp.tsx')
for(const required of [
 "from '../features/access/LoginPage'",
 "from '../features/access/WorkspacePage'",
 "from '../features/access/CrmWorkspace'",
 "from '../features/dashboard/DashboardPage'",
 "from '../features/contracts/ContractsPage'",
 "from '../features/finance/FinanceMainPage'",
 "from '../features/finance/FinanceInvoicesPage'",
 "from '../features/finance/FinanceAccountingPage'",
 "from '../features/site-manager/SiteManagerRoutes'",
 'path="/app/login"','path="/app/workspaces"','path="/app/dashboard"','path="/app/crm/*"','path="/app/contracts"','path="/app/finance"','path="/app/finance/invoices"','path="/app/finance/accounting"','path="/app/site/*"'
])if(!internalApp.includes(required))failures.push(`InternalApp deve manter ${required}.`)
for(const forbidden of ['CrmRoutes','/app/crm/integrations'])if(internalApp.includes(forbidden))failures.push(`InternalApp não pode reintroduzir infraestrutura removida: ${forbidden}`)

const crmWorkspace=await read('src/features/access/CrmWorkspace.tsx')
for(const required of ["from '../crm/CrmPage'",'<Route index element={<CrmPage/>}/>','path="leads" element={<CrmPage/>}','path="contatos" element={<CrmPage/>}'])if(!crmWorkspace.includes(required))failures.push(`CrmWorkspace deve preservar página CRM unificada: ${required}`)
for(const forbidden of ['DashboardPage','crm/dashboard'])if(crmWorkspace.includes(forbidden))failures.push(`CrmWorkspace não pode conter Dashboard interno do CRM: ${forbidden}`)

const adminNavigation=await read('src/shared/internal/adminNavigation.ts')
for(const required of [
 'CRM_WORKSPACE_NAV',
 "['Dashboard',LayoutDashboard,'/app/dashboard']",
 "['CRM',ContactRound,'/app/crm']",
 "['Contratos',FileText,'/app/contracts']",
 "label:'Financeiro'",
 "['Transações',Landmark,'/app/finance']",
 "['Notas Fiscais',ReceiptText,'/app/finance/invoices']",
 "['Contabilidade',BookOpen,'/app/finance/accounting']"
])if(!adminNavigation.includes(required))failures.push(`adminNavigation deve preservar módulo obrigatório: ${required}`)
for(const forbidden of ["['Dashboard',LayoutDashboard,'/app/crm']","['Leads'","['Contatos'",'/app/crm/dashboard','/app/crm/integrations','Integrações','PlugZap',"['Categorias',Tags,'/app/finance/categories']","['Regras'","/app/finance/automations"])if(adminNavigation.includes(forbidden))failures.push(`adminNavigation contém item proibido ou removido: ${forbidden}`)

const requiredFiles=[
 'src/features/contracts/ContractsPage.tsx',
 'src/features/contracts/domain.ts',
 'src/features/contracts/repository.ts',
 'src/features/finance/FinanceMainPage.tsx',
 'src/features/finance/FinancePage.tsx',
 'src/features/finance/FinanceInvoicesPage.tsx',
 'src/features/finance/FinanceAccountingPage.tsx',
 'src/styles/admin-contracts.css',
 'src/styles/admin-finance.css',
 'src/styles/admin-nav-groups.css'
]
for(const path of requiredFiles)if(!(await exists(path)))failures.push(`${path} é obrigatório e não pode ser removido.`)

const crmPage=await read('src/features/crm/CrmPage.tsx')
for(const required of ["title:'CRM'",'Gerencie contatos, leads e relacionamentos comerciais do Portal Lander.','crm-tabs','role="tablist"','Novo Contato','Novo Lead','LeadFormModal','ContactFormModal','Total de Leads','Total de Contatos'])if(!crmPage.includes(required))failures.push(`CRM deve preservar página unificada e ação contextual: ${required}`)
for(const forbidden of ['crm-page-toolbar','Gravadora/Selo','Distribuição Digital','Gestão Artística','Contratação de Artistas'])if(crmPage.includes(forbidden))failures.push(`CRM não pode manter cabeçalho duplicado ou domínio musical: ${forbidden}`)

const routing=await read('src/features/crm/routing.ts')
for(const required of ["pathname.endsWith('/leads')?'leads':'contacts'","'/app/crm/leads'","'/app/crm/contatos'"])if(!routing.includes(required))failures.push(`CRM routing deve sincronizar URL e tab: ${required}`)

const adminUi=await read('src/shared/internal/AdminUi.tsx')
if(adminUi.indexOf('{renderActions()}')>adminUi.indexOf('notification-button'))failures.push('A ação contextual deve ser renderizada antes do sino de notificações.')
if(!adminUi.includes("end={to==='/app/site'}"))failures.push('AdminUi deve manter comportamento de deep links do shell.')
for(const required of ["'contracts'","'finance'",'AdminNavGroup','isNavGroup'])if(!adminUi.includes(required))failures.push(`AdminUi deve suportar navegação dos módulos restaurados: ${required}`)

const financeMain=await read('src/features/finance/FinanceMainPage.tsx')
for(const required of ['Financeiro','Nova Transação','Importar OFX'])if(!financeMain.includes(required))failures.push(`Financeiro principal deve preservar: ${required}`)

const financeInvoices=await read('src/features/finance/FinanceInvoicesPage.tsx')
for(const required of ['Notas Fiscais','Registrar Nota'])if(!financeInvoices.includes(required))failures.push(`Notas Fiscais deve preservar: ${required}`)

const financeAccounting=await read('src/features/finance/FinanceAccountingPage.tsx')
for(const required of ['Contabilidade','P&amp;L Empresa','P&amp;L Contratos','P&amp;L Clientes'])if(!financeAccounting.includes(required))failures.push(`Contabilidade deve preservar: ${required}`)

const contracts=await read('src/features/contracts/ContractsPage.tsx')
for(const required of ['Novo Contrato','Templates'])if(!contracts.includes(required))failures.push(`Contratos deve preservar: ${required}`)

if(failures.length){console.error('Falha nos boundaries da aplicação:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Application boundaries OK')
