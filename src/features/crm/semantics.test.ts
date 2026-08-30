import {describe,expect,it} from 'vitest'
import {contactProfiles} from './domain'
import {getContactSemanticLabels,getServiceDetailLabel} from './semantics'

describe('CRM semantic labels',()=>{
 it('uses person labels for pessoa física',()=>{
  expect(getContactSemanticLabels('pessoa_fisica')).toEqual({
   name:'Nome completo *',company:'Empresa / Organização',document:'CPF',role:'Cargo / Função',
  })
 })

 it('uses company labels for pessoa jurídica',()=>{
  expect(getContactSemanticLabels('pessoa_juridica')).toEqual({
   name:'Razão Social *',company:'Nome Fantasia',document:'CNPJ',role:'Cargo / Função',
  })
 })

 it('keeps profile options valid for type and category combinations',()=>{
  expect(contactProfiles.pessoa_fisica.fonte_editorial).toContain('Jornalista')
  expect(contactProfiles.pessoa_juridica.anunciante).toContain('Marca')
 })

 it('uses official service detail labels instead of camelCase derivation',()=>{
  expect(getServiceDetailLabel('divulgacao_evento','eventName')).toBe('Nome do evento')
  expect(getServiceDetailLabel('publieditorial','provisionalTitle')).toBe('Título provisório')
  expect(getServiceDetailLabel('campanha_publicitaria','campaignName')).toBe('Nome da campanha')
 })
})
