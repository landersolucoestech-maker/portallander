import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'
import { CRM_WORKSPACE_NAV } from '../../shared/internal/adminNavigation'

function CrmWorkspaceHome(){
  return <AdminShell area="crm" items={CRM_WORKSPACE_NAV}>
    <AdminPageHeader eyebrow="WORKSPACE" title="CRM" description="Workspace administrativo preservado para receber os módulos reconstruídos."/>
  </AdminShell>
}

export default function CrmWorkspace(){
  return <Routes>
    <Route index element={<CrmWorkspaceHome/>}/>
    <Route path="*" element={<Navigate to="/app/crm" replace/>}/>
  </Routes>
}
