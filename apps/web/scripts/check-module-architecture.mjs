import {readFileSync,readdirSync,statSync} from 'node:fs'
import {join,relative,resolve,sep} from 'node:path'

const repositoryRoot=resolve(process.cwd(),'../..')
const ignoredDirectories=new Set(['.git','node_modules','dist','test-results','coverage'])
const textExtensions=/\.(?:[cm]?[jt]sx?|json|md|ya?ml|css|html)$/i
const legacyRoot=join(repositoryRoot,'apps','web','src','features')
const targetRoot=join(repositoryRoot,'apps','web','src','modules')
const violations=[]

function walk(directory){
  for(const name of readdirSync(directory)){
    if(ignoredDirectories.has(name))continue
    const absolute=join(directory,name)
    const stats=statSync(absolute)
    if(stats.isDirectory()){
      if(absolute===legacyRoot||absolute===targetRoot)continue
      walk(absolute)
      continue
    }
    if(!textExtensions.test(name))continue
    const content=readFileSync(absolute,'utf8')
    const lines=content.split(/\r?\n/)
    lines.forEach((line,index)=>{
      if(/(?:^|[/'"`])features\//.test(line)||/src\/features/.test(line)){
        violations.push(`${relative(repositoryRoot,absolute).split(sep).join('/')}:${index+1}: ${line.trim()}`)
      }
    })
  }
}

walk(repositoryRoot)

if(violations.length){
  console.error('Legacy feature-path references remain. Domain code must live under apps/web/src/modules.')
  for(const violation of violations)console.error(`- ${violation}`)
  process.exit(1)
}

console.log('Module architecture OK — no references outside the migration roots point to src/features.')
