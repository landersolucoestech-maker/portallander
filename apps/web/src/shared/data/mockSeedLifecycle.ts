import {getRuntimeDataProvider} from './runtimeDataProvider'

export const MOCK_SEED_VERSION='2026-08-30-global-v1'
const VERSION_KEY='portal-lander:mock-seed-version'
const MUTABLE_MOCK_STORAGE_KEYS=[
 'portal-lander:crm:v1',
 'portal-lander:contracts:v1',
 'portal-lander:finance:transactions',
 'portal-lander:finance:invoices',
 'portal-lander:finance:categories',
 'portal-lander:finance:rules',
] as const

/**
 * Re-seeds mutable demo repositories exactly once when the canonical global mock dataset changes.
 * Subsequent reloads preserve local CRUD changes until MOCK_SEED_VERSION is intentionally bumped.
 * Real/API providers are never touched.
 */
export function prepareMockSeedStorage(){
 if(getRuntimeDataProvider().kind!=='mock')return false
 try{
  if(localStorage.getItem(VERSION_KEY)===MOCK_SEED_VERSION)return false
  for(const key of MUTABLE_MOCK_STORAGE_KEYS)localStorage.removeItem(key)
  localStorage.setItem(VERSION_KEY,MOCK_SEED_VERSION)
  return true
 }catch{
  return false
 }
}
