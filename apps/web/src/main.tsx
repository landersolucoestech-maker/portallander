import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router-dom'
import App from './app/PortalApp'
import {loadPublicEditorialSnapshot} from './features/editorial/apiClient'
import {withDevelopmentCmsOverrides} from './features/site-manager/developmentCmsOverlay'
import {contentDraftRepository} from './features/site-manager/contentDraftRepository'
import {sitePageRepository} from './features/site-manager/pageRepository'
import {bootstrapPublishedSiteForms} from './features/site-manager/forms/runtimeClient'
import {mockDataProvider} from './shared/data/mockDataProvider'
import {withEditorialSnapshot} from './shared/data/editorialOverlayDataProvider'
import type {ApplicationDataProvider} from './shared/data/dataProvider'
import {prepareMockSeedStorage} from './shared/data/mockSeedLifecycle'
import {setRuntimeDataProvider} from './shared/data/runtimeDataProvider'
import {scenarioController} from './shared/data/scenarioController'
import {purgeRemovedModuleStorage} from './shared/internal/legacyStorageCleanup'
import {installRhMarketingTableSorting} from './shared/internal/tableSortEnhancer'
import {installAutoTablePagination} from './shared/internal/autoTablePagination'
import './styles/public-styles.css'

let editorialBaseProvider:ApplicationDataProvider=mockDataProvider
const applyDevelopmentCmsPreview=()=>setRuntimeDataProvider(withDevelopmentCmsOverrides(editorialBaseProvider))
applyDevelopmentCmsPreview()
scenarioController.bootstrapFromLocation()
prepareMockSeedStorage()
purgeRemovedModuleStorage()

const queryClient=new QueryClient()

const REQUIRED_PUBLIC_FONTS = [
  '400 16px "Bebas Neue"','400 16px "Montserrat"','500 16px "Montserrat"','600 16px "Montserrat"','700 16px "Montserrat"','800 16px "Montserrat"',
]

async function waitForPublicFonts() {
  if (!document.fonts?.load) return
  await Promise.all(REQUIRED_PUBLIC_FONTS.map(font => document.fonts.load(font)))
  await document.fonts.ready
}

async function bootstrapEditorialData(){
  try{
    const snapshot=await loadPublicEditorialSnapshot()
    if(snapshot){editorialBaseProvider=withEditorialSnapshot(mockDataProvider,snapshot);applyDevelopmentCmsPreview()}
  }catch(error){
    console.warn('[Portal Lander] API editorial indisponível; mantendo provider atual.',error)
  }
}

async function bootstrapForms(){
  try{await bootstrapPublishedSiteForms()}
  catch(error){console.warn('[Portal Lander] API de formulários indisponível; mantendo definições seed.',error)}
}

function mountApp() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode><QueryClientProvider client={queryClient}><HashRouter><App/></HashRouter></QueryClientProvider></React.StrictMode>,
  )
  requestAnimationFrame(()=>{
    installRhMarketingTableSorting()
    installAutoTablePagination()
  })
}

window.addEventListener(sitePageRepository.eventName,applyDevelopmentCmsPreview)
window.addEventListener(contentDraftRepository.eventName,applyDevelopmentCmsPreview)

void Promise.all([
  waitForPublicFonts().catch(()=>undefined),
  bootstrapEditorialData(),
  bootstrapForms(),
]).finally(() => {
  document.documentElement.classList.remove('pl-fonts-loading')
  document.documentElement.classList.add('pl-fonts-ready')
  mountApp()
})
