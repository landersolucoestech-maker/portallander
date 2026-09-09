import {mockEditorialContents,mockEditorialMedia,mockEditorialPages} from '@portallander/mockup'

/** Compatibility facade. Canonical reusable Site development data lives in @portallander/mockup. */
export const siteManagerMockPages=mockEditorialPages
export const siteManagerMockMedia=mockEditorialMedia
export const siteManagerMockCategories=Array.from(new Set(mockEditorialContents.flatMap((item:{tags:string[]})=>item.tags))).sort()
