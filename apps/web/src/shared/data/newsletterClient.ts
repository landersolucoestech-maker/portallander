export class NewsletterApiError extends Error{
  status:number
  code:string
  constructor(message:string,status:number,code='NEWSLETTER_API_ERROR'){super(message);this.name='NewsletterApiError';this.status=status;this.code=code}
}

type ApiErrorBody={message?:string;code?:string}
export type NewsletterStats={total:number;active:number;unsubscribed:number;sync_errors:number}
const apiBase=()=>String(import.meta.env.VITE_PORTAL_API_BASE_URL??'').trim().replace(/\/$/,'')

async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const base=apiBase()
  if(!base)throw new NewsletterApiError('A API da Newsletter ainda não está configurada.',503,'NEWSLETTER_API_NOT_CONFIGURED')
  const response=await fetch(`${base}${path}`,{
    ...init,
    credentials:'include',
    headers:{Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...init.headers},
  })
  const body=await response.json().catch(()=>({})) as ApiErrorBody&T
  if(!response.ok)throw new NewsletterApiError(body.message||`A Newsletter respondeu ${response.status}.`,response.status,body.code)
  return body
}

export async function subscribeNewsletter(email:string){
  const body=await request<{ok?:boolean;synced?:boolean;message?:string}>('/api/newsletter/subscribe',{
    method:'POST',
    body:JSON.stringify({email,source:'home-newsletter',consentVersion:'v1',website:''}),
  })
  return {ok:Boolean(body.ok),synced:Boolean(body.synced),message:body.message||'Inscrição realizada com sucesso.'}
}

export async function loadNewsletterStats(){
  const body=await request<{stats:NewsletterStats}>('/api/newsletter/stats')
  return body.stats
}
