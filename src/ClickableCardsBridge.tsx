import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[“”"'’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function contentTitle(card: HTMLElement) {
  return card.querySelector('h3,h4')?.textContent?.trim() || ''
}

function destinationFor(card: HTMLElement) {
  if (card.matches('.pl-release')) {
    const title = contentTitle(card)
    return title ? `/noticia/${slugify(title)}` : '/lancamentos'
  }
  if (card.matches('.pl-podcast')) return '/videos'
  if (card.matches('.pl-gallery .pl-thumb')) return '/destaques'
  if (card.matches('.pl-agenda-item')) return '/destaques'
  if (card.matches('.pl-card,.news-reference-card,.pl-feature,.pl-mini,.pl-ranked')) {
    const title = contentTitle(card)
    return title ? `/noticia/${slugify(title)}` : '/noticias'
  }
  return null
}

export function ClickableCardsBridge() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname.startsWith('/app')) return

    const selector = '.pl-card,.news-reference-card,.pl-release,.pl-feature,.pl-mini,.pl-ranked,.pl-podcast,.pl-gallery .pl-thumb,.pl-agenda-item'

    const enhance = () => {
      document.querySelectorAll<HTMLElement>(selector).forEach(card => {
        const destination = destinationFor(card)
        if (!destination) return
        card.dataset.clickableCard = 'true'
        card.dataset.destination = destination
        card.tabIndex = 0
        card.setAttribute('role', 'link')
        card.setAttribute('aria-label', `Abrir ${contentTitle(card) || 'conteúdo'}`)
      })
    }

    enhance()
    const observer = new MutationObserver(enhance)
    observer.observe(document.body, { childList: true, subtree: true })

    const activate = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null
      if (!element || element.closest('a,button,input,select,textarea,label')) return
      const card = element.closest<HTMLElement>(selector)
      if (!card || card.dataset.clickableCard !== 'true') return
      const destination = card.dataset.destination || destinationFor(card)
      if (destination) navigate(destination)
    }

    const onClick = (event: MouseEvent) => activate(event.target)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      const element = event.target instanceof Element ? event.target : null
      const card = element?.closest<HTMLElement>(selector)
      if (!card || card.dataset.clickableCard !== 'true') return
      if (element?.closest('a,button,input,select,textarea,label')) return
      event.preventDefault()
      const destination = card.dataset.destination || destinationFor(card)
      if (destination) navigate(destination)
    }

    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [location.pathname, navigate])

  return null
}
