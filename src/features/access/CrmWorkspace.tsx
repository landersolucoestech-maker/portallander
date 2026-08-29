import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from '../dashboard/DashboardPage'

export default function CrmWorkspace(){
  return <Routes>
    <Route index element={<DashboardPage/>}/>
    <Route path="*" element={<Navigate to="/app/crm" replace/>}/>
  </Routes>
}
