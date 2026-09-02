import {Copy,FileInput,Pencil,Plus,Trash2,UsersRound} from 'lucide-react'
import {useMemo,useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {siteFormRegistry} from '../forms/catalog'
import {formDraftRepository} from '../forms/draftRepository'
import type {SiteFormDefinition} from '../forms/domain'

const purposeLabel={lead_capture:'Captação comercial',contact:'Contato',advertising:'Publicidade',editorial_submission:'Submissão editorial',newsletter:'Newsletter',survey:'Pesquisa',event_registration:'Inscrição',custom:'Personalizado'} as const
const destinationLabel={crm:'CRM → Leads',content_collaborations:'Site → Conteúdos → Colaborações recebidas',marketing:'Marketing',internal:'Interno',none:'Sem destino'} as const
const statusLabel={draft:'Rascunho',active:'Ativo',inactive:'Inativo'} as const

export function SiteFormsPage(){
  const navigate=useNavigate()
  const [drafts,setDrafts]=useState<SiteFormDefinition[]>(()=>formDraftRepository.list())
  const forms=useMemo(()=>[...siteFormRegistry,...drafts],[drafts])
  const createForm=()=>{const form=formDraftRepository.create();setDrafts(formDraftRepository.list());navigate(`/app/site/formularios/${form.id}`)}
  const duplicateForm=(form:SiteFormDefinition)=>{const draft=formDraftRepository.duplicate(form);setDrafts(formDraftRepository.list());navigate(`/app/site/formularios/${draft.id}`)}
  const deleteDraft=(form:SiteFormDefinition)=>{if(form.source!=='custom')return;if(!window.confirm(`Excluir o rascunho “${form.name}”?`))return;formDraftRepository.remove(form.id);setDrafts(formDraftRepository.list())}

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Formulários',description:'Defina formulários do site sem misturar configuração, publicação e operação dos dados recebidos.'}} headerAction={{label:'Novo formulário',icon:Plus,onClick:createForm}}>
    <AdminNotice title="Fonte central de formulários" description="Formulários do sistema continuam imutáveis até existir persistência compartilhada. Você pode criar ou duplicar rascunhos locais para estruturar novos formulários sem publicá-los por engano."/>
    <div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Formulário</th><th>Origem</th><th>Finalidade</th><th>Destino operacional</th><th>Versão</th><th>Campos</th><th>Consentimentos</th><th>Status</th><th>Ações</th></tr></thead><tbody>{forms.map(form=>{const Icon=form.purpose==='editorial_submission'?FileInput:UsersRound;return <tr key={form.id}><td><div className="table-primary"><span className="table-avatar"><Icon size={15} aria-hidden="true"/></span><div><b>{form.name}</b><small>/{form.slug}</small></div></div></td><td>{form.source==='custom'?'Rascunho local':'Sistema'}</td><td>{purposeLabel[form.purpose]}</td><td>{destinationLabel[form.routing.destination]}</td><td>v{form.version}</td><td>{form.fields.length}</td><td>{form.consents.length}</td><td>{form.source==='custom'?'Rascunho local':statusLabel[form.status]}</td><td><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><Link className="button outline" to={`/app/site/formularios/${form.id}`}><Pencil size={14}/>{form.source==='custom'?'Editar':'Visualizar / editar'}</Link><button type="button" className="button outline" onClick={()=>duplicateForm(form)} title="Criar uma cópia editável como rascunho"><Copy size={14}/>Duplicar</button>{form.source==='custom'&&<button type="button" className="button outline" onClick={()=>deleteDraft(form)}><Trash2 size={14}/>Excluir</button>}</div></td></tr>})}</tbody></table></section></div>
    <AdminNotice title="Publicação e submissões" description="Rascunhos locais não entram no site público nem no endpoint de submissão. A publicação continuará bloqueada até a persistência do Portal Lander estar conectada; leads permanecem no CRM e materiais do Colabore em Conteúdos → Colaborações recebidas."/>
  </AdminShell>
}
