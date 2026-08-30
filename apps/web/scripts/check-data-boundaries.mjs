import {readdir,readFile,stat} from 'node:fs/promises'
import {extname,join,relative,resolve} from 'node:path'

const root=resolve(process.cwd(),'src')
const failures=[]

async function walk(dir){
 const entries=await readdir(dir)
 const files=[]
 for(const name of entries){
  const path=join(dir,name)
  const info=await stat(path)
  if(info.isDirectory())files.push(...await walk(path))
  else files.push(path)
 }
 return files
}

const files=await walk(root)
const sourceFiles=files.filter(path=>['.ts','.tsx'].includes(extname(path)))
const visualFiles=sourceFiles.filter(path=>path.endsWith('.tsx')&&relative(root,path)!=='main.tsx'&&!relative(root,path).startsWith('mocks/'))

for(const path of visualFiles){
 const source=await readFile(path,'utf8')
 const rel=relative(root,path)
 if(/from\s+['"][^'"]*\/mocks(?:\/|['"])/.test(source)||/from\s+['"]\.\/mocks['"]/.test(source))failures.push(`${rel} não pode importar mocks brutos.`)
 if(source.includes('/shared/data/mockDataProvider')||source.includes("from '../../shared/data/mockDataProvider'")||source.includes("from '../shared/data/mockDataProvider'"))failures.push(`${rel} não pode depender diretamente do MockDataProvider.`)
}

for(const rel of ['features/crm/repository.ts','features/contracts/repository.ts','features/finance/repository.ts','features/editorial/repository.ts']){
 const source=await readFile(join(root,rel),'utf8')
 if(!source.includes('getRuntimeDataProvider'))failures.push(`${rel} deve obter seeds/leitura pelo runtime provider.`)
 if(/from\s+['"]\.\/mocks['"]/.test(source))failures.push(`${rel} não pode importar mocks locais da feature.`)
}

const main=await readFile(join(root,'main.tsx'),'utf8')
if(!main.includes('setRuntimeDataProvider(mockDataProvider)'))failures.push('main.tsx deve registrar explicitamente o provider de runtime atual.')

const provider=await readFile(join(root,'shared/data/mockDataProvider.ts'),'utf8')
if(!provider.includes("from '../../mocks'"))failures.push('Somente o MockDataProvider deve agregar a raiz global de mocks.')

if(failures.length){
 console.error('Falha nos boundaries de dados:')
 failures.forEach(item=>console.error(`- ${item}`))
 process.exit(1)
}
console.log('Data provider boundaries OK')
