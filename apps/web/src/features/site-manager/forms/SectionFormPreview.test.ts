import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {describe,expect,it} from 'vitest'
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
    const sourcePath=fileURLToPath(new URL('../pages/SectionConfigurationPage.tsx',import.meta.url))
    const source=readFileSync(sourcePath,'utf8')
    expect(source).toContain('<SectionFormPreview sectionId={definition.id}/>')
    expect(source).not.toContain('ENVIAR MATERIAL')
    expect(source).not.toContain('placeholder="Seu nome"')
    expect(source).not.toContain('placeholder="seu@email.com"')
  })
})
