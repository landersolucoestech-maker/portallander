import {Navigate,Route,Routes} from 'react-router-dom'
import {AdminAuthProvider} from '../features/access/AdminAuthContext'
import {ProfilePage} from '../features/access/AccountPages'
import CrmModuleRoutes from '../features/access/CrmModuleRoutes'
import DashboardPage from '../features/dashboard/DashboardPage'
import ContractsPage from '../features/contracts/ContractsPage'
import AgendaPage from '../features/agenda/AgendaPage'
import ChatPage from '../features/chat/ChatPage'
import ChatAutomationSettingsPage from '../features/chat/ChatAutomationSettingsPage'
import RHPage from '../features/rh/RHPage'
import MarketingPage from '../features/marketing/MarketingPage'
import ReportsPage from '../features/reports/ReportsPage'
import SettingsPage from '../features/settings/SettingsPage'
import FinanceMainPage from '../features/finance/FinanceMainPage'
import FinanceInvoicesPage from '../features/finance/FinanceInvoicesPage'
import FinanceAccountingPage from '../features/finance/FinanceAccountingPage'
import FinanceRegistryPage from '../features/finance/FinanceRegistryPage'
import SiteManagerRoutes from '../features/site-manager/SiteManagerRoutes'
import '../styles/admin-entry.css'

function InternalRoutes(){return <Routes>
  <Route path="/app" element={<Navigate to="/app/dashboard" replace/>}/>
  <Route path="/app/login" element={<Navigate to="/app/dashboard" replace/>}/>
  <Route path="/app/profile" element={<ProfilePage/>}/>
  <Route path="/app/dashboard" element={<DashboardPage/>}/>
  <Route path="/app/crm/*" element={<CrmModuleRoutes/>}/>
  <Route path="/app/contracts" element={<ContractsPage/>}/>
  <Route path="/app/agenda" element={<AgendaPage/>}/>
  <Route path="/app/chat" element={<ChatPage/>}/>
  <Route path="/app/chat/settings" element={<ChatAutomationSettingsPage/>}/>
  <Route path="/app/rh" element={<RHPage/>}/>
  <Route path="/app/marketing/*" element={<MarketingPage/>}/>
  <Route path="/app/reports" element={<ReportsPage/>}/>
  <Route path="/app/relatorios" element={<Navigate to="/app/reports" replace/>}/>
  <Route path="/app/settings" element={<SettingsPage/>}/>
  <Route path="/app/configuracoes" element={<Navigate to="/app/settings" replace/>}/>
  <Route path="/app/finance" element={<FinanceMainPage/>}/>
  <Route path="/app/finance/invoices" element={<FinanceInvoicesPage/>}/>
  <Route path="/app/finance/accounting" element={<FinanceAccountingPage/>}/>
  <Route path="/app/finance/rules" element={<FinanceRegistryPage/>}/>
  <Route path="/app/finance/categories" element={<FinanceRegistryPage/>}/>
  <Route path="/app/finance/automations" element={<Navigate to="/app/finance" replace/>}/>
  <Route path="/app/site/*" element={<SiteManagerRoutes/>}/>
  <Route path="*" element={<Navigate to="/app/dashboard" replace/>}/>
</Routes>}

export default function InternalApp(){return <AdminAuthProvider><InternalRoutes/></AdminAuthProvider>}
