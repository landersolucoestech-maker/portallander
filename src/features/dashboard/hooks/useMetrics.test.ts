import { describe, expect, it } from 'vitest'
import { deriveArtistMetrics } from './useMetrics'

describe('deriveArtistMetrics — KPIs independem de lista capada',()=>{
  it('usa o agregado real de 137 artistas',()=>{
    const result=deriveArtistMetrics(137,{contratado:12,ativo:30,prospecto:95})
    expect(result.totalArtistas).toBe(137)
    expect(result.artistasComContrato).toBe(12)
    expect(result.artistasAtivos).toBe(42)
  })
})
