import {HttpError} from './editorialService.js'
import {googleAnalyticsConfig} from './googleAnalyticsProvider.js'

const AUTENTIQUE_DEFAULT_URL='https://api.autentique.com.br/v2/graphql'
const META_GRAPH_BASE='https://graph.facebook.com'
const REQUEST_TIMEOUT_MS=15_000
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/

const clean=value=>String(value??'').trim()
const timeoutSignal=()=>AbortSignal.timeout(REQUEST_TIMEOUT_MS)

function providerError(provider,response,payload){
  const detail=clean(payload?.error?.message||payload?.message||payload?.errors?.[0]?.message)
  return new HttpError(response.status>=500?502:response.status,detail||`${provider} respondeu ${response.status}.`,`${provider.toUpperCase()}_REQUEST_FAILED`,{providerStatus:response.status})
}

async function jsonRequest(url,{method='GET',headers={},body}={}){
  let response
  try{response=await fetch(url,{method,headers,body,signal:timeoutSignal()})}
  catch(error){
    if(error?.name==='TimeoutError')throw new HttpError(504,'O provedor excedeu o tempo limite de resposta.','PROVIDER_TIMEOUT')
    throw new HttpError(503,'Não foi possível conectar ao provedor.','PROVIDER_NETWORK_ERROR')
  }
  const payload=await response.json().catch(()=>({}))
  return {response,payload}
}

export function normalizeWhatsappRecipient(value){
  const digits=clean(value).replace(/\D/g,'')
  if(digits.length<10||digits.length>15)throw new HttpError(400,'Número de WhatsApp inválido. Use código do país + DDD + número.','WHATSAPP_RECIPIENT_INVALID')
  return digits
}

export function integrationProviderConfig(env=process.env){
  return {
    autentique:{configured:Boolean(clean(env.AUTENTIQUE_API_TOKEN)),apiUrl:clean(env.AUTENTIQUE_API_URL)||AUTENTIQUE_DEFAULT_URL},
    whatsapp:{configured:Boolean(clean(env.WHATSAPP_ACCESS_TOKEN)&&clean(env.WHATSAPP_PHONE_NUMBER_ID)&&clean(env.WHATSAPP_GRAPH_API_VERSION)),phoneNumberId:clean(env.WHATSAPP_PHONE_NUMBER_ID),graphVersion:clean(env.WHATSAPP_GRAPH_API_VERSION),verifyTokenConfigured:Boolean(clean(env.WHATSAPP_WEBHOOK_VERIFY_TOKEN))},
    spotify:{configured:Boolean(clean(env.SPOTIFY_CLIENT_ID)&&clean(env.SPOTIFY_CLIENT_SECRET)&&clean(env.SPOTIFY_REDIRECT_URI)&&clean(env.SPOTIFY_TOKEN_ENCRYPTION_KEY))},
    resend:{configured:Boolean(clean(env.RESEND_API_KEY))},
    google:{configured:googleAnalyticsConfig(env).configured},
  }
}

function autentiqueCredentials(){
  const token=clean(process.env.AUTENTIQUE_API_TOKEN),apiUrl=clean(process.env.AUTENTIQUE_API_URL)||AUTENTIQUE_DEFAULT_URL
  if(!token)throw new HttpError(503,'Autentique ainda não está configurado no backend.','AUTENTIQUE_NOT_CONFIGURED')
  return {token,apiUrl}
}

export const autentiqueProvider={
  configured(){return integrationProviderConfig().autentique.configured},
  async graphql(query,variables={}){
    const {token,apiUrl}=autentiqueCredentials()
    const {response,payload}=await jsonRequest(apiUrl,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({query,variables})})
    if(!response.ok||payload?.errors?.length)throw providerError('autentique',response,payload)
    return payload?.data??{}
  },
  async testConnection(){await this.graphql('query PortalLanderIntegrationProbe { __typename }');return {ok:true,provider:'autentique'}},
  async createDocument({name,signers,file}){
    const documentName=clean(name)
    if(!documentName)throw new HttpError(400,'Informe o nome do documento.','AUTENTIQUE_DOCUMENT_NAME_REQUIRED')
    if(!file?.buffer?.length)throw new HttpError(400,'Envie o PDF que será encaminhado para assinatura.','AUTENTIQUE_DOCUMENT_FILE_REQUIRED')
    if(file.mimeType!=='application/pdf'||file.buffer.subarray(0,5).toString('ascii')!=='%PDF-')throw new HttpError(415,'O Autentique exige um arquivo PDF válido neste fluxo.','AUTENTIQUE_DOCUMENT_FILE_INVALID')
    const normalized=(Array.isArray(signers)?signers:[]).map((item,index)=>({name:clean(item?.name),email:clean(item?.email).toLowerCase(),action:'SIGN',order:Number(item?.order)||index+1})).sort((a,b)=>a.order-b.order)
    if(!normalized.length)throw new HttpError(400,'Configure ao menos um signatário.','AUTENTIQUE_SIGNERS_REQUIRED')
    if(normalized.some(item=>!EMAIL_RE.test(item.email)))throw new HttpError(400,'Todos os signatários precisam de um e-mail válido.','AUTENTIQUE_SIGNER_EMAIL_INVALID')
    const query='mutation CreateDocumentMutation($document: DocumentInput!, $signers: [SignerInput!]!, $file: Upload!) { createDocument(document: $document, signers: $signers, file: $file) { id name created_at signatures { public_id name email created_at action { name } link { short_link } } } }'
    const variables={document:{name:documentName},signers:normalized.map(item=>({email:item.email,action:item.action})),file:null}
    const form=new FormData()
    form.append('operations',JSON.stringify({query,variables}))
    form.append('map',JSON.stringify({file:['variables.file']}))
    form.append('file',new Blob([file.buffer],{type:'application/pdf'}),file.filename||'documento.pdf')
    const {token,apiUrl}=autentiqueCredentials()
    let response
    try{response=await fetch(apiUrl,{method:'POST',headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},body:form,signal:timeoutSignal()})}
    catch(error){if(error?.name==='TimeoutError')throw new HttpError(504,'O Autentique excedeu o tempo limite de resposta.','AUTENTIQUE_TIMEOUT');throw new HttpError(503,'Não foi possível conectar ao Autentique.','AUTENTIQUE_NETWORK_ERROR')}
    const payload=await response.json().catch(()=>({}))
    if(!response.ok||payload?.errors?.length)throw providerError('autentique',response,payload)
    const document=payload?.data?.createDocument
    if(!document?.id)throw new HttpError(502,'Autentique não retornou o identificador do documento.','AUTENTIQUE_RESPONSE_INVALID')
    return {provider:'autentique',externalId:String(document.id),name:clean(document.name)||documentName,createdAt:document.created_at||null,signatures:Array.isArray(document.signatures)?document.signatures:[]}
  },
}

function whatsappBase(){
  const token=clean(process.env.WHATSAPP_ACCESS_TOKEN),phoneNumberId=clean(process.env.WHATSAPP_PHONE_NUMBER_ID),graphVersion=clean(process.env.WHATSAPP_GRAPH_API_VERSION)
  if(!token||!phoneNumberId||!graphVersion)throw new HttpError(503,'WhatsApp ainda não possui Access Token, Phone Number ID e versão da Graph API configurados.','WHATSAPP_NOT_CONFIGURED')
  return {token,phoneNumberId,base:`${META_GRAPH_BASE}/${encodeURIComponent(graphVersion)}`}
}

export const whatsappProvider={
  configured(){return integrationProviderConfig().whatsapp.configured},
  async testConnection(){
    const {token,phoneNumberId,base}=whatsappBase()
    const {response,payload}=await jsonRequest(`${base}/${encodeURIComponent(phoneNumberId)}?fields=id,display_phone_number,verified_name`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}})
    if(!response.ok)throw providerError('whatsapp',response,payload)
    return {ok:true,provider:'whatsapp',account:{id:payload.id||phoneNumberId,displayPhoneNumber:payload.display_phone_number||'',verifiedName:payload.verified_name||''}}
  },
  async sendText({to,text}){
    const recipient=normalizeWhatsappRecipient(to),message=clean(text)
    if(!message||message.length>4096)throw new HttpError(400,'A mensagem deve conter entre 1 e 4096 caracteres.','WHATSAPP_MESSAGE_INVALID')
    const {token,phoneNumberId,base}=whatsappBase()
    const {response,payload}=await jsonRequest(`${base}/${encodeURIComponent(phoneNumberId)}/messages`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({messaging_product:'whatsapp',recipient_type:'individual',to:recipient,type:'text',text:{preview_url:false,body:message}})})
    if(!response.ok)throw providerError('whatsapp',response,payload)
    const messageId=clean(payload?.messages?.[0]?.id)
    if(!messageId)throw new HttpError(502,'WhatsApp não retornou o ID da mensagem enviada.','WHATSAPP_RESPONSE_INVALID')
    return {provider:'whatsapp',messageId,to:recipient}
  },
}

export function integrationRuntimeStatus(){
  const cfg=integrationProviderConfig()
  return {
    autentique:{implementation:'partial',configured:cfg.autentique.configured},meta:{implementation:'planned',configured:false},tiktok:{implementation:'planned',configured:false},google:{implementation:'partial',configured:cfg.google.configured},spotify:{implementation:'partial',configured:cfg.spotify.configured},nfe:{implementation:'planned',configured:false},whatsapp:{implementation:'partial',configured:cfg.whatsapp.configured,webhookVerifyTokenConfigured:cfg.whatsapp.verifyTokenConfigured},resend:{implementation:'partial',configured:cfg.resend.configured},
  }
}
