import {access,readdir,readFile} from 'node:fs/promises'
import {constants} from 'node:fs'
import {extname,join,relative,resolve} from 'node:path'

const root=resolve(process.cwd(),'src')
const failures=[]
const forbiddenTokens=[
  'CRM_WORKSPACE_NAV',
  'WorkspaceDescriptor',
  'mockWorkspaces',
  '/app/workspaces',
  'WorkspacePage',
  'CrmWorkspace',
  'workspace-selection',
  'admin-workspaces.css',
]
const removedPaths=[
  'features/access/WorkspacePage.tsx',
  'features/access/CrmWorkspace.tsx',
  'features/access/mocks/index.ts',
  'styles/admin-workspaces.css',
]

async function exists(path){
  try{await access(join(root,path),constants.F_OK);return true}catch{return false}
}

async function walk(dir){
  const files=[]
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=join(dir,entry.name)
    if(entry.isDirectory())files.push(...await walk(path))
    else if(['.ts','.tsx','.css'].includes(extname(entry.name)))files.push(path)
  }
  return files
}

for(const path of removedPaths)if(await exists(path))failures.push(`Arquivo legado voltou a existir: src/${path}`)
for(const path of await walk(root)){
  const source=await readFile(path,'utf8')
  const rel=relative(root,path).replaceAll('\\','/')
  for(const token of forbiddenTokens)if(source.includes(token))failures.push(`${rel} reintroduziu arquitetura de múltiplos workspaces: ${token}`)
}

if(failures.length){
  console.error('Falha na arquitetura administrativa unificada:')
  failures.forEach(item=>console.error(`- ${item}`))
  process.exit(1)
}
console.log('Unified admin architecture OK — nenhum resíduo de múltiplos workspaces')
