import {ChevronLeft,ChevronRight,ExternalLink,Maximize2,Minus,Plus} from 'lucide-react'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import type {MediaKitDraft} from '../mediaKitDomain'
import {MEDIA_KIT_PAGE_COUNT,MediaKitDocument} from './MediaKitDocument'
import './media-kit-preview.css'
import './media-kit-live-preview.css'

export function MediaKitLivePreview({kit}:{kit:MediaKitDraft}){
  const navigate=useNavigate()
  const [page,setPage]=useState(1)
  const [zoom,setZoom]=useState(52)
  const bounded=(value:number)=>Math.min(MEDIA_KIT_PAGE_COUNT,Math.max(1,value))
  const changeZoom=(value:number)=>setZoom(Math.min(85,Math.max(30,value)))
  return <aside className="site-media-kit-live-preview" aria-label="Live Preview do Mídia Kit" data-testid="media-kit-live-preview">
    <div className="site-media-kit-live-sticky">
      <header className="site-media-kit-live-head"><div><span>LIVE PREVIEW</span><strong>Página {page} de {MEDIA_KIT_PAGE_COUNT}</strong></div><button type="button" onClick={()=>navigate('/app/site/midia-kit/preview')}><ExternalLink size={14}/>Abrir preview completo</button></header>
      <div className="site-media-kit-live-toolbar" aria-label="Controles do preview">
        <button type="button" aria-label="Página anterior" onClick={()=>setPage(current=>bounded(current-1))} disabled={page===1}><ChevronLeft size={16}/></button>
        <label><span>Página</span><select aria-label="Página do Mídia Kit" value={page} onChange={event=>setPage(bounded(Number(event.target.value)))}>{Array.from({length:MEDIA_KIT_PAGE_COUNT},(_,index)=><option key={index+1} value={index+1}>{index+1} de {MEDIA_KIT_PAGE_COUNT}</option>)}</select></label>
        <button type="button" aria-label="Próxima página" onClick={()=>setPage(current=>bounded(current+1))} disabled={page===MEDIA_KIT_PAGE_COUNT}><ChevronRight size={16}/></button>
        <span className="site-media-kit-toolbar-divider"/>
        <button type="button" aria-label="Diminuir zoom" onClick={()=>changeZoom(zoom-5)}><Minus size={15}/></button><output aria-label="Zoom do preview">{zoom}%</output><button type="button" aria-label="Aumentar zoom" onClick={()=>changeZoom(zoom+5)}><Plus size={15}/></button>
        <button type="button" className="fit" onClick={()=>setZoom(52)} title="Ajustar à largura"><Maximize2 size={15}/>Fit</button>
      </div>
      <div className="site-media-kit-live-stage" style={{'--mk-live-scale':String(zoom/100)} as React.CSSProperties}>
        <div className="site-media-kit-live-document"><MediaKitDocument kit={kit} selectedPage={page}/></div>
      </div>
      <p className="site-media-kit-live-note">O preview usa o draft atual em memória e o mesmo <code>MediaKitDocument</code> utilizado pelo preview completo e pelo PDF. Nenhuma alteração precisa ser salva para aparecer aqui.</p>
    </div>
  </aside>
}
