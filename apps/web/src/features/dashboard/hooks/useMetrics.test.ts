import { describe, expect, it } from 'vitest'
import { deriveEditorialMetrics } from './useMetrics'
import type { PortalDashboard } from '../types'

describe('deriveEditorialMetrics — KPIs independem de listas visuais capadas',()=>{
  it('usa os agregados do dashboard, não a quantidade de cards recentes',()=>{
    const dashboard:PortalDashboard={
      published_count:137,
      draft_count:12,
      archived_count:5,
      published_this_month:30,
      category_count:7,
      page_count:1,
      recent_publications:[],
      recent_updates:[],
      generated_at:'2026-08-29T00:00:00.000Z',
    }
    const result=deriveEditorialMetrics(dashboard)
    expect(result.published).toBe(137)
    expect(result.drafts).toBe(12)
    expect(result.publishedThisMonth).toBe(30)
    expect(result.categories).toBe(7)
  })
})
