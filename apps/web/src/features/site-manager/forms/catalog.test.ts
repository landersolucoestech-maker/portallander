import {beforeEach,describe,expect,it} from 'vitest'
import {getMockupSystemForms} from '@portallander/mockup'
import {SYSTEM_FORM_KEYS} from '../../../../../../packages/shared/systemFormCatalog.js'
import {getSiteFormBySlug,listRuntimeSiteForms,setRuntimeSiteForms} from './catalog'
import type {SiteFormDefinition} from './domain'

const fullForms=()=>getMockupSystemForms('full') as unknown as SiteFormDefinition[]

describe('canonical site forms catalog',()=>{
  beforeEach(()=>setRuntimeSiteForms(fullForms()))

  it('expõe exatamente os dois formulários de sistema canônicos',()=>{
    const forms=listRuntimeSiteForms()
    expect(forms).toHaveLength(2)
    expect(forms.map(form=>form.id)).toEqual(SYSTEM_FORM_KEYS)
    expect(forms.map(form=>form.name)).toEqual(['Contato Comercial','Colabore / Anuncie'])
    expect(forms.some(form=>form.id==='advertising-inquiry')).toBe(false)
    expect(forms.some(form=>form.name==='Captação de Leads')).toBe(false)
    expect(forms.some(form=>form.name==='Contato Comercial · Anuncie')).toBe(false)
  })

  it.each([
    ['captacao-leads','lead-capture'],
    ['contato','lead-capture'],
    ['contato-comercial','lead-capture'],
    ['colabore','collaborate'],
    ['anuncie','collaborate'],
    ['anuncie-contato','collaborate'],
    ['advertising-inquiry','collaborate'],
  ])('resolve alias %s para a identidade %s sem criar registro extra',(alias,key)=>{
    expect(getSiteFormBySlug(alias)?.id).toBe(key)
    expect(listRuntimeSiteForms()).toHaveLength(2)
  })

  it('mantém contato comercial exclusivamente no CRM',()=>{
    const contact=getSiteFormBySlug('contato')
    expect(contact?.id).toBe('lead-capture')
    expect(contact?.routing.destination).toBe('crm')
    expect(contact?.routing.crm?.origin).toBe('formulario_portal')
  })

  it('usa uma única definição para Colabore e Anuncie em Colaborações recebidas',()=>{
    const colabore=getSiteFormBySlug('colabore')
    const anuncie=getSiteFormBySlug('anuncie')
    expect(colabore?.id).toBe('collaborate')
    expect(anuncie?.id).toBe(colabore?.id)
    expect(anuncie?.version).toBe(colabore?.version)
    expect(anuncie?.routing.destination).toBe('content_collaborations')
    expect(anuncie?.routing.crm).toBeUndefined()
    expect(anuncie?.fields.find(field=>field.key==='tipo')?.options).toEqual(expect.arrayContaining(['publicidade','patrocinio','parceria_comercial','conteudo_patrocinado']))
  })

  it('rejeita runtime que recrie um terceiro formulário de sistema',()=>{
    const forms=fullForms()
    const duplicate={...structuredClone(forms[1]),id:'advertising-inquiry',slug:'anuncie-contato'}
    expect(()=>setRuntimeSiteForms([...forms,duplicate])).toThrow(/Canonical system forms mismatch/)
  })
})
