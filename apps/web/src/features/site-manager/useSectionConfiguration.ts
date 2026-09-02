import {useEffect,useState} from 'react'
import {readSectionConfiguration,SECTION_CONFIGURATION_EVENT,type SectionConfiguration} from './sectionConfiguration'

export function useSectionConfiguration(pageId:string,sectionId:string,name?:string):SectionConfiguration{
  const [config,setConfig]=useState<SectionConfiguration>(()=>readSectionConfiguration(pageId,sectionId,name))
  useEffect(()=>{
    const sync=(event?:Event)=>{
      const detail=(event as CustomEvent<{pageId?:string;sectionId?:string}>|undefined)?.detail
      if(detail&&!(detail.pageId===pageId&&detail.sectionId===sectionId))return
      setConfig(readSectionConfiguration(pageId,sectionId,name))
    }
    const storage=()=>sync()
    window.addEventListener(SECTION_CONFIGURATION_EVENT,sync)
    window.addEventListener('storage',storage)
    return()=>{window.removeEventListener(SECTION_CONFIGURATION_EVENT,sync);window.removeEventListener('storage',storage)}
  },[pageId,sectionId,name])
  return config
}
