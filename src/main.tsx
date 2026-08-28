import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './PortalApp'
import { HomeAdBridge } from './HomeAdBridge'
import { HeaderBrandBridge } from './HeaderBrandBridge'
import { BrandAssetsBridge } from './BrandAssetsBridge'
import { NewsPageBridge } from './NewsPageBridge'
import { NewsAdBridge } from './NewsAdBridge'
import { ArticlePageBridge } from './ArticlePageBridge'
import { ClickableCardsBridge } from './ClickableCardsBridge'
import { HomePageAdjustmentsBridge } from './HomePageAdjustmentsBridge'
import { HomeSidebarAdBridge } from './HomeSidebarAdBridge'
import { PublicSearchSuggestionsBridge } from './PublicSearchSuggestionsBridge'
import { ColaborePageBridge } from './ColaborePageBridge'
import './styles.css'
import './public.css'
import './public-logo.css'
import './public-tweaks.css'
import './public-mockup.css'
import './hero-editable.css'
import './public-reference.css'
import './public-corrections.css'
import './hero-fixed-background.css'
import './hero-carousel.css'
import './featured-grid.css'
import './home-ad-manager.css'
import './releases-four.css'
import './header-active-indicator.css'
import './header-brand-manager.css'
import './news-reference-page.css'
import './news-hero-upload.css'
import './news-hero-reference.css'
import './article-page.css'
import './article-hero-shared.css'
import './clickable-cards.css'
import './home-sidebar-ad.css'
import './home-trending.css'
import './bastidores-three-grid.css'
import './article-route-fix.css'
import './public-header-system.css'
import './public-search-suggestions.css'
import './public-typography-system.css'
import './brand-assets-manager.css'
import './colabore-page.css'

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
