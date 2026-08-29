export interface PortalDashboardItem {
  id: string
  pageId: string
  pageSlug: string
  title: string
  slug: string
  category: string
  author: string
  coverImage?: string
  status: 'draft' | 'published' | 'archived'
  publishedAt?: string
  updatedAt: string
}

export interface PortalDashboard {
  published_count: number
  draft_count: number
  archived_count: number
  published_this_month: number
  category_count: number
  page_count: number
  recent_publications: PortalDashboardItem[]
  recent_updates: PortalDashboardItem[]
  generated_at: string
}

export interface EditorialActivity {
  id: string
  action: 'published' | 'updated'
  title: string
  category: string
  occurred_at: string
  pageSlug: string
  slug: string
}
