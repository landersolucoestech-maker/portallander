import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'

const read = path => readFile(new URL(`../${path}`, import.meta.url),'utf8')
const failures=[]

const publicStyles=await read('src/styles/public-styles.css')
for(const forbidden of ['admin-system','admin-workspaces','admin-entry','admin-header','admin-dashboard','admin-brand','admin-responsive','admin-accessibility','admin-access.css','header-brand-manager.css','brand-assets-manager.css'])if(publicStyles.includes(forbidden))failures.push(`public-styles.css não pode carregar stylesheet administrativo: ${forbidden}`)

const main=await read('src/main.tsx')
for(const required of ['QueryClientProvider','<HashRouter><App/></HashRouter>'])if(!main.includes(required))failures.push(`main.tsx deve manter runtime: ${required}`)

const internalApp=await read('src/app/InternalApp.tsx')
for(const required of ["from '../features/access/LoginPage'","from '../features/access/WorkspacePage'","from '../features/access/CrmWorkspace'","from '../features/site-manager/SiteManagerRoutes'",'path="/app/login"','path="/app/workspaces"','path="/app/crm/*"','path="/app/site/*"'])if(!internalApp.includes(required))failures.push(`InternalApp deve manter ${required}.`)
for(const forbidden of ['CrmRoutes','integrations'])if(internalApp.includes(forbidden))failures.push(`InternalApp não pode reintroduzir módulo removido: ${forbidden}`)

const workspacePage=await read('src/features/access/WorkspacePage.tsx')
for(const required of ["to:'/app/crm'","to:'/app/site'",'title:\'CRM\''])if(!workspacePage.includes(required))failures.push(`WorkspacePage deve manter workspace: ${required}`)

const crmWorkspace=await read('src/features/access/CrmWorkspace.tsx')
for(const required of ["from '../dashboard/DashboardPage'",'<Route index element={<DashboardPage/>}/>'])if(!crmWorkspace.includes(required))failures.push(`CrmWorkspace deve montar Dashboard: ${required}`)
for(const forbidden of ['Contacts','Leads','Integration','repository','demoSnapshot'])if(crmWorkspace.includes(forbidden))failures.push(`CrmWorkspace não pode conter módulo CRM/Integrações: ${forbidden}`)

const dashboard=await read('src/features/dashboard/DashboardPage.tsx')
for(const required of ['Visão executiva e operacional do Portal Lander','Faturamento do Mês','A Receber','Contratos Ativos','Publicações Contratadas Pendentes','Atenção Necessária','Próximos Compromissos','Pipeline Comercial','Operação Editorial','Receita por Origem','Atividades Recentes'])if(!dashboard.includes(required))failures.push(`Dashboard executivo deve preservar: ${required}`)
for(const forbidden of ['Conteúdos Publicados','Categorias Editoriais','Últimas Atualizações','Publicações Recentes','Artistas Cadastrados','Contratos Vigentes','Receita Total','Eventos do Mês','Artistas em Destaque','streams','Math.random','fake data','mockDashboard'])if(dashboard.includes(forbidden))failures.push(`Dashboard não pode reintroduzir dashboard editorial/musical ou dado fabricado: ${forbidden}`)

const dashboardApi=await read('src/features/dashboard/api.ts')
for(const required of ['editorialReadModel','published_count','draft_count','published_this_month','category_count','recent_publications','recent_updates'])if(!dashboardApi.includes(required))failures.push(`Dashboard datasource deve manter a fonte editorial real disponível: ${required}`)

const operationalHook=await read('src/features/dashboard/hooks/useOperationalDashboard.ts')
for(const required of ["queryKey:['portal-dashboard']",'staleTime:30_000','refetchInterval:60_000'])if(!operationalHook.includes(required))failures.push(`useOperationalDashboard deve preservar ${required}`)

const activityHook=await read('src/features/dashboard/hooks/useActivityHistory.ts')
for(const required of ["queryKey:['editorial-activity-history',safeLimit]",'staleTime:30_000','refetchOnWindowFocus:false','retry:1'])if(!activityHook.includes(required))failures.push(`useActivityHistory deve preservar ${required}`)

const dashboardTypes=await read('src/features/dashboard/types.ts')
for(const forbidden of ['artists','contracts','revenue_current_month','distribution','society_submissions'])if(dashboardTypes.includes(forbidden))failures.push(`Tipos do Dashboard não podem manter domínio musical: ${forbidden}`)

const siteRoutes=await read('src/features/site-manager/SiteManagerRoutes.tsx')
if(!siteRoutes.includes('<Route index'))failures.push('SiteManagerRoutes deve declarar dashboard index.')
for(const required of ['path="home"','path="home/anuncio"','path="marca"','path="cabecalho"','path="noticias/anuncio"'])if(!siteRoutes.includes(required))failures.push(`SiteManagerRoutes deve manter ${required}.`)

const adminNavigation=await read('src/shared/internal/adminNavigation.ts')
if(!adminNavigation.includes('CRM_WORKSPACE_NAV'))failures.push('adminNavigation deve preservar a navegação estrutural do workspace CRM.')
for(const forbidden of ['CRM_NAV','Integrações','PlugZap','/app/crm/contatos','/app/crm/integrations'])if(adminNavigation.includes(forbidden))failures.push(`adminNavigation não pode reintroduzir módulo removido: ${forbidden}`)

const removedPaths=[
  'src/features/crm/CrmRoutes.tsx','src/features/crm/data/demoSnapshot.ts','src/features/crm/model.ts','src/features/crm/pages/ContactsReferencePage.tsx','src/features/crm/pages/CrmDashboardPage.tsx','src/features/crm/presentation.ts','src/features/crm/repository.ts','src/features/operations/OperationsPage.tsx','src/styles/admin-crm.css','src/styles/admin-crm-dashboard-header.css','src/styles/admin-crm-relationships.css','src/styles/admin-reference-v2.css','src/styles/admin-reference-real.css',
]
for(const removedPath of removedPaths){try{await access(new URL(`../${removedPath}`,import.meta.url),constants.F_OK);failures.push(`${removedPath} deve permanecer removido.`)}catch{}}

if(failures.length){console.error('Falha nos boundaries da aplicação:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Application boundaries OK')
