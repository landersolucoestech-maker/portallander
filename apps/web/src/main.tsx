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
import {withEditorialSnapshot} from './shared/data/editorialOverlayDataProvider'
import type {ApplicationDataProvider} from './shared/data/dataProvider'
import {hasRuntimeDataProvider,setRuntimeDataProvider} from './shared/data/runtimeDataProvider'
import {scenarioController} from './shared/data/scenarioController'
import {purgeRemovedModuleStorage} from './shared/internal/legacyStorageCleanup'
import {installRhMarketingTableSorting} from './shared/internal/tableSortEnhancer'
import {installAutoTablePagination} from './shared/internal/autoTablePagination'
import './styles/public-styles.css'

const demoDataEnabled=import.meta.env.DEV||import.meta.env.VITE_ENABLE_DEMO_DATA==='true'
let editorialBaseProvider:ApplicationDataProvider|null=null

const applyDevelopmentCmsPreview=()=>{
  if(editorialBaseProvider)setRuntimeDataProvider(withDevelopmentCmsOverrides(editorialBaseProvider))
}

async function bootstrapExplicitDemoData(){
  if(!demoDataEnabled)return
  const [{mockDataProvider},{prepareMockSeedStorage}]=await Promise.all([
    import('./shared/data/mockDataProvider'),
    import('./shared/data/mockSeedLifecycle'),
  ])
  editorialBaseProvider=mockDataProvider
  applyDevelopmentCmsPreview()
  scenarioController.bootstrapFromLocation()
  prepareMockSeedStorage()
}

purgeRemovedModuleStorage()

const queryClient=new QueryClient()

const REQUIRED_PUBLIC_FONTS = [
  '400 16px "Bebas Neue"','400 16px "Montserrat"','500 16px "Montserrat"','600 16px "Montserrat"','700 16px "Montserrat"','800 16px "Montserrat"',
]
const FONT_BOOTSTRAP_TIMEOUT_MS=3000

async function waitForPublicFonts() {
  if (!document.fonts?.load) return
  const fontLoad=Promise.all(REQUIRED_PUBLIC_FONTS.map(font => document.fonts.load(font))).then(()=>document.fonts.ready).then(()=>undefined)
  await Promise.race([
    fontLoad,
    new Promise<void>(resolve=>window.setTimeout(resolve,FONT_BOOTSTRAP_TIMEOUT_MS)),
  ])
}

async function bootstrapEditorialData(){
  try{
    const snapshot=await loadPublicEditorialSnapshot()
    if(snapshot&&editorialBaseProvider){editorialBaseProvider=withEditorialSnapshot(editorialBaseProvider,snapshot);applyDevelopmentCmsPreview()}
  }catch(error){
    console.warn('[Portal Lander] API editorial indisponível; nenhuma fonte real foi substituída por mock.',error)
  }
}

async function bootstrapForms(){
  try{await bootstrapPublishedSiteForms()}
  catch(error){console.warn('[Portal Lander] API de formulários indisponível; nenhuma definição mock foi promovida a produção.',error)}
}

function mountApp() {
  const root=document.getElementById('root')!
  if(!hasRuntimeDataProvider()){
    ReactDOM.createRoot(root).render(
      <React.StrictMode><main role="main" className="runtime-data-unavailable"><h1>Portal Lander</h1><p>Dados operacionais indisponíveis.</p><p>O provider real ainda não foi configurado para este ambiente.</p></main></React.StrictMode>,
    )
    return
  }
  ReactDOM.createRoot(root).render(
    <React.StrictMode><QueryClientProvider client={queryClient}><HashRouter><App/></HashRouter></QueryClientProvider></React.StrictMode>,
  )
  requestAnimationFrame(()=>{
    installRhMarketingTableSorting()
    installAutoTablePagination()
  })
}

window.addEventListener(sitePageRepository.eventName,applyDevelopmentCmsPreview)
window.addEventListener(contentDraftRepository.eventName,applyDevelopmentCmsPreview)

void bootstrapExplicitDemoData().then(()=>Promise.all([
  waitForPublicFonts().catch(()=>undefined),
  bootstrapEditorialData(),
  bootstrapForms(),
])).finally(() => {
  document.documentElement.classList.remove('pl-fonts-loading')
  document.documentElement.classList.add('pl-fonts-ready')
  mountApp()
})
