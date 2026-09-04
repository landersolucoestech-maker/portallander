import {describe,expect,it} from 'vitest'
import {siteFormRegistry} from './catalog'

describe('site forms catalog',()=>{
  it('mantém ids e slugs únicos',()=>{
    const ids=siteFormRegistry.map(form=>form.id)
    const slugs=siteFormRegistry.map(form=>form.slug)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('mantém campos ordenados e chaves únicas dentro de cada formulário',()=>{
    for(const form of siteFormRegistry){
      expect(form.fields.map(field=>field.order)).toEqual(form.fields.map((_,index)=>index+1))
      const keys=form.fields.map(field=>field.key)
      expect(new Set(keys).size).toBe(keys.length)
    }
  })

  it('roteia captação comercial exclusivamente ao CRM',()=>{
    const leadForm=siteFormRegistry.find(form=>form.purpose==='lead_capture')
    expect(leadForm?.routing.destination).toBe('crm')
    expect(leadForm?.routing.crm?.origin).toBe('formulario_portal')
  })

  it('roteia Colabore para Conteúdos → Colaborações recebidas e não para CRM',()=>{
    const collaborate=siteFormRegistry.find(form=>form.id==='collaborate')
    expect(collaborate?.purpose).toBe('editorial_submission')
    expect(collaborate?.routing.destination).toBe('content_collaborations')
    expect(collaborate?.routing.crm).toBeUndefined()
  })

  it('publica o contato de Anuncie como intake comercial real do CRM',()=>{
    const advertising=siteFormRegistry.find(form=>form.id==='advertising-inquiry')
    expect(advertising?.slug).toBe('anuncie-contato')
    expect(advertising?.purpose).toBe('advertising')
    expect(advertising?.status).toBe('active')
    expect(advertising?.routing.destination).toBe('crm')
    expect(advertising?.routing.crm?.tags).toEqual(expect.arrayContaining(['anuncie','publicidade']))
    expect(advertising?.fields.some(field=>field.key==='service'&&field.type==='select')).toBe(true)
  })

  it('versiona explicitamente todo formulário publicado ou em rascunho',()=>{
    for(const form of siteFormRegistry)expect(form.version).toBeGreaterThanOrEqual(1)
  })
})
