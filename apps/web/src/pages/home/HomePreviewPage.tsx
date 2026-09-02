import {useEffect,useMemo,useState} from 'react'
import {HomePageRenderer,type HomeRenderedSectionId,type HomeSectionConfigurationMap} from './HomePageRenderer'
import {loadPublicHomeSections,readInitialHomeSections} from '../../features/site-manager/homeSectionConfigRepository'
import {HOME_PREVIEW_MESSAGE} from '../../features/site-manager/components/HomePagePreviewFrame'
import type {SectionConfiguration} from '../../features/site-manager/sectionConfiguration'
import './styles/home-admin-preview.css'

type PreviewPayload={type:string;sectionId?:HomeRenderedSectionId;configuration?:SectionConfiguration}

export function HomePreviewPage(){
  const [persisted,setPersisted]=useState<HomeSectionConfigurationMap>(()=>readInitialHomeSections())
  const [draft,setDraft]=useState<Partial<HomeSectionConfigurationMap>>({})
  const [selected,setSelected]=useState<HomeRenderedSectionId|null>(null)
  const configurations=useMemo(()=>({...persisted,...draft}),[persisted,draft])

  useEffect(()=>{
    let active=true
    void loadPublicHomeSections().then(value=>{if(active)setPersisted(value)}).catch(error=>console.error('Falha ao carregar a configuração persistida para o preview da Home.',error))
    return()=>{active=false}
  },[])

  useEffect(()=>{
    const receive=(event:MessageEvent<PreviewPayload>)=>{
      if(event.origin!==window.location.origin)return
      const payload=event.data
      if(!payload||payload.type!==HOME_PREVIEW_MESSAGE||!payload.sectionId||!payload.configuration)return
      setDraft(current=>({...current,[payload.sectionId!]:payload.configuration!}))
      setSelected(payload.sectionId)
    }
    window.addEventListener('message',receive)
    return()=>window.removeEventListener('message',receive)
  },[])

  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      document.querySelectorAll('.home-admin-preview-target').forEach(node=>node.classList.remove('home-admin-preview-target'))
      if(!selected)return
      const target=document.querySelector(`[data-home-section="${selected}"]`)
      if(target instanceof HTMLElement){
        target.classList.add('home-admin-preview-target')
        target.scrollIntoView({block:'center'})
      }
    },50)
    return()=>window.clearTimeout(timer)
  },[selected,configurations])

  return <HomePageRenderer sectionConfigurations={configurations} hydrated/>
}
