import {describe,expect,it} from 'vitest'
import {contactProfiles,type Contact} from './domain'
import {draftFromContact} from './contactDraft'
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

 it('preserves a legacy contact role while editing other fields',()=>{
  const contact:Contact={id:'contact_legacy',entityType:'pessoa_juridica',category:'cliente',profile:'Empresa',name:'Empresa Exemplo',company:'Marca Exemplo',role:'Diretor Comercial',email:'contato@example.com',phone:'11999999999',whatsapp:'11999999999',city:'São Paulo',state:'SP',document:'12345678000199',website:'https://example.com',instagram:'@exemplo',priority:'media',status:'ativo',tags:['Cliente'],notes:'',attachments:[],timeline:[],createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z'}
  const draft=draftFromContact(contact)
  const edited={...draft,phone:'11888888888'}
  expect(edited.role).toBe('Diretor Comercial')
  expect(edited.phone).toBe('11888888888')
 })

 it('uses official service detail labels instead of camelCase derivation',()=>{
  expect(getServiceDetailLabel('divulgacao_evento','eventName')).toBe('Nome do evento')
  expect(getServiceDetailLabel('publieditorial','provisionalTitle')).toBe('Título provisório')
  expect(getServiceDetailLabel('campanha_publicitaria','campaignName')).toBe('Nome da campanha')
 })
})
