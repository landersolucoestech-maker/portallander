import {lazy,Suspense} from 'react'
import {Navigate,Route,Routes} from 'react-router-dom'
import {AdminAuthProvider} from '../features/access/AdminAuthContext'
import '../styles/admin-entry.css'

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
const FinanceMainPage=lazy(()=>import('../features/finance/FinanceMainPage'))
const FinanceInvoicesPage=lazy(()=>import('../features/finance/FinanceInvoicesPage'))
const FinanceAccountingPage=lazy(()=>import('../features/finance/FinanceAccountingPage'))
const FinanceRegistryPage=lazy(()=>import('../features/finance/FinanceRegistryPage'))
const SiteManagerRoutes=lazy(()=>import('../features/site-manager/SiteManagerRoutes'))

function InternalRoutes(){return <Suspense fallback={null}><Routes>
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
</Routes></Suspense>}

export default function InternalApp(){return <AdminAuthProvider><InternalRoutes/></AdminAuthProvider>}
