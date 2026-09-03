import {describe,expect,it} from 'vitest'
import {INTEGRATION_CAPABILITIES,REQUIRED_INTEGRATION_PROVIDER_IDS} from './integrationCapabilities'

describe('integration capability registry',()=>{
  it('registers every required Portal Lander provider exactly once',()=>{
    expect([...REQUIRED_INTEGRATION_PROVIDER_IDS].sort()).toEqual(['autentique','google','meta','nfe','resend','spotify','tiktok','whatsapp'])
  })

  it('does not claim unfinished providers are fully implemented',()=>{
    expect(INTEGRATION_CAPABILITIES.autentique.state).toBe('planned')
    expect(INTEGRATION_CAPABILITIES.meta.state).toBe('planned')
    expect(INTEGRATION_CAPABILITIES.tiktok.state).toBe('planned')
    expect(INTEGRATION_CAPABILITIES.google.state).toBe('planned')
    expect(INTEGRATION_CAPABILITIES.nfe.state).toBe('planned')
    expect(INTEGRATION_CAPABILITIES.whatsapp.state).toBe('planned')
    expect(INTEGRATION_CAPABILITIES.spotify.state).toBe('partial')
    expect(INTEGRATION_CAPABILITIES.resend.state).toBe('partial')
  })

  it('documents both implemented and missing scopes for partial providers',()=>{
    for(const id of ['spotify','resend'] as const){
      expect(INTEGRATION_CAPABILITIES[id].implementedCapabilities.length).toBeGreaterThan(0)
      expect(INTEGRATION_CAPABILITIES[id].missingCapabilities.length).toBeGreaterThan(0)
    }
  })
})
