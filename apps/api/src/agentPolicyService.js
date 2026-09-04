const ROLE_PERMISSIONS=Object.freeze({
  owner:new Set(['system.read','integrations.read']),
  admin:new Set(['system.read','integrations.read']),
  editor:new Set([]),
})

export function evaluateSkillPolicy({actor,skill}){
  if(!actor?.user?.id||actor.mode!=='session')return {allowed:false,decision:'DENY',code:'AGENTIC_SESSION_IDENTITY_REQUIRED',reason:'Agentic execution requires an attributable administrative session.'}
  const role=String(actor.user.role||'').trim()
  const granted=ROLE_PERMISSIONS[role]
  if(!granted)return {allowed:false,decision:'DENY',code:'AGENTIC_ROLE_UNKNOWN',reason:'Administrative role is not mapped to agentic permissions.',role}
  if(skill.mutates)return {allowed:false,decision:'DENY',code:'AGENTIC_MUTATION_SKILLS_DISABLED',reason:'Mutation skills remain disabled until canonical domain sources, authorization and approval gates are proven.',role}
  const missing=skill.permissions.filter(permission=>!granted.has(permission))
  if(missing.length)return {allowed:false,decision:'DENY',code:'AGENTIC_PERMISSION_DENIED',reason:'Actor lacks one or more required permissions.',role,missingPermissions:missing}
  if(skill.requiresApproval)return {allowed:false,decision:'APPROVAL_REQUIRED',code:'AGENTIC_APPROVAL_REQUIRED',reason:'Skill requires a persisted human approval before execution.',role,risk:skill.risk}
  return {allowed:true,decision:'ALLOW',code:'AGENTIC_POLICY_ALLOWED',reason:'Read-only skill is permitted for this attributable session.',role,permissions:[...skill.permissions],risk:skill.risk}
}

export function describeAgenticPermissions(){
  return Object.fromEntries(Object.entries(ROLE_PERMISSIONS).map(([role,permissions])=>[role,[...permissions].sort()]))
}
