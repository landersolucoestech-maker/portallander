import {mockDashboardOperationalSnapshot,mockNotifications} from '../../../mocks'

/** Compatibility facade. Canonical dashboard data lives in src/mocks/dashboard. */
export const dashboardMockOverview={
 period:mockDashboardOperationalSnapshot.period,
 notifications:mockNotifications.filter(item=>item.status==='unread').length,
 pendingActions:mockDashboardOperationalSnapshot.pendingActions,
} as const
