import {mockCurrentUserId,mockUsers,mockWorkspaces} from '../../../mocks'

const currentUser=mockUsers.find(user=>user.id===mockCurrentUserId)
const activeWorkspace=mockWorkspaces.find(workspace=>workspace.active)??mockWorkspaces[0]

/** Compatibility facade. Canonical identity data lives in src/mocks/identity. */
export const accessMockWorkspace={
 name:activeWorkspace?.name??'Portal Lander',
 role:currentUser?.roleLabel??'Administrador',
} as const
