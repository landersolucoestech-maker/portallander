import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {extname,posix} from 'node:path'

const ROOT=process.cwd()
const OUT_DIR=posix.join('artifacts','engineering-audit')
const textExtensions=new Set(['.js','.mjs','.cjs','.ts','.tsx','.jsx','.json','.md','.yml','.yaml','.sql','.css','.scss','.html','.txt','.d.ts'])
const assetExtensions=new Set(['.png','.jpg','.jpeg','.gif','.webp','.svg','.ico','.woff','.woff2','.ttf','.otf','.pdf'])

const tracked=execFileSync('git',['ls-files','-z'],{cwd:ROOT,encoding:'utf8'}).split('\0').filter(Boolean).sort()
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim()
const branch=execFileSync('git',['branch','--show-current'],{cwd:ROOT,encoding:'utf8'}).trim()

function classify(path){
  const lower=path.toLowerCase()
  const ext=extname(lower)
  if(lower.startsWith('.github/workflows/'))return ['workflow','CI']
  if(lower.includes('/migrations/')&&ext==='.sql')return ['migration','SQL']
  if(lower.includes('/e2e/')||/\.e2e\.[^.]+$/.test(lower))return ['E2E','test']
  if(/\.(test|spec)\.[^.]+$/.test(lower))return ['test']
  if(lower.includes('/scripts/')||lower.startsWith('scripts/'))return ['script','tooling']
  if(lower.endsWith('readme.md')||lower.includes('/docs/')||lower.startsWith('docs/'))return ['documentation']
  if(lower.endsWith('.env.example'))return ['environment-template','configuration']
  if(lower.endsWith('package.json')||lower.includes('tsconfig')||lower.includes('eslint')||lower.includes('vite.config')||lower.includes('playwright.config')||lower.endsWith('.gitignore'))return ['configuration']
  if(ext==='.css'||ext==='.scss')return ['asset','style']
  if(assetExtensions.has(ext))return ['asset']
  if(ext==='.html')return ['page','asset']
  if(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.d.ts'].includes(ext)){
    const kinds=['source']
    if(lower.includes('/pages/')||/page\.(tsx|ts|jsx|js)$/.test(lower))kinds.push('page')
    if(lower.includes('/components/')||/component\.(tsx|ts|jsx|js)$/.test(lower))kinds.push('component')
    if(lower.includes('/hooks/')||/hook\.(tsx|ts|jsx|js)$/.test(lower))kinds.push('hook')
    if(lower.includes('provider'))kinds.push('provider')
    if(lower.includes('service'))kinds.push('service')
    if(lower.includes('repository'))kinds.push('repository')
    if(lower.includes('validator')||lower.includes('schema'))kinds.push('validator')
    return kinds
  }
  if(ext==='.json'||ext==='.yaml'||ext==='.yml'||ext==='.txt'||ext==='.md'||ext==='.sql')return ['configuration']
  return []
}

function conceptTags(path,source=''){
  const haystack=`${path}\n${source}`.toLowerCase()
  const tags=[]
  const concepts={
    agent:['agent','subagent','supervisor'],
    skill:['skill registry','skill_invocation','skill invocation'],
    automation:['automation','workflow engine','scheduler','cron'],
    policy:['policy engine','permission','approval'],
    evidence:['evidence','audit ledger','run ledger','agent_runs','agent run'],
    event:['integration_events','event bus','outbox','dead letter','queue','worker'],
    mock:['mockdataprovider','src/mocks','mock provider'],
  }
  for(const [tag,needles] of Object.entries(concepts))if(needles.some(needle=>haystack.includes(needle)))tags.push(tag)
  return tags
}

const artifacts=[]
const unaccounted=[]
const duplicateCandidates=new Map()
for(const path of tracked){
  const categories=classify(path)
  if(categories.length===0)unaccounted.push(path)
  const buffer=await readFile(path)
  const hash=createHash('sha256').update(buffer).digest('hex')
  const ext=extname(path.toLowerCase())
  const source=textExtensions.has(ext)||path.endsWith('package.json')||path.endsWith('.gitignore')?buffer.toString('utf8'):''
  const lines=source?source.split(/\r?\n/).length:null
  artifacts.push({path,categories,sha256:hash,bytes:buffer.length,lines,concepts:conceptTags(path,source)})
  const key=`${hash}:${buffer.length}`
  if(!duplicateCandidates.has(key))duplicateCandidates.set(key,[])
  duplicateCandidates.get(key).push(path)
}

const duplicates=[...duplicateCandidates.values()].filter(paths=>paths.length>1&&paths.every(path=>!path.endsWith('package.json')))
const lockfiles=tracked.filter(path=>['package-lock.json','pnpm-lock.yaml','yarn.lock'].includes(path))
const packageFiles=tracked.filter(path=>path.endsWith('package.json'))
const unpinned=[]
for(const path of packageFiles){
  const pkg=JSON.parse(await readFile(path,'utf8'))
  for(const section of ['dependencies','devDependencies','optionalDependencies']){
    for(const [name,version] of Object.entries(pkg[section]||{}))if(version==='latest'||version==='*')unpinned.push({path,section,name,version})
  }
}

const conceptInventory={}
for(const artifact of artifacts)for(const concept of artifact.concepts)(conceptInventory[concept]??=[]).push(artifact.path)

const summary={
  repository:'landersolucoestech-maker/portallander',
  branch,
  head,
  generatedAt:new Date().toISOString(),
  TOTAL_ARTIFACTS:tracked.length,
  CLASSIFIED_ARTIFACTS:tracked.length-unaccounted.length,
  REVIEWED_ARTIFACTS:null,
  MACHINE_ANALYZED_ARTIFACTS:tracked.length,
  RUNTIME_VALIDATED_ARTIFACTS:0,
  BLOCKED_ARTIFACTS:0,
  EXCLUDED_WITH_JUSTIFICATION:0,
  UNACCOUNTED_ARTIFACTS:unaccounted.length,
  lockfiles,
  unpinnedDependencies:unpinned,
  duplicateGroups:duplicates.length,
  conceptCounts:Object.fromEntries(Object.entries(conceptInventory).map(([key,value])=>[key,value.length])),
}

await mkdir(OUT_DIR,{recursive:true})
await writeFile(posix.join(OUT_DIR,'census.json'),JSON.stringify({summary,artifacts,unaccounted,duplicates,conceptInventory},null,2))
await writeFile(posix.join(OUT_DIR,'summary.json'),JSON.stringify(summary,null,2))
console.log(JSON.stringify(summary,null,2))
if(unaccounted.length){
  console.error('UNACCOUNTED_ARTIFACTS:',unaccounted)
  process.exitCode=2
}
