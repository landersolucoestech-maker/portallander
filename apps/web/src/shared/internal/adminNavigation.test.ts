import {describe,expect,it} from 'vitest'
import {CRM_WORKSPACE_NAV} from './adminNavigation'

describe('admin navigation',()=>{
 it('mantém Dashboard, CRM, Contratos e Financeiro no workspace administrativo',()=>{
  const labels=CRM_WORKSPACE_NAV.map(item=>Array.isArray(item)?item[0]:item.label)
  expect(labels).toEqual(['Dashboard','CRM','Contratos','Financeiro'])
 })

 it('preserva as rotas principais obrigatórias',()=>{
  const serialized=JSON.stringify(CRM_WORKSPACE_NAV)
  expect(serialized).toContain('/app/dashboard')
  expect(serialized).toContain('/app/crm')
  expect(serialized).toContain('/app/contracts')
  expect(serialized).toContain('/app/finance')
  expect(serialized).toContain('/app/finance/invoices')
  expect(serialized).toContain('/app/finance/accounting')
 })

 it('mantém somente as três páginas permitidas no submenu Financeiro',()=>{
  const finance=CRM_WORKSPACE_NAV.find(item=>!Array.isArray(item)&&item.label==='Financeiro')
  expect(finance&& !Array.isArray(finance) ? finance.children.map(child=>child[0]) : []).toEqual(['Transações','Notas Fiscais','Contabilidade'])
  const serialized=JSON.stringify(finance)
  expect(serialized).not.toContain('/app/finance/categories')
  expect(serialized).not.toContain('/app/finance/rules')
  expect(serialized).not.toContain('/app/finance/automations')
 })

 it('não divide o CRM em itens internos na sidebar',()=>{
  const serialized=JSON.stringify(CRM_WORKSPACE_NAV)
  expect(serialized).not.toContain('/app/crm/leads')
  expect(serialized).not.toContain('/app/crm/contatos')
  expect(serialized).not.toContain('/app/crm/dashboard')
 })
})
