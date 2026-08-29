import { Navigate, Route, Routes } from 'react-router-dom'
import { OperationsPage } from './OperationsPage'

export default function OperationsRoutes(){
  return <Routes>
    <Route index element={<Navigate to="/app/operations/accounting" replace/>}/>
    <Route path=":moduleKey" element={<OperationsPage/>}/>
    <Route path="*" element={<Navigate to="/app/operations/accounting" replace/>}/>
  </Routes>
}
