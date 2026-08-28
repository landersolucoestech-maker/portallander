import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function HomePageAdjustmentsBridge() {
  const location = useLocation()

  useLayoutEffect(() => {
    if (location.pathname !== '/') return

    const hiddenSections: HTMLElement[] = []
    document.querySelectorAll<HTMLElement>('.pl-bottom-grid > div').forEach(section => {
      const title = section.querySelector('.pl-section-head h2')?.textContent?.trim().toUpperCase()
      if (title === 'FOTOGALERIA' || title === 'PODCASTS') {
        section.dataset.homeTemporarilyHidden = 'true'
        section.style.display = 'none'
        hiddenSections.push(section)
      }
    })

    const whatsappSection = document.querySelector<HTMLElement>('.public-page .pl-latest-wrap .pl-whatsapp')
    const whatsappOriginalClass = whatsappSection?.className || ''
    const whatsappOriginalHtml = whatsappSection?.innerHTML || ''

    if (whatsappSection) {
      whatsappSection.className = 'pl-trending'
      whatsappSection.innerHTML = `
        <div class="pl-section-head pl-trending-head"><h2>EM ALTA</h2><a href="#/noticias">VER TODOS</a></div>
        <div class="pl-trending-list">
          <a class="pl-trending-item" href="#/noticia/veigh-bate-recorde-com-novo-album-dos-predios-deluxe">
            <span class="pl-trending-rank">01</span>
            <div><strong>Veigh bate recorde com novo álbum “Dos Prédios Deluxe”</strong><small>Há 3 horas</small></div>
          </a>
          <a class="pl-trending-item" href="#/noticia/mc-ryan-sp-cancela-show-de-ultima-hora-e-web-reage">
            <span class="pl-trending-rank">02</span>
            <div><strong>MC Ryan SP cancela show de última hora e web reage</strong><small>Há 4 horas</small></div>
          </a>
          <a class="pl-trending-item" href="#/noticia/festival-de-trap-2025-anuncia-line-up-pesado">
            <span class="pl-trending-rank">03</span>
            <div><strong>Festival de Trap 2025 anuncia line-up pesado</strong><small>Há 5 horas</small></div>
          </a>
          <a class="pl-trending-item" href="#/noticia/ludmilla-confirma-nova-turne-numanice-4">
            <span class="pl-trending-rank">04</span>
            <div><strong>Ludmilla confirma nova turnê “Numanice 4”</strong><small>Há 6 horas</small></div>
          </a>
        </div>
      `
    }

    const homeMain = document.querySelector<HTMLElement>('.public-page .pl-main')
    const ad = homeMain?.querySelector<HTMLElement>(':scope > .pl-ad') || null
    const categorySection = Array.from(homeMain?.querySelectorAll<HTMLElement>(':scope > section.pl-section') || [])
      .find(section => section.querySelector('.pl-section-head h2')?.textContent?.trim().toUpperCase() === 'NAVEGUE POR CATEGORIAS') || null

    const adOriginalParent = ad?.parentElement || null
    const adOriginalNextSibling = ad?.nextSibling || null

    if (ad && categorySection) {
      categorySection.dataset.homeTemporarilyHidden = 'true'
      categorySection.style.display = 'none'
      categorySection.insertAdjacentElement('beforebegin', ad)
    }

    return () => {
      hiddenSections.forEach(section => {
        section.style.removeProperty('display')
        delete section.dataset.homeTemporarilyHidden
      })
      if (whatsappSection) {
        whatsappSection.className = whatsappOriginalClass
        whatsappSection.innerHTML = whatsappOriginalHtml
      }
      if (categorySection) {
        categorySection.style.removeProperty('display')
        delete categorySection.dataset.homeTemporarilyHidden
      }
      if (ad && adOriginalParent) {
        if (adOriginalNextSibling && adOriginalNextSibling.parentNode === adOriginalParent) adOriginalParent.insertBefore(ad, adOriginalNextSibling)
        else adOriginalParent.appendChild(ad)
      }
    }
  }, [location.pathname])

  return null
}
