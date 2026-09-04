import {describe,expect,it} from 'vitest'
import sectionConfigurationSource from '../pages/SectionConfigurationPage.tsx?raw'
import {getSiteFormById} from './catalog'
import {resolveSectionFormId} from './SectionFormPreview'

describe('section form preview contract',()=>{
  it('maps the Colabore section to the canonical collaborate form id',()=>{
    expect(resolveSectionFormId('colabore-formulario')).toBe('collaborate')
    const form=getSiteFormById('collaborate')
    expect(form?.purpose).toBe('editorial_submission')
    expect(form?.fields.some(field=>field.type==='textarea')).toBe(true)
    expect(form?.fields.some(field=>field.type==='select')).toBe(true)
    expect(form?.fields.some(field=>field.type==='file')).toBe(true)
    expect(form?.consents.length).toBeGreaterThan(0)
  })

  it('prevents SectionConfigurationPage from restoring a scenic hardcoded form',()=>{
    expect(sectionConfigurationSource).toContain('<SectionFormPreview sectionId={definition.id}/>')
    expect(sectionConfigurationSource).not.toContain('ENVIAR MATERIAL')
    expect(sectionConfigurationSource).not.toContain('placeholder="Seu nome"')
    expect(sectionConfigurationSource).not.toContain('placeholder="seu@email.com"')
  })
})
