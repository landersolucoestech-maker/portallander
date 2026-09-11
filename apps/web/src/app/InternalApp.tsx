import {lazy,Suspense,type ReactNode} from 'react'
import {Navigate,Route,Routes,useLocation} from 'react-router-dom'
import {AdminAuthProvider} from '../modules/access/AdminAuthContext'
import {useAdminAuth} from '../modules/access/adminAuthState'
import '../styles/admin-entry.css'

const LoginPage=lazy(()=>import('../modules/access/LoginPage').then(module=>({default:module.LoginPage})))
const ProfilePage=lazy(()=>import('../modules/access/AccountPages').then(module=>({default:module.ProfilePage})))
const CrmModuleRoutes=lazy(()=>import('../modules/access/CrmModuleRoutes'))
const DashboardPage=lazy(()=>import('../modules/dashboard/DashboardPage'))
const ContractsPage=lazy(()=>import('../modules/contracts/ContractsPage'))
const AgendaPage=lazy(()=>import('../modules/agenda/AgendaPage'))
const ChatPage=lazy(()=>import('../modules/chat/ChatPage'))
const ChatAutomationSettingsPage=lazy(()=>import('../modules/chat/ChatAutomationSettingsPage'))
const HRPage=lazy(()=>import('../modules/hr/HRPage'))
const MetricsPage=lazy(()=>import('../modules/analytics/MetricsPage'))
const EditorialAdminPage=lazy(()=>import('../modules/editorial/EditorialAdminPage'))
const MarketingPage=lazy(()=>import('../modules/marketing/MarketingPage'))
const ReportsPage=lazy(()=>import('../modules/reports/ReportsPage'))
const SettingsPage=lazy(()=>import('../modules/settings/SettingsPage'))
const FinanceMainPage=lazy(()=>import('../modules/finance/FinanceMainPage'))
const FinanceInvoicesPage=lazy(()=>import('../modules/finance/FinanceInvoicesPage'))
const FinanceAccountingPage=lazy(()=>import('../modules/finance/FinanceAccountingPage'))
const FinanceRegistryPage=lazy(()=>import('../modules/finance/FinanceRegistryPage'))
const SiteManagerRoutes=lazy(()=>import('../modules/site-manager/SiteManagerRoutes'))

function RequireAdmin({children}:{children:ReactNode}){
  const {status}=useAdminAuth()
  const location=useLocation()
  if(status==='loading')return <main className="access-page"><section className="access-form-panel"><div className="access-form-wrap"><div className="access-form-heading"><span>ACESSO ADMINISTRATIVO</span><h2>Validando sessão…</h2><p>Aguarde enquanto o Portal Lander confirma sua sessão com a API.</p></div></div></section></main>
  if(status==='authenticated'||status==='development')return children
  return <Navigate to="/app/login" replace state={{from:location.pathname}}/>
}

function LoginRoute(){
  const {status}=useAdminAuth()
  if(status==='authenticated'||status==='development')return <Navigate to="/app/dashboard" replace/>
  return <LoginPage/>
}

const protectedRoute=(element:ReactNode)=><RequireAdmin>{element}</RequireAdmin>

function InternalRoutes(){return <Suspense fallback={null}><Routes>
  <Route path="/app" element={<Navigate to="/app/login" replace/>}/>
  <Route path="/app/login" element={<LoginRoute/>}/>
  <Route path="/app/profile" element={protectedRoute(<ProfilePage/>)}/>
  <Route path="/app/dashboard" element={protectedRoute(<DashboardPage/>)}/>
  <Route path="/app/crm/*" element={protectedRoute(<CrmModuleRoutes/>)}/>
  <Route path="/app/contracts" element={protectedRoute(<ContractsPage/>)}/>
  <Route path="/app/agenda" element={protectedRoute(<AgendaPage/>)}/>
  <Route path="/app/chat" element={protectedRoute(<ChatPage/>)}/>
  <Route path="/app/chat/settings" element={protectedRoute(<ChatAutomationSettingsPage/>)}/>
  <Route path="/app/hr" element={protectedRoute(<HRPage/>)}/>
  <Route path="/app/metrics" element={protectedRoute(<MetricsPage/>)}/>
  <Route path="/app/editorial" element={protectedRoute(<EditorialAdminPage/>)}/>
  <Route path="/app/editorial/content" element={protectedRoute(<EditorialAdminPage/>)}/>
  <Route path="/app/marketing/*" element={protectedRoute(<MarketingPage/>)}/>
  <Route path="/app/reports" element={protectedRoute(<ReportsPage/>)}/>
  <Route path="/app/settings" element={protectedRoute(<SettingsPage/>)}/>
  <Route path="/app/finance" element={protectedRoute(<FinanceMainPage/>)}/>
  <Route path="/app/finance/invoices" element={protectedRoute(<FinanceInvoicesPage/>)}/>
  <Route path="/app/finance/accounting" element={protectedRoute(<FinanceAccountingPage/>)}/>
  <Route path="/app/finance/rules" element={protectedRoute(<FinanceRegistryPage/>)}/>
  <Route path="/app/finance/categories" element={protectedRoute(<FinanceRegistryPage/>)}/>
  <Route path="/app/finance/automations" element={<Navigate to="/app/finance" replace/>}/>
  <Route path="/app/site/*" element={protectedRoute(<SiteManagerRoutes/>)}/>
  <Route path="*" element={<Navigate to="/app/login" replace/>}/>
</Routes></Suspense>}

export default function InternalApp(){return <AdminAuthProvider><InternalRoutes/></AdminAuthProvider>}
