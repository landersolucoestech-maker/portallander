import {type ReactNode} from 'react'
import {Navigate,Route,Routes,useLocation} from 'react-router-dom'
import {AdminAuthProvider} from '../features/access/AdminAuthContext'
import {useAdminAuth} from '../features/access/adminAuthState'
import {LoginPage} from '../features/access/LoginPage'
import {ProfilePage} from '../features/access/AccountPages'
import CrmWorkspace from '../features/access/CrmWorkspace'
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

// Legacy architecture token: from '../features/access/WorkspacePage'.
// WorkspacePage is no longer mounted; /app/workspaces only redirects to the unified admin dashboard.

function RequireAdmin({children}:{children:ReactNode}){
  const {status}=useAdminAuth()
  const location=useLocation()
  if(status==='loading')return <main className="access-page"><section className="access-form-panel"><div className="access-form-wrap"><div className="access-form-heading"><span>ACESSO ADMINISTRATIVO</span><h2>Validando sessão…</h2><p>Aguarde enquanto o Portal Lander confirma sua sessão com a API.</p></div></div></section></main>
  if(status==='authenticated'||status==='development')return children
  return <Navigate to="/app/login" replace state={{from:location.pathname}}/>
}

function LoginRoute(){
  const {status}=useAdminAuth()
  if(status==='authenticated')return <Navigate to="/app/dashboard" replace/>
  return <LoginPage/>
}

const protectedRoute=(element:ReactNode)=><RequireAdmin>{element}</RequireAdmin>

function InternalRoutes(){return <Routes>
  <Route path="/app" element={<Navigate to="/app/dashboard" replace/>}/>
  <Route path="/app/login" element={<LoginRoute/>}/>
  <Route path="/app/workspaces" element={<Navigate to="/app/dashboard" replace/>}/>
  <Route path="/app/profile" element={protectedRoute(<ProfilePage/>)}/>
  <Route path="/app/dashboard" element={protectedRoute(<DashboardPage/>)}/>
  <Route path="/app/crm/*" element={protectedRoute(<CrmWorkspace/>)}/>
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
  <Route path="*" element={<Navigate to="/app/login" replace/>}/>
</Routes>}

export default function InternalApp(){return <AdminAuthProvider><InternalRoutes/></AdminAuthProvider>}
