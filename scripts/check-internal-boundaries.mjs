import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'

const read = path => readFile(new URL(`../${path}`, import.meta.url),'utf8')
const failures=[]

const publicStyles=await read('src/styles/public-styles.css')
for(const forbidden of ['admin-system','admin-workspaces','admin-entry','admin-header','admin-dashboard','admin-brand','admin-responsive','admin-accessibility','admin-access.css','header-brand-manager.css','brand-assets-manager.css'])if(publicStyles.includes(forbidden))failures.push(`public-styles.css não pode carregar stylesheet administrativo: ${forbidden}`)

const main=await read('src/main.tsx')
if(!main.includes('<React.StrictMode><HashRouter><App/></HashRouter></React.StrictMode>'))failures.push('main.tsx deve montar App dentro do HashRouter.')

const internalApp=await read('src/app/InternalApp.tsx')
for(const required of ["from '../features/access/LoginPage'","from '../features/access/WorkspacePage'","from '../features/access/CrmWorkspace'","from '../features/site-manager/SiteManagerRoutes'",'path="/app/login"','path="/app/workspaces"','path="/app/crm/*"','path="/app/site/*"'])if(!internalApp.includes(required))failures.push(`InternalApp deve manter ${required}.`)
for(const forbidden of ['CrmRoutes','integrations'])if(internalApp.includes(forbidden))failures.push(`InternalApp não pode reintroduzir módulo removido: ${forbidden}`)

const workspacePage=await read('src/features/access/WorkspacePage.tsx')
for(const required of ["to:'/app/crm'","to:'/app/site'",'title:\'CRM\''])if(!workspacePage.includes(required))failures.push(`WorkspacePage deve manter workspace: ${required}`)
for(const forbidden of ['CRM completo','contatos, leads','Integrações removidas?'])if(workspacePage.includes(forbidden))failures.push(`WorkspacePage não pode reintroduzir implementação antiga: ${forbidden}`)

const crmWorkspace=await read('src/features/access/CrmWorkspace.tsx')
if(!crmWorkspace.includes('CRM_WORKSPACE_NAV'))failures.push('CrmWorkspace deve usar navegação própria do workspace.')
if(!crmWorkspace.includes('<Route index'))failures.push('CrmWorkspace deve declarar rota index.')
for(const forbidden of ['Contacts','Leads','Integration','repository','demoSnapshot'])if(crmWorkspace.includes(forbidden))failures.push(`CrmWorkspace não pode conter módulo CRM/Integrações: ${forbidden}`)

const siteRoutes=await read('src/features/site-manager/SiteManagerRoutes.tsx')
if(!siteRoutes.includes('<Route index'))failures.push('SiteManagerRoutes deve declarar dashboard index.')
for(const required of ['path="home"','path="home/anuncio"','path="marca"','path="cabecalho"','path="noticias/anuncio"'])if(!siteRoutes.includes(required))failures.push(`SiteManagerRoutes deve manter ${required}.`)

const adminNavigation=await read('src/shared/internal/adminNavigation.ts')
if(!adminNavigation.includes('CRM_WORKSPACE_NAV'))failures.push('adminNavigation deve preservar a navegação estrutural do workspace CRM.')
for(const forbidden of ['CRM_NAV','Integrações','PlugZap','/app/crm/contatos','/app/crm/integrations'])if(adminNavigation.includes(forbidden))failures.push(`adminNavigation não pode reintroduzir módulo removido: ${forbidden}`)

const adminUi=await read('src/shared/internal/AdminUi.tsx')
for(const forbidden of ['isContactsRoute','contactsCreateLabel','app-shell-crm-contacts'])if(adminUi.includes(forbidden))failures.push(`AdminUi não pode reintroduzir comportamento do módulo CRM: ${forbidden}`)

const removedPaths=[
  'src/features/crm/CrmRoutes.tsx',
  'src/features/crm/data/demoSnapshot.ts',
  'src/features/crm/model.ts',
  'src/features/crm/pages/ContactsReferencePage.tsx',
  'src/features/crm/pages/CrmDashboardPage.tsx',
  'src/features/crm/presentation.ts',
  'src/features/crm/repository.ts',
  'src/features/operations/OperationsPage.tsx',
  'src/styles/admin-crm.css',
  'src/styles/admin-crm-dashboard-header.css',
  'src/styles/admin-crm-relationships.css',
  'src/styles/admin-reference-v2.css',
  'src/styles/admin-reference-real.css',
]
for(const removedPath of removedPaths){try{await access(new URL(`../${removedPath}`,import.meta.url),constants.F_OK);failures.push(`${removedPath} deve permanecer removido.`)}catch{}}

if(failures.length){console.error('Falha nos boundaries da aplicação:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Application boundaries OK')
