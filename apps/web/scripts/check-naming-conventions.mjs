import {existsSync,readFileSync,readdirSync,statSync} from 'node:fs'
import {join,relative,resolve,sep} from 'node:path'
const root=resolve(process.cwd(),'../..')
const forbiddenPaths=['apps/web/src/modules/rh','apps/api/src/rhService.js','apps/api/src/rhHttp.js','apps/web/scripts/check-rh-boundaries.mjs','apps/web/src/pages/anuncie','apps/web/src/pages/colabore','apps/web/src/pages/contato','apps/web/src/pages/sobre','apps/api/scripts/verify-rh-runtime.mjs']
const violations=[]
for(const path of forbiddenPaths)if(existsSync(join(root,path)))violations.push(`legacy technical path: ${path}`)
const ignored=new Set(['.git','node_modules','dist','test-results','coverage','migrations','.github'])
// Enforce universal English at executable technical boundaries. Localized public/admin route slugs,
// persisted CMS section ids and visible pt-BR copy are product contracts and are intentionally allowed.
// Legacy RH CSS selectors remain a presentation-compatibility contract until their atomic stylesheet migration.
const patterns=[
 /\bRhSeed\b/,/\brhService\b/,/\brhHttp\b/,/\bhandleRhRequest\b/,/\brhAdminClient\b/,/\bRhAdminClientError\b/,/\brhRepository\b/,/\buseRh(?:Runtime|State)\b/,/\binstallRhMarketingTableSorting\b/,
 /\/api\/rh(?:\/|['"`])/
]
function walk(dir){for(const name of readdirSync(dir)){if(ignored.has(name)||name==='check-naming-conventions.mjs')continue;const absolute=join(dir,name),stats=statSync(absolute);if(stats.isDirectory()){walk(absolute);continue}if(!/\.(?:[cm]?[jt]sx?|json|ya?ml|css)$/i.test(name))continue;const text=readFileSync(absolute,'utf8');text.split(/\r?\n/).forEach((line,index)=>{if(patterns.some(pattern=>pattern.test(line)))violations.push(`${relative(root,absolute).split(sep).join('/')}:${index+1}`)})}}
walk(root)
if(violations.length){console.error('Technical English naming violations:');violations.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Technical English naming gate passed.')
