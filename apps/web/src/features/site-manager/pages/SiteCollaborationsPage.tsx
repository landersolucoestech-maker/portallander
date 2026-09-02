import {Inbox,Newspaper} from 'lucide-react'
import {Link} from 'react-router-dom'
import {AdminEmpty,AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'

function ContentTabs(){return <div className="admin-toolbar"><div className="admin-toolbar-group"><Link className="button outline" to="/app/site/conteudos"><Newspaper size={15}/>Publicações</Link><Link className="button" to="/app/site/conteudos/colaboracoes"><Inbox size={15}/>Colaborações recebidas</Link></div></div>}

export function SiteCollaborationsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Conteúdos',description:'Gerencie publicações e materiais enviados pelo público sem misturar os dois fluxos editoriais.'}}>
    <ContentTabs/>
    <AdminNotice title="Recebimento ainda não conectado" description="O formulário Colabore já existe no site público, mas ainda não há endpoint persistente para registrar submissões. Esta fila permanecerá vazia até que o motor de formulários e o armazenamento seguro sejam conectados."/>
    <AdminEmpty title="Nenhuma colaboração recebida" description="Materiais enviados pelo formulário Colabore aparecerão aqui para triagem editorial, sem serem convertidos automaticamente em Leads do CRM."/>
  </AdminShell>
}
