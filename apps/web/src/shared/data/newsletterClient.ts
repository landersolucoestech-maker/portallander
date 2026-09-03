export class NewsletterApiError extends Error{
  status:number
  code:string
  constructor(message:string,status:number,code='NEWSLETTER_API_ERROR'){super(message);this.name='NewsletterApiError';this.status=status;this.code=code}
}

type ApiErrorBody={message?:string;code?:string}
const apiBase=()=>String(import.meta.env.VITE_PORTAL_API_BASE_URL??'').trim().replace(/\/$/,'')

export async function subscribeNewsletter(email:string){
  const base=apiBase()
  if(!base)throw new NewsletterApiError('A API da Newsletter ainda não está configurada.',503,'NEWSLETTER_API_NOT_CONFIGURED')
  const response=await fetch(`${base}/api/newsletter/subscribe`,{
    method:'POST',
    credentials:'include',
    headers:{Accept:'application/json','Content-Type':'application/json'},
    body:JSON.stringify({email,source:'home-newsletter',consentVersion:'v1',website:''}),
  })
  const body=await response.json().catch(()=>({})) as ApiErrorBody&{ok?:boolean;synced?:boolean;message?:string}
  if(!response.ok)throw new NewsletterApiError(body.message||`A Newsletter respondeu ${response.status}.`,response.status,body.code)
  return {ok:Boolean(body.ok),synced:Boolean(body.synced),message:body.message||'Inscrição realizada com sucesso.'}
}
