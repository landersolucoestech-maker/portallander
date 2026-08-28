import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './PortalApp'
import { HomeAdBridge } from './pages/home/HomeAdBridge'
import { HeaderBrandBridge } from './HeaderBrandBridge'
import { BrandAssetsBridge } from './BrandAssetsBridge'
import { NewsPageBridge } from './pages/noticias/NewsPageBridge'
import { NewsAdBridge } from './NewsAdBridge'
import { ArticlePageBridge } from './pages/article/ArticlePageBridge'
import { ClickableCardsBridge } from './ClickableCardsBridge'
import { HomePageAdjustmentsBridge } from './pages/home/HomePageAdjustmentsBridge'
import { HomeSidebarAdBridge } from './pages/home/HomeSidebarAdBridge'
import { PublicSearchSuggestionsBridge } from './PublicSearchSuggestionsBridge'
import { ColaborePageBridge } from './pages/colabore/ColaborePageBridge'
import './public-styles.css'

const REQUIRED_PUBLIC_FONTS = [
  '400 16px "Bebas Neue"',
  '400 16px "Montserrat"',
  '500 16px "Montserrat"',
  '600 16px "Montserrat"',
  '700 16px "Montserrat"',
  '800 16px "Montserrat"',
]

async function waitForPublicFonts() {
  if (!document.fonts?.load) return
  await Promise.all(REQUIRED_PUBLIC_FONTS.map(font => document.fonts.load(font)))
  await document.fonts.ready
}

function mountApp() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <HashRouter>
        <App />
        <HomeAdBridge />
        <HeaderBrandBridge />
        <BrandAssetsBridge />
        <NewsPageBridge />
        <NewsAdBridge />
        <ArticlePageBridge />
        <ClickableCardsBridge />
        <HomePageAdjustmentsBridge />
        <HomeSidebarAdBridge />
        <PublicSearchSuggestionsBridge />
        <ColaborePageBridge />
      </HashRouter>
    </React.StrictMode>,
  )
}

void waitForPublicFonts()
  .catch(() => undefined)
  .finally(() => {
    document.documentElement.classList.remove('pl-fonts-loading')
    document.documentElement.classList.add('pl-fonts-ready')
    mountApp()
  })
