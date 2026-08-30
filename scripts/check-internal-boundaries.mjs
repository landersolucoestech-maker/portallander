import {access,readFile} from 'node:fs/promises'
import {constants} from 'node:fs'
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');const failures=[]

const publicStyles=await read('src/styles/public-styles.css')
for(const forbidden of ['admin-system','admin-workspaces','admin-entry','admin-header','admin-dashboard','admin-brand','admin-responsive','admin-accessibility','admin-access.css','header-brand-manager.css','brand-assets-manager.css'])if(publicStyles.includes(forbidden))failures.push(`public-styles.css não pode carregar stylesheet administrativo: ${forbidden}`)

const main=await read('src/main.tsx')
for(const required of ['QueryClientProvider','<HashRouter><App/></HashRouter>','purgeRemovedModuleStorage'])if(!main.includes(required))failures.push(`main.tsx deve manter runtime: ${required}`)

const internalApp=await read('src/app/InternalApp.tsx')
for(const required of ["from '../features/access/LoginPage'","from '../features/access/WorkspacePage'","from '../features/access/CrmWorkspace'","from '../features/dashboard/DashboardPage'","from '../features/site-manager/SiteManagerRoutes'",'path="/app/login"','path="/app/workspaces"','path="/app/dashboard"','path="/app/crm/*"','path="/app/site/*"'])if(!internalApp.includes(required))failures.push(`InternalApp deve manter ${required}.`)
for(const forbidden of ['CrmRoutes','integrations','/app/contracts','/app/finance','/app/settings'])if(internalApp.includes(forbidden))failures.push(`InternalApp não pode reintroduzir infraestrutura removida: ${forbidden}`)

const crmWorkspace=await read('src/features/access/CrmWorkspace.tsx')
for(const required of ["from '../crm/CrmPage'",'<Route index element={<CrmPage/>}/>','path="leads" element={<CrmPage/>}','path="contatos" element={<CrmPage/>}'])if(!crmWorkspace.includes(required))failures.push(`CrmWorkspace deve preservar página CRM unificada: ${required}`)
for(const forbidden of ['DashboardPage','crm/dashboard'])if(crmWorkspace.includes(forbidden))failures.push(`CrmWorkspace não pode conter Dashboard interno do CRM: ${forbidden}`)

const dashboard=await read('src/features/dashboard/DashboardPage.tsx')
for(const required of ['Visão geral.','Pipeline Comercial','Operação Editorial','Atividades Recentes'])if(!dashboard.includes(required))failures.push(`Dashboard deve preservar área ativa: ${required}`)
for(const forbidden of ['Faturamento do Mês','A Receber','Contratos Ativos','Publicações Contratadas Pendentes','Próximos Compromissos','Receita por Origem','Conteúdos Publicados','Categorias Editoriais','Últimas Atualizações','Publicações Recentes','Artistas Cadastrados','Artistas em Destaque','streams','Math.random','fake data','mockDashboard'])if(dashboard.includes(forbidden))failures.push(`Dashboard não pode reintroduzir módulo removido ou dado fabricado: ${forbidden}`)

const adminNavigation=await read('src/shared/internal/adminNavigation.ts')
for(const required of ['CRM_WORKSPACE_NAV',"['Dashboard',LayoutDashboard,'/app/dashboard']","['CRM',ContactRound,'/app/crm']"])if(!adminNavigation.includes(required))failures.push(`adminNavigation deve preservar Dashboard e CRM: ${required}`)
for(const forbidden of ["['Dashboard',LayoutDashboard,'/app/crm']","['Leads'","['Contatos'",'/app/crm/dashboard','/app/crm/integrations','Integrações','PlugZap','/app/contracts','/app/finance','/app/settings'])if(adminNavigation.includes(forbidden))failures.push(`adminNavigation não pode expor rota removida ou dividir o CRM: ${forbidden}`)

const crmPage=await read('src/features/crm/CrmPage.tsx')
for(const required of ["title:'CRM'",'Gerencie contatos, leads e relacionamentos comerciais do Portal Lander.','crm-tabs','role="tablist"','Novo Contato','Novo Lead',"navigate(crmPathForTab('contacts'))","navigate(crmPathForTab('leads'))",'LeadFormModal','ContactFormModal','Total de Leads','Total de Contatos'])if(!crmPage.includes(required))failures.push(`CRM deve preservar página unificada e ação contextual: ${required}`)
for(const forbidden of ['crm-page-toolbar','Gravadora/Selo','Distribuição Digital','Gestão Artística','Contratação de Artistas'])if(crmPage.includes(forbidden))failures.push(`CRM não pode manter cabeçalho duplicado ou domínio musical: ${forbidden}`)

const routing=await read('src/features/crm/routing.ts')
for(const required of ["pathname.endsWith('/leads')?'leads':'contacts'","'/app/crm/leads'","'/app/crm/contatos'"])if(!routing.includes(required))failures.push(`CRM routing deve sincronizar URL e tab: ${required}`)

const adminUi=await read('src/shared/internal/AdminUi.tsx')
if(adminUi.indexOf('{renderActions()}')>adminUi.indexOf('notification-button'))failures.push('A ação contextual deve ser renderizada antes do sino de notificações.')
if(!adminUi.includes("end={to==='/app/site'}"))failures.push('AdminUi deve permitir CRM ativo nos deep links sem afetar o Dashboard global.')
for(const forbidden of ['contracts','finance','/app/settings','Configurações'])if(adminUi.includes(forbidden))failures.push(`AdminUi não pode manter resíduo de módulo removido: ${forbidden}`)

const domain=await read('src/features/crm/domain.ts')
for(const required of ['agencia_publicidade','assessoria_imprensa','anunciante','patrocinador','fonte_editorial','publieditorial','campanha_publicitaria'])if(!domain.includes(required))failures.push(`CRM domain deve preservar adaptação Portal Lander: ${required}`)

const cleanup=await read('src/shared/internal/legacyStorageCleanup.ts')
for(const required of ['portal-lander:contracts:v1','portal-lander:finance:transactions','portal-lander:finance:invoices'])if(!cleanup.includes(required))failures.push(`Limpeza de storage legado deve preservar chave comprovada: ${required}`)

const removedPaths=[
 'src/features/contracts/ContractsPage.tsx','src/features/contracts/domain.ts','src/features/contracts/repository.ts',
 'src/features/finance/FinancePage.tsx','src/features/finance/FinanceMainPage.tsx','src/features/finance/FinanceInvoicesPage.tsx','src/features/finance/FinanceAccountingPage.tsx',
 'src/features/crm/CrmRoutes.tsx','src/features/crm/data/demoSnapshot.ts','src/features/crm/model.ts','src/features/crm/pages/ContactsReferencePage.tsx','src/features/crm/pages/CrmDashboardPage.tsx','src/features/crm/presentation.ts','src/features/operations/OperationsPage.tsx',
 'src/styles/admin-contracts.css','src/styles/admin-finance.css','src/styles/admin-nav-groups.css','src/styles/admin-crm.css','src/styles/admin-crm-dashboard-header.css','src/styles/admin-crm-relationships.css','src/styles/admin-reference-v2.css','src/styles/admin-reference-real.css'
]
for(const removedPath of removedPaths){try{await access(new URL(`../${removedPath}`,import.meta.url),constants.F_OK);failures.push(`${removedPath} deve permanecer removido.`)}catch{}}

if(failures.length){console.error('Falha nos boundaries da aplicação:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Application boundaries OK')
