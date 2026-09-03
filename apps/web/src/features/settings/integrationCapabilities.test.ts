import {describe,expect,it} from 'vitest'
import {INTEGRATION_CAPABILITIES,REQUIRED_INTEGRATION_PROVIDER_IDS} from './integrationCapabilities'

describe('integration capability registry',()=>{
  it('registers every required Portal Lander provider exactly once',()=>{
    expect([...REQUIRED_INTEGRATION_PROVIDER_IDS].sort()).toEqual(['autentique','google','meta','nfe','resend','spotify','tiktok','whatsapp'])
  })

  it('does not claim unfinished providers are fully implemented',()=>{
    for(const id of REQUIRED_INTEGRATION_PROVIDER_IDS){
      expect(INTEGRATION_CAPABILITIES[id].state).not.toBe('implemented')
    }
    for(const id of ['meta','tiktok','google','nfe'] as const){
      expect(INTEGRATION_CAPABILITIES[id].state).toBe('planned')
    }
    for(const id of ['autentique','whatsapp','spotify','resend'] as const){
      expect(INTEGRATION_CAPABILITIES[id].state).toBe('partial')
    }
  })

  it('documents both implemented and missing scopes for partial providers',()=>{
    for(const id of ['autentique','whatsapp','spotify','resend'] as const){
      expect(INTEGRATION_CAPABILITIES[id].implementedCapabilities.length).toBeGreaterThan(0)
      expect(INTEGRATION_CAPABILITIES[id].missingCapabilities.length).toBeGreaterThan(0)
    }
  })
})
