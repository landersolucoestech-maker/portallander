import {Navigate,Route,Routes} from 'react-router-dom'
import DashboardPage from '../dashboard/DashboardPage'
import CrmPage from '../crm/CrmPage'

export default function CrmWorkspace(){
 return <Routes>
  <Route index element={<DashboardPage/>}/>
  <Route path="leads" element={<CrmPage view="leads"/>}/>
  <Route path="contatos" element={<CrmPage view="contacts"/>}/>
  <Route path="*" element={<Navigate to="/app/crm" replace/>}/>
 </Routes>
}
