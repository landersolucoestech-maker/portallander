import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/access/LoginPage'
import { WorkspacePage } from '../features/access/WorkspacePage'
import { ProfilePage } from '../features/access/AccountPages'
import CrmWorkspace from '../features/access/CrmWorkspace'
import DashboardPage from '../features/dashboard/DashboardPage'
import ContractsPage from '../features/contracts/ContractsPage'
import FinancePage from '../features/finance/FinancePage'
import FinanceMainPage from '../features/finance/FinanceMainPage'
import FinanceInvoicesPage from '../features/finance/FinanceInvoicesPage'
import FinanceAccountingPage from '../features/finance/FinanceAccountingPage'
import SiteManagerRoutes from '../features/site-manager/SiteManagerRoutes'
import '../styles/admin-entry.css'

export default function InternalApp(){
  return <Routes>
    <Route path="/app" element={<Navigate to="/app/login" replace/>}/>
    <Route path="/app/login" element={<LoginPage/>}/>
    <Route path="/app/workspaces" element={<WorkspacePage/>}/>
    <Route path="/app/profile" element={<ProfilePage/>}/>
    <Route path="/app/dashboard" element={<DashboardPage/>}/>
    <Route path="/app/crm/*" element={<CrmWorkspace/>}/>
    <Route path="/app/contracts" element={<ContractsPage/>}/>
    <Route path="/app/finance" element={<FinanceMainPage/>}/>
    <Route path="/app/finance/invoices" element={<FinanceInvoicesPage/>}/>
    <Route path="/app/finance/accounting" element={<FinanceAccountingPage/>}/>
    <Route path="/app/finance/rules" element={<FinancePage/>}/>
    <Route path="/app/finance/categories" element={<FinancePage/>}/>
    <Route path="/app/finance/automations" element={<Navigate to="/app/finance" replace/>}/>
    <Route path="/app/site/*" element={<SiteManagerRoutes/>}/>
    <Route path="*" element={<Navigate to="/app/login" replace/>}/>
  </Routes>
}
