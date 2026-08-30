import {readdirSync,readFileSync,statSync} from 'node:fs'
import {join,relative} from 'node:path'
import {describe,expect,it} from 'vitest'

const srcRoot=join(process.cwd(),'src')
const walk=(dir:string):string[]=>readdirSync(dir).flatMap(name=>{const path=join(dir,name);return statSync(path).isDirectory()?walk(path):[path]})
const sourceFiles=walk(srcRoot).filter(path=>/\.(ts|tsx)$/.test(path)&&!path.includes(`${join('src','mocks')}`))

describe('application data boundary',()=>{
 it('prevents visual components from importing raw mocks',()=>{
  const violations=sourceFiles.filter(path=>path.endsWith('.tsx')).filter(path=>{const source=readFileSync(path,'utf8');return /from\s+['"][^'"]*\/mocks(?:\/|['"])/.test(source)||/from\s+['"]\.\/mocks['"]/.test(source)})
  expect(violations.map(path=>relative(srcRoot,path))).toEqual([])
 })
 it('routes core repositories through the runtime provider',()=>{
  for(const file of ['features/crm/repository.ts','features/contracts/repository.ts','features/editorial/repository.ts','features/finance/repository.ts']){
   const source=readFileSync(join(srcRoot,file),'utf8')
   expect(source,`${file} must use getRuntimeDataProvider`).toContain('getRuntimeDataProvider')
   expect(source,`${file} cannot import local feature mocks`).not.toMatch(/from\s+['"]\.\/mocks['"]/)
  }
 })
 it('keeps raw global mocks isolated behind the mock provider',()=>{
  const provider=readFileSync(join(srcRoot,'shared/data/mockDataProvider.ts'),'utf8')
  expect(provider).toContain("from '../../mocks'")
  const runtime=readFileSync(join(srcRoot,'shared/data/runtimeDataProvider.ts'),'utf8')
  expect(runtime).toContain('ApplicationDataProvider')
 })
})
