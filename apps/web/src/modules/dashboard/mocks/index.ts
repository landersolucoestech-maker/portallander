import {mockDashboardOperationalSnapshot,mockNotifications} from '@portallander/mockup'

/** Compatibility facade. Canonical reusable Dashboard development data lives in @portallander/mockup. */
export const dashboardMockOverview={
 period:mockDashboardOperationalSnapshot.period,
 notifications:mockNotifications.filter((item:{status:string})=>item.status==='unread').length,
 pendingActions:mockDashboardOperationalSnapshot.pendingActions,
} as const
