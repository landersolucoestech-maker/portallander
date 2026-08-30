import {describe,expect,it} from 'vitest'
import {crmPathForTab,crmTabFromPath} from './routing'

describe('CRM tab routing',()=>{
 it('abre Contatos como aba padrão na rota principal',()=>{expect(crmTabFromPath('/app/crm')).toBe('contacts')})
 it('ativa Contatos no deep link',()=>{expect(crmTabFromPath('/app/crm/contatos')).toBe('contacts')})
 it('ativa Leads no deep link',()=>{expect(crmTabFromPath('/app/crm/leads')).toBe('leads')})
 it('gera as rotas client-side das tabs',()=>{expect(crmPathForTab('contacts')).toBe('/app/crm/contatos');expect(crmPathForTab('leads')).toBe('/app/crm/leads')})
 it('mantém sincronização determinística para back/forward',()=>{const history=['/app/crm/contatos','/app/crm/leads','/app/crm/contatos'];expect(history.map(crmTabFromPath)).toEqual(['contacts','leads','contacts'])})
})
