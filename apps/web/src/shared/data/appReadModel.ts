import {getRuntimeDataProvider} from './runtimeDataProvider'

export const appReadModel={
 currentUser(){return getRuntimeDataProvider().identity.currentUser()},
 workspaces(){return getRuntimeDataProvider().identity.workspaces().filter(item=>item.active)},
 notifications(){return getRuntimeDataProvider().notifications.list().sort((a,b)=>b.createdAt.localeCompare(a.createdAt))},
 notificationsForCurrentUser(){
  const user=this.currentUser()
  return this.notifications().filter(item=>item.userId===user.id)
 },
 unreadNotificationsForCurrentUser(){return this.notificationsForCurrentUser().filter(item=>item.status==='unread')},
}
