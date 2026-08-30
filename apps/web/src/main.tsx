import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router-dom'
import App from './app/PortalApp'
import {registerDataProvider} from './shared/data/dataProvider'
import {mockDataProvider} from './shared/data/mockDataProvider'
import {purgeRemovedModuleStorage} from './shared/internal/legacyStorageCleanup'
import './styles/public-styles.css'

registerDataProvider(mockDataProvider)
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

function mountApp() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode><QueryClientProvider client={queryClient}><HashRouter><App/></HashRouter></QueryClientProvider></React.StrictMode>,
  )
}

void waitForPublicFonts().catch(() => undefined).finally(() => {
  document.documentElement.classList.remove('pl-fonts-loading')
  document.documentElement.classList.add('pl-fonts-ready')
  mountApp()
})
