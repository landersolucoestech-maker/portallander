import {readFile} from 'node:fs/promises'

const root=new URL('../',import.meta.url)
const read=path=>readFile(new URL(path,root),'utf8')
const failures=[]

const preview=await read('src/modules/contracts/components/ContractA4Preview.tsx')
const safeHtml=await read('src/modules/contracts/components/SafeContractHtml.tsx')
if(preview.includes('dangerouslySetInnerHTML'))failures.push('ContractA4Preview não pode injetar HTML bruto no DOM.')
if(!preview.includes('<SafeContractHtml'))failures.push('ContractA4Preview deve usar o renderer HTML allowlisted.')
if(safeHtml.includes('dangerouslySetInnerHTML'))failures.push('SafeContractHtml não pode reintroduzir dangerouslySetInnerHTML.')
for(const required of ['BLOCKED_TAGS','safeUrl','DOMParser','noopener noreferrer'])if(!safeHtml.includes(required))failures.push(`SafeContractHtml deve preservar o boundary: ${required}`)

const siteSections=await read('src/modules/site-manager/pages/SiteSectionsPage.tsx')
if(siteSections.includes('/app/site/paginas/'))failures.push('SiteSectionsPage não pode produzir links técnicos legados em português.')
if(!siteSections.includes('/app/site/pages/${encodeURIComponent(selected.id)}/sections/${encodeURIComponent(section.id)}'))failures.push('SiteSectionsPage deve produzir a rota técnica canônica de configuração de seção.')

const adminUi=await read('src/shared/internal/AdminUi.tsx')
if(adminUi.includes('/app/metricas'))failures.push('AdminUi não pode depender da rota técnica legada /app/metricas.')

const visualAudit=await read('e2e/visual.audit.ts')
for(const forbidden of ['/app/site/midia-kit','/app/site/formularios','/app/marketing/campanhas','/app/marketing/calendario','/app/marketing/tarefas','/app/marketing/ia-criativa'])if(visualAudit.includes(forbidden))failures.push(`visual.audit.ts não pode cobrir rota técnica obsoleta: ${forbidden}`)
for(const required of ['/app/site/media-kit','/app/site/forms','/app/marketing/campaigns','/app/marketing/calendar','/app/marketing/tasks','/app/marketing/creative-ai'])if(!visualAudit.includes(required))failures.push(`visual.audit.ts deve cobrir rota técnica canônica: ${required}`)

const metricsWorkflow=await read('../../.github/workflows/metrics-runtime.yml')
if(metricsWorkflow.includes("goto('#/app/site/midia-kit')"))failures.push('Metrics runtime workflow não pode navegar pela rota técnica legada de Mídia Kit.')
if(!metricsWorkflow.includes("goto('#/app/site/media-kit')"))failures.push('Metrics runtime workflow deve validar a rota canônica de Mídia Kit publicada.')
if(!metricsWorkflow.includes("goto('#/app/metrics')"))failures.push('Metrics runtime workflow deve validar a rota canônica global de Métricas publicada.')

if(failures.length){console.error('Security/canonical-route boundaries failed:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Security/canonical-route boundaries OK — contract preview is allowlisted and technical navigation is canonical across app, E2E and workflow proofs.')
