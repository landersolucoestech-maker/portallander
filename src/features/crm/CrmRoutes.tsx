import { Navigate, Route, Routes } from 'react-router-dom'
import { OperationsPage } from '../operations/OperationsPage'
import { ContractTemplatesPage, ContractVariablesPage } from '../operations/ContractRegistryPages'
import { ContractsPage } from '../operations/ContractsPage'
import { MarketingReferencePage } from '../operations/MarketingReferencePage'
import { AgendaReferencePage } from '../operations/AgendaReferencePage'
import { ReportsReferencePage } from '../operations/ReportsReferencePage'
import { AccountingReferencePage } from '../operations/AccountingReferencePage'
import { RHReferencePage } from '../operations/RHReferencePage'
import { SettingsReferencePage } from '../operations/SettingsReferencePage'
import { ChatReferencePage } from '../operations/ChatReferencePage'
import { ContactsPage } from './pages/ContactsPage'
import { CrmDashboardPage } from './pages/CrmDashboardPage'
import { ReportsPage } from './pages/ReportsPage'

export default function CrmRoutes(){
  return <Routes>
    <Route index element={<CrmDashboardPage/>}/>
    <Route path="contatos" element={<ContactsPage/>}/>
    <Route path="campanhas" element={<Navigate to="/app/crm/marketing/campanhas" replace/>}/>
    <Route path="marketing" element={<Navigate to="/app/crm/marketing/visao-geral" replace/>}/>
    <Route path="marketing/:sectionKey" element={<MarketingReferencePage/>}/>
    <Route path="chat" element={<ChatReferencePage/>}/>
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
    <Route path="financeiro" element={<AccountingReferencePage/>}/>
    <Route path="financeiro/contabilidade" element={<AccountingReferencePage/>}/>
    <Route path="accounting" element={<Navigate to="/app/crm/financeiro" replace/>}/>
    <Route path="rh" element={<RHReferencePage/>}/>
    <Route path="settings" element={<SettingsReferencePage/>}/>
    <Route path=":moduleKey" element={<OperationsPage/>}/>
    <Route path="*" element={<Navigate to="/app/crm" replace/>}/>
  </Routes>
}
