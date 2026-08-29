import { Navigate, Route, Routes } from 'react-router-dom'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { CampaignsPage } from './pages/CampaignsPage'
import { ContactsPage } from './pages/ContactsPage'
import { CrmDashboardPage } from './pages/CrmDashboardPage'
import { DealsPage } from './pages/DealsPage'
import { FinancePage } from './pages/FinancePage'
import { PipelinePage } from './pages/PipelinePage'
import { ReportsPage } from './pages/ReportsPage'

export default function CrmRoutes(){
  return <Routes>
    <Route index element={<CrmDashboardPage/>}/>
    <Route path="contatos" element={<ContactsPage/>}/>
    <Route path="negocios" element={<DealsPage/>}/>
    <Route path="atividades" element={<ActivitiesPage/>}/>
    <Route path="pipeline" element={<PipelinePage/>}/>
    <Route path="campanhas" element={<CampaignsPage/>}/>
    <Route path="relatorios" element={<ReportsPage/>}/>
    <Route path="financeiro" element={<FinancePage/>}/>
    <Route path="*" element={<Navigate to="/app/crm" replace/>}/>
  </Routes>
}
