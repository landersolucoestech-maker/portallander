import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'

const read = path => readFile(new URL(`../${path}`, import.meta.url),'utf8')
const failures=[]

const publicStyles=await read('src/styles/public-styles.css')
if(/admin-(system|workspaces|entry|header|dashboard|brand|responsive|accessibility|hero)/.test(publicStyles)){
  failures.push('public-styles.css não pode importar folhas administrativas.')
}

const globalStyles=await read('src/styles/styles.css')
for(const selector of ['.app-shell{','.sidebar{','.workspace-top{','.admin-kpi-grid{']){
  if(globalStyles.includes(selector))failures.push(`styles.css contém seletor administrativo legado: ${selector}`)
}

const portalApp=await read('src/app/PortalApp.tsx')
if(portalApp.includes('LegacyApp'))failures.push('PortalApp não pode depender de LegacyApp.')
if(!portalApp.includes("import InternalApp from './InternalApp'"))failures.push('PortalApp deve rotear a área interna por InternalApp.')

try{
  await access(new URL('../src/app/LegacyApp.tsx',import.meta.url),constants.F_OK)
  failures.push('src/app/LegacyApp.tsx deve permanecer removido.')
}catch{}

const adminEntry=await read('src/styles/admin-entry.css')
for(const required of ['admin-system.css','admin-workspaces.css','admin-brand.css','admin-responsive.css','admin-accessibility.css']){
  if(!adminEntry.includes(required))failures.push(`admin-entry.css deve carregar ${required}.`)
}

if(failures.length){
  console.error('Falha nos boundaries da área interna:')
  failures.forEach(item=>console.error(`- ${item}`))
  process.exit(1)
}

console.log('Internal boundaries OK')
