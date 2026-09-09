import {mockEditorialContents} from '@portallander/mockup'

/** Compatibility facade. Canonical reusable Editorial development data lives in @portallander/mockup. */
export const editorialMockContent=mockEditorialContents
export const editorialMockCategories=Array.from(new Set(mockEditorialContents.flatMap((item:{tags:string[]})=>item.tags))).sort()
