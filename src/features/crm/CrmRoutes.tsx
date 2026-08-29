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
    <Route path="/app/crm" element={<CrmDashboardPage/>}/>
    <Route path="/app/crm/contatos" element={<ContactsPage/>}/>
    <Route path="/app/crm/negocios" element={<DealsPage/>}/>
    <Route path="/app/crm/atividades" element={<ActivitiesPage/>}/>
    <Route path="/app/crm/pipeline" element={<PipelinePage/>}/>
    <Route path="/app/crm/campanhas" element={<CampaignsPage/>}/>
    <Route path="/app/crm/relatorios" element={<ReportsPage/>}/>
    <Route path="/app/crm/financeiro" element={<FinancePage/>}/>
    <Route path="*" element={<Navigate to="/app/crm" replace/>}/>
  </Routes>
}
