import {ArrowLeft,Printer} from 'lucide-react'
import {useEffect,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import type {MediaKitDraft} from '../mediaKitDomain'
import {mediaKitRepository} from '../mediaKitRepository'
import {MediaKitDocument} from './MediaKitDocument'
import './media-kit-preview.css'

export function MediaKitPreviewPage(){
 const navigate=useNavigate()
 const [kit,setKit]=useState<MediaKitDraft>()
 const [error,setError]=useState('')
 useEffect(()=>{let active=true;mediaKitRepository.read().then(value=>{if(active)setKit(value)}).catch(caught=>{if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar o Mídia Kit.')});return()=>{active=false}},[])
 if(!kit)return <main className="mk-preview-loading">{error||'Carregando preview…'}</main>
 return <div className="mk-preview-shell"><div className="mk-preview-toolbar" role="toolbar" aria-label="Controles do Preview do Mídia Kit"><button type="button" onClick={()=>navigate('/app/site/midia-kit')} aria-label="Voltar ao editor do Mídia Kit"><ArrowLeft size={16}/>Editor</button><span>{kit.status==='published'?`Versão publicada v${kit.version}`:`Preview do rascunho v${kit.version}`}</span><button type="button" onClick={()=>window.print()} aria-label="Gerar ou baixar PDF do Mídia Kit"><Printer size={16}/>Gerar / Baixar PDF</button></div><MediaKitDocument kit={kit}/></div>
}
