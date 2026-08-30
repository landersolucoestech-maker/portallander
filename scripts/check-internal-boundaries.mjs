import {access,readFile} from 'node:fs/promises'
import {constants} from 'node:fs'
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');const failures=[]

const publicStyles=await read('src/styles/public-styles.css')
for(const forbidden of ['admin-system','admin-workspaces','admin-entry','admin-header','admin-dashboard','admin-brand','admin-responsive','admin-accessibility','admin-access.css','header-brand-manager.css','brand-assets-manager.css'])if(publicStyles.includes(forbidden))failures.push(`public-styles.css não pode carregar stylesheet administrativo: ${forbidden}`)

const main=await read('src/main.tsx')
for(const required of ['QueryClientProvider','<HashRouter><App/></HashRouter>'])if(!main.includes(required))failures.push(`main.tsx deve manter runtime: ${required}`)

const internalApp=await read('src/app/InternalApp.tsx')
for(const required of ["from '../features/access/LoginPage'","from '../features/access/WorkspacePage'","from '../features/access/CrmWorkspace'","from '../features/site-manager/SiteManagerRoutes'",'path="/app/login"','path="/app/workspaces"','path="/app/crm/*"','path="/app/site/*"'])if(!internalApp.includes(required))failures.push(`InternalApp deve manter ${required}.`)
for(const forbidden of ['CrmRoutes','integrations'])if(internalApp.includes(forbidden))failures.push(`InternalApp não pode reintroduzir infraestrutura removida: ${forbidden}`)

const crmWorkspace=await read('src/features/access/CrmWorkspace.tsx')
for(const required of ["from '../dashboard/DashboardPage'","from '../crm/CrmPage'",'<Route index element={<DashboardPage/>}/>','path="leads"','path="contatos"'])if(!crmWorkspace.includes(required))failures.push(`CrmWorkspace deve preservar rota CRM: ${required}`)

const dashboard=await read('src/features/dashboard/DashboardPage.tsx')
for(const required of ['Visão geral.','Faturamento do Mês','A Receber','Contratos Ativos','Publicações Contratadas Pendentes','Próximos Compromissos','Pipeline Comercial','Operação Editorial','Receita por Origem','Atividades Recentes'])if(!dashboard.includes(required))failures.push(`Dashboard executivo deve preservar: ${required}`)
for(const forbidden of ['Conteúdos Publicados','Categorias Editoriais','Últimas Atualizações','Publicações Recentes','Artistas Cadastrados','Artistas em Destaque','streams','Math.random','fake data','mockDashboard'])if(dashboard.includes(forbidden))failures.push(`Dashboard não pode reintroduzir dashboard editorial/musical ou dado fabricado: ${forbidden}`)

const adminNavigation=await read('src/shared/internal/adminNavigation.ts')
for(const required of ['CRM_WORKSPACE_NAV','/app/crm/leads','/app/crm/contatos'])if(!adminNavigation.includes(required))failures.push(`adminNavigation deve preservar CRM adaptado: ${required}`)
for(const forbidden of ['Integrações','PlugZap','/app/crm/integrations'])if(adminNavigation.includes(forbidden))failures.push(`adminNavigation não pode reintroduzir Integrações removidas: ${forbidden}`)

const crmPage=await read('src/features/crm/CrmPage.tsx')
for(const required of ['Pipeline Comercial','Rede de Relacionamentos','Novo lead','Novo contato','Total de Leads','Total de Contatos'])if(!crmPage.includes(required))failures.push(`CRM deve preservar UX adaptada: ${required}`)
for(const forbidden of ['Gravadora/Selo','Distribuição Digital','Gestão Artística','Contratação de Artistas'])if(crmPage.includes(forbidden))failures.push(`CRM não pode importar domínio musical: ${forbidden}`)

const domain=await read('src/features/crm/domain.ts')
for(const required of ['agencia_publicidade','assessoria_imprensa','anunciante','patrocinador','fonte_editorial','publieditorial','campanha_publicitaria'])if(!domain.includes(required))failures.push(`CRM domain deve preservar adaptação Portal Lander: ${required}`)

const removedPaths=['src/features/crm/CrmRoutes.tsx','src/features/crm/data/demoSnapshot.ts','src/features/crm/model.ts','src/features/crm/pages/ContactsReferencePage.tsx','src/features/crm/pages/CrmDashboardPage.tsx','src/features/crm/presentation.ts','src/features/operations/OperationsPage.tsx','src/styles/admin-crm.css','src/styles/admin-crm-dashboard-header.css','src/styles/admin-crm-relationships.css','src/styles/admin-reference-v2.css','src/styles/admin-reference-real.css']
for(const removedPath of removedPaths){try{await access(new URL(`../${removedPath}`,import.meta.url),constants.F_OK);failures.push(`${removedPath} deve permanecer removido.`)}catch{}}

if(failures.length){console.error('Falha nos boundaries da aplicação:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Application boundaries OK')
