import {Monitor,Smartphone,Tablet} from 'lucide-react'
import {useEffect,useState} from 'react'
import {HERO_APPEARANCE_EVENT} from '../../../pages/home/models/heroAppearanceModel'
import {HERO_BACKGROUND_EVENT} from '../../../pages/home/models/heroBackgroundModel'
import type {SectionHeroViewport} from '../sectionConfiguration'

const HERO_CONTENT_EVENT='portal-lander:hero-updated'
const widths:Record<SectionHeroViewport,number>={desktop:1433,tablet:768,mobile:390}

export function HeroFullPagePreview(){
  const [viewport,setViewport]=useState<SectionHeroViewport>('desktop')
  const [revision,setRevision]=useState(0)
  const width=widths[viewport]
  const src=`${window.location.origin}${window.location.pathname}#/_preview/home`

  useEffect(()=>{
    const reload=()=>setRevision(value=>value+1)
    window.addEventListener(HERO_CONTENT_EVENT,reload)
    window.addEventListener(HERO_APPEARANCE_EVENT,reload)
    window.addEventListener(HERO_BACKGROUND_EVENT,reload)
    return()=>{
      window.removeEventListener(HERO_CONTENT_EVENT,reload)
      window.removeEventListener(HERO_APPEARANCE_EVENT,reload)
      window.removeEventListener(HERO_BACKGROUND_EVENT,reload)
    }
  },[])

  return <aside className="home-hero-full-preview" aria-label="Preview completo da Página Inicial">
    <div className="home-hero-full-preview-head">
      <div><h2>Preview da página inteira</h2><p>Home pública completa · viewport real do iframe.</p></div>
      <div className="home-hero-full-preview-devices" aria-label="Viewport do preview">
        <button type="button" className={viewport==='desktop'?'active':''} onClick={()=>setViewport('desktop')} aria-label="Desktop"><Monitor size={17}/></button>
        <button type="button" className={viewport==='tablet'?'active':''} onClick={()=>setViewport('tablet')} aria-label="Tablet"><Tablet size={17}/></button>
        <button type="button" className={viewport==='mobile'?'active':''} onClick={()=>setViewport('mobile')} aria-label="Mobile"><Smartphone size={17}/></button>
      </div>
    </div>
    <div className="home-hero-full-preview-canvas" data-preview-viewport={viewport}>
      <div className="home-hero-full-preview-scroll">
        <iframe key={revision} title={`Preview completo da Página Inicial · ${viewport}`} src={src} style={{width}}/>
      </div>
    </div>
  </aside>
}
