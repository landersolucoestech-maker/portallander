import {lazy,Suspense,type ReactNode} from 'react'
import {Navigate,Route,Routes,useLocation} from 'react-router-dom'
import {AdminAuthProvider} from '../features/access/AdminAuthContext'
import {useAdminAuth} from '../features/access/adminAuthState'
import '../styles/admin-entry.css'

const LoginPage=lazy(()=>import('../features/access/LoginPage').then(module=>({default:module.LoginPage})))
const ProfilePage=lazy(()=>import('../features/access/AccountPages').then(module=>({default:module.ProfilePage})))
const CrmModuleRoutes=lazy(()=>import('../features/access/CrmModuleRoutes'))
const DashboardPage=lazy(()=>import('../features/dashboard/DashboardPage'))
const ContractsPage=lazy(()=>import('../features/contracts/ContractsPage'))
const AgendaPage=lazy(()=>import('../features/agenda/AgendaPage'))
const ChatPage=lazy(()=>import('../features/chat/ChatPage'))
const ChatAutomationSettingsPage=lazy(()=>import('../features/chat/ChatAutomationSettingsPage'))
const RHPage=lazy(()=>import('../features/rh/RHPage'))
const MarketingPage=lazy(()=>import('../features/marketing/MarketingPage'))
const ReportsPage=lazy(()=>import('../features/reports/ReportsPage'))
const SettingsPage=lazy(()=>import('../features/settings/SettingsPage'))
const EditorialSourcesPage=lazy(()=>import('../features/settings/EditorialSourcesPage'))
const FinanceMainPage=lazy(()=>import('../features/finance/FinanceMainPage'))
const FinanceInvoicesPage=lazy(()=>import('../features/finance/FinanceInvoicesPage'))
const FinanceAccountingPage=lazy(()=>import('../features/finance/FinanceAccountingPage'))
const FinanceRegistryPage=lazy(()=>import('../features/finance/FinanceRegistryPage'))
const SiteManagerRoutes=lazy(()=>import('../features/site-manager/SiteManagerRoutes'))

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
  <Route path="/app/rh" element={protectedRoute(<RHPage/>)}/>
  <Route path="/app/marketing/*" element={protectedRoute(<MarketingPage/>)}/>
  <Route path="/app/reports" element={protectedRoute(<ReportsPage/>)}/>
  <Route path="/app/relatorios" element={<Navigate to="/app/reports" replace/>}/>
  <Route path="/app/settings/integracoes/editoriais" element={protectedRoute(<EditorialSourcesPage/>)}/>
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
</Routes></Suspense>}

export default function InternalApp(){return <AdminAuthProvider><InternalRoutes/></AdminAuthProvider>}
