import { useEffect } from 'react'
import { resolveSeo } from '../model'

export function useEditorialSeo(entity: Parameters<typeof resolveSeo>[0]) {
  useEffect(() => {
    const seo = resolveSeo(entity)
    const previousTitle = document.title
    document.title = seo.title

    const ensureMeta = (selector: string, attr: 'name' | 'property', key: string, value: string) => {
      let node = document.head.querySelector<HTMLMetaElement>(selector)
      if (!value) { node?.remove(); return }
      if (!node) {
        node = document.createElement('meta')
        node.setAttribute(attr, key)
        document.head.appendChild(node)
      }
      node.content = value
    }

    ensureMeta('meta[name="description"]','name','description',seo.description)
    ensureMeta('meta[property="og:title"]','property','og:title',seo.ogTitle)
    ensureMeta('meta[property="og:description"]','property','og:description',seo.ogDescription)
    ensureMeta('meta[property="og:image"]','property','og:image',seo.ogImage)
    ensureMeta('meta[name="robots"]','name','robots',seo.noIndex ? 'noindex,nofollow' : 'index,follow')

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const fallbackCanonical = `${window.location.origin}${window.location.pathname}${window.location.hash}`
    const canonicalHref = seo.canonical || fallbackCanonical
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalHref

    return () => { document.title = previousTitle }
  }, [entity])
}
