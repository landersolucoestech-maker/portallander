import {useEffect,useState} from 'react'
import {loadPublicHomeSections,readInitialHomeSections,type HomeSectionConfigurationMap} from '../../features/site-manager/homeSectionConfigRepository'
import {isSectionConfigurationApiConfigured} from '../../shared/data/sectionConfigurationClient'
import {SECTION_CONFIGURATION_EVENT} from '../../features/site-manager/sectionConfiguration'
import {HomePageRenderer} from './HomePageRenderer'

export function PublicHome(){
  const [sections,setSections]=useState<HomeSectionConfigurationMap>(()=>readInitialHomeSections())
  const [hydrated,setHydrated]=useState(false)

  useEffect(()=>{
    let active=true
    void loadPublicHomeSections().then(configurations=>{
      if(active)setSections(configurations)
    }).catch(error=>{
      if(active)console.error('Falha ao carregar as configurações públicas da Home.',error)
    }).finally(()=>{
      if(active)setHydrated(true)
    })
    return()=>{active=false}
  },[])

  useEffect(()=>{
    if(isSectionConfigurationApiConfigured())return
    const sync=()=>setSections(readInitialHomeSections())
    window.addEventListener(SECTION_CONFIGURATION_EVENT,sync)
    window.addEventListener('storage',sync)
    return()=>{window.removeEventListener(SECTION_CONFIGURATION_EVENT,sync);window.removeEventListener('storage',sync)}
  },[])

  return <HomePageRenderer sectionConfigurations={sections} hydrated={hydrated}/>
}
