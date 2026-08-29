import { Navigate, Route, Routes } from 'react-router-dom'
import { OperationsPage } from '../operations/OperationsPage'
import { ContractsReferencePage } from '../operations/ContractsReferencePage'
import { MarketingReferencePage } from '../operations/MarketingReferencePage'
import { AgendaReferencePage } from '../operations/AgendaReferencePage'
import { ReportsReferencePage } from '../operations/ReportsReferencePage'
import { AccountingSectionPage } from '../operations/AccountingSectionPage'
import { RHReferencePage } from '../operations/RHReferencePage'
import { SettingsSectionPage } from '../operations/SettingsSectionPage'
import { ChatSectionPage } from '../operations/ChatSectionPage'
import { ContactsReferencePage } from './pages/ContactsReferencePage'
import { CrmDashboardPage } from './pages/CrmDashboardPage'
import { ReportsPage } from './pages/ReportsPage'

function SeparatedContractRoute({section}:{section:'contracts'|'templates'|'variables'|'categories'}){return <div className="reference-route-separated"><ContractsReferencePage initialTab={section}/></div>}

export default function CrmRoutes(){
  return <Routes>
    <Route index element={<CrmDashboardPage/>}/>
    <Route path="contatos" element={<ContactsReferencePage/>}/>
    <Route path="campanhas" element={<Navigate to="/app/crm/marketing/campanhas" replace/>}/>
    <Route path="marketing" element={<Navigate to="/app/crm/marketing/visao-geral" replace/>}/>
    <Route path="marketing/:sectionKey" element={<MarketingReferencePage/>}/>
    <Route path="chat" element={<ChatSectionPage section="chat"/>}/>
    <Route path="chat/automacoes" element={<ChatSectionPage section="automacoes"/>}/>
    <Route path="musicchat" element={<Navigate to="/app/crm/chat" replace/>}/>
    <Route path="internal-chat" element={<Navigate to="/app/crm/chat" replace/>}/>
    <Route path="contracts" element={<SeparatedContractRoute section="contracts"/>}/>
    <Route path="contracts/templates" element={<SeparatedContractRoute section="templates"/>}/>
    <Route path="contracts/categorias" element={<SeparatedContractRoute section="categories"/>}/>
    <Route path="contracts/variaveis" element={<SeparatedContractRoute section="variables"/>}/>
    <Route path="events" element={<AgendaReferencePage/>}/>
    <Route path="integrations" element={<Navigate to="/app/crm/settings" replace/>}/>
    <Route path="relatorios" element={<ReportsPage/>}/>
    <Route path="reports" element={<ReportsReferencePage/>}/>
    <Route path="financeiro" element={<AccountingSectionPage section="financeiro"/>}/>
    <Route path="financeiro/contabilidade" element={<AccountingSectionPage section="contabilidade"/>}/>
    <Route path="financeiro/nota-fiscal" element={<AccountingSectionPage section="notas"/>}/>
    <Route path="financeiro/categorias" element={<AccountingSectionPage section="categorias"/>}/>
    <Route path="financeiro/regras" element={<AccountingSectionPage section="financial-rules"/>}/>
    <Route path="financeiro/regras-transacao" element={<AccountingSectionPage section="transaction-rules"/>}/>
    <Route path="accounting" element={<Navigate to="/app/crm/financeiro" replace/>}/>
    <Route path="rh" element={<RHReferencePage/>}/>
    <Route path="settings" element={<SettingsSectionPage section="configuracoes"/>}/>
    <Route path="settings/perfil" element={<SettingsSectionPage section="perfil"/>}/>
    <Route path="settings/usuarios" element={<SettingsSectionPage section="usuarios"/>}/>
    <Route path="settings/audit-trail" element={<SettingsSectionPage section="auditoria"/>}/>
    <Route path="settings/billing" element={<SettingsSectionPage section="billing"/>}/>
    <Route path=":moduleKey" element={<OperationsPage/>}/>
    <Route path="*" element={<Navigate to="/app/crm" replace/>}/>
  </Routes>
}
