import type {ContentCollaboration} from './domain'

const apiBase=()=>String(import.meta.env.VITE_PORTAL_API_BASE_URL??'').trim().replace(/\/$/,'')

export class CollaborationApiError extends Error{
  status?:number
  constructor(message:string,status?:number){super(message);this.name='CollaborationApiError';this.status=status}
}

export async function listContentCollaborations(signal?:AbortSignal):Promise<ContentCollaboration[]>{
  const base=apiBase()
  if(!base)throw new CollaborationApiError('A API do Portal Lander ainda não foi configurada neste ambiente.')
  const response=await fetch(`${base}/api/forms/editorial/collaborations`,{headers:{Accept:'application/json'},signal}).catch(error=>{
    if(error instanceof DOMException&&error.name==='AbortError')throw error
    throw new CollaborationApiError('O serviço de Colaborações recebidas está indisponível.')
  })
  const data=await response.json().catch(()=>null) as {items?:ContentCollaboration[];message?:string}|ContentCollaboration[]|null
  if(!response.ok)throw new CollaborationApiError((data&&!Array.isArray(data)&&data.message)||'Não foi possível carregar as colaborações.',response.status)
  return Array.isArray(data)?data:data?.items??[]
}
