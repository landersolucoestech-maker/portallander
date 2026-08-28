import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { portalLogo } from './brandAsset'

export function HomeSidebarAdBridge(){
  const location=useLocation()

  useEffect(()=>{
    document.querySelectorAll('.pl-home-sidebar-ad').forEach(node=>node.remove())
    if(location.pathname!=='/') return

    const mostRead=document.querySelector('.public-page .pl-most') as HTMLElement|null
    if(!mostRead) return

    const ad=document.createElement('aside')
    ad.className='pl-home-sidebar-ad'
    ad.innerHTML=`
      <div class="pl-home-sidebar-ad-inner">
        <img src="${portalLogo}" alt="Portal Lander" />
        <span class="pl-home-sidebar-ad-kicker">PUBLICIDADE</span>
        <h3>ANUNCIE AQUI</h3>
        <p>SUA MARCA NO<br/>RITMO CERTO!</p>
        <a href="#/anuncie">SAIBA MAIS →</a>
      </div>
    `

    mostRead.insertAdjacentElement('afterend',ad)
  },[location.pathname])

  return null
}
