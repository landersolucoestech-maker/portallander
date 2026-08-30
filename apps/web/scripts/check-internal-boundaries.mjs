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
 "from '../features/finance/FinancePage'",
 "from '../features/site-manager/SiteManagerRoutes'",
 'path="/app/login"','path="/app/workspaces"','path="/app/dashboard"','path="/app/crm/*"','path="/app/contracts"','path="/app/finance"','path="/app/finance/invoices"','path="/app/finance/accounting"','path="/app/finance/rules"','path="/app/finance/categories"','path="/app/site/*"'
])if(!internalApp.includes(required))failures.push(`InternalApp deve manter ${required}.`)
for(const forbidden of ['CrmRoutes','/app/crm/integrations','path="/app/settings"'])if(internalApp.includes(forbidden))failures.push(`InternalApp não pode reintroduzir infraestrutura removida: ${forbidden}`)

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
for(const required of ['export type PageHeaderConfig','function HeaderActionButton','function PageHeader','<PageHeader context={context} header={header} actions={actions}/>','workspace-header-polished-action','notification-button','account-button','expandedGroups','aria-expanded={expanded}','<NavLink end className="sidebar-subnav-link"'])if(!adminUi.includes(required))failures.push(`AdminUi deve preservar arquitetura compartilhada: ${required}`)
if(adminUi.includes('AdminPageHeader'))failures.push('AdminUi não pode reintroduzir o cabeçalho duplicado AdminPageHeader.')
if(adminUi.includes('/app/settings')||adminUi.includes('>Configurações</span>'))failures.push('Account Menu não pode apontar para Configurações inexistente.')
if(adminUi.indexOf('{actions.map(')>adminUi.indexOf('notification-button'))failures.push('Ações de página devem permanecer antes das notificações no PageHeader compartilhado.')
if(!adminUi.includes("end={to==='/app/site'}"))failures.push('AdminUi deve manter comportamento de deep links do shell.')
for(const required of ["'contracts'","'finance'",'AdminNavGroup','isNavGroup'])if(!adminUi.includes(required))failures.push(`AdminUi deve suportar navegação dos módulos restaurados: ${required}`)

const siteHeaderFiles=[
 'src/features/site-manager/HeroManagerPage.tsx',
 'src/features/site-manager/pages/SiteManagerDashboardPage.tsx',
 'src/features/site-manager/pages/HomeManagerPage.tsx',
 'src/features/site-manager/pages/BrandAssetsManagerPage.tsx',
 'src/features/site-manager/pages/HeaderBrandManagerPage.tsx',
 'src/features/site-manager/pages/HomeAdManagerPage.tsx',
 'src/features/site-manager/pages/NewsAdManagerPage.tsx',
 'src/features/site-manager/pages/SiteCategoriesPage.tsx',
 'src/features/site-manager/pages/SiteMediaPage.tsx',
 'src/features/site-manager/pages/MediaKitPage.tsx',
 'src/features/site-manager/pages/SitePagesPage.tsx',
 'src/features/site-manager/pages/SiteContentsPage.tsx'
]
for(const path of siteHeaderFiles){
 const source=await read(path)
 if(!source.includes('<AdminShell')||!source.includes('header={{'))failures.push(`${path} deve usar o PageHeader compartilhado via AdminShell.header.`)
 if(source.includes('AdminPageHeader'))failures.push(`${path} não pode usar AdminPageHeader embutido no conteúdo.`)
}
const editorialAdmin=await read('src/features/editorial/components/EditorialAdmin.tsx')
if(editorialAdmin.includes('AdminPageHeader'))failures.push('EditorialAdmin não pode reconstruir cabeçalho dentro do conteúdo.')
const brandAssets=await read('src/features/site-manager/pages/BrandAssetsManagerPage.tsx')
if(brandAssets.includes('brand-assets-top'))failures.push('Marca & Logos não pode manter cabeçalho manual duplicado dentro do conteúdo.')

const financeMain=await read('src/features/finance/FinanceMainPage.tsx')
for(const required of ['Financeiro','Nova Transação','Importar OFX'])if(!financeMain.includes(required))failures.push(`Financeiro principal deve preservar: ${required}`)

const financeInvoices=await read('src/features/finance/FinanceInvoicesPage.tsx')
for(const required of ['Notas Fiscais','Registrar Nota','setInvoiceModal(null)','function InvoiceModal','writeInvoices'])if(!financeInvoices.includes(required))failures.push(`Notas Fiscais deve preservar fluxo funcional: ${required}`)
if(financeInvoices.includes('newInvoice=1'))failures.push('Registrar Nota não pode depender de query param sem consumidor.')

const financeAccounting=await read('src/features/finance/FinanceAccountingPage.tsx')
for(const required of ['Contabilidade','Receita Total','Despesa Total','Lucro Líquido','Margem Líquida','Demonstrativo de Resultado','Resultado por Contrato','Resultado por Cliente'])if(!financeAccounting.includes(required))failures.push(`Contabilidade deve preservar: ${required}`)
for(const forbidden of ['finance-accounting-tabs','P&amp;L Empresa','P&amp;L Contratos','P&amp;L Clientes',"type Tab=",'setTab('])if(financeAccounting.includes(forbidden))failures.push(`Contabilidade não pode reintroduzir estrutura descartada: ${forbidden}`)
if(financeAccounting.indexOf('finance-kpis accounting-original-kpis')>financeAccounting.indexOf('finance-filters'))failures.push('Contabilidade deve manter KPI Cards acima dos filtros.')

const contracts=await read('src/features/contracts/ContractsPage.tsx')
for(const required of ['Novo Contrato','Templates','Novo Template'])if(!contracts.includes(required))failures.push(`Contratos deve preservar: ${required}`)

if(failures.length){console.error('Falha nos boundaries da aplicação:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Application boundaries OK')
