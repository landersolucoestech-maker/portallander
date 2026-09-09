import { isPublicContent, isPublicEditorialPage, isPublishedPage, type EditorialContent, type EditorialPage } from './model'
import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'

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

class ProviderReadOnlyEditorialRepository implements EditorialRepository {
  async listPages() { return getRuntimeDataProvider().editorial.pages() }
  async listContents() { return getRuntimeDataProvider().editorial.contents() }
  async createPage(): Promise<EditorialPage> { throw new EditorialPersistenceUnavailableError() }
  async updatePage(): Promise<EditorialPage> { throw new EditorialPersistenceUnavailableError() }
  async deletePage(): Promise<void> { throw new EditorialPersistenceUnavailableError() }
  async createContent(): Promise<EditorialContent> { throw new EditorialPersistenceUnavailableError() }
  async updateContent(): Promise<EditorialContent> { throw new EditorialPersistenceUnavailableError() }
  async deleteContent(): Promise<void> { throw new EditorialPersistenceUnavailableError() }
}

export const editorialRepository: EditorialRepository = new ProviderReadOnlyEditorialRepository()

const pages=()=>getRuntimeDataProvider().editorial.pages()
const contents=()=>getRuntimeDataProvider().editorial.contents()
const normalizeSearch=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim()

export const editorialReadModel = {
  get pages(){return pages()},
  get contents(){return contents()},
  getPageBySlug(slug: string) {
    return pages().find(page => page.slug === slug && isPublicEditorialPage(page)) || null
  },
  getPublishedPageBySlug(slug:string){
    return pages().find(page=>page.slug===slug&&isPublishedPage(page))||null
  },
  getPageById(id: string) {
    return pages().find(page => page.id === id) || null
  },
  getContent(pageId: string, slug: string) {
    return contents().find(content => content.pageId === pageId && content.slug === slug && isPublicContent(content)) || null
  },
  listPageContents(pageId: string) {
    return contents().filter(content => content.pageId === pageId && isPublicContent(content))
      .sort((a,b) => (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt))
  },
  searchPublicContents(query:string) {
    const normalized=normalizeSearch(query)
    if(!normalized)return []
    const allPages=pages()
    return contents().filter(content=>{
      if(!isPublicContent(content))return false
      const page=allPages.find(item=>item.id===content.pageId&&isPublicEditorialPage(item))
      if(!page)return false
      const haystack=normalizeSearch([content.title,content.subtitle,content.summary,content.author,...content.tags,page.title,page.navigationLabel].join(' '))
      return haystack.includes(normalized)
    }).sort((a,b)=>(b.publishedAt||b.updatedAt).localeCompare(a.publishedAt||a.updatedAt))
  },
  listMenuPages() {
    return pages().filter(page => isPublicEditorialPage(page) && page.showInMainMenu)
      .sort((a,b) => a.menuOrder - b.menuOrder)
  },
  countContents(pageId: string) {
    return contents().filter(content => content.pageId === pageId).length
  },
}
