import {readFile} from 'node:fs/promises'

const root=new URL('../',import.meta.url)
const read=path=>readFile(new URL(path,root),'utf8')
const failures=[]

const foundations=await read('src/styles/admin-foundations.css')
for(const token of [
  '--ui-table-head-height:40px',
  '--ui-table-row-height:48px',
  '--ui-table-cell-block:0px',
  '--ui-table-cell-inline:12px',
  '--ui-table-selector-inline:0px',
  '--ui-table-selector-width:38px',
  '--ui-table-min-width:760px',
  '--ui-table-primary-min-width:220px',
  '--ui-table-action-width:64px',
  '--ui-badge-min-height:22px',
  '--ui-pagination-control:30px',
])if(!foundations.includes(token))failures.push(`Fundação TableView deve preservar ${token}.`)

const table=await read('src/styles/admin-table-system.css')
for(const token of [
  'table:not(.tableview-freeform)',
  'min-width:var(--ui-table-min-width)',
  'height:var(--ui-table-head-height)!important',
  'height:var(--ui-table-row-height)!important',
  'padding-block:var(--ui-table-cell-block)!important',
  'padding-inline:var(--ui-table-cell-inline)!important',
  'vertical-align:middle!important',
  'font-size:var(--ui-type-label)!important',
  'font-size:var(--ui-type-body)!important',
  'font-size:var(--ui-type-micro)!important',
  'width:var(--ui-table-selector-width)!important',
  'min-width:var(--ui-table-primary-min-width)',
  'width:var(--ui-table-action-width)!important',
  'font-variant-numeric:tabular-nums!important',
  'text-align:left!important',
  'text-align:center!important',
  'justify-content:flex-start!important',
  'min-height:var(--ui-badge-min-height)!important',
  ':has(.table-row-actions-trigger) th:last-child',
  'td:has(.table-row-actions-trigger)',
  '.tableview-page-size select',
  'height:var(--ui-pagination-control)!important',
  'min-height:var(--ui-pagination-control)!important',
  '.accounting-result-table',
  '.crm-table-card',
  '.finance-table-card',
  '.contracts-table-card',
  '.rh-table-card',
  '.marketing-table-card',
])if(!table.includes(token))failures.push(`Contrato TableView universal deve preservar: ${token}.`)

if(!/\.app-shell \.workspace-main table:not\(\.tableview-freeform\)\s*\{/.test(table))failures.push('TableView canônico deve aplicar geometria diretamente a todo table do workspace administrativo.')
if(!/table:not\(\.tableview-freeform\) :is\(th,td\)\s*\{[^}]*padding-block:var\(--ui-table-cell-block\)!important;[^}]*padding-inline:var\(--ui-table-cell-inline\)!important;[^}]*text-align:left!important;/s.test(table))failures.push('Todas as células administrativas devem consumir o mesmo padding e o eixo esquerdo base.')
if(!/table:not\(\.tableview-freeform\) th\s*\{[^}]*height:var\(--ui-table-head-height\)!important;[^}]*text-align:left!important;/s.test(table))failures.push('Headers administrativos devem usar altura canônica e alinhamento base à esquerda.')
if(!/table:not\(\.tableview-freeform\) td\s*\{[^}]*height:var\(--ui-table-row-height\)!important;[^}]*text-align:left!important;/s.test(table))failures.push('Rows administrativas devem usar altura canônica e alinhamento base à esquerda.')

if(!/:is\(th,td\):has\(input\[type='checkbox'\]\),[\s\S]*\.check\)\s*\{[^}]*width:var\(--ui-table-selector-width\)!important;[^}]*text-align:center!important;/s.test(table))failures.push('Coluna seletora deve preservar largura canônica e centralizar o checkbox no rail estreito.')
if(!/input\[type='checkbox'\]\s*\{[^}]*margin:0 auto!important;/s.test(table))failures.push('Checkbox de TableView deve permanecer centralizado horizontalmente com margem automática.')

if(!/:is\(\s*\.numeric,[\s\S]*\.accounting-number-col\s*\)\s*\{[^}]*font-variant-numeric:tabular-nums!important;[^}]*text-align:left!important;/s.test(table))failures.push('Colunas numéricas devem preservar numerais tabulares sem abandonar o eixo esquerdo universal.')
if(!/:is\(\.status-col,\.state-col,\.center,\.actions-center\)\{text-align:left!important\}/s.test(table))failures.push('Status e aliases legados de centralização devem ser normalizados para a esquerda.')

if(!/:is\(\s*th\.actions-col,td\.actions,[\s\S]*\.crm-actions-cell\s*\)\{[^}]*width:var\(--ui-table-action-width\)!important;[^}]*text-align:left!important;/s.test(table))failures.push('Coluna de ações deve preservar seu rail canônico e alinhar à esquerda.')
if(!/table:not\(\.tableview-freeform\):has\(\.table-row-actions-trigger\) th:last-child,[\s\S]*td:has\(\.table-row-actions-trigger\)\{[^}]*width:var\(--ui-table-action-width\)!important;[^}]*text-align:left!important;/s.test(table))failures.push('TableViews com menu canônico devem inferir o mesmo rail de ações alinhado à esquerda mesmo quando markup legado esquece a classe actions.')
if(!/\.table-row-actions\s*\{[^}]*justify-content:flex-start!important;[^}]*margin-left:0!important;[^}]*margin-right:auto!important;/s.test(table))failures.push('Menu de ações por linha deve começar no eixo esquerdo da célula.')

if(!/table:not\(\.tableview-freeform\) \.crm-sort-header\s*\{[^}]*justify-content:flex-start!important;/s.test(table))failures.push('Todos os sort headers devem compartilhar o eixo esquerdo de seus valores.')
if(!/th:is\([\s\S]*\.accounting-number-col[\s\S]*\) \.crm-sort-header\{justify-content:flex-start!important\}/s.test(table))failures.push('Sort header numérico deve permanecer à esquerda, igual ao valor numérico.')

if(!/\/\* Final alignment lock:[\s\S]*table:not\(\.tableview-freeform\) :is\(th,td\)\{text-align:left!important\}/s.test(table))failures.push('TableView deve encerrar com um lock canônico de alinhamento à esquerda para colunas de dados.')
if(!/table:not\(\.tableview-freeform\) :is\(th,td\):has\(input\[type='checkbox'\]\),[\s\S]*\.check\)\{text-align:center!important\}/s.test(table))failures.push('Lock final deve preservar a exceção centralizada do rail de seleção.')

/* Reject the old mixed-axis policy specifically. Compact controls such as badge text,
   the selector checkbox and the tiny sort-arrow button may center internally; data columns may not. */
if(/table:not\(\.tableview-freeform\) th\s*\{[^}]*text-align:(?:center|right)!important;/s.test(table))failures.push('Header base de TableView não pode voltar a alinhar ao centro ou à direita.')
if(/table:not\(\.tableview-freeform\) td\s*\{[^}]*text-align:(?:center|right)!important;/s.test(table))failures.push('Célula base de TableView não pode voltar a alinhar ao centro ou à direita.')
if(/:is\(\.status-col,\.state-col,\.center,\.actions-center\)\{text-align:(?:center|right)!important\}/s.test(table))failures.push('Aliases de status/center não podem quebrar o eixo esquerdo universal.')
if(/\.crm-sort-header\s*\{[^}]*justify-content:(?:center|flex-end)!important;/s.test(table))failures.push('Sort header não pode voltar ao eixo central ou direito.')

if(!/\.tableview-page-size select\s*\{[^}]*height:var\(--ui-pagination-control\)!important;[^}]*min-height:var\(--ui-pagination-control\)!important;/s.test(table))failures.push('Seletor de page-size deve permanecer com a mesma altura dos botões de paginação na camada canônica tardia.')

const entry=await read('src/styles/admin-entry.css')
const designImport="@import './admin-design-system.css';"
const tableImport="@import './admin-table-system.css';"
const accessibilityImport="@import './admin-accessibility.css';"
const designIndex=entry.indexOf(designImport)
const tableIndex=entry.indexOf(tableImport)
const accessibilityIndex=entry.indexOf(accessibilityImport)
if(!(designIndex>=0&&tableIndex>designIndex&&accessibilityIndex>tableIndex))failures.push('admin-table-system.css deve permanecer na cauda canônica, depois do design system e antes de accessibility.')
const afterTable=entry.slice(tableIndex+tableImport.length).trim().split(/\r?\n/).filter(Boolean)
if(afterTable.some(line=>line!==accessibilityImport))failures.push('Nenhuma folha visual de domínio pode ser importada depois do TableView canônico; apenas accessibility pode vir depois.')
if(entry.includes("@import './admin-finance-accounting.css';"))failures.push('Contabilidade não pode manter camada paralela de densidade após o TableView canônico.')

const accessibility=await read('src/styles/admin-accessibility.css')
if(/\.table-card\s+(?:th|td)\s*\{[^}]*(?:padding|height|font-size|text-align|vertical-align)\s*:/s.test(accessibility))failures.push('A camada de acessibilidade não pode redefinir geometria ou alinhamento de TableView após o contrato canônico.')

for(const token of [
  '.finance-page .finance-table :is(',
  '.numeric,.tabular,.money,.currency,.amount,.percent,.percentage,.positive,.negative,.accounting-number-col',
  'td.actions,td.actions-col,.actions,.crm-actions-cell',
])if(!table.includes(token))failures.push(`Financeiro precisa preservar override canônico tardio contra legado específico: ${token}.`)
if(!/\.finance-page \.finance-table :is\([\s\S]*\.accounting-number-col[\s\S]*\)\{text-align:left!important;font-variant-numeric:tabular-nums!important\}/s.test(table))failures.push('Financeiro deve ser explicitamente normalizado ao eixo esquerdo mesmo diante do CSS legado de maior especificidade.')

const financeAccounting=await read('src/modules/finance/FinanceAccountingPage.tsx')
const financeStyles=await read('src/styles/admin-finance.css')
for(const token of [
  '<colgroup>',
  'className="accounting-category-col"',
  'className="numeric accounting-number-col"',
  'className="numeric positive accounting-number-col"',
  'className="numeric negative accounting-number-col"',
])if(!financeAccounting.includes(token))failures.push(`Contabilidade deve preservar contrato semântico de coluna: ${token}.`)
if(financeAccounting.includes('tableHeaderStyle')||financeAccounting.includes('tableCellStyle'))failures.push('Contabilidade não pode sobrescrever geometria de TableView com estilos inline locais.')
for(const rule of [
  '.accounting-result-table{table-layout:fixed}',
  '.accounting-result-table col.accounting-category-col{width:36%}',
  '.accounting-result-table col.accounting-number-col{width:16%}',
])if(!financeStyles.includes(rule))failures.push(`Contabilidade deve preservar apenas largura semântica no CSS do domínio: ${rule}.`)

if(failures.length){
  console.error('TableView invariants failed:')
  failures.forEach(item=>console.error(`- ${item}`))
  process.exit(1)
}

console.log('TableView contract OK — colunas de dados à esquerda e checkboxes centralizados no rail seletor; header 40px, row 48px e padding 12px em todo admin.')
