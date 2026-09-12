import {access,readFile,readdir} from 'node:fs/promises'
import {constants} from 'node:fs'
import {extname,join} from 'node:path'

const root=new URL('../',import.meta.url)
const read=path=>readFile(new URL(path,root),'utf8')
const exists=async path=>{try{await access(new URL(path,root),constants.F_OK);return true}catch{return false}}
const failures=[]
const warnings=[]
const importsOf=source=>source.match(/@import\s+['"][^'"]+['"];?/g)??[]
const assertCascadeTail=(source,expected,message)=>{
 const imports=importsOf(source)
 const tail=imports.slice(-expected.length)
 if(tail.length!==expected.length||tail.some((value,index)=>value!==expected[index]))failures.push(message)
 for(const item of expected)if(imports.filter(value=>value===item).length!==1)failures.push(`Camada de cascade deve aparecer exatamente uma vez: ${item}`)
}

const adminEntry=await read('src/styles/admin-entry.css')
assertCascadeTail(adminEntry,["@import './admin-design-system.css';","@import './admin-layout-system.css';","@import './admin-component-system.css';","@import './admin-table-system.css';","@import './admin-accessibility.css';"],'Cascade administrativa deve terminar em admin-design-system.css → admin-layout-system.css → admin-component-system.css → admin-table-system.css → admin-accessibility.css; nenhuma folha de módulo pode sobrescrever o contrato canônico.')
if(!adminEntry.includes("@import './admin-access-system.css';"))failures.push('Páginas de acesso devem carregar o baseline tipográfico/interacional interno.')
for(const forbidden of ['admin-table-alignment.css','admin-settings-pruning.css','admin-finance-accounting.css'])if(adminEntry.includes(forbidden))failures.push(`Cascade administrativa não pode depender da camada paralela: ${forbidden}`)
for(const path of ['src/styles/admin-foundations.css','src/styles/admin-design-system.css','src/styles/admin-layout-system.css','src/styles/admin-component-system.css','src/styles/admin-table-system.css','src/styles/admin-access-system.css','src/styles/admin-accessibility.css'])if(!(await exists(path)))failures.push(`Design system interno exige ${path}.`)

const publicStyles=await read('src/styles/public-styles.css')
assertCascadeTail(publicStyles,["@import './public-layout-system.css';","@import './public-corrections.css';"],'Cascade pública deve terminar em public-layout-system.css → public-corrections.css; nenhuma folha arbitrária pode vir depois da camada final de correções/a11y.')
for(const path of ['src/styles/public-layout-system.css','src/styles/public-corrections.css'])if(!(await exists(path)))failures.push(`Baseline público exige ${path}.`)

const indexHtml=await read('index.html')
for(const font of ['Bebas+Neue','Montserrat'])if(!indexHtml.includes(font))failures.push(`Fonte carregada obrigatória ausente: ${font}.`)
if(indexHtml.includes('.news-reference-page .pl-page-hero'))failures.push('Layout visual da página de notícias não pode permanecer hardcoded em index.html.')

const adminFoundations=await read('src/styles/admin-foundations.css')
for(const required of [
 "--ui-font:'Montserrat'",
 '--ui-type-micro:10px','--ui-type-label:11px','--ui-type-body:12px','--ui-type-control:12px','--ui-type-card-title:13px','--ui-type-section-title:16px','--ui-type-dialog-title:18px','--ui-type-kpi-value:24px',
 '--ui-control-sm:32px','--ui-control-md:36px','--ui-page-gap:24px','--ui-card-padding:16px','--ui-card-header-min-height:60px','--ui-filter-padding:8px','--ui-filter-gap:8px',
 '--ui-table-head-height:40px','--ui-table-row-height:48px','--ui-table-cell-inline:12px','--ui-pagination-min-height:48px',
])if(!adminFoundations.includes(required))failures.push(`Fundações administrativas devem preservar: ${required}`)

const adminDesign=await read('src/styles/admin-design-system.css')
for(const required of [
 'min-height:100dvh','prefers-reduced-motion','workspace-primary-action{display:inline-flex',
 'Controls and forms: one height, one type scale, one horizontal rhythm.',
 'Filter/tool bars share the same container padding and spacing.',
 'Tabs: same height, padding and text hierarchy across modules.',
 'KPI family: one geometry and hierarchy',
 'Pagination: one footer rhythm across every TableView.',
 'Modals: one header/body/footer spacing and readable type scale.',
 'font-size:var(--ui-type-control)!important','font-size:var(--ui-type-micro)!important','padding:var(--ui-filter-padding)!important',
])if(!adminDesign.includes(required))failures.push(`Design system administrativo deve preservar: ${required}`)
if(/font-size:\s*[0-9](?:\.\d+)?px/.test(adminDesign))failures.push('admin-design-system.css não pode voltar a declarar escala tipográfica numérica local; use tokens --ui-type-* (exceto controles gráficos sem texto).')

const adminComponents=await read('src/styles/admin-component-system.css')
for(const required of [
 'canonical administrative component system',
 '--ui-dialog-backdrop:',
 '--ui-dialog-max-height:',
 'Shared surfaces',
 'Buttons and action groups',
 'Forms and fields',
 'Modal system',
 'Menus, popovers and dropdown surfaces',
 "[role='presentation']:has(>[role='dialog'])",
 "[role='dialog'].section-editor-card",
 '.section-editor-workbench',
 '.site-pages-management',
 'height:var(--ui-control-md)!important',
 'padding:var(--ui-card-padding)!important',
 'border-radius:var(--ui-radius-lg)!important',
])if(!adminComponents.includes(required))failures.push(`Sistema canônico de componentes deve preservar: ${required}`)

const adminTable=await read('src/styles/admin-table-system.css')
for(const required of ['height:var(--ui-table-head-height)!important','height:var(--ui-table-row-height)!important','padding-inline:var(--ui-table-cell-inline)!important','font-size:var(--ui-type-label)!important','font-size:var(--ui-type-body)!important','font-size:var(--ui-type-micro)!important','accounting-number-col'])if(!adminTable.includes(required))failures.push(`TableView canônica deve preservar: ${required}`)

const accessDesign=await read('src/styles/admin-access-system.css')
for(const required of ["font-family:'Montserrat'",'min-height:100dvh','focus-visible','prefers-reduced-motion'])if(!accessDesign.includes(required))failures.push(`Baseline de acesso deve preservar: ${required}`)

const settings=await read('src/modules/settings/SettingsPage.tsx')
for(const forbidden of ["['cadastro-publico'","['billing'",'<PublicRegistration','<Billing ','Acesso externo',"item.status==='available'"])if(settings.includes(forbidden))failures.push(`Configurações reintroduziu UI removida: ${forbidden}`)
for(const required of ["['empresa'","['automacoes'","['seguranca'","['integracoes'","['usuarios'",'role="tablist"','useModalA11y'])if(!settings.includes(required))failures.push(`Configurações deve preservar: ${required}`)
const settingsDomain=await read('src/modules/settings/domain.ts')
for(const forbidden of ['cadastro-publico','billing','SettingsPlan','SettingsBilling','SettingsInvoice','publicRegistration'])if(settingsDomain.includes(forbidden))failures.push(`Contratos de Settings reintroduziram estrutura comercial removida: ${forbidden}`)
const mockupRuntime=await read('../../packages/mockup/src/generated/runtimeData.ts')
const settingsStart=mockupRuntime.indexOf('"mockSettingsSeed"')
const settingsEnd=mockupRuntime.indexOf('"mockSocialChannels"',settingsStart)
if(settingsStart<0||settingsEnd<0)failures.push('Mockup canônico deve preservar mockSettingsSeed antes de mockSocialChannels.')
const settingsMock=settingsStart>=0&&settingsEnd>settingsStart?mockupRuntime.slice(settingsStart,settingsEnd):''
for(const forbidden of ['plans:','billing:','publicRegistration:','ONErpm','DistroKid','Symphonic','SoundOn','MusicPro','SomVibe','ECAD','ABRAMUS','UBC'])if(settingsMock.includes(forbidden))failures.push(`Mock canônico de Settings reintroduziu dado removido: ${forbidden}`)

const adminUi=await read('src/shared/internal/AdminUi.tsx')
for(const required of ['to="/app/settings"','<span>Configurações</span>','aria-label="Abrir menu da conta"'])if(!adminUi.includes(required))failures.push(`Account Menu deve preservar: ${required}`)
const rowMenu=await read('src/shared/internal/TableRowActionMenu.tsx')
for(const required of ['Visualizar','Editar','Excluir','role="menu"','role="menuitem"','ArrowDown','ArrowUp'])if(!rowMenu.includes(required))failures.push(`Menu de ações compartilhado deve preservar: ${required}`)
const sortHeader=await read('src/shared/internal/TableSortHeader.tsx')
for(const required of ['TableSortHeader','TableSortState','aria-pressed','crm-sort-header'])if(!sortHeader.includes(required))failures.push(`Cabeçalho de ordenação compartilhado deve preservar: ${required}`)
const canonicalSortConsumers=['src/modules/crm/CrmPage.tsx','src/modules/finance/FinanceMainPage.tsx','src/modules/finance/FinanceInvoicesPage.tsx','src/modules/finance/FinanceRegistryPage.tsx','src/modules/contracts/ContractsPage.tsx','src/modules/contracts/components/TemplatesPanel.tsx']
for(const path of canonicalSortConsumers){const source=await read(path);if(!source.includes('TableSortHeader'))failures.push(`${path}: tabela ordenável deve reutilizar TableSortHeader.`)}
const tableSortEnhancer=await read('src/shared/internal/tableSortEnhancer.ts')
if(!tableSortEnhancer.includes('.rh-page .rh-table'))failures.push('Ordenação compartilhada deve alcançar as tabelas reais de RH (.rh-page .rh-table).')
if(tableSortEnhancer.includes('.hr-page .hr-table'))failures.push('Ordenação compartilhada não pode depender do seletor legado inexistente .hr-page .hr-table.')

const reports=await read('src/modules/reports/ReportsPage.tsx')
const marketingUi=await read('src/modules/marketing/MarketingUi.tsx')
for(const [name,source] of [['Relatórios',reports],['Marketing',marketingUi]])for(const required of ['useModalA11y','role="dialog"','aria-modal="true"'])if(!source.includes(required))failures.push(`${name}: modal deve usar ${required}.`)
if(!marketingUi.includes('TableRowActionMenu'))failures.push('Marketing deve reutilizar o menu de ações compartilhado.')
if(marketingUi.includes('label="registro"')||!marketingUi.includes('label={label}'))failures.push('Marketing deve encaminhar o rótulo semântico de cada registro ao menu de ações compartilhado.')

const siteRoutes=await read('src/modules/site-manager/SiteManagerRoutes.tsx')
for(const required of ['LegacyPageSectionRedirect','path="paginas/:pageId/secoes/:sectionId"','/app/site/pages/${encodeURIComponent(pageId)}/sections/${encodeURIComponent(sectionId)}'])if(!siteRoutes.includes(required))failures.push(`Navegação de Páginas deve preservar compatibilidade e resolver para a rota canônica: ${required}`)

const visualAudit=await read('e2e/visual.audit.ts')
for(const required of ['/app/login','/app/profile','/app/chat/settings','/app/finance/rules','/app/finance/categories','/app/site/midia-kit','desktop-large','tablet','mobile','modal viewport integrity'])if(!visualAudit.includes(required))failures.push(`Auditoria visual deve cobrir: ${required}`)

async function walk(path){
 const entries=await readdir(new URL(path,root),{withFileTypes:true})
 const files=[]
 for(const entry of entries){const next=join(path,entry.name);if(entry.isDirectory()){if(!['node_modules','dist','test-results'].includes(entry.name))files.push(...await walk(next))}else files.push(next)}
 return files
}
const sourceFiles=(await walk('src')).filter(path=>['.tsx','.ts','.css'].includes(extname(path)))
for(const path of sourceFiles){
 const source=await read(path)
 if(source.includes('crm-row-actions')||source.includes('crm-row-menu'))failures.push(`${path}: implementação legada de ações por linha detectada; use TableRowActionMenu.`)
 if(path.startsWith('src/modules/')&&/function\s+\w*SortHeader\s*\(/.test(source))failures.push(`${path}: implementação local de cabeçalho de ordenação detectada; use TableSortHeader.`)
 if(source.includes('style={{')&&!path.endsWith('shared/public/PublicChrome.tsx'))warnings.push(`${path}: estilo inline detectado; manter somente se for valor realmente dinâmico.`)
 if(path.endsWith('.css')){
   const tiny=[...source.matchAll(/font-size:\s*([0-9](?:\.\d+)?)px/g)].filter(match=>Number(match[1])<10).length
   if(tiny)warnings.push(`${path}: ${tiny} declaração(ões) tipográfica(s) legadas abaixo de 10px; a camada canônica deve prevalecer e a origem deve ser removida quando o módulo for tocado.`)
 }
}

if(warnings.length){console.log('UI audit warnings:');warnings.forEach(item=>console.log(`- ${item}`))}
if(failures.length){console.error('UI system invariants failed:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log(`UI system invariants OK (${sourceFiles.length} arquivos inspecionados, ${warnings.length} avisos legados não bloqueantes; tipografia/controles/cards/KPIs/TableViews/tabs/filtros/paginação/modais/componentes centralizados).`)
