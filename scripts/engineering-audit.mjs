import {execFileSync} from 'node:child_process'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {extname,posix} from 'node:path'

const OUT_DIR=posix.join('artifacts','engineering-audit')
const tracked=execFileSync('git',['ls-files'],{encoding:'utf8'}).trim().split('\n').filter(Boolean)
const textExtensions=new Set(['.js','.mjs','.cjs','.ts','.tsx','.jsx','.json','.md','.yml','.yaml','.sql','.css','.scss','.html','.txt'])
const sources=new Map()

for(const path of tracked){
  if(!textExtensions.has(extname(path.toLowerCase()))&&!path.endsWith('package.json')&&!path.endsWith('.gitignore'))continue
  try{sources.set(path,await readFile(path,'utf8'))}catch{}
}

const matches=[]
function scan(id,pattern,{include=()=>true,exclude=()=>false}={}){
  for(const [path,source] of sources){
    if(!include(path)||exclude(path))continue
    const lines=source.split(/\r?\n/)
    lines.forEach((line,index)=>{if(pattern.test(line))matches.push({rule:id,path,line:index+1})})
  }
}

scan('mock-reference',/mockDataProvider|src\/mocks|\/mocks(?:\/|['"])/i,{exclude:path=>path.includes('/mocks/')||path.endsWith('.test.ts')||path.endsWith('.test.tsx')})
scan('local-storage',/\blocalStorage\b/)
scan('session-storage',/\bsessionStorage\b/)
scan('todo-fixme',/\b(?:TODO|FIXME|HACK|XXX)\b/i)
scan('unsafe-html',/dangerouslySetInnerHTML/)
scan('dynamic-code',/\b(?:eval\s*\(|new\s+Function\s*\()/)
scan('api-route',/["'`]\/api\//)
scan('frontend-route',/\b(?:path|route)\s*[=:]\s*["'`]\//i)
scan('event-reference',/integration_events|event_type|webhook|queue|worker|dead.?letter|outbox/i)
scan('agent-reference',/\b(?:agent|subagent|supervisor|skill registry|approval engine|policy engine|agent_runs|skill_invocations)\b/i)
scan('rls-reference',/row level security|\bcreate\s+policy\b|\benable\s+row\s+level\s+security\b/i,{include:path=>path.endsWith('.sql')})
scan('legacy-admin-token',/PORTAL_ADMIN_TOKEN/)

const get=(path)=>sources.get(path)||''
const lineOf=(path,pattern)=>{
  const lines=get(path).split(/\r?\n/)
  const index=lines.findIndex(line=>pattern.test(line))
  return index>=0?index+1:null
}
const evidence=(path,pattern)=>({path,line:lineOf(path,pattern)})
const existing=(path)=>sources.has(path)
const lockfiles=tracked.filter(path=>['package-lock.json','pnpm-lock.yaml','yarn.lock'].includes(path))
const packagePaths=tracked.filter(path=>path.endsWith('package.json'))
const unpinned=[]
for(const path of packagePaths){
  let pkg
  try{pkg=JSON.parse(get(path))}catch{continue}
  for(const section of ['dependencies','devDependencies','optionalDependencies'])for(const [name,version] of Object.entries(pkg[section]||{}))if(version==='latest'||version==='*')unpinned.push({path,section,name,version})
}

const findings=[]
function finding(value){findings.push(value)}

const mainPath='apps/web/src/main.tsx'
const boundaryPath='apps/web/scripts/check-data-boundaries.mjs'
if(get(mainPath).includes('editorialBaseProvider:ApplicationDataProvider=mockDataProvider')&&get(boundaryPath).includes('preservar o MockDataProvider como fallback canônico do runtime')){
  finding({
    id:'PL-ENG-001',severity:'HIGH',confidence:'HIGH',domain:'frontend/data-boundary',status:'OPEN',classification:'EXISTS_BUT_BROKEN',disposition:'REFACTOR',
    title:'Production bootstrap preserves MockDataProvider as canonical fallback',
    evidence:[evidence(mainPath,/editorialBaseProvider:ApplicationDataProvider=mockDataProvider/),evidence(boundaryPath,/preservar o MockDataProvider como fallback canônico do runtime/)],
    rootCause:'The runtime bootstrap and its deterministic architecture check both encode mock data as the canonical fallback instead of restricting mocks to explicit development/demo execution.',
    blastRadius:['identity','notifications','crm','contracts','finance','editorial','home','agenda','chat','rh','marketing','reports','settings','advertising','branding','collaboration','dashboard'],
    recommendation:'Stabilize canonical backend sources per domain, then change the bootstrap and the existing data-boundary check together. Agentic write skills must remain disabled for mock-backed domains.'
  })
}

const authMigration='apps/api/migrations/009_admin_auth.sql',httpPath='apps/api/src/http.js'
if(/role\s+text[\s\S]*owner[\s\S]*admin[\s\S]*editor/.test(get(authMigration))&&existing(httpPath)&&!/(requireRole|requirePermission|authorizeRole|allowedRoles)/.test(get(httpPath))){
  finding({
    id:'PL-ENG-002',severity:'HIGH',confidence:'HIGH',domain:'backend/authorization',status:'OPEN',classification:'EXISTS_BUT_WEAK',disposition:'STRENGTHEN',
    title:'Administrative roles exist but route mutations are not governed by role/permission checks',
    evidence:[evidence(authMigration,/role\s+text/),evidence(httpPath,/export async function requireAdmin/)],
    rootCause:'Authentication and authorization are collapsed into a single requireAdmin gate; the stored owner/admin/editor role is not used to authorize individual operations.',
    blastRadius:['editorial mutations','media','media kit publish','forms administration','integration/provider administration and other admin handlers'],
    recommendation:'Introduce deterministic permission checks at backend boundaries and map roles to permissions. Keep frontend authorization non-authoritative.'
  })
}

if(lockfiles.length===0||unpinned.length){
  finding({
    id:'PL-ENG-003',severity:'HIGH',confidence:'HIGH',domain:'tooling/dependencies',status:'OPEN',classification:'EXISTS_BUT_WEAK',disposition:'FIX',
    title:'Dependency resolution is not reproducible',
    evidence:[...unpinned.slice(0,20).map(item=>({path:item.path,dependency:item.name,declared:item.version})),{lockfiles}],
    rootCause:'The repository has no tracked package-manager lockfile and frontend dependencies are declared with floating latest/* ranges.',
    blastRadius:['local development','CI','build reproducibility','security review','regression attribution'],
    recommendation:'Generate and commit one canonical npm lockfile, pin intentional dependency ranges, then use npm ci in CI.'
  })
}

const integrationMigration='apps/api/migrations/017_integration_events.sql'
const integrationRecoveryMigration='apps/api/migrations/020_integration_event_recovery.sql'
const integrationService='apps/api/src/integrationEventService.js'
const integrationRecoverySurface=`${get(integrationRecoveryMigration)}\n${get(integrationService)}`
const integrationRecoveryComplete=['processing_state','next_attempt_at','claim_expires_at','dead_letter','for update skip locked','requeueDeadLetter'].every(token=>integrationRecoverySurface.toLowerCase().includes(token.toLowerCase()))
if(existing(integrationMigration)&&existing(integrationService)&&!integrationRecoveryComplete){
  finding({
    id:'PL-ENG-004',severity:'MEDIUM',confidence:'HIGH',domain:'integrations/events',status:'OPEN',classification:'EXISTS_BUT_WEAK',disposition:'STRENGTHEN',
    title:'Integration event ledger has idempotency but no durable claim/retry/dead-letter state machine',
    evidence:[evidence(integrationMigration,/create table if not exists integration_events/),evidence(integrationService,/async markFailed/)],
    rootCause:'The existing ledger records delivery attempts and errors but does not fully model ownership/lease, retry scheduling, terminal dead-letter state, or safe reprocessing.',
    blastRadius:['webhooks','provider event processing','failure recovery','duplicate workers'],
    recommendation:'Evolve integration_events in place with a deterministic processing state machine; do not create a parallel event table unless a distinct domain requirement is proven.'
  })
}

const sharedPackage='packages/shared/package.json'
if(existing(sharedPackage)&&tracked.filter(path=>path.startsWith('packages/shared/')&&path!==sharedPackage).length===0){
  finding({
    id:'PL-ENG-005',severity:'INFO',confidence:'HIGH',domain:'shared-contracts',status:'OPEN',classification:'EXISTS_BUT_WEAK',disposition:'COMPLETE',
    title:'Shared package exists but contains no shared contracts yet',
    evidence:[{path:sharedPackage,line:1}],
    rootCause:'The workspace boundary was created but has not been populated.',
    blastRadius:['cross-layer contracts','future event/permission/agent protocols'],
    recommendation:'Use this package only for contracts proven to be shared by existing consumers; do not create speculative folders.'
  })
}

const agentPaths=matches.filter(item=>item.rule==='agent-reference'&&!item.path.startsWith('scripts/')).map(item=>item.path)
if(agentPaths.length===0){
  finding({
    id:'PL-ENG-006',severity:'INFO',confidence:'MEDIUM',domain:'agentic-runtime',status:'OPEN',classification:'MISSING',disposition:'COMPLETE',
    title:'No product/engineering agentic control plane detected in application code',
    evidence:[{machineScan:'agent-reference',applicationMatches:0}],
    rootCause:'No native agent/skill/policy/approval/run-ledger implementation is present in the application paths scanned.',
    blastRadius:['future governed automation only'],
    recommendation:'After P0 gates are stable, implement the smallest native deterministic governance kernel in the existing API architecture before adding domain agents.'
  })
}

const sqlPaths=tracked.filter(path=>path.endsWith('.sql'))
const rlsMatches=matches.filter(item=>item.rule==='rls-reference')
if(sqlPaths.length&&rlsMatches.length===0){
  finding({
    id:'PL-ENG-007',severity:'MEDIUM',confidence:'HIGH',domain:'database/security',status:'OPEN',classification:'BLOCKED',disposition:'AUDIT_REQUIRED',
    title:'No RLS/policy declarations detected in repository SQL',
    evidence:[{sqlArtifacts:sqlPaths.length,rlsDeclarations:0}],
    rootCause:'Repository migrations do not declare PostgreSQL row-level security or policies. Whether this is a vulnerability depends on the actual tenancy and database access model.',
    blastRadius:['database authorization','tenant isolation if multi-tenant'],
    recommendation:'Classify every table as tenant-scoped or not, then enable/test RLS where required. Do not claim tenant isolation from application checks alone.'
  })
}

const visualAuditPaths=tracked.filter(path=>path.startsWith('apps/web/e2e/')&&path.endsWith('.audit.ts'))
if(visualAuditPaths.length){
  const source=visualAuditPaths.map(path=>get(path)).join('\n')
  const requestedWidths=[320,375,390,414,768,1024,1280,1440,1920]
  const missingWidths=requestedWidths.filter(width=>!new RegExp(`width\\s*:\\s*${width}\\b`).test(source))
  if(missingWidths.length){
    finding({
      id:'PL-ENG-008',severity:'MEDIUM',confidence:'HIGH',domain:'frontend/visual-validation',status:'OPEN',classification:'EXISTS_BUT_WEAK',disposition:'STRENGTHEN',
      title:'Existing Playwright visual audit does not cover the full required breakpoint matrix',
      evidence:[{paths:visualAuditPaths,missingWidths}],
      rootCause:'The existing Playwright audit suite uses a useful but narrower viewport set than the audit contract requires.',
      blastRadius:['responsive regressions at uncovered widths'],
      recommendation:'Strengthen the existing Playwright suite with the missing breakpoints instead of creating a second visual framework.'
    })
  }
}

const accessibilityEvidence=[...sources.entries()].filter(([path,source])=>/axe-core|@axe-core|accessibility tree|aria snapshot|ariaSnapshot/i.test(source)&&!path.startsWith('scripts/'))
if(accessibilityEvidence.length===0){
  finding({
    id:'PL-ENG-009',severity:'MEDIUM',confidence:'MEDIUM',domain:'frontend/accessibility',status:'OPEN',classification:'MISSING',disposition:'COMPLETE',
    title:'No deterministic accessibility audit gate detected',
    evidence:[{machineScan:'accessibility-gate',applicationMatches:0}],
    rootCause:'Existing Playwright coverage validates layout/overflow and selected behavior, but no repository evidence was found for automated semantic/contrast/keyboard accessibility validation.',
    blastRadius:['keyboard users','screen-reader users','WCAG regressions'],
    recommendation:'Extend the existing Playwright-based validation with accessibility checks; only add a package if native project tooling cannot prove the required assertions.'
  })
}

const summary={
  generatedAt:new Date().toISOString(),
  trackedArtifacts:tracked.length,
  textArtifactsScanned:sources.size,
  matchCounts:Object.fromEntries([...new Set(matches.map(item=>item.rule))].sort().map(rule=>[rule,matches.filter(item=>item.rule===rule).length])),
  findingsBySeverity:Object.fromEntries(['BLOCKER','CRITICAL','HIGH','MEDIUM','LOW','INFO'].map(severity=>[severity,findings.filter(item=>item.severity===severity).length])),
  openBlockerCritical:findings.filter(item=>['BLOCKER','CRITICAL'].includes(item.severity)&&item.status==='OPEN').length,
}

await mkdir(OUT_DIR,{recursive:true})
await writeFile(posix.join(OUT_DIR,'findings.json'),JSON.stringify({summary,findings,matches},null,2))
await writeFile(posix.join(OUT_DIR,'findings-summary.json'),JSON.stringify(summary,null,2))
console.log(JSON.stringify(summary,null,2))