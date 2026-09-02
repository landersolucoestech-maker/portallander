import {useCallback,useEffect,useRef} from 'react'
import type {SectionConfiguration,SectionHeroViewport} from '../sectionConfiguration'
import type {HomeRenderedSectionId} from '../../../pages/home/HomePageRenderer'
import '../../../styles/home-page-preview-frame.css'

export const HOME_PREVIEW_WIDTHS:Record<SectionHeroViewport,number>={desktop:1433,tablet:768,mobile:390}
export const HOME_PREVIEW_MESSAGE='portal-lander:home-page-preview'

export type HomePreviewMessage={
  type:typeof HOME_PREVIEW_MESSAGE
  sectionId:HomeRenderedSectionId
  configuration:SectionConfiguration
}

export function HomePagePreviewFrame({sectionId,configuration,viewport}:{sectionId:HomeRenderedSectionId;configuration:SectionConfiguration;viewport:SectionHeroViewport}){
  const iframeRef=useRef<HTMLIFrameElement>(null)
  const width=HOME_PREVIEW_WIDTHS[viewport]
  const src=`${window.location.origin}${window.location.pathname}#/_preview/home`
  const send=useCallback(()=>{
    const target=iframeRef.current?.contentWindow
    if(!target)return
    const message:HomePreviewMessage={type:HOME_PREVIEW_MESSAGE,sectionId,configuration}
    target.postMessage(message,window.location.origin)
  },[sectionId,configuration])

  useEffect(()=>{send()},[send,viewport])

  return <div className="home-page-preview-shell" data-preview-viewport={viewport}>
    <div className="home-page-preview-scroll">
      <iframe ref={iframeRef} className="home-page-preview-iframe" title={`Preview completo da Página Inicial · ${viewport}`} src={src} style={{width}} onLoad={send}/>
    </div>
  </div>
}
