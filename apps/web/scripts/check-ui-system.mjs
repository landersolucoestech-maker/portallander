import {access,readFile,readdir} from 'node:fs/promises'
import {constants} from 'node:fs'
import {extname,join} from 'node:path'

const root=new URL('../',import.meta.url)
const read=path=>readFile(new URL(path,root),'utf8')
const exists=async path=>{try{await access(new URL(path,root),constants.F_OK);return true}catch{return false}}
const failures=[]
const warnings=[]

const adminEntry=await read('src/styles/admin-entry.css')
if(!adminEntry.trim().endsWith("@import './admin-design-system.css';"))failures.push('admin-design-system.css deve ser a última camada visual administrativa.')
if(!adminEntry.includes("@import './admin-access-system.css';"))failures.push('Páginas de acesso devem carregar o baseline tipográfico/interacional interno.')
if(adminEntry.includes('admin-table-alignment.css'))failures.push('A camada global de alinhamento de tabelas não pode voltar; alinhamento deve ser semântico.')
if(adminEntry.includes('admin-settings-pruning.css'))failures.push('Configurações não pode depender de pruning por CSS para esconder funcionalidades.')
for(const path of ['src/styles/admin-design-system.css','src/styles/admin-access-system.css'])if(!(await exists(path)))failures.push(`Design system interno exige ${path}.`)

const publicStyles=await read('src/styles/public-styles.css')
if(!publicStyles.trim().endsWith("@import './public-layout-system.css';"))failures.push('public-layout-system.css deve ser a última camada de layout público.')
if(!(await exists('src/styles/public-layout-system.css')))failures.push('Baseline público de viewport/responsividade é obrigatório.')

const indexHtml=await read('index.html')
for(const font of ['Bebas+Neue','Montserrat'])if(!indexHtml.includes(font))failures.push(`Fonte carregada obrigatória ausente: ${font}.`)
if(indexHtml.includes('.news-reference-page'))failures.push('Layout visual da página de notícias não pode permanecer hardcoded em index.html.')
const adminDesign=await read('src/styles/admin-design-system.css')
for(const required of ["--ui-font:'Montserrat'",'min-height:100dvh','--ui-control-sm:32px','--ui-control-md:36px','--ui-page-gap:24px','prefers-reduced-motion','workspace-primary-action{display:inline-flex'])if(!adminDesign.includes(required))failures.push(`Design system administrativo deve preservar: ${required}`)
const accessDesign=await read('src/styles/admin-access-system.css')
for(const required of ["font-family:'Montserrat'",'min-height:100dvh','focus-visible','prefers-reduced-motion'])if(!accessDesign.includes(required))failures.push(`Baseline de acesso deve preservar: ${required}`)

const settings=await read('src/features/settings/SettingsPage.tsx')
for(const forbidden of ["['cadastro-publico'","['billing'",'<PublicRegistration','<Billing ','Acesso externo',"item.status==='available'"])if(settings.includes(forbidden))failures.push(`Configurações reintroduziu UI removida: ${forbidden}`)
for(const required of ["['empresa'","['automacoes'","['seguranca'","['integracoes'","['usuarios'",'role="tablist"','useModalA11y'])if(!settings.includes(required))failures.push(`Configurações deve preservar: ${required}`)
const settingsDomain=await read('src/features/settings/domain.ts')
for(const forbidden of ['cadastro-publico','billing','SettingsPlan','SettingsBilling','SettingsInvoice','publicRegistration'])if(settingsDomain.includes(forbidden))failures.push(`Contratos de Settings reintroduziram estrutura comercial removida: ${forbidden}`)
const settingsMock=await read('src/mocks/settings/index.ts')
for(const forbidden of ['plans:','billing:','publicRegistration:','ONErpm','DistroKid','Symphonic','SoundOn','MusicPro','SomVibe','ECAD','ABRAMUS','UBC'])if(settingsMock.includes(forbidden))failures.push(`Mock de Settings reintroduziu dado removido: ${forbidden}`)

const adminUi=await read('src/shared/internal/AdminUi.tsx')
for(const required of ['to="/app/settings"','<span>Configurações</span>','aria-label="Abrir menu da conta"'])if(!adminUi.includes(required))failures.push(`Account Menu deve preservar: ${required}`)
const rowMenu=await read('src/shared/internal/TableRowActionMenu.tsx')
for(const required of ['Visualizar','Editar','Excluir','role="menu"','role="menuitem"','ArrowDown','ArrowUp'])if(!rowMenu.includes(required))failures.push(`Menu de ações compartilhado deve preservar: ${required}`)

const reports=await read('src/features/reports/ReportsPage.tsx')
const marketingUi=await read('src/features/marketing/MarketingUi.tsx')
for(const [name,source] of [['Relatórios',reports],['Marketing',marketingUi]])for(const required of ['useModalA11y','role="dialog"','aria-modal="true"'])if(!source.includes(required))failures.push(`${name}: modal deve usar ${required}.`)
if(!marketingUi.includes('TableRowActionMenu'))failures.push('Marketing deve reutilizar o menu de ações compartilhado.')

const visualAudit=await read('e2e/visual.audit.ts')
for(const required of ['/app/login','/app/workspaces','/app/profile','/app/chat/settings','/app/finance/rules','/app/finance/categories','/app/site/midia-kit','desktop-large','tablet','mobile','modal viewport integrity'])if(!visualAudit.includes(required))failures.push(`Auditoria visual deve cobrir: ${required}`)

async function walk(path){
 const entries=await readdir(new URL(path,root),{withFileTypes:true})
 const files=[]
 for(const entry of entries){const next=join(path,entry.name);if(entry.isDirectory()){if(!['node_modules','dist','test-results'].includes(entry.name))files.push(...await walk(next))}else files.push(next)}
 return files
}
const sourceFiles=(await walk('src')).filter(path=>['.tsx','.ts','.css'].includes(extname(path)))
for(const path of sourceFiles){
 const source=await read(path)
 if(source.includes('style={{')&&!path.endsWith('shared/public/PublicChrome.tsx'))warnings.push(`${path}: estilo inline detectado; manter somente se for valor realmente dinâmico.`)
 if(path.endsWith('.css')){
   const tiny=[...source.matchAll(/font-size:\s*([0-7](?:\.\d+)?)px/g)].length
   if(tiny)warnings.push(`${path}: ${tiny} declaração(ões) tipográfica(s) abaixo de 8px; revisar como exceção de alta densidade.`)
 }
}

if(warnings.length){console.log('UI audit warnings:');warnings.forEach(item=>console.log(`- ${item}`))}
if(failures.length){console.error('UI system invariants failed:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log(`UI system invariants OK (${sourceFiles.length} arquivos inspecionados, ${warnings.length} avisos não bloqueantes).`)
