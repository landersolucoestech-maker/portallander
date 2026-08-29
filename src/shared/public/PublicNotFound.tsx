import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PublicFooter, PublicHeader } from './PublicChrome'

export function PublicNotFound(){
  return <div className="public-page"><PublicHeader/><main className="public-shell editorial-empty-state public-not-found" role="main"><span>404</span><h1>Página não encontrada</h1><p>A rota solicitada não existe ou ainda não está publicada no Portal Lander.</p><Link className="button outline" to="/"><ArrowLeft size={16}/> Voltar para a página inicial</Link></main><PublicFooter/></div>
}
