import {describe,expect,it} from 'vitest'
import type {AdminNavGroup,AdminNavItem} from './AdminUi'
import {UNIFIED_ADMIN_NAV} from './adminNavigation'

const isGroup=(item:AdminNavItem):item is AdminNavGroup=>!Array.isArray(item)

describe('admin navigation',()=>{
  it('keeps exactly the implemented administrative modules',()=>{
    const labels=UNIFIED_ADMIN_NAV.map(item=>isGroup(item)?item.label:item[0])
    expect(labels).toEqual(['Dashboard','CRM','Contratos','Financeiro','Agenda','Chat','RH','Métricas','Site','Marketing','Relatórios','Configurações'])
  })

  it('preserves the required canonical routes in the unified shell',()=>{
    const serialized=JSON.stringify(UNIFIED_ADMIN_NAV)
    for(const route of ['/app/dashboard','/app/crm','/app/contracts','/app/finance','/app/finance/invoices','/app/finance/accounting','/app/agenda','/app/chat','/app/hr','/app/metrics','/app/site/content','/app/site/media','/app/site/pages','/app/site/forms','/app/site/media-kit','/app/marketing','/app/reports','/app/settings'])expect(serialized).toContain(route)
    expect(serialized).not.toContain('/app/marketing/metrics')
  })

  it('does not expose the removed duplicate Editorial module',()=>{
    const editorial=UNIFIED_ADMIN_NAV.find(item=>isGroup(item)&&item.label==='Editorial')
    const removedEditorialRoot=['','app','editorial'].join('/')
    expect(editorial).toBeUndefined()
    expect(JSON.stringify(UNIFIED_ADMIN_NAV)).not.toContain(removedEditorialRoot)
  })

  it('keeps Marketing with its six legitimate submodules and without Metrics ownership',()=>{
    const marketing=UNIFIED_ADMIN_NAV.find(item=>isGroup(item)&&item.label==='Marketing')
    expect(marketing&&isGroup(marketing)?marketing.children.map(child=>child[0]):[]).toEqual(['Visão Geral','Campanhas','Calendário','Tarefas','Briefings','IA Criativa'])
    expect(marketing&&isGroup(marketing)?marketing.children.map(child=>child[2]):[]).toEqual(['/app/marketing','/app/marketing/campaigns','/app/marketing/calendar','/app/marketing/tasks','/app/marketing/briefings','/app/marketing/creative-ai'])
  })

  it('keeps only the three approved Finance submenu pages',()=>{
    const finance=UNIFIED_ADMIN_NAV.find(item=>isGroup(item)&&item.label==='Financeiro')
    expect(finance&&isGroup(finance)?finance.children.map(child=>child[0]):[]).toEqual(['Transações','Notas Fiscais','Contabilidade'])
    const serialized=JSON.stringify(finance)
    expect(serialized).not.toContain('/app/finance/categories')
    expect(serialized).not.toContain('/app/finance/rules')
    expect(serialized).not.toContain('/app/finance/automations')
  })

  it('keeps Site as a five-item management group without a second Dashboard',()=>{
    const site=UNIFIED_ADMIN_NAV.find(item=>isGroup(item)&&item.label==='Site')
    expect(site&&isGroup(site)?site.to:undefined).toBe('/app/site/pages')
    expect(site&&isGroup(site)?site.children.map(child=>child[0]):[]).toEqual(['Conteúdos','Mídias','Páginas','Formulários','Mídia Kit'])
    expect(site&&isGroup(site)?site.children.some(child=>child[0]==='Dashboard'):true).toBe(false)
  })

  it('does not split CRM into internal sidebar items',()=>{
    const serialized=JSON.stringify(UNIFIED_ADMIN_NAV)
    expect(serialized).not.toContain('/app/crm/leads')
    expect(serialized).not.toContain('/app/crm/contacts')
    expect(serialized).not.toContain('/app/crm/dashboard')
  })
})
