import {readFile} from 'node:fs/promises'

const root=new URL('../',import.meta.url)
const read=path=>readFile(new URL(path,root),'utf8')
const failures=[]

const foundations=await read('src/styles/admin-foundations.css')
for(const token of [
  '--ui-table-row-height:52px',
  '--ui-table-cell-block:0px',
  '--ui-table-cell-inline:10px',
  '--ui-table-selector-inline:0px',
  '--ui-table-selector-width:38px',
  '--ui-table-min-width:760px',
  '--ui-table-primary-min-width:220px',
  '--ui-badge-min-height:22px',
])if(!foundations.includes(token))failures.push(`Fundação TableView deve preservar ${token}.`)

const table=await read('src/styles/admin-table-system.css')
for(const selector of [
  '.crm-table',
  '.finance-table',
  '.contracts-table',
  '.rh-table',
  '.marketing-table',
  '.settings-table-wrap table',
  '.crm-table-card',
  '.finance-table-card',
  '.contracts-table-card',
  '.rh-table-card',
  '.marketing-table-card',
  '.contracts-checkbox-cell',
  '.numeric',
  '.tabular',
  '.actions-col',
  '.crm-badge',
  '.contracts-status',
  '.finance-status',
  '.rh-status',
  '.marketing-status',
])if(!table.includes(selector))failures.push(`Contrato TableView não cobre ${selector}.`)

for(const rule of [
  'height:var(--ui-table-row-height)!important',
  'padding-block:var(--ui-table-cell-block)!important',
  'padding-inline:var(--ui-table-cell-inline)!important',
  'font-size:11px!important',
  'font-size:12px!important',
  'font-size:10px!important',
  'width:var(--ui-table-selector-width)!important',
  'text-align:center!important',
  'font-variant-numeric:tabular-nums',
  'text-align:right!important',
  'min-height:var(--ui-badge-min-height)!important',
])if(!table.includes(rule))failures.push(`Regra TableView canônica ausente: ${rule}.`)

const entry=await read('src/styles/admin-entry.css')
const designIndex=entry.indexOf("@import './admin-design-system.css';")
const tableIndex=entry.indexOf("@import './admin-table-system.css';")
const accessibilityIndex=entry.indexOf("@import './admin-accessibility.css';")
if(!(designIndex>=0&&tableIndex>designIndex&&accessibilityIndex>tableIndex))failures.push('admin-table-system.css deve permanecer na cauda canônica, depois do design system e antes de accessibility.')

const financeMain=await read('src/modules/finance/FinanceMainPage.tsx')
const financeInvoices=await read('src/modules/finance/FinanceInvoicesPage.tsx')
for(const [path,source] of [['FinanceMainPage.tsx',financeMain],['FinanceInvoicesPage.tsx',financeInvoices]]){
  if(!source.includes('checkboxCellStyle={width:44'))continue
  if(!table.includes("input[type='checkbox']"))failures.push(`${path}: checkbox inline legado exige override canônico no table system.`)
}

if(failures.length){
  console.error('TableView invariants failed:')
  failures.forEach(item=>console.error(`- ${item}`))
  process.exit(1)
}

console.log('TableView contract OK — headers 11px, cells 12px, secondary text/badges 10px, rows 52px, selector 38px e ações/números alinhados semanticamente.')
