import {mockEditorialContents,mockEditorialMedia,mockEditorialPages} from '../../../mocks'

/** Compatibility facade. Canonical site-manager records live in src/mocks editorial and media domains. */
export const siteManagerMockPages=mockEditorialPages
export const siteManagerMockMedia=mockEditorialMedia
export const siteManagerMockCategories=Array.from(new Set(mockEditorialContents.flatMap(item=>item.tags))).sort()
