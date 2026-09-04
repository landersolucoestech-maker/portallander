import test from 'node:test'
import assert from 'node:assert/strict'
import {createSkillRegistry,portalSkillRegistry} from './skillRegistry.js'

test('portal skill registry exposes only explicit read-only skills available on the clean engineering branch',()=>{
  const skills=portalSkillRegistry.list()
  assert.ok(skills.length>=2)
  assert.ok(skills.every(skill=>skill.mutates===false&&skill.risk<=1&&skill.requiresApproval===false))
  assert.ok(skills.some(skill=>skill.id==='system.database.health'))
  assert.ok(skills.some(skill=>skill.id==='integrations.providers.status'))
  assert.equal(skills.some(skill=>skill.id.startsWith('analytics.')),false)
  assert.equal(skills.some(skill=>Object.hasOwn(skill,'execute')),false)
})

test('skill registry rejects duplicates and non-idempotent mutation descriptors',()=>{
  const skill={id:'test.read.value',version:'1.0',description:'test',owner:'test',permissions:['test.read'],risk:0,requiresApproval:false,idempotent:true,mutates:false,timeoutMs:1000,retries:0,execute:async()=>({ok:true})}
  const registry=createSkillRegistry([skill])
  assert.throws(()=>registry.register(skill),/Duplicate skill registration/)
  assert.throws(()=>createSkillRegistry([{...skill,id:'test.write.value',mutates:true,idempotent:false,risk:1}]),/must declare idempotency/)
  assert.throws(()=>createSkillRegistry([{...skill,id:'test.high.risk',risk:3,requiresApproval:false}]),/must require approval/)
})
