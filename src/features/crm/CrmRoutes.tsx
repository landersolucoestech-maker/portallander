import { Navigate, Route, Routes } from 'react-router-dom'
import { OperationsPage } from '../operations/OperationsPage'
import { CampaignsPage } from './pages/CampaignsPage'
import { ContactsPage } from './pages/ContactsPage'
import { CrmDashboardPage } from './pages/CrmDashboardPage'
import { FinancePage } from './pages/FinancePage'
import { ReportsPage } from './pages/ReportsPage'

export default function CrmRoutes(){
  return <Routes>
    <Route index element={<CrmDashboardPage/>}/>
    <Route path="contatos" element={<ContactsPage/>}/>
    <Route path="campanhas" element={<CampaignsPage/>}/>
    <Route path="relatorios" element={<ReportsPage/>}/>
    <Route path="financeiro" element={<FinancePage/>}/>
    <Route path=":moduleKey" element={<OperationsPage/>}/>
    <Route path="*" element={<Navigate to="/app/crm" replace/>}/>
  </Routes>
}
