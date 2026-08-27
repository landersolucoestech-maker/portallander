import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './PortalApp'
import './styles.css'
import './public.css'
import './public-logo.css'
import './public-tweaks.css'
import './public-mockup.css'
import './hero-editable.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
