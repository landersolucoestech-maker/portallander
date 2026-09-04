import {createHash,randomBytes,randomUUID,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto'
import {promisify} from 'node:util'
import {getPool,withTransaction} from './db.js'
import {HttpError} from './editorialService.js'

const scrypt=promisify(scryptCallback)
const PASSWORD_KEY_LENGTH=64
const SCRYPT_N=16384
const SCRYPT_R=8
const SCRYPT_P=1
const MAX_FAILED_ATTEMPTS=5
const LOCK_MINUTES=15
const DEFAULT_SESSION_HOURS=12
const REMEMBER_SESSION_DAYS=30

const text=value=>value===undefined||value===null?'':String(value).trim()
const normalizeEmail=value=>text(value).toLowerCase()
const sha256=value=>createHash('sha256').update(String(value)).digest('hex')
const safeEqualBuffers=(left,right)=>left.length===right.length&&timingSafeEqual(left,right)
const safeEqualText=(left,right)=>safeEqualBuffers(Buffer.from(String(left)),Buffer.from(String(right)))
const encode=value=>Buffer.from(value).toString('base64url')
const decode=value=>Buffer.from(value,'base64url')

function authSchemaError(error){
  if(error?.code==='42P01')return new HttpError(503,'A estrutura de autenticação administrativa ainda não foi migrada.','ADMIN_AUTH_SCHEMA_MISSING')
  return error
}

export async function hashPassword(password){
  const raw=String(password??'')
  if(raw.length<10)throw new HttpError(400,'A senha administrativa precisa ter pelo menos 10 caracteres.','ADMIN_PASSWORD_TOO_SHORT')
  const salt=randomBytes(16)
  const derived=await scrypt(raw,salt,PASSWORD_KEY_LENGTH,{N:SCRYPT_N,r:SCRYPT_R,p:SCRYPT_P,maxmem:64*1024*1024})
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${encode(salt)}$${encode(derived)}`
}

export async function verifyPassword(password,encoded){
  const [algorithm,n,r,p,saltValue,hashValue]=String(encoded??'').split('$')
  if(algorithm!=='scrypt'||!n||!r||!p||!saltValue||!hashValue)return false
  try{
    const salt=decode(saltValue),expected=decode(hashValue)
    const derived=await scrypt(String(password??''),salt,expected.length,{N:Number(n),r:Number(r),p:Number(p),maxmem:64*1024*1024})
    return safeEqualBuffers(expected,derived)
  }catch{return false}
}

function publicUser(row){return {id:row.id,email:row.email,displayName:row.display_name||'',role:row.role,lastLoginAt:row.last_login_at||null}}

async function maybeBootstrapUser(client,email,password){
  const bootstrapEmail=normalizeEmail(process.env.PORTAL_ADMIN_EMAIL),bootstrapPassword=String(process.env.PORTAL_ADMIN_PASSWORD||'')
  if(!bootstrapEmail||!bootstrapPassword||email!==bootstrapEmail||!safeEqualText(password,bootstrapPassword))return null
  const passwordHash=await hashPassword(password),displayName=text(process.env.PORTAL_ADMIN_NAME)||'Administrador'
  const {rows}=await client.query(`insert into admin_users(id,email,password_hash,display_name,role,active) values($1,$2,$3,$4,'owner',true) on conflict do nothing returning *`,[`admin_${randomUUID()}`,email,passwordHash,displayName])
  if(rows[0])return rows[0]
  return (await client.query('select * from admin_users where lower(email)=lower($1) limit 1',[email])).rows[0]||null
}

async function recordFailure(client,user){
  if(!user)return
  const attempts=Number(user.failed_attempts||0)+1
  if(attempts>=MAX_FAILED_ATTEMPTS)await client.query(`update admin_users set failed_attempts=0,locked_until=now()+($2||' minutes')::interval,updated_at=now() where id=$1`,[user.id,String(LOCK_MINUTES)])
  else await client.query('update admin_users set failed_attempts=$2,updated_at=now() where id=$1',[user.id,attempts])
}

export const authService={
  async login({email,password,remember=false,userAgent='',ipHash=''}){
    const normalizedEmail=normalizeEmail(email),rawPassword=String(password??'')
    if(!normalizedEmail||!rawPassword)throw new HttpError(400,'Informe e-mail e senha.','ADMIN_CREDENTIALS_REQUIRED')
    try{return await withTransaction(async client=>{
      let user=(await client.query('select * from admin_users where lower(email)=lower($1) limit 1',[normalizedEmail])).rows[0]||null
      if(!user)user=await maybeBootstrapUser(client,normalizedEmail,rawPassword)
      if(!user){await scrypt(rawPassword,randomBytes(16),PASSWORD_KEY_LENGTH,{N:SCRYPT_N,r:SCRYPT_R,p:SCRYPT_P,maxmem:64*1024*1024});throw new HttpError(401,'E-mail ou senha inválidos.','ADMIN_INVALID_CREDENTIALS')}
      if(!user.active)throw new HttpError(403,'Este usuário administrativo está desativado.','ADMIN_USER_DISABLED')
      if(user.locked_until&&new Date(user.locked_until).getTime()>Date.now())throw new HttpError(429,'Muitas tentativas inválidas. Tente novamente mais tarde.','ADMIN_LOGIN_LOCKED')
      if(!await verifyPassword(rawPassword,user.password_hash)){await recordFailure(client,user);throw new HttpError(401,'E-mail ou senha inválidos.','ADMIN_INVALID_CREDENTIALS')}
      const token=randomBytes(32).toString('base64url'),tokenHash=sha256(token),ttlMs=remember?REMEMBER_SESSION_DAYS*86400000:DEFAULT_SESSION_HOURS*3600000,expiresAt=new Date(Date.now()+ttlMs)
      await client.query('delete from admin_sessions where expires_at<=now()')
      await client.query(`insert into admin_sessions(id,user_id,token_hash,expires_at,user_agent,ip_hash) values($1,$2,$3,$4,$5,$6)`,[`session_${randomUUID()}`,user.id,tokenHash,expiresAt,userAgent||null,ipHash||null])
      const {rows}=await client.query('update admin_users set failed_attempts=0,locked_until=null,last_login_at=now(),updated_at=now() where id=$1 returning *',[user.id])
      return {token,expiresAt,user:publicUser(rows[0]||user)}
    })}catch(error){throw authSchemaError(error)}
  },
  async session(token){
    if(!token)return null
    try{const {rows}=await getPool().query(`select s.id as session_id,s.expires_at,u.* from admin_sessions s join admin_users u on u.id=s.user_id where s.token_hash=$1 and s.expires_at>now() and u.active=true limit 1`,[sha256(token)]);const row=rows[0];if(!row)return null;await getPool().query('update admin_sessions set last_seen_at=now() where id=$1',[row.session_id]);return {sessionId:row.session_id,expiresAt:row.expires_at,user:publicUser(row)}}catch(error){throw authSchemaError(error)}
  },
  async logout(token){if(!token)return;try{await getPool().query('delete from admin_sessions where token_hash=$1',[sha256(token)])}catch(error){throw authSchemaError(error)}},
  async revokeUserSessions(userId){try{await getPool().query('delete from admin_sessions where user_id=$1',[userId])}catch(error){throw authSchemaError(error)}},
  async listSessions(userId,currentToken=''){
    try{await getPool().query('delete from admin_sessions where expires_at<=now()');const currentHash=currentToken?sha256(currentToken):'';const {rows}=await getPool().query('select id,token_hash,expires_at,created_at,last_seen_at,user_agent from admin_sessions where user_id=$1 and expires_at>now() order by last_seen_at desc,created_at desc',[userId]);return rows.map(row=>({id:row.id,isCurrent:Boolean(currentHash&&safeEqualText(row.token_hash,currentHash)),createdAt:row.created_at,lastSeenAt:row.last_seen_at,expiresAt:row.expires_at,userAgent:row.user_agent||''}))}catch(error){throw authSchemaError(error)}
  },
  async revokeOtherSessions(userId,currentToken){if(!currentToken)throw new HttpError(409,'Operação disponível apenas para sessão autenticada.','ADMIN_SESSION_REQUIRED');try{const {rowCount}=await getPool().query('delete from admin_sessions where user_id=$1 and token_hash<>$2',[userId,sha256(currentToken)]);return {revoked:Number(rowCount||0)}}catch(error){throw authSchemaError(error)}},
  async changePassword(userId,{currentPassword,newPassword,currentToken}){
    const current=String(currentPassword??''),next=String(newPassword??'');if(!current||!next)throw new HttpError(400,'Informe a senha atual e a nova senha.','ADMIN_PASSWORD_FIELDS_REQUIRED')
    try{return await withTransaction(async client=>{const {rows}=await client.query('select password_hash from admin_users where id=$1 and active=true for update',[userId]);if(!rows[0])throw new HttpError(404,'Usuário administrativo não encontrado.','ADMIN_USER_NOT_FOUND');if(!await verifyPassword(current,rows[0].password_hash))throw new HttpError(401,'Senha atual inválida.','ADMIN_CURRENT_PASSWORD_INVALID');const passwordHash=await hashPassword(next);await client.query('update admin_users set password_hash=$2,updated_at=now() where id=$1',[userId,passwordHash]);if(currentToken)await client.query('delete from admin_sessions where user_id=$1 and token_hash<>$2',[userId,sha256(currentToken)]);else await client.query('delete from admin_sessions where user_id=$1',[userId]);return {changed:true}})}catch(error){throw authSchemaError(error)}
  },
}

export const authInternals={normalizeEmail,sha256,safeEqualText}
