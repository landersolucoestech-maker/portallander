import {getPool} from './db.js'
import {HttpError} from './editorialService.js'
import {integrationRuntimeStatus} from './integrationProviderService.js'

const SKILL_ID=/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+$/
const VERSION=/^[0-9]+(?:\.[0-9]+){0,2}$/
const clone=value=>structuredClone(value)

function normalizeDescriptor(input){
  const descriptor={
    id:String(input?.id||'').trim(),
    version:String(input?.version||'').trim(),
    description:String(input?.description||'').trim(),
    owner:String(input?.owner||'').trim(),
    permissions:[...new Set((input?.permissions||[]).map(value=>String(value).trim()).filter(Boolean))],
    risk:Number(input?.risk),
    requiresApproval:Boolean(input?.requiresApproval),
    idempotent:Boolean(input?.idempotent),
    mutates:Boolean(input?.mutates),
    timeoutMs:Number(input?.timeoutMs),
    retries:Number(input?.retries),
    inputSchema:input?.inputSchema&&typeof input.inputSchema==='object'?clone(input.inputSchema):{type:'object',additionalProperties:true},
    outputSchema:input?.outputSchema&&typeof input.outputSchema==='object'?clone(input.outputSchema):{type:'object'},
    execute:input?.execute,
  }
  if(!SKILL_ID.test(descriptor.id))throw new Error(`Invalid skill id: ${descriptor.id||'<empty>'}`)
  if(!VERSION.test(descriptor.version))throw new Error(`Invalid skill version for ${descriptor.id}`)
  if(!descriptor.owner)throw new Error(`Skill ${descriptor.id} requires an owner`)
  if(!Number.isInteger(descriptor.risk)||descriptor.risk<0||descriptor.risk>4)throw new Error(`Skill ${descriptor.id} has invalid risk`)
  if(!Number.isInteger(descriptor.timeoutMs)||descriptor.timeoutMs<100||descriptor.timeoutMs>120000)throw new Error(`Skill ${descriptor.id} has invalid timeout`)
  if(!Number.isInteger(descriptor.retries)||descriptor.retries<0||descriptor.retries>3)throw new Error(`Skill ${descriptor.id} has invalid retries`)
  if(typeof descriptor.execute!=='function')throw new Error(`Skill ${descriptor.id} requires an executor`)
  if(descriptor.mutates&&!descriptor.idempotent)throw new Error(`Mutating skill ${descriptor.id} must declare idempotency`)
  if(descriptor.risk>=2&&!descriptor.requiresApproval)throw new Error(`Risk ${descriptor.risk} skill ${descriptor.id} must require approval`)
  return Object.freeze(descriptor)
}

export function createSkillRegistry(initial=[]){
  const skills=new Map()
  const register=input=>{
    const descriptor=normalizeDescriptor(input)
    const key=`${descriptor.id}@${descriptor.version}`
    if(skills.has(key))throw new Error(`Duplicate skill registration: ${key}`)
    skills.set(key,descriptor)
    return descriptor
  }
  initial.forEach(register)
  const get=(id,version)=>{
    const normalizedId=String(id||'').trim(),normalizedVersion=String(version||'').trim()
    if(normalizedVersion)return skills.get(`${normalizedId}@${normalizedVersion}`)||null
    return [...skills.values()].filter(skill=>skill.id===normalizedId).sort((a,b)=>b.version.localeCompare(a.version,undefined,{numeric:true}))[0]||null
  }
  const list=()=>[...skills.values()].map(({execute,...descriptor})=>clone(descriptor)).sort((a,b)=>a.id.localeCompare(b.id)||a.version.localeCompare(b.version,undefined,{numeric:true}))
  return Object.freeze({register,get,list})
}

const readOnlySkills=[
  {
    id:'system.database.health',version:'1.0',description:'Validate database connectivity without mutating state.',owner:'platform',permissions:['system.read'],risk:0,requiresApproval:false,idempotent:true,mutates:false,timeoutMs:5000,retries:1,
    inputSchema:{type:'object',additionalProperties:false},outputSchema:{type:'object',required:['status']},
    execute:async()=>{await getPool().query('select 1');return {status:'ok',database:'connected'}},
  },
  {
    id:'integrations.providers.status',version:'1.0',description:'Read configured integration runtime health without exposing credentials.',owner:'integrations',permissions:['integrations.read'],risk:0,requiresApproval:false,idempotent:true,mutates:false,timeoutMs:5000,retries:0,
    inputSchema:{type:'object',additionalProperties:false},outputSchema:{type:'object',required:['providers']},
    execute:async()=>({providers:integrationRuntimeStatus()}),
  },
]

export const portalSkillRegistry=createSkillRegistry(readOnlySkills)

export function requireSkill(id,version){
  const skill=portalSkillRegistry.get(id,version)
  if(!skill)throw new HttpError(404,'Skill não encontrada.','AGENTIC_SKILL_NOT_FOUND',{skillId:id,skillVersion:version||null})
  return skill
}
