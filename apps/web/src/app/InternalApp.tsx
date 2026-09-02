import {type ReactNode} from 'react'
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

function RequireAdmin({children}:{children:ReactNode}){return children}
const protectedRoute=(element:ReactNode)=><RequireAdmin>{element}</RequireAdmin>

function InternalRoutes(){return <Routes>
  <Route path="/app" element={<Navigate to="/app/dashboard" replace/>}/>
  <Route path="/app/login" element={<Navigate to="/app/dashboard" replace/>}/>
  <Route path="/app/profile" element={protectedRoute(<ProfilePage/>)}/>
  <Route path="/app/dashboard" element={protectedRoute(<DashboardPage/>)}/>
  <Route path="/app/crm/*" element={protectedRoute(<CrmModuleRoutes/>)}/>
  <Route path="/app/contracts" element={protectedRoute(<ContractsPage/>)}/>
  <Route path="/app/agenda" element={protectedRoute(<AgendaPage/>)}/>
  <Route path="/app/chat" element={protectedRoute(<ChatPage/>)}/>
  <Route path="/app/chat/settings" element={protectedRoute(<ChatAutomationSettingsPage/>)}/>
  <Route path="/app/rh" element={protectedRoute(<RHPage/>)}/>
  <Route path="/app/marketing/*" element={protectedRoute(<MarketingPage/>)}/>
  <Route path="/app/reports" element={protectedRoute(<ReportsPage/>)}/>
  <Route path="/app/relatorios" element={<Navigate to="/app/reports" replace/>}/>
  <Route path="/app/settings" element={protectedRoute(<SettingsPage/>)}/>
  <Route path="/app/configuracoes" element={<Navigate to="/app/settings" replace/>}/>
  <Route path="/app/finance" element={protectedRoute(<FinanceMainPage/>)}/>
  <Route path="/app/finance/invoices" element={protectedRoute(<FinanceInvoicesPage/>)}/>
  <Route path="/app/finance/accounting" element={protectedRoute(<FinanceAccountingPage/>)}/>
  <Route path="/app/finance/rules" element={protectedRoute(<FinanceRegistryPage/>)}/>
  <Route path="/app/finance/categories" element={protectedRoute(<FinanceRegistryPage/>)}/>
  <Route path="/app/finance/automations" element={<Navigate to="/app/finance" replace/>}/>
  <Route path="/app/site/*" element={protectedRoute(<SiteManagerRoutes/>)}/>
  <Route path="*" element={<Navigate to="/app/dashboard" replace/>}/>
</Routes>}

export default function InternalApp(){return <AdminAuthProvider><InternalRoutes/></AdminAuthProvider>}
