import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './PortalApp'
import { HomeAdBridge } from './HomeAdBridge'
import { HeaderBrandBridge } from './HeaderBrandBridge'
import { NewsPageBridge } from './NewsPageBridge'
import { NewsAdBridge } from './NewsAdBridge'
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
      <HomeAdBridge />
      <HeaderBrandBridge />
      <NewsPageBridge />
      <NewsAdBridge />
    </HashRouter>
  </React.StrictMode>,
)
