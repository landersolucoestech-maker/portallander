import test from 'node:test'
import assert from 'node:assert/strict'
import {evaluateSkillPolicy} from './agentPolicyService.js'

const readSkill={id:'integrations.providers.status',permissions:['integrations.read'],risk:0,mutates:false,requiresApproval:false}

test('agentic policy requires attributable session identity',()=>{
  const decision=evaluateSkillPolicy({actor:{mode:'legacy-token'},skill:readSkill})
  assert.equal(decision.allowed,false)
  assert.equal(decision.code,'AGENTIC_SESSION_IDENTITY_REQUIRED')
})

test('agentic policy allows explicit read permission and denies missing permission',()=>{
  const allowed=evaluateSkillPolicy({actor:{mode:'session',user:{id:'u1',role:'admin'}},skill:readSkill})
  assert.equal(allowed.allowed,true)
  const denied=evaluateSkillPolicy({actor:{mode:'session',user:{id:'u1',role:'editor'}},skill:readSkill})
  assert.equal(denied.allowed,false)
  assert.equal(denied.code,'AGENTIC_PERMISSION_DENIED')
})

test('agentic policy fail-closes mutation skills even for owner',()=>{
  const decision=evaluateSkillPolicy({actor:{mode:'session',user:{id:'owner1',role:'owner'}},skill:{...readSkill,id:'crm.lead.create',risk:1,mutates:true}})
  assert.equal(decision.allowed,false)
  assert.equal(decision.code,'AGENTIC_MUTATION_SKILLS_DISABLED')
})
