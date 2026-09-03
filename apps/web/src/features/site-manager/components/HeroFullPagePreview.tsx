import {Monitor,Smartphone,Tablet} from 'lucide-react'
import {useEffect,useState} from 'react'
import {HERO_APPEARANCE_EVENT} from '../../../pages/home/models/heroAppearanceModel'
import {HERO_BACKGROUND_EVENT} from '../../../pages/home/models/heroBackgroundModel'
import type {SectionHeroViewport} from '../sectionConfiguration'

const HERO_CONTENT_EVENT='portal-lander:hero-updated'
const widths:Record<SectionHeroViewport,number>={desktop:1433,tablet:768,mobile:390}
const labels:Record<SectionHeroViewport,string>={desktop:'Desktop',tablet:'Tablet',mobile:'Mobile'}

function syncEditorViewport(viewport:SectionHeroViewport){
  const label=labels[viewport]
  const button=document.querySelector<HTMLButtonElement>(`.home-hero-config-rail .hero-cms-preview-column button[aria-label="${label}"]`)
  button?.click()
}

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

  useEffect(()=>{
    syncEditorViewport(viewport)
    const rail=document.querySelector('.home-hero-config-rail')
    if(!rail)return
    const observer=new MutationObserver(()=>syncEditorViewport(viewport))
    observer.observe(rail,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[viewport])

  const selectViewport=(next:SectionHeroViewport)=>{
    setViewport(next)
    syncEditorViewport(next)
  }

  return <aside className="home-hero-full-preview" aria-label="Preview completo da Página Inicial">
    <div className="home-hero-full-preview-head">
      <div><h2>Preview da página inteira</h2><p>{labels[viewport]} · Home pública completa · o mesmo breakpoint controla os ajustes da Hero à esquerda.</p></div>
      <div className="home-hero-full-preview-devices" aria-label="Viewport do preview">
        <button type="button" className={viewport==='desktop'?'active':''} onClick={()=>selectViewport('desktop')} aria-label="Desktop"><Monitor size={17}/></button>
        <button type="button" className={viewport==='tablet'?'active':''} onClick={()=>selectViewport('tablet')} aria-label="Tablet"><Tablet size={17}/></button>
        <button type="button" className={viewport==='mobile'?'active':''} onClick={()=>selectViewport('mobile')} aria-label="Mobile"><Smartphone size={17}/></button>
      </div>
    </div>
    <div className="home-hero-full-preview-canvas" data-preview-viewport={viewport}>
      <div className="home-hero-full-preview-scroll">
        <iframe key={revision} title={`Preview completo da Página Inicial · ${viewport}`} src={src} style={{width}}/>
      </div>
    </div>
  </aside>
}
