import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const HOME_MENU = [
  { from: 'Notícias', to: 'Notícias', href: '#/noticias' },
  { from: 'Polêmicas', to: 'Músicas', href: '#/musicas' },
  { from: 'Bastidores', to: 'Bastidores', href: '#/bastidores' },
  { from: 'Lançamentos', to: 'Lançamentos', href: '#/lancamentos' },
  { from: 'Destaques', to: 'Cultura', href: '#/cultura' },
  { from: 'Vídeos', to: 'Vídeos', href: '#/videos' },
] as const

function labelOf(anchor: HTMLAnchorElement) {
  return Array.from(anchor.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent || '')
    .join('')
    .trim()
}

function setAnchorLabel(anchor: HTMLAnchorElement, label: string) {
  const textNode = Array.from(anchor.childNodes).find(node => node.nodeType === Node.TEXT_NODE)
  if (textNode) textNode.textContent = label
  else anchor.append(document.createTextNode(label))
}

export function HomePageAdjustmentsBridge() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/') return

    const headerLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.public-header .public-links a'))
    const originals = headerLinks.map(anchor => ({
      anchor,
      label: labelOf(anchor),
      href: anchor.getAttribute('href'),
    }))

    HOME_MENU.forEach(item => {
      const anchor = headerLinks.find(link => labelOf(link) === item.from)
      if (!anchor) return
      setAnchorLabel(anchor, item.to)
      anchor.setAttribute('href', item.href)
    })

    const hiddenSections: HTMLElement[] = []
    document.querySelectorAll<HTMLElement>('.pl-bottom-grid > div').forEach(section => {
      const title = section.querySelector('.pl-section-head h2')?.textContent?.trim().toUpperCase()
      if (title === 'FOTOGALERIA' || title === 'PODCASTS') {
        section.dataset.homeTemporarilyHidden = 'true'
        section.style.display = 'none'
        hiddenSections.push(section)
      }
    })

    return () => {
      originals.forEach(({ anchor, label, href }) => {
        setAnchorLabel(anchor, label)
        if (href === null) anchor.removeAttribute('href')
        else anchor.setAttribute('href', href)
      })
      hiddenSections.forEach(section => {
        section.style.removeProperty('display')
        delete section.dataset.homeTemporarilyHidden
      })
    }
  }, [location.pathname])

  return null
}
