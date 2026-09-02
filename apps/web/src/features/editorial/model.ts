export type EditorialPageType = 'editorial' | 'institutional' | 'special'
export type PublicationStatus = 'draft' | 'published' | 'archived'
export type Visibility = 'public' | 'private'

export type SeoFields = {
  metaTitle?: string
  metaDescription?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  noIndex?: boolean
}

export type EditorialPage = {
  id: string
  title: string
  navigationLabel: string
  slug: string
  description: string
  coverImage?: string
  type: EditorialPageType
  status: PublicationStatus
  active: boolean
  visibility: Visibility
  showInMainMenu: boolean
  menuOrder: number
  order: number
  parentId: string | null
  seo: SeoFields
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export type EditorialContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string; attribution?: string }

export type EditorialContent = {
  id: string
  pageId: string
  title: string
  slug: string
  subtitle?: string
  summary: string
  body: EditorialContentBlock[]
  coverImage?: string
  coverImageAlt?: string
  author: string
  status: PublicationStatus
  active: boolean
  tags: string[]
  media: Array<{ type: 'image' | 'video' | 'embed'; url: string; caption?: string }>
  seo: SeoFields
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export const SPECIAL_LAYOUT_PAGE_SLUGS = new Set(['sobre','colabore','contato'])

export const RESERVED_PAGE_SLUGS = new Set([
  'app','admin','api','assets','auth','login','logout','home','noticia','noticias-feed',
  ...SPECIAL_LAYOUT_PAGE_SLUGS,
  'politica','faq','anuncie','regras','parcerias','termos','equipe',
])

export function normalizeSlug(input: string) {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[“”"'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function validatePageSlug(slug: string, pages: EditorialPage[], currentId?: string) {
  const normalized = normalizeSlug(slug)
  if (!normalized) return { ok: false, error: 'Slug obrigatório.' }
  if (RESERVED_PAGE_SLUGS.has(normalized)) return { ok: false, error: 'Slug reservado pelo sistema.' }
  const collision = pages.some(page => page.id !== currentId && page.slug === normalized)
  if (collision) return { ok: false, error: 'Já existe uma página com este slug.' }
  return { ok: true, slug: normalized }
}

export function validateContentSlug(slug: string, pageId: string, contents: EditorialContent[], currentId?: string) {
  const normalized = normalizeSlug(slug)
  if (!normalized) return { ok: false, error: 'Slug obrigatório.' }
  const collision = contents.some(content => content.id !== currentId && content.pageId === pageId && content.slug === normalized)
  if (collision) return { ok: false, error: 'Já existe conteúdo com este slug nesta página.' }
  return { ok: true, slug: normalized }
}

export function isPublishedPage(page: EditorialPage) {
  return page.active && page.status === 'published' && page.visibility === 'public'
}

export function isSpecialLayoutPage(page:Pick<EditorialPage,'slug'>) {
  return SPECIAL_LAYOUT_PAGE_SLUGS.has(page.slug)
}

export function isPublicEditorialPage(page: EditorialPage) {
  return page.type === 'editorial' && !isSpecialLayoutPage(page) && isPublishedPage(page)
}

// Alias legado preservado para consumidores editoriais existentes.
export const isPublicPage=isPublicEditorialPage

export function isPublicContent(content: EditorialContent) {
  return content.active && content.status === 'published'
}

export function resolveSeo(entity: { title: string; description?: string; summary?: string; coverImage?: string; seo: SeoFields }) {
  const description = entity.seo.metaDescription || entity.description || entity.summary || ''
  return {
    title: entity.seo.metaTitle || entity.title,
    description,
    canonical: entity.seo.canonical,
    ogTitle: entity.seo.ogTitle || entity.seo.metaTitle || entity.title,
    ogDescription: entity.seo.ogDescription || description,
    ogImage: entity.seo.ogImage || entity.coverImage || '',
    noIndex: Boolean(entity.seo.noIndex),
  }
}
