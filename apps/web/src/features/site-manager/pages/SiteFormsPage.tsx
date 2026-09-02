import {ClipboardList,FileInput,UsersRound} from 'lucide-react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'

const forms=[
  {id:'lead-capture',name:'Captação de Leads',purpose:'Captação comercial',destination:'CRM → Leads',icon:UsersRound,status:'Estrutura pendente'},
  {id:'collaborate',name:'Colabore',purpose:'Submissão editorial',destination:'Site → Conteúdos → Colaborações recebidas',icon:FileInput,status:'Formulário público existente'},
] as const

export function SiteFormsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Formulários',description:'Defina e publique formulários do site sem misturar a configuração da captura com a operação dos dados recebidos.'}}>
    <AdminNotice title="Motor de formulários em implantação" description="Esta área passa a ser a fonte de definição dos formulários. O endpoint persistente, versionamento, anti-spam, consentimentos e roteamento ainda precisam ser conectados antes de habilitar publicação e recebimento real."/>
    <div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Formulário</th><th>Finalidade</th><th>Destino operacional</th><th>Status</th></tr></thead><tbody>{forms.map(form=>{const Icon=form.icon;return <tr key={form.id}><td><div className="table-primary"><span className="table-avatar"><Icon size={15} aria-hidden="true"/></span><div><b>{form.name}</b><small>{form.id}</small></div></div></td><td>{form.purpose}</td><td>{form.destination}</td><td>{form.status}</td></tr>})}</tbody></table></section></div>
    <AdminNotice title="Regra de responsabilidade" description="Formulários configuram a captura. Leads continuam sendo operados no CRM e materiais enviados pelo Colabore continuam sendo operados em Conteúdos → Colaborações recebidas."/>
  </AdminShell>
}
