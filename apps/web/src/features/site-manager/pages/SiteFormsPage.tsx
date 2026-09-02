import {FileInput,UsersRound} from 'lucide-react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {systemForms} from '../forms/catalog'

const purposeLabel={lead_capture:'Captação comercial',contact:'Contato',advertising:'Publicidade',editorial_submission:'Submissão editorial',newsletter:'Newsletter',survey:'Pesquisa',event_registration:'Inscrição',custom:'Personalizado'} as const
const destinationLabel={crm:'CRM → Leads',content_collaborations:'Site → Conteúdos → Colaborações recebidas',marketing:'Marketing',internal:'Interno',none:'Sem destino'} as const
const statusLabel={draft:'Rascunho',active:'Ativo',inactive:'Inativo'} as const

export function SiteFormsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Formulários',description:'Defina e publique formulários do site sem misturar a configuração da captura com a operação dos dados recebidos.'}}>
    <AdminNotice title="Motor de formulários em implantação" description="Esta área passa a ser a fonte de definição dos formulários. O endpoint persistente, versionamento, anti-spam, consentimentos e roteamento ainda precisam ser conectados antes de habilitar publicação e recebimento real."/>
    <div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Formulário</th><th>Finalidade</th><th>Destino operacional</th><th>Status</th></tr></thead><tbody>{systemForms.map(form=>{const Icon=form.purpose==='editorial_submission'?FileInput:UsersRound;return <tr key={form.id}><td><div className="table-primary"><span className="table-avatar"><Icon size={15} aria-hidden="true"/></span><div><b>{form.name}</b><small>{form.slug}</small></div></div></td><td>{purposeLabel[form.purpose]}</td><td>{destinationLabel[form.routing.destination]}</td><td>{statusLabel[form.status]}</td></tr>})}</tbody></table></section></div>
    <AdminNotice title="Regra de responsabilidade" description="Formulários configuram a captura. Leads continuam sendo operados no CRM e materiais enviados pelo Colabore continuam sendo operados em Conteúdos → Colaborações recebidas."/>
  </AdminShell>
}
