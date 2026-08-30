import {Navigate,Route,Routes} from 'react-router-dom'
import CrmPage from '../crm/CrmPage'

export default function CrmWorkspace(){
 return <Routes>
  <Route index element={<CrmPage/>}/>
  <Route path="contatos" element={<CrmPage/>}/>
  <Route path="leads" element={<CrmPage/>}/>
  <Route path="*" element={<Navigate to="/app/crm" replace/>}/>
 </Routes>
}
