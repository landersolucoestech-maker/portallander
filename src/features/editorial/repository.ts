import { legacyEditorialContents, legacyEditorialPages } from './data/legacySnapshot'
import { isPublicContent, isPublicPage, type EditorialContent, type EditorialPage } from './model'

export class EditorialPersistenceUnavailableError extends Error {
  constructor() {
    super('Persistência editorial compartilhada indisponível: este repositório não possui backend, banco ou API configurados.')
    this.name = 'EditorialPersistenceUnavailableError'
  }
}

export interface EditorialRepository {
  listPages(): Promise<EditorialPage[]>
  listContents(): Promise<EditorialContent[]>
  createPage(input: EditorialPage): Promise<EditorialPage>
  updatePage(input: EditorialPage): Promise<EditorialPage>
  deletePage(id: string): Promise<void>
  createContent(input: EditorialContent): Promise<EditorialContent>
  updateContent(input: EditorialContent): Promise<EditorialContent>
  deleteContent(id: string): Promise<void>
}

class BundledReadOnlyEditorialRepository implements EditorialRepository {
  async listPages() { return legacyEditorialPages.map(page => ({ ...page, seo: { ...page.seo } })) }
  async listContents() { return legacyEditorialContents.map(content => ({ ...content, seo: { ...content.seo }, tags: [...content.tags], media: [...content.media], body: [...content.body] })) }
  async createPage(): Promise<EditorialPage> { throw new EditorialPersistenceUnavailableError() }
  async updatePage(): Promise<EditorialPage> { throw new EditorialPersistenceUnavailableError() }
  async deletePage(): Promise<void> { throw new EditorialPersistenceUnavailableError() }
  async createContent(): Promise<EditorialContent> { throw new EditorialPersistenceUnavailableError() }
  async updateContent(): Promise<EditorialContent> { throw new EditorialPersistenceUnavailableError() }
  async deleteContent(): Promise<void> { throw new EditorialPersistenceUnavailableError() }
}

export const editorialRepository: EditorialRepository = new BundledReadOnlyEditorialRepository()

// Read model síncrono usado pelo bundle atual. Quando uma API real for conectada,
// este módulo é o único ponto que precisa ser substituído por estado carregado do backend.
export const editorialReadModel = {
  pages: legacyEditorialPages,
  contents: legacyEditorialContents,
  getPageBySlug(slug: string) {
    return legacyEditorialPages.find(page => page.slug === slug && isPublicPage(page)) || null
  },
  getPageById(id: string) {
    return legacyEditorialPages.find(page => page.id === id) || null
  },
  getContent(pageId: string, slug: string) {
    return legacyEditorialContents.find(content => content.pageId === pageId && content.slug === slug && isPublicContent(content)) || null
  },
  listPageContents(pageId: string) {
    return legacyEditorialContents.filter(content => content.pageId === pageId && isPublicContent(content))
      .sort((a,b) => (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt))
  },
  listMenuPages() {
    return legacyEditorialPages.filter(page => isPublicPage(page) && page.showInMainMenu)
      .sort((a,b) => a.menuOrder - b.menuOrder)
  },
  countContents(pageId: string) {
    return legacyEditorialContents.filter(content => content.pageId === pageId).length
  },
}
