import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './app/PortalApp'
import { HomeAdBridge } from './pages/home/components/HomeAdBridge'
import { HeaderBrandBridge } from './shared/branding/components/HeaderBrandBridge'
import { BrandAssetsBridge } from './shared/branding/components/BrandAssetsBridge'
import { NewsAdBridge } from './pages/noticias/components/NewsAdBridge'
import { ClickableCardsBridge } from './shared/behaviors/components/ClickableCardsBridge'
import { HomePageAdjustmentsBridge } from './pages/home/components/HomePageAdjustmentsBridge'
import { HomeSidebarAdBridge } from './pages/home/components/HomeSidebarAdBridge'
import { PublicSearchSuggestionsBridge } from './shared/behaviors/components/PublicSearchSuggestionsBridge'
import { ColaborePageBridge } from './pages/colabore/components/ColaborePageBridge'
import './styles/public-styles.css'

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
    <React.StrictMode><HashRouter><App/><HomeAdBridge/><HeaderBrandBridge/><BrandAssetsBridge/><NewsAdBridge/><ClickableCardsBridge/><HomePageAdjustmentsBridge/><HomeSidebarAdBridge/><PublicSearchSuggestionsBridge/><ColaborePageBridge/></HashRouter></React.StrictMode>,
  )
}

void waitForPublicFonts().catch(() => undefined).finally(() => {
  document.documentElement.classList.remove('pl-fonts-loading')
  document.documentElement.classList.add('pl-fonts-ready')
  mountApp()
})
