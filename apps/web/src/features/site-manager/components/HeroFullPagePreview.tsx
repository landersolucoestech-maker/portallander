import {Monitor,Smartphone,Tablet} from 'lucide-react'
import {useCallback,useEffect,useRef,useState} from 'react'
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
  const iframeRef=useRef<HTMLIFrameElement>(null)
  const frameRequestRef=useRef<number|null>(null)
  const width=widths[viewport]
  const src=`${window.location.origin}${window.location.pathname}#/_preview/home`

  const syncLiveHero=useCallback(()=>{
    const source=document.querySelector<HTMLElement>('.home-hero-config-rail .hero-cms-preview-stage')
    const frameDocument=iframeRef.current?.contentDocument
    if(!source||!frameDocument)return

    const sourceHero=source.querySelector<HTMLElement>('.editorial-hero')
    const targetHero=frameDocument.querySelector<HTMLElement>('.editorial-hero')
    if(sourceHero&&targetHero){
      const heroClone=sourceHero.cloneNode(true) as HTMLElement
      const sourceBackground=sourceHero.querySelector<HTMLElement>('.editorial-hero-background')
      const clonedBackground=heroClone.querySelector<HTMLElement>('.editorial-hero-background')
      if(sourceBackground&&clonedBackground){
        const computed=getComputedStyle(sourceBackground)
        clonedBackground.style.backgroundImage=computed.backgroundImage
        clonedBackground.style.backgroundPosition=computed.backgroundPosition
        clonedBackground.style.backgroundSize=computed.backgroundSize
        clonedBackground.style.backgroundRepeat=computed.backgroundRepeat
      }
      heroClone.dataset.liveAdminPreview='true'
      targetHero.replaceWith(heroClone)
    }

    const sourceTicker=source.querySelector<HTMLElement>('.editorial-ticker')
    const targetTicker=frameDocument.querySelector<HTMLElement>('.editorial-ticker')
    if(sourceTicker&&targetTicker){
      const tickerClone=sourceTicker.cloneNode(true) as HTMLElement
      tickerClone.dataset.liveAdminPreview='true'
      targetTicker.replaceWith(tickerClone)
    }
  },[])

  const scheduleLiveSync=useCallback(()=>{
    if(frameRequestRef.current!==null)cancelAnimationFrame(frameRequestRef.current)
    frameRequestRef.current=requestAnimationFrame(()=>{
      frameRequestRef.current=null
      syncLiveHero()
    })
  },[syncLiveHero])

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
    scheduleLiveSync()
    const workbench=document.querySelector('.home-hero-section-workbench')
    const rail=document.querySelector('.home-hero-config-rail')
    if(!workbench||!rail)return

    const onFieldInput=()=>queueMicrotask(scheduleLiveSync)
    rail.addEventListener('input',onFieldInput,true)
    rail.addEventListener('change',onFieldInput,true)
    rail.addEventListener('click',onFieldInput,true)

    const observer=new MutationObserver(()=>{
      syncEditorViewport(viewport)
      scheduleLiveSync()
    })
    observer.observe(workbench,{attributes:true,childList:true,subtree:true,characterData:true})

    return()=>{
      observer.disconnect()
      rail.removeEventListener('input',onFieldInput,true)
      rail.removeEventListener('change',onFieldInput,true)
      rail.removeEventListener('click',onFieldInput,true)
    }
  },[viewport,scheduleLiveSync])

  useEffect(()=>()=>{
    if(frameRequestRef.current!==null)cancelAnimationFrame(frameRequestRef.current)
  },[])

  const selectViewport=(next:SectionHeroViewport)=>{
    setViewport(next)
    syncEditorViewport(next)
    queueMicrotask(scheduleLiveSync)
  }

  return <aside className="home-hero-full-preview" aria-label="Preview completo da Página Inicial">
    <div className="home-hero-full-preview-head">
      <div><h2>Preview da página inteira</h2><p>{labels[viewport]} · edição independente por dispositivo · alterações refletidas ao vivo antes de salvar.</p></div>
      <div className="home-hero-full-preview-devices" aria-label="Viewport do preview">
        <button type="button" className={viewport==='desktop'?'active':''} onClick={()=>selectViewport('desktop')} aria-label="Desktop"><Monitor size={17}/></button>
        <button type="button" className={viewport==='tablet'?'active':''} onClick={()=>selectViewport('tablet')} aria-label="Tablet"><Tablet size={17}/></button>
        <button type="button" className={viewport==='mobile'?'active':''} onClick={()=>selectViewport('mobile')} aria-label="Mobile"><Smartphone size={17}/></button>
      </div>
    </div>
    <div className="home-hero-full-preview-canvas" data-preview-viewport={viewport}>
      <div className="home-hero-full-preview-scroll">
        <iframe ref={iframeRef} key={revision} title={`Preview completo da Página Inicial · ${viewport}`} src={src} style={{width}} onLoad={scheduleLiveSync}/>
      </div>
    </div>
  </aside>
}
