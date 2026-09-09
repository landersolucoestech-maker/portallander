import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {SYSTEM_FORM_CANONICAL_COUNT,SYSTEM_FORM_KEYS} from '../packages/shared/systemFormCatalog.js'

assert.equal(SYSTEM_FORM_CANONICAL_COUNT,2,'Canonical system form count must stay at two.')
assert.deepEqual([...SYSTEM_FORM_KEYS].sort(),['collaborate','lead-capture'])

const legacyReferences=[
  'Captação de Leads',
  'Captacao de Leads',
  'captacao-leads',
  'captacao_leads',
  'Contato Comercial · Anuncie',
  'Contato Comercial - Anuncie',
  'advertising-inquiry',
  'anuncie-contato',
]

const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean)
const findings=[]

function classification(path){
  if(/^apps\/api\/migrations\/(005_seed_system_forms|021_advertising_inquiry_form|030_canonical_system_forms)\.sql$/.test(path))return 'MIGRATION HISTORY'
  if(/^packages\/shared\/systemFormCatalog\.(js|d\.ts)$/.test(path))return 'LEGACY ALIAS'
  if(/(?:\.test\.|\.audit\.|forms-runtime-proof\.mjs$)/.test(path))return 'HISTORICAL TEST'
  if(/^\.github\/workflows\/(deploy-pages|engineering-dev-validation)\.yml$/.test(path))return 'HISTORICAL TEST'
  if(path==='scripts/check-canonical-forms.mjs')return 'DOCUMENTED COMPATIBILITY'
  return 'BUG/RESIDUE'
}

for(const path of tracked){
  let content
  try{content=readFileSync(path,'utf8')}catch{continue}
  for(const reference of legacyReferences){
    if(!content.includes(reference))continue
    findings.push({path,reference,classification:classification(path)})
  }
}

const unjustified=findings.filter(item=>item.classification==='BUG/RESIDUE')
if(unjustified.length){
  console.error('UNJUSTIFIED LEGACY REFERENCES')
  for(const item of unjustified)console.error(`${item.path} :: ${item.reference}`)
  process.exitCode=1
}

const adminSource=readFileSync('apps/web/src/modules/site-manager/pages/SiteFormsPage.tsx','utf8')
const forbiddenUiPatterns=[
  [/\.slice\(0\s*,\s*2\)/,'slice(0,2)'],
  [/forms\.filter\([^\n]*(?:name|slug|id)/,'name/id based forms.filter'],
  [/display\s*:\s*none[^\n]*(?:form|row)/i,'display:none row suppression'],
  [/hardcoded[^\n]*count[^\n]*2/i,'hardcoded count'],
]
for(const [pattern,label] of forbiddenUiPatterns){
  if(pattern.test(adminSource))throw new Error(`Forbidden Forms UI masking detected: ${label}`)
}

console.log(`CANONICAL SYSTEM FORMS = ${SYSTEM_FORM_CANONICAL_COUNT}`)
console.log(`CANONICAL KEYS = ${SYSTEM_FORM_KEYS.join(', ')}`)
for(const item of findings)console.log(`${item.classification} | ${item.path} | ${item.reference}`)
console.log(`UNJUSTIFIED LEGACY REFERENCES = ${unjustified.length}`)
console.log('UI FILTER HACK = NO')
console.log('HARDCODED COUNT = NO')
console.log('THIRD ROW HIDDEN = NO')
