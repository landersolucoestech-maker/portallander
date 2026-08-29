import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './app/PortalApp'
import { NewsAdBridge } from './pages/noticias/components/NewsAdBridge'
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
    <React.StrictMode><HashRouter><App/><NewsAdBridge/></HashRouter></React.StrictMode>,
  )
}

void waitForPublicFonts().catch(() => undefined).finally(() => {
  document.documentElement.classList.remove('pl-fonts-loading')
  document.documentElement.classList.add('pl-fonts-ready')
  mountApp()
})
