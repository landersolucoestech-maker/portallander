export const MAX_MARKETING_HASHTAGS:5
export interface MarketingHashtagValidation{hashtags:string[];invalid:string[];duplicates:string[];tooMany:boolean;valid:boolean}
export function normalizeMarketingHashtag(value:unknown):string|null
export function parseMarketingHashtags(value:unknown):Omit<MarketingHashtagValidation,'valid'>
export function validateMarketingHashtags(value:unknown):MarketingHashtagValidation
export function normalizeMarketingHashtags(value:unknown):string[]
export function formatMarketingHashtags(value:unknown):string
