import {access,readdir,readFile} from 'node:fs/promises'
import {constants} from 'node:fs'
import {extname,join,relative,resolve} from 'node:path'

const srcRoot=resolve(process.cwd(),'src')
const e2eRoot=resolve(process.cwd(),'e2e')
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
  '/app/editorial',
  'EditorialAdminPage',
]
const removedPaths=[
  'modules/access/WorkspacePage.tsx',
  'modules/access/CrmWorkspace.tsx',
  'modules/access/mocks/index.ts',
  'styles/admin-workspaces.css',
  'modules/editorial/EditorialAdminPage.tsx',
  'modules/editorial/components/EditorialAdmin.tsx',
]

async function exists(path){
  try{await access(path,constants.F_OK);return true}catch{return false}
}

async function walk(dir){
  const files=[]
  if(!(await exists(dir)))return files
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=join(dir,entry.name)
    if(entry.isDirectory())files.push(...await walk(path))
    else if(['.ts','.tsx','.css'].includes(extname(entry.name)))files.push(path)
  }
  return files
}

for(const path of removedPaths)if(await exists(join(srcRoot,path)))failures.push(`Arquivo legado voltou a existir: src/${path}`)
for(const [root,label] of [[srcRoot,'src'],[e2eRoot,'e2e']]){
  for(const path of await walk(root)){
    const source=await readFile(path,'utf8')
    const rel=relative(root,path).replaceAll('\\','/')
    for(const token of forbiddenTokens)if(source.includes(token))failures.push(`${label}/${rel} reintroduziu arquitetura administrativa removida: ${token}`)
  }
}

if(failures.length){
  console.error('Falha na arquitetura administrativa unificada:')
  failures.forEach(item=>console.error(`- ${item}`))
  process.exit(1)
}
console.log('Unified admin architecture OK — módulos administrativos duplicados permanecem removidos')
