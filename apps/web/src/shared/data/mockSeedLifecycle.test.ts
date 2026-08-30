import {beforeEach,describe,expect,it} from 'vitest'
import {mockDataProvider} from './mockDataProvider'
import {prepareMockSeedStorage} from './mockSeedLifecycle'
import {setRuntimeDataProvider} from './runtimeDataProvider'

class MemoryStorage{
 private data=new Map<string,string>()
 get length(){return this.data.size}
 clear(){this.data.clear()}
 getItem(key:string){return this.data.get(key)??null}
 key(index:number){return Array.from(this.data.keys())[index]??null}
 removeItem(key:string){this.data.delete(key)}
 setItem(key:string,value:string){this.data.set(key,value)}
}

describe('mock seed lifecycle',()=>{
 beforeEach(()=>{
  Object.defineProperty(globalThis,'localStorage',{value:new MemoryStorage(),configurable:true})
  setRuntimeDataProvider(mockDataProvider)
  mockDataProvider.setScenario('success')
 })

 it('clears stale mutable module storage once and preserves later CRUD',()=>{
  localStorage.setItem('portal-lander:crm:v1','stale-crm')
  localStorage.setItem('portal-lander:contracts:v1','stale-contracts')
  localStorage.setItem('portal-lander:finance:transactions','stale-finance')
  expect(prepareMockSeedStorage()).toBe(true)
  expect(localStorage.getItem('portal-lander:crm:v1')).toBeNull()
  expect(localStorage.getItem('portal-lander:contracts:v1')).toBeNull()
  expect(localStorage.getItem('portal-lander:finance:transactions')).toBeNull()

  localStorage.setItem('portal-lander:crm:v1','local-crud-change')
  expect(prepareMockSeedStorage()).toBe(false)
  expect(localStorage.getItem('portal-lander:crm:v1')).toBe('local-crud-change')
 })
})
