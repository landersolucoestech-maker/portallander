import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizeAppearance,normalizeDefinition} from './formAdminService.js'

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

test('aplica aparência segura e retrocompatível quando versões antigas não possuem appearance',()=>{
  const form=normalizeDefinition(base,{key:'contato_comercial',version:3})
  assert.equal(form.appearance.preset,'portal')
  assert.equal(form.appearance.container.maxWidth,960)
  assert.equal(form.appearance.button.background,'#e50914')
})

test('normaliza aparência sem aceitar CSS arbitrário',()=>{
  const appearance=normalizeAppearance({
    preset:'highlight',css:'body{display:none}',
    container:{maxWidth:99999,background:'url(javascript:alert(1))',position:'fixed'},
    fields:{textColor:'#ABCDEF',focusRing:99},
    button:{text:'Enviar proposta',background:'#ff0000',width:'viewport'},
  })
  assert.equal(appearance.preset,'highlight')
  assert.equal(appearance.container.maxWidth,1440)
  assert.equal(appearance.container.background,'#ffffff')
  assert.equal(appearance.fields.textColor,'#abcdef')
  assert.equal(appearance.fields.focusRing,6)
  assert.equal(appearance.button.text,'Enviar proposta')
  assert.equal(appearance.button.width,'auto')
  assert.equal('css' in appearance,false)
  assert.equal('position' in appearance.container,false)
})

test('incorpora aparência customizada à definição normalizada que será versionada',()=>{
  const form=normalizeDefinition({...base,appearance:{preset:'editorial',container:{background:'#121212',borderRadius:7},button:{background:'#e50914',foreground:'#ffffff'}}},{key:'contato_comercial',version:4})
  assert.equal(form.version,4)
  assert.equal(form.appearance.preset,'editorial')
  assert.equal(form.appearance.container.background,'#121212')
  assert.equal(form.appearance.container.borderRadius,7)
  assert.equal(form.appearance.button.background,'#e50914')
})

test('rejeita chaves de campo duplicadas',()=>{
  assert.throws(()=>normalizeDefinition({...base,fields:[...base.fields,{id:'email-2',key:'email',label:'Outro e-mail',type:'email',required:false,order:30}]}),error=>error?.code==='FORM_FIELD_KEY_DUPLICATE')
})

test('rejeita submissão editorial roteada diretamente ao CRM',()=>{
  assert.throws(()=>normalizeDefinition({...base,purpose:'editorial_submission',routing:{destination:'crm'}}),error=>error?.code==='FORM_ROUTING_CONFLICT')
})
