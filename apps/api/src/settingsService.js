import {getPool,withTransaction} from './db.js'
import {authService} from './authService.js'
import {HttpError} from './editorialService.js'
import {integrationRuntimeStatus} from './integrationProviderService.js'

const text=value=>value===undefined||value===null?'':String(value).trim()
const emptyCompany=()=>({legalName:'',tradeName:'',cnpj:'',address:'',phone:'',responsible:'',slug:'',logoUrl:''})
const sanitizeCompany=input=>({legalName:text(input?.legalName),tradeName:text(input?.tradeName),cnpj:text(input?.cnpj),address:text(input?.address),phone:text(input?.phone),responsible:text(input?.responsible),slug:text(input?.slug),logoUrl:''})
const roles=[
 {id:'owner',slug:'owner',name:'Owner',description:'Proprietário administrativo do portal.',archived:false,system:true,permissions:['administrative']},
 {id:'admin',slug:'admin',name:'Admin',description:'Administrador do portal.',archived:false,system:true,permissions:['administrative']},
 {id:'editor',slug:'editor',name:'Editor',description:'Perfil editorial sem herança de acesso administrativo.',archived:false,system:true,permissions:['editorial']},
]
async function ensureRow(client,userId=null){await client.query("insert into settings_admin_state(id,company,created_by,updated_by) values('primary',$1,$2,$2) on conflict (id) do nothing",[JSON.stringify(emptyCompany()),userId]);return (await client.query("select company,version,updated_at from settings_admin_state where id='primary'")).rows[0]}
async function listUsers(){const {rows}=await getPool().query('select id,email,display_name,role,active,created_at from admin_users order by created_at asc,id asc');return rows.map(row=>({id:row.id,name:text(row.display_name)||row.email,email:row.email,role:row.role,phone:'',createdAt:row.created_at,status:row.active?'ativo':'inativo'}))}
function integrations(){const runtime=integrationRuntimeStatus();return Object.entries(runtime).map(([id,value])=>({id,name:id==='google'?'Google Analytics':id==='whatsapp'?'WhatsApp':id==='autentique'?'Autentique':id==='resend'?'Resend':id==='spotify'?'Spotify':id.toUpperCase(),category:'Integrações',description:value.configured?'Configuração detectada no backend.':'Não configurado neste ambiente.',status:value.configured?'connected':value.implementation==='planned'?'unavailable':'available',logo:id.slice(0,2).toUpperCase(),actionLabel:value.configured?'CONFIGURADO':'NÃO CONFIGURADO'}))}
export const settingsService={
 async state(userId,currentToken=''){
  const row=await ensureRow(getPool()),sessions=currentToken?await authService.listSessions(userId,currentToken):[]
  return {company:{...emptyCompany(),...(row?.company||{}),logoUrl:''},automations:[],integrations:integrations(),users:await listUsers(),roles,invites:[],audit:[],security:{passwordChange:true,twoFactor:false,sessionList:Boolean(currentToken),revokeOtherSessions:Boolean(currentToken),deleteAccount:false,sessions},runtime:{automation:false,userInvites:false,roleMutation:false,userRemoval:false,companyLogoUpload:false,websiteEmbed:false},meta:{version:Number(row?.version||1),updatedAt:row?.updated_at?new Date(row.updated_at).toISOString():''}}
 },
 async saveCompany(input,userId){return withTransaction(async client=>{await ensureRow(client,userId);const company=sanitizeCompany(input);const {rows}=await client.query("update settings_admin_state set company=$1,version=version+1,created_by=coalesce(created_by,$2),updated_by=$2 where id='primary' returning company,version,updated_at",[JSON.stringify(company),userId]);return {company:rows[0].company,version:Number(rows[0].version),updatedAt:new Date(rows[0].updated_at).toISOString()}})},
 async changePassword(userId,currentToken,input){if(!currentToken)throw new HttpError(409,'Troca de senha disponível apenas para sessão autenticada.','SETTINGS_SESSION_REQUIRED');return authService.changePassword(userId,{currentPassword:input?.currentPassword,newPassword:input?.newPassword,currentToken})},
 async revokeOtherSessions(userId,currentToken){return authService.revokeOtherSessions(userId,currentToken)},
}
