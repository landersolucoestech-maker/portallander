import {getPool} from './db.js'
import {evaluateSkillPolicy} from './agentPolicyService.js'
import {HttpError} from './editorialService.js'
import {requireSkill} from './skillRegistry.js'

const clean=value=>String(value??'').trim()
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{}
const json=value=>JSON.stringify(value??null)

function mapRun(row){if(!row)return null;return {id:row.id,requesterType:row.requester_type,requesterId:row.requester_id,idempotencyKey:row.idempotency_key,objective:row.objective,agentKey:row.agent_key,agentVersion:row.agent_version,skillId:row.skill_id,skillVersion:row.skill_version,state:row.state,riskLevel:Number(row.risk_level),input:row.input||{},output:row.output??null,error:row.error??null,policyDecision:row.policy_decision||{},startedAt:row.started_at??null,completedAt:row.completed_at??null,createdAt:row.created_at,updatedAt:row.updated_at}}
function serializeError(error){return {name:clean(error?.name)||'Error',code:clean(error?.code)||'AGENTIC_SKILL_EXECUTION_FAILED',message:clean(error?.message)||'Skill execution failed.'}}
function timeoutAfter(ms,skillId){return new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new HttpError(504,`Skill ${skillId} excedeu o timeout.`,'AGENTIC_SKILL_TIMEOUT',{skillId,timeoutMs:ms})),ms);timer.unref?.()})}

async function findExisting({requesterType,requesterId,idempotencyKey}){
  const {rows}=await getPool().query('select * from agent_runs where requester_type=$1 and requester_id=$2 and idempotency_key=$3 limit 1',[requesterType,requesterId,idempotencyKey])
  return mapRun(rows[0])
}

export const agentRunService={
  async executeSkillRun({actor,skillId,skillVersion,input={},objective,idempotencyKey}){
    const skill=requireSkill(skillId,skillVersion)
    const policy=evaluateSkillPolicy({actor,skill})
    const requesterType='user',requesterId=clean(actor?.user?.id)
    if(!requesterId)throw new HttpError(403,'Execução agentic exige sessão administrativa atribuível.','AGENTIC_SESSION_IDENTITY_REQUIRED')
    const key=clean(idempotencyKey)
    if(key.length<8||key.length>200)throw new HttpError(400,'Idempotency key deve possuir entre 8 e 200 caracteres.','AGENTIC_IDEMPOTENCY_KEY_INVALID')
    const normalizedObjective=clean(objective)||`Execute ${skill.id}`
    if(normalizedObjective.length>4000)throw new HttpError(400,'Objetivo agentic excede o limite permitido.','AGENTIC_OBJECTIVE_TOO_LARGE')
    const normalizedInput=object(input)
    const {rows}=await getPool().query(`
      insert into agent_runs(requester_type,requester_id,idempotency_key,objective,skill_id,skill_version,state,risk_level,input,policy_decision)
      values($1,$2,$3,$4,$5,$6,'queued',$7,$8::jsonb,$9::jsonb)
      on conflict(requester_type,requester_id,idempotency_key) do nothing
      returning *`,[requesterType,requesterId,key,normalizedObjective,skill.id,skill.version,skill.risk,json(normalizedInput),json(policy)])
    if(!rows[0])return {replayed:true,run:await findExisting({requesterType,requesterId,idempotencyKey:key})}
    const run=rows[0]
    if(!policy.allowed){
      const terminal=policy.decision==='APPROVAL_REQUIRED'?'waiting_approval':'failed'
      const error=policy.decision==='APPROVAL_REQUIRED'?null:{code:policy.code,message:policy.reason}
      const {rows:updated}=await getPool().query(`update agent_runs set state=$2,error=$3::jsonb,completed_at=case when $2='failed' then now() else null end,updated_at=now() where id=$1 returning *`,[run.id,terminal,json(error)])
      return {replayed:false,run:mapRun(updated[0])}
    }
    const {rows:running}=await getPool().query(`update agent_runs set state='running',started_at=now(),updated_at=now() where id=$1 and state='queued' returning *`,[run.id])
    if(!running[0])throw new HttpError(409,'Transição de estado agentic inválida.','AGENTIC_STATE_CONFLICT')
    const {rows:stepRows}=await getPool().query(`insert into agent_steps(run_id,sequence,skill_id,skill_version,state,risk_level,input,started_at) values($1,0,$2,$3,'running',$4,$5::jsonb,now()) returning *`,[run.id,skill.id,skill.version,skill.risk,json(normalizedInput)])
    const step=stepRows[0]
    let lastError=null
    for(let attempt=1;attempt<=skill.retries+1;attempt+=1){
      const {rows:invocationRows}=await getPool().query(`insert into skill_invocations(run_id,step_id,skill_id,skill_version,attempt,state,permissions,policy_decision,input) values($1,$2,$3,$4,$5,'running',$6,$7::jsonb,$8::jsonb) returning id`,[run.id,step.id,skill.id,skill.version,attempt,skill.permissions,json(policy),json(normalizedInput)])
      const invocationId=invocationRows[0].id
      try{
        const output=await Promise.race([Promise.resolve(skill.execute(normalizedInput,{actor,runId:run.id,stepId:step.id,attempt})),timeoutAfter(skill.timeoutMs,skill.id)])
        await getPool().query(`update skill_invocations set state='succeeded',output=$2::jsonb,completed_at=now() where id=$1`,[invocationId,json(output)])
        await getPool().query(`update agent_steps set state='succeeded',output=$2::jsonb,completed_at=now(),updated_at=now() where id=$1`,[step.id,json(output)])
        const {rows:completed}=await getPool().query(`update agent_runs set state='succeeded',output=$2::jsonb,completed_at=now(),updated_at=now() where id=$1 and state='running' returning *`,[run.id,json(output)])
        if(!completed[0])throw new HttpError(409,'Conclusão agentic encontrou estado inesperado.','AGENTIC_STATE_CONFLICT')
        return {replayed:false,run:mapRun(completed[0])}
      }catch(error){
        lastError=serializeError(error)
        await getPool().query(`update skill_invocations set state='failed',error=$2::jsonb,completed_at=now() where id=$1`,[invocationId,json(lastError)])
      }
    }
    await getPool().query(`update agent_steps set state='failed',error=$2::jsonb,completed_at=now(),updated_at=now() where id=$1`,[step.id,json(lastError)])
    const {rows:failed}=await getPool().query(`update agent_runs set state='failed',error=$2::jsonb,completed_at=now(),updated_at=now() where id=$1 and state='running' returning *`,[run.id,json(lastError)])
    return {replayed:false,run:mapRun(failed[0]||run)}
  },

  async get(id){
    const runId=clean(id)
    if(!runId)throw new HttpError(400,'ID da execução é obrigatório.','AGENTIC_RUN_ID_REQUIRED')
    const {rows}=await getPool().query('select * from agent_runs where id=$1 limit 1',[runId])
    if(!rows[0])throw new HttpError(404,'Execução agentic não encontrada.','AGENTIC_RUN_NOT_FOUND')
    const steps=await getPool().query('select * from agent_steps where run_id=$1 order by sequence asc',[runId])
    const invocations=await getPool().query('select id,step_id,skill_id,skill_version,attempt,state,permissions,policy_decision,input,output,error,started_at,completed_at from skill_invocations where run_id=$1 order by created_at asc',[runId])
    return {run:mapRun(rows[0]),steps:steps.rows,invocations:invocations.rows}
  },
}
