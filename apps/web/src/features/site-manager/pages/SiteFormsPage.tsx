import {FileInput,UsersRound} from 'lucide-react'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {systemForms} from '../forms/catalog'

const purposeLabel={lead_capture:'Captação comercial',contact:'Contato',advertising:'Publicidade',editorial_submission:'Submissão editorial',newsletter:'Newsletter',survey:'Pesquisa',event_registration:'Inscrição',custom:'Personalizado'} as const
const destinationLabel={crm:'CRM → Leads',content_collaborations:'Site → Conteúdos → Colaborações recebidas',marketing:'Marketing',internal:'Interno',none:'Sem destino'} as const
const statusLabel={draft:'Rascunho',active:'Ativo',inactive:'Inativo'} as const

export function SiteFormsPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Formulários',description:'Defina e publique formulários do site sem misturar a configuração da captura com a operação dos dados recebidos.'}}>
    <AdminNotice title="Fonte central de formulários" description="Campos, finalidade, consentimentos e roteamento pertencem a esta área. Leads continuam no CRM e materiais do Colabore em Conteúdos → Colaborações recebidas."/>
    <div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Formulário</th><th>Finalidade</th><th>Destino operacional</th><th>Campos</th><th>Consentimentos</th><th>Status</th></tr></thead><tbody>{systemForms.map(form=>{const Icon=form.purpose==='editorial_submission'?FileInput:UsersRound;return <tr key={form.id}><td><div className="table-primary"><span className="table-avatar"><Icon size={15} aria-hidden="true"/></span><div><b>{form.name}</b><small>/{form.slug}</small></div></div></td><td>{purposeLabel[form.purpose]}</td><td>{destinationLabel[form.routing.destination]}</td><td>{form.fields.length}</td><td>{form.consents.length}</td><td>{statusLabel[form.status]}</td></tr>})}</tbody></table></section></div>
    <AdminNotice title="Persistência de produção" description="As respostas não são armazenadas no navegador. O frontend utiliza um contrato de submissão por API; falta implantar um backend e banco próprios do Portal Lander antes de habilitar recebimento persistente em produção."/>
  </AdminShell>
}
