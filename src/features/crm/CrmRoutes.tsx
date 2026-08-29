import { Navigate, Route, Routes } from 'react-router-dom'
import { ChatPage, OperationsPage } from '../operations/OperationsPage'
import { ContractTemplatesPage, ContractVariablesPage } from '../operations/ContractRegistryPages'
import { ContractsPage } from '../operations/ContractsPage'
import { PaginatedMarketingPage } from '../operations/PaginatedMarketingPage'
import { PaginatedOperationsPage } from '../operations/PaginatedOperationsPage'
import { AgendaReferencePage } from '../operations/AgendaReferencePage'
import { ReportsReferencePage } from '../operations/ReportsReferencePage'
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
    <Route path="marketing/:sectionKey" element={<PaginatedMarketingPage/>}/>
    <Route path="chat" element={<ChatPage/>}/>
    <Route path="musicchat" element={<Navigate to="/app/crm/chat" replace/>}/>
    <Route path="internal-chat" element={<Navigate to="/app/crm/chat" replace/>}/>
    <Route path="contracts" element={<ContractsPage/>}/>
    <Route path="contracts/templates" element={<ContractTemplatesPage/>}/>
    <Route path="contracts/categorias" element={<Navigate to="/app/crm/contracts" replace/>}/>
    <Route path="contracts/variaveis" element={<ContractVariablesPage/>}/>
    <Route path="events" element={<AgendaReferencePage/>}/>
    <Route path="integrations" element={<Navigate to="/app/crm/settings" replace/>}/>
    <Route path="relatorios" element={<ReportsPage/>}/>
    <Route path="reports" element={<ReportsReferencePage/>}/>
    <Route path="financeiro" element={<FinancePage/>}/>
    <Route path="financeiro/contabilidade" element={<PaginatedOperationsPage moduleKey="accounting"/>}/>
    <Route path="accounting" element={<Navigate to="/app/crm/financeiro/contabilidade" replace/>}/>
    <Route path="rh" element={<PaginatedOperationsPage moduleKey="rh"/>}/>
    <Route path=":moduleKey" element={<OperationsPage/>}/>
    <Route path="*" element={<Navigate to="/app/crm" replace/>}/>
  </Routes>
}
