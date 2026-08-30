import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/access/LoginPage'
import { WorkspacePage } from '../features/access/WorkspacePage'
import { ProfilePage } from '../features/access/AccountPages'
import CrmWorkspace from '../features/access/CrmWorkspace'
import DashboardPage from '../features/dashboard/DashboardPage'
import SiteManagerRoutes from '../features/site-manager/SiteManagerRoutes'
import '../styles/admin-entry.css'

export default function InternalApp(){
  return <Routes>
    <Route path="/app" element={<Navigate to="/app/login" replace/>}/>
    <Route path="/app/login" element={<LoginPage/>}/>
    <Route path="/app/workspaces" element={<WorkspacePage/>}/>
    <Route path="/app/profile" element={<ProfilePage/>}/>
    <Route path="/app/dashboard" element={<DashboardPage/>}/>
    <Route path="/app/crm/*" element={<CrmWorkspace/>}/>
    <Route path="/app/site/*" element={<SiteManagerRoutes/>}/>
    <Route path="*" element={<Navigate to="/app/login" replace/>}/>
  </Routes>
}
