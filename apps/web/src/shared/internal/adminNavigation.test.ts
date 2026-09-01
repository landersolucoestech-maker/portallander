import {describe,expect,it} from 'vitest'
import type {AdminNavGroup,AdminNavItem} from './AdminUi'
import {UNIFIED_ADMIN_NAV} from './adminNavigation'

const isGroup=(item:AdminNavItem):item is AdminNavGroup=>!Array.isArray(item)

describe('admin navigation',()=>{
  it('mantém exatamente os módulos aprovados no workspace administrativo',()=>{
    const labels=UNIFIED_ADMIN_NAV.map(item=>isGroup(item)?item.label:item[0])
    expect(labels).toEqual(['Dashboard','CRM','Financeiro','Agenda','Chat','RH','Site','Marketing','Configurações'])
  })

  it('preserva as rotas visíveis obrigatórias do shell unificado',()=>{
    const serialized=JSON.stringify(UNIFIED_ADMIN_NAV)
    for(const route of ['/app/dashboard','/app/crm','/app/finance','/app/finance/invoices','/app/finance/accounting','/app/agenda','/app/chat','/app/rh','/app/site/conteudos','/app/site/midia','/app/site/paginas','/app/site/midia-kit','/app/marketing','/app/settings'])expect(serialized).toContain(route)
    expect(serialized).not.toContain('/app/contracts')
    expect(serialized).not.toContain('/app/reports')
  })

  it('expõe somente os seis submódulos aprovados de Marketing',()=>{
    const marketing=UNIFIED_ADMIN_NAV.find(item=>isGroup(item)&&item.label==='Marketing')
    expect(marketing&&isGroup(marketing)?marketing.children.map(child=>child[0]):[]).toEqual(['Visão Geral','Campanhas','Calendário','Tarefas','Briefings','IA Criativa'])
    expect(marketing&&isGroup(marketing)?marketing.children.map(child=>child[2]):[]).toEqual(['/app/marketing','/app/marketing/campanhas','/app/marketing/calendario','/app/marketing/tarefas','/app/marketing/briefings','/app/marketing/ia-criativa'])
  })

  it('mantém somente as três páginas permitidas no submenu Financeiro',()=>{
    const finance=UNIFIED_ADMIN_NAV.find(item=>isGroup(item)&&item.label==='Financeiro')
    expect(finance&&isGroup(finance)?finance.children.map(child=>child[0]):[]).toEqual(['Transações','Notas Fiscais','Contabilidade'])
    const serialized=JSON.stringify(finance)
    expect(serialized).not.toContain('/app/finance/categories')
    expect(serialized).not.toContain('/app/finance/rules')
    expect(serialized).not.toContain('/app/finance/automations')
  })

  it('mantém o Site com os quatro submódulos aprovados',()=>{
    const site=UNIFIED_ADMIN_NAV.find(item=>isGroup(item)&&item.label==='Site')
    expect(site&&isGroup(site)?site.children.map(child=>child[0]):[]).toEqual(['Conteúdos','Mídias','Páginas','Mídia Kit'])
  })

  it('não divide o CRM em itens internos na sidebar',()=>{
    const serialized=JSON.stringify(UNIFIED_ADMIN_NAV)
    expect(serialized).not.toContain('/app/crm/leads')
    expect(serialized).not.toContain('/app/crm/contatos')
    expect(serialized).not.toContain('/app/crm/dashboard')
  })
})
