import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'

const read = path => readFile(new URL(`../${path}`, import.meta.url),'utf8')
const failures=[]

const publicStyles=await read('src/styles/public-styles.css')
for(const forbidden of ['admin-system','admin-workspaces','admin-entry','admin-header','admin-dashboard','admin-brand','admin-responsive','admin-accessibility','admin-access.css','header-brand-manager.css','brand-assets-manager.css'])if(publicStyles.includes(forbidden))failures.push(`public-styles.css não pode carregar stylesheet administrativo: ${forbidden}`)

const main=await read('src/main.tsx')
if(!main.includes('<React.StrictMode><HashRouter><App/></HashRouter></React.StrictMode>'))failures.push('main.tsx deve montar App dentro do HashRouter.')

const internalApp=await read('src/app/InternalApp.tsx')
for(const required of ["from '../features/access/LoginPage'","from '../features/access/WorkspacePage'","from '../features/site-manager/SiteManagerRoutes'",'path="/app/login"','path="/app/workspaces"','path="/app/site/*"'])if(!internalApp.includes(required))failures.push(`InternalApp deve manter ${required}.`)
for(const forbidden of ['/app/crm','CrmRoutes','integrations'])if(internalApp.includes(forbidden))failures.push(`InternalApp não pode manter módulo removido: ${forbidden}`)

const workspacePage=await read('src/features/access/WorkspacePage.tsx')
if(!workspacePage.includes("to:'/app/site'"))failures.push('WorkspacePage deve manter o Gerenciador do Site.')
for(const forbidden of ["to:'/app/crm'",'CRM completo','Integrações'])if(workspacePage.includes(forbidden))failures.push(`WorkspacePage não pode manter módulo removido: ${forbidden}`)

const siteRoutes=await read('src/features/site-manager/SiteManagerRoutes.tsx')
if(!siteRoutes.includes('<Route index'))failures.push('SiteManagerRoutes deve declarar dashboard index.')
for(const required of ['path="home"','path="home/anuncio"','path="marca"','path="cabecalho"','path="noticias/anuncio"'])if(!siteRoutes.includes(required))failures.push(`SiteManagerRoutes deve manter ${required}.`)

const adminNavigation=await read('src/shared/internal/adminNavigation.ts')
for(const forbidden of ['CRM_NAV','/app/crm','Integrações','PlugZap'])if(adminNavigation.includes(forbidden))failures.push(`adminNavigation não pode manter módulo removido: ${forbidden}`)

const adminUi=await read('src/shared/internal/AdminUi.tsx')
for(const forbidden of ["'crm'",'/app/crm','isContactsRoute','contactsCreateLabel','app-shell-crm'])if(adminUi.includes(forbidden))failures.push(`AdminUi não pode manter comportamento CRM: ${forbidden}`)

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
