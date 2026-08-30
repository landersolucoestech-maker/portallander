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
const relPath=path=>relative(root,path).replaceAll('\\','/')
const visualFiles=sourceFiles.filter(path=>path.endsWith('.tsx')&&relPath(path)!=='main.tsx'&&!relPath(path).startsWith('mocks/'))

for(const path of visualFiles){
 const source=await readFile(path,'utf8')
 const rel=relPath(path)
 if(/from\s+['"][^'"]*\/mocks(?:\/|['"])/.test(source)||/from\s+['"]\.\/mocks['"]/.test(source))failures.push(`${rel} não pode importar mocks brutos.`)
 if(source.includes('/shared/data/mockDataProvider')||source.includes("from '../../shared/data/mockDataProvider'")||source.includes("from '../shared/data/mockDataProvider'"))failures.push(`${rel} não pode depender diretamente do MockDataProvider.`)
}

const featureMockFacades=[
 'features/access/mocks/index.ts',
 'features/crm/mocks/index.ts',
 'features/contracts/mocks/index.ts',
 'features/finance/mocks/index.ts',
 'features/dashboard/mocks/index.ts',
 'features/editorial/mocks/index.ts',
 'features/site-manager/mocks/index.ts',
]
for(const rel of featureMockFacades){
 const source=await readFile(join(root,rel),'utf8')
 if(!source.includes("from '../../../mocks'"))failures.push(`${rel} deve ser apenas fachada da raiz global src/mocks.`)
 if(/createdAt\s*:|updatedAt\s*:|id\s*:\s*['"][^'"]+['"]/.test(source))failures.push(`${rel} não pode voltar a declarar registros mock locais.`)
}

const allowedRawMockConsumers=new Set(['shared/data/mockDataProvider.ts',...featureMockFacades])
const demoRecordPatterns=[
 /Cliente Exemplo/i,
 /Fornecedor Exemplo/i,
 /Cliente Corporativo/i,
 /Agência Parceira/i,
 /lead_mock_/i,
 /contact_mock_/i,
 /interaction_mock_/i,
 /timeline_mock_/i,
 /['"](?:tx|nf|rule)-\d+['"]/i,
 /@example\.com/i,
]
for(const path of sourceFiles){
 const rel=relPath(path)
 if(rel.startsWith('mocks/')||rel.endsWith('.test.ts')||rel.endsWith('.test.tsx')||allowedRawMockConsumers.has(rel))continue
 const source=await readFile(path,'utf8')
 if(/from\s+['"][^'"]*\/mocks(?:\/|['"])/.test(source)||/from\s+['"]\.\/mocks['"]/.test(source))failures.push(`${rel} não pode consumir mocks diretamente; use provider/repository/read model.`)
 if(demoRecordPatterns.some(pattern=>pattern.test(source)))failures.push(`${rel} contém registro demonstrativo fora da fonte canônica src/mocks.`)
}

for(const rel of ['features/crm/repository.ts','features/contracts/repository.ts','features/finance/repository.ts','features/editorial/repository.ts']){
 const source=await readFile(join(root,rel),'utf8')
 if(!source.includes('getRuntimeDataProvider'))failures.push(`${rel} deve obter seeds/leitura pelo runtime provider.`)
 if(/from\s+['"]\.\/mocks['"]/.test(source))failures.push(`${rel} não pode importar mocks locais da feature.`)
}

const main=await readFile(join(root,'main.tsx'),'utf8')
if(!main.includes('setRuntimeDataProvider(mockDataProvider)'))failures.push('main.tsx deve registrar explicitamente o provider de runtime atual.')

const provider=await readFile(join(root,'shared/data/mockDataProvider.ts'),'utf8')
if(!provider.includes("from '../../mocks'"))failures.push('Somente o MockDataProvider deve agregar a raiz global de mocks no runtime.')

if(failures.length){
 console.error('Falha nos boundaries de dados:')
 failures.forEach(item=>console.error(`- ${item}`))
 process.exit(1)
}
console.log('Data provider boundaries OK')
