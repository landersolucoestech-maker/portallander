import {describe,expect,it} from 'vitest'
import type {AdminNavItem,AdminNavLink} from './AdminUi'
import {CRM_WORKSPACE_NAV} from './adminNavigation'

const isNavLink=(item:AdminNavItem):item is AdminNavLink=>Array.isArray(item)

describe('admin navigation',()=>{
 it('mantém Dashboard principal e CRM como módulos independentes',()=>{
  const links=CRM_WORKSPACE_NAV.filter(isNavLink).map(item=>[item[0],item[2]])
  expect(links).toEqual([
   ['Dashboard','/app/dashboard'],
   ['CRM','/app/crm'],
  ])
 })

 it('não expõe Leads, Contatos ou Dashboard interno do CRM na sidebar',()=>{
  const serialized=JSON.stringify(CRM_WORKSPACE_NAV)
  expect(serialized).not.toContain('/app/crm/leads')
  expect(serialized).not.toContain('/app/crm/contatos')
  expect(serialized).not.toContain('/app/crm/dashboard')
 })
})
