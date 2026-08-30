import {mockEditorialContents} from '../../../mocks'

/** Compatibility facade. Canonical editorial data lives in src/mocks/editorial. */
export const editorialMockContent=mockEditorialContents
export const editorialMockCategories=Array.from(new Set(mockEditorialContents.flatMap(item=>item.tags))).sort()
