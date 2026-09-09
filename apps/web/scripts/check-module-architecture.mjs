import {existsSync,readFileSync,readdirSync,statSync} from 'node:fs'
import {join,relative,resolve,sep} from 'node:path'

const repositoryRoot=resolve(process.cwd(),'../..')
const ignoredDirectories=new Set(['.git','node_modules','dist','test-results','coverage'])
const textExtensions=/\.(?:[cm]?[jt]sx?|json|md|ya?ml|css|html)$/i
const legacySegment=['fea','tures'].join('')
const legacyRoot=join(repositoryRoot,'apps','web','src',legacySegment)
const violations=[]
const legacyPathPattern=new RegExp(`(?:^|[/'\"\x60])${legacySegment}/`)
const srcLegacyPathPattern=new RegExp(`src/${legacySegment}`)

if(existsSync(legacyRoot)){
  console.error('Legacy domain directory still exists. Domain code must live under apps/web/src/modules.')
  process.exit(1)
}

function walk(directory){
  for(const name of readdirSync(directory)){
    if(ignoredDirectories.has(name))continue
    const absolute=join(directory,name)
    const stats=statSync(absolute)
    if(stats.isDirectory()){walk(absolute);continue}
    if(!textExtensions.test(name))continue
    const content=readFileSync(absolute,'utf8')
    const lines=content.split(/\r?\n/)
    lines.forEach((line,index)=>{
      if(legacyPathPattern.test(line)||srcLegacyPathPattern.test(line)){
        violations.push(`${relative(repositoryRoot,absolute).split(sep).join('/')}:${index+1}: ${line.trim()}`)
      }
    })
  }
}

walk(repositoryRoot)
if(violations.length){
  console.error('Legacy module-path references remain.')
  for(const violation of violations)console.error(`- ${violation}`)
  process.exit(1)
}
console.log('Module architecture OK — apps/web/src/modules is the single canonical domain tree.')
