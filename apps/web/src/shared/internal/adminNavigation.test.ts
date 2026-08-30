import {describe,expect,it} from 'vitest'
import {CRM_WORKSPACE_NAV} from './adminNavigation'

describe('admin navigation',()=>{
 it('mantém apenas Dashboard e CRM no workspace administrativo ativo',()=>{
  expect(CRM_WORKSPACE_NAV.map(item=>[item[0],item[2]])).toEqual([
   ['Dashboard','/app/dashboard'],
   ['CRM','/app/crm'],
  ])
 })

 it('não expõe rotas internas ou módulos removidos na sidebar',()=>{
  const serialized=JSON.stringify(CRM_WORKSPACE_NAV)
  expect(serialized).not.toContain('/app/crm/leads')
  expect(serialized).not.toContain('/app/crm/contatos')
  expect(serialized).not.toContain('/app/crm/dashboard')
  expect(serialized).not.toContain('/app/contracts')
  expect(serialized).not.toContain('/app/finance')
  expect(serialized).not.toContain('/app/settings')
 })
})
