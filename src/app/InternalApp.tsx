import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/access/LoginPage'
import { WorkspacePage } from '../features/access/WorkspacePage'
import CrmRoutes from '../features/crm/CrmRoutes'
import SiteManagerRoutes from '../features/site-manager/SiteManagerRoutes'
import '../styles/admin-entry.css'

export default function InternalApp(){
  return <Routes>
    <Route path="/app" element={<Navigate to="/app/login" replace/>}/>
    <Route path="/app/login" element={<LoginPage/>}/>
    <Route path="/app/workspaces" element={<WorkspacePage/>}/>
    <Route path="/app/crm/*" element={<CrmRoutes/>}/>
    <Route path="/app/site/*" element={<SiteManagerRoutes/>}/>
    <Route path="*" element={<Navigate to="/app/login" replace/>}/>
  </Routes>
}
