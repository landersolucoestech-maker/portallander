import { Navigate, Route, Routes } from 'react-router-dom'
import { ActivitiesPage, CrmDashboard, PipelinePage } from './CrmWorkspace'
import { CampaignsPage, FinancePage, ReportsPage } from './CrmOperations'
import { ContactsPage } from './pages/ContactsPage'
import { DealsPage } from './pages/DealsPage'

export default function CrmRoutes(){
  return <Routes>
    <Route path="/app/crm" element={<CrmDashboard/>}/>
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
