import {readFile} from 'node:fs/promises'

const root=new URL('../',import.meta.url)
const read=path=>readFile(new URL(path,root),'utf8')
const failures=[]

const foundations=await read('src/styles/admin-foundations.css')
for(const token of [
  '--ui-kpi-height:104px',
  '--ui-kpi-min-height:var(--ui-kpi-height)',
  '--ui-kpi-padding:16px',
  '--ui-kpi-gap:16px',
  '--ui-kpi-icon:34px',
])if(!foundations.includes(token))failures.push(`Fundação KPI deve preservar ${token}.`)

const standard=await read('src/styles/admin-kpi-standard.css')
for(const selector of [
  '.admin-kpi',
  '.crm-kpi',
  '.contracts-kpi',
  '.finance-kpi',
  '.rh-kpi',
  '.marketing-kpi',
  '.dashboard-kpi-card',
  '.dashboard-kpi-grid',
  '.dashboard-kpi-icon',
  '.dashboard-stat-card',
  '.marketing-metric-strip>article',
  '.settings-user-kpis>article',
  '.settings-public-stats>div',
])if(!standard.includes(selector))failures.push(`Contrato KPI não cobre ${selector}.`)

for(const rule of [
  'width:100%!important',
  'min-width:0!important',
  'height:var(--ui-kpi-height)!important',
  'min-height:var(--ui-kpi-height)!important',
  'padding:var(--ui-kpi-padding)!important',
  'box-sizing:border-box!important',
  'font-size:10px!important',
  'font-size:24px!important',
  'width:var(--ui-kpi-icon)!important',
  'height:var(--ui-kpi-icon)!important',
  'font-variant-numeric:tabular-nums',
])if(!standard.includes(rule))failures.push(`Contrato KPI canônico ausente: ${rule}.`)

for(const selector of [
  '.crm-kpi>div>span',
  '.contracts-kpi>div>span',
  '.finance-kpi>div>span',
  '.rh-kpi small',
  '.marketing-kpi span:not(.marketing-kpi-icon)',
  '.dashboard-kpi-card [data-dashboard-kpi-label]',
  '.crm-kpi>div>strong',
  '.contracts-kpi>div>strong',
  '.finance-kpi>div>strong',
  '.rh-kpi strong',
  '.marketing-kpi strong',
  '.dashboard-kpi-card .dashboard-kpi-value-line>strong',
  '.dashboard-kpi-card .dashboard-kpi-copy>small',
  '.crm-kpi>i',
  '.contracts-kpi>i',
  '.finance-kpi>i',
  '.rh-kpi>span:first-child',
  '.marketing-kpi-icon',
  '.dashboard-kpi-icon',
])if(!standard.includes(selector))failures.push(`Hierarquia visual KPI não cobre ${selector}.`)

for(const rule of [
  '.dashboard-kpi-card .dashboard-kpi-icon{order:2!important}',
  '.dashboard-kpi-card .dashboard-kpi-copy{order:1!important}',
  'display:flex!important',
  'justify-content:space-between!important',
])if(!standard.includes(rule))failures.push(`Dashboard deve consumir a mesma composição visual dos KPIs canônicos: ${rule}.`)

if(standard.includes('height:auto'))failures.push('KPI não pode voltar a usar altura automática; a geometria deve permanecer determinística.')

const dashboard=await read('src/styles/admin-dashboard-unified.css')
for(const forbidden of [
  '.dashboard-kpi-card{height:96px!important',
  '.dashboard-kpi-card{height:92px!important',
  '.dashboard-kpi-card{height:90px!important',
  '.dashboard-kpi-card{padding:12px!important',
  '.dashboard-kpi-icon{width:40px!important',
  '.dashboard-kpi-icon{height:40px!important',
])if(dashboard.includes(forbidden))failures.push(`Dashboard não pode vencer o contrato KPI canônico com geometria paralela: ${forbidden}.`)

const dashboardPage=await read('src/modules/dashboard/DashboardPage.tsx')
for(const token of [
  'className="dashboard-kpi-grid"',
  'className="dashboard-kpi-card"',
  'className="dashboard-kpi-icon"',
  'data-dashboard-kpi-label',
  'className="dashboard-kpi-value-line"',
  'className="dashboard-kpi-copy"',
])if(!dashboardPage.includes(token))failures.push(`Dashboard deve preservar markup compatível com KPI canônico: ${token}.`)

const contractsPatch=await read('src/styles/admin-contracts-kpis-row.css')
for(const forbidden of ['gap:8px','min-height:92px','padding:12px','font-size:21px','width:30px','height:30px','flex:0 0 30px']){
  if(contractsPatch.includes(forbidden))failures.push(`Patch de Contratos não pode sobrescrever apresentação KPI canônica: ${forbidden}.`)
}
if(!contractsPatch.includes('grid-template-columns:repeat(7,minmax(0,1fr))!important'))failures.push('Contratos deve preservar sua composição semântica de sete KPIs no desktop.')

if(failures.length){
  console.error('KPI geometry/presentation invariants failed:')
  failures.forEach(item=>console.error(`- ${item}`))
  process.exit(1)
}

console.log('KPI contract OK — Dashboard e demais módulos usam 104px, padding/gap 16px, ícone 34px e hierarquia 10/24/10 sob o mesmo contrato visual.')
