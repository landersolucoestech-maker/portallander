import {beforeEach,describe,expect,it} from 'vitest'
import {contactProfiles,emptyLead,label,leadStatusOptions} from './domain'
import {crmRepository} from './repository'

class MemoryStorage{private data=new Map<string,string>();getItem(k:string){return this.data.get(k)??null}setItem(k:string,v:string){this.data.set(k,v)}removeItem(k:string){this.data.delete(k)}clear(){this.data.clear()}}
Object.defineProperty(globalThis,'localStorage',{value:new MemoryStorage(),configurable:true})
Object.defineProperty(globalThis,'window',{value:{dispatchEvent:()=>true},configurable:true})
Object.defineProperty(globalThis,'CustomEvent',{value:class{constructor(public type:string){}},configurable:true})

describe('Portal Lander CRM domain',()=>{
 beforeEach(()=>localStorage.clear())
 it('keeps contact classification config-driven',()=>{expect(contactProfiles.pessoa_fisica.fonte_editorial).toContain('Jornalista');expect(contactProfiles.pessoa_juridica.anunciante).toContain('Marca')})
 it('maps lead status labels',()=>expect(label(leadStatusOptions,'negociacao')).toBe('Negociação'))
 it('prevents stale updates with optimistic concurrency',()=>{const lead=crmRepository.createLead({...emptyLead(),name:'Marca Exemplo',phone:'11999999999'});const changed=crmRepository.updateLead(lead.id,{company:'Empresa A'},lead.updatedAt);expect(()=>crmRepository.updateLead(lead.id,{company:'Empresa B'},lead.updatedAt)).toThrow(/CONFLICT/);expect(changed.company).toBe('Empresa A')})
 it('converts a closed lead idempotently',()=>{const lead=crmRepository.createLead({...emptyLead(),name:'Cliente Exemplo',phone:'11999999999',status:'fechado'});const first=crmRepository.convertLead(lead.id);const second=crmRepository.convertLead(lead.id);expect(second.id).toBe(first.id);expect(crmRepository.listContacts()).toHaveLength(1)})
})
