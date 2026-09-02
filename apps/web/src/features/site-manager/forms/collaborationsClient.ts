import type {ContentCollaboration} from './domain'

const apiBase=()=>((import.meta.env.VITE_PUBLIC_API_URL as string|undefined)||'').replace(/\/$/,'')

export class CollaborationApiError extends Error{
  status?:number
  constructor(message:string,status?:number){super(message);this.name='CollaborationApiError';this.status=status}
}

export async function listContentCollaborations(signal?:AbortSignal):Promise<ContentCollaboration[]>{
  const response=await fetch(`${apiBase()}/api/forms/editorial/collaborations`,{headers:{Accept:'application/json'},signal}).catch(error=>{
    if(error instanceof DOMException&&error.name==='AbortError')throw error
    throw new CollaborationApiError('O serviço de Colaborações recebidas está indisponível.')
  })
  const data=await response.json().catch(()=>null) as {items?:ContentCollaboration[];message?:string}|ContentCollaboration[]|null
  if(!response.ok)throw new CollaborationApiError((data&&!Array.isArray(data)&&data.message)||'Não foi possível carregar as colaborações.',response.status)
  return Array.isArray(data)?data:data?.items??[]
}
