import { PenLine } from 'lucide-react'

export function SigningPlatformBadge({platform}:{platform?:string|null}){
  if(!platform||platform==='Sem plataforma'||platform==='—')return <span className="zip-badge">Sem plataforma</span>
  return <span className="zip-badge contracts-platform-badge"><PenLine size={11}/>{platform}</span>
}
