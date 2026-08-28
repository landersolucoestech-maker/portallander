import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './PortalApp'
import { HomeAdBridge } from './HomeAdBridge'
import { HeaderBrandBridge } from './HeaderBrandBridge'
import { NewsPageBridge } from './NewsPageBridge'
import { NewsAdBridge } from './NewsAdBridge'
import { ArticlePageBridge } from './ArticlePageBridge'
import { ClickableCardsBridge } from './ClickableCardsBridge'
import { HomePageAdjustmentsBridge } from './HomePageAdjustmentsBridge'
import { HomeSidebarAdBridge } from './HomeSidebarAdBridge'
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
      <HomeAdBridge />
      <HeaderBrandBridge />
      <NewsPageBridge />
      <NewsAdBridge />
      <ArticlePageBridge />
      <ClickableCardsBridge />
      <HomePageAdjustmentsBridge />
      <HomeSidebarAdBridge />
    </HashRouter>
  </React.StrictMode>,
)
