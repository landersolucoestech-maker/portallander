import { Navigate, Route, Routes } from 'react-router-dom'
import { ChatPage, MarketingPage, OperationsPage } from '../operations/OperationsPage'
import { ContactsPage } from './pages/ContactsPage'
import { CrmDashboardPage } from './pages/CrmDashboardPage'
import { FinancePage } from './pages/FinancePage'
import { ReportsPage } from './pages/ReportsPage'

export default function CrmRoutes(){
  return <Routes>
    <Route index element={<CrmDashboardPage/>}/>
    <Route path="contatos" element={<ContactsPage/>}/>
    <Route path="campanhas" element={<Navigate to="/app/crm/marketing/campanhas" replace/>}/>
    <Route path="marketing" element={<Navigate to="/app/crm/marketing/visao-geral" replace/>}/>
    <Route path="marketing/:sectionKey" element={<MarketingPage/>}/>
    <Route path="chat" element={<ChatPage/>}/>
    <Route path="musicchat" element={<Navigate to="/app/crm/chat" replace/>}/>
    <Route path="internal-chat" element={<Navigate to="/app/crm/chat" replace/>}/>
    <Route path="relatorios" element={<ReportsPage/>}/>
    <Route path="reports" element={<OperationsPage moduleKey="reports"/>}/>
    <Route path="financeiro" element={<FinancePage/>}/>
    <Route path="financeiro/contabilidade" element={<OperationsPage moduleKey="accounting"/>}/>
    <Route path="accounting" element={<Navigate to="/app/crm/financeiro/contabilidade" replace/>}/>
    <Route path=":moduleKey" element={<OperationsPage/>}/>
    <Route path="*" element={<Navigate to="/app/crm" replace/>}/>
  </Routes>
}
