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
])if(!foundations.includes(token))failures.push(`Fundação KPI deve preservar ${token}.`)

const standard=await read('src/styles/admin-kpi-standard.css')
for(const selector of [
  '.admin-kpi',
  '.crm-kpi',
  '.contracts-kpi',
  '.finance-kpi',
  '.rh-kpi',
  '.marketing-kpi',
  '.dashboard-stat-card',
  '.marketing-metric-strip>article',
  '.settings-user-kpis>article',
])if(!standard.includes(selector))failures.push(`Contrato KPI não cobre ${selector}.`)

for(const rule of [
  'width:100%!important',
  'min-width:0!important',
  'height:var(--ui-kpi-height)!important',
  'min-height:var(--ui-kpi-height)!important',
  'padding:var(--ui-kpi-padding)!important',
  'box-sizing:border-box!important',
])if(!standard.includes(rule))failures.push(`Geometria KPI canônica ausente: ${rule}.`)

if(standard.includes('height:auto'))failures.push('KPI não pode voltar a usar altura automática; a geometria deve permanecer determinística.')

if(failures.length){
  console.error('KPI geometry invariants failed:')
  failures.forEach(item=>console.error(`- ${item}`))
  process.exit(1)
}

console.log('KPI geometry OK — 104px de altura, largura integral da célula e padding de 16px compartilhados.')
