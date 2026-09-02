import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizeDefinition} from './formAdminService.js'

const base={
  name:'Contato Comercial',slug:'Contato Comercial',purpose:'lead_capture',
  fields:[
    {id:'message',key:'message',label:'Mensagem',type:'textarea',required:true,order:20},
    {id:'email',key:'email',label:'E-mail',type:'email',required:true,order:10},
  ],
  consents:[{id:'privacy',kind:'privacy',label:'Privacidade',required:true,version:'1.0',text:'Autorizo o tratamento.'}],
  routing:{destination:'crm',crm:{origin:'formulario_portal'}},
  successMessage:'Recebido.',
}

test('normaliza definição sem vincular layout ou página',()=>{
  const form=normalizeDefinition(base,{key:'contato_comercial',version:3})
  assert.equal(form.slug,'contato-comercial')
  assert.equal(form.version,3)
  assert.deepEqual(form.fields.map(field=>field.key),['email','message'])
  assert.deepEqual(form.fields.map(field=>field.order),[1,2])
})

test('rejeita chaves de campo duplicadas',()=>{
  assert.throws(()=>normalizeDefinition({...base,fields:[...base.fields,{id:'email-2',key:'email',label:'Outro e-mail',type:'email',required:false,order:30}]}),error=>error?.code==='FORM_FIELD_KEY_DUPLICATE')
})

test('rejeita submissão editorial roteada diretamente ao CRM',()=>{
  assert.throws(()=>normalizeDefinition({...base,purpose:'editorial_submission',routing:{destination:'crm'}}),error=>error?.code==='FORM_ROUTING_CONFLICT')
})
