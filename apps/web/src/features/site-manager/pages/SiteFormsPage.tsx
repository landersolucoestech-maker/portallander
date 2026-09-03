import {FileInput,Plus,UsersRound} from 'lucide-react'
import {useCallback,useEffect,useMemo,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAdminAuth} from '../../access/adminAuthState'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {TableRowActionMenu} from '../../../shared/internal/TableRowActionMenu'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {createAdminSiteForm,deleteAdminSiteForm,listAdminSiteForms} from '../forms/adminClient'
import {listRuntimeSiteForms} from '../forms/catalog'
import {formDraftRepository} from '../forms/draftRepository'
import type {SiteFormDefinition} from '../forms/domain'

const purposeLabel={lead_capture:'Captação comercial',contact:'Contato',advertising:'Publicidade',editorial_submission:'Submissão editorial',newsletter:'Newsletter',survey:'Pesquisa',event_registration:'Inscrição',custom:'Personalizado'} as const
const destinationLabel={crm:'CRM → Leads',content_collaborations:'Site → Conteúdos → Colaborações recebidas',marketing:'Marketing',internal:'Interno',none:'Sem destino'} as const
const statusLabel={draft:'Rascunho',active:'Ativo',inactive:'Inativo'} as const

const newFormDefinition=():SiteFormDefinition=>{
  const suffix=crypto.randomUUID().slice(0,8)
  return {
    id:`form-${crypto.randomUUID()}`,
    name:'Novo formulário',
    slug:`novo-formulario-${suffix}`,
    version:1,
    purpose:'custom',
    status:'draft',
    source:'custom',
    fields:[],
    consents:[],
    routing:{destination:'none'},
    successMessage:'Recebemos suas informações com sucesso.',
  }
}

export function SiteFormsPage(){
  const navigate=useNavigate()
  const {status}=useAdminAuth()
  const persisted=status==='authenticated'
  const [drafts,setDrafts]=useState<SiteFormDefinition[]>(()=>formDraftRepository.list())
  const [remoteForms,setRemoteForms]=useState<SiteFormDefinition[]>([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const forms=useMemo(()=>persisted?remoteForms:[...listRuntimeSiteForms(),...drafts],[persisted,remoteForms,drafts])

  const reload=useCallback(async()=>{
    if(!persisted)return
    setLoading(true);setError('')
    try{setRemoteForms(await listAdminSiteForms())}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível carregar os formulários persistidos.')}
    finally{setLoading(false)}
  },[persisted])

  useEffect(()=>{
    if(!persisted)return
    let active=true
    void listAdminSiteForms().then(items=>{
      if(active){setRemoteForms(items);setError('')}
    }).catch(caught=>{
      if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar os formulários persistidos.')
    })
    return()=>{active=false}
  },[persisted])

  const createForm=async()=>{
    setError('')
    if(!persisted){const form=formDraftRepository.create();setDrafts(formDraftRepository.list());navigate(`/app/site/formularios/${form.id}`);return}
    try{const form=await createAdminSiteForm(newFormDefinition());navigate(`/app/site/formularios/${form.id}`)}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível criar o formulário.')}
  }

  const duplicateForm=async(form:SiteFormDefinition)=>{
    setError('')
    if(!persisted){const draft=formDraftRepository.duplicate(form);setDrafts(formDraftRepository.list());navigate(`/app/site/formularios/${draft.id}`);return}
    const suffix=crypto.randomUUID().slice(0,8)
    const copy:SiteFormDefinition={...structuredClone(form),id:`form-${crypto.randomUUID()}`,name:`${form.name} — cópia`,slug:`${form.slug}-copia-${suffix}`,version:1,status:'draft',source:'custom'}
    try{const created=await createAdminSiteForm(copy);navigate(`/app/site/formularios/${created.id}`)}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível duplicar o formulário.')}
  }

  const deleteDraft=async(form:SiteFormDefinition)=>{
    if(form.source!=='custom'||!window.confirm(`Excluir o formulário “${form.name}”?`))return
    setError('')
    if(!persisted){formDraftRepository.remove(form.id);setDrafts(formDraftRepository.list());return}
    try{await deleteAdminSiteForm(form.id);await reload()}
    catch(caught){setError(caught instanceof Error?caught.message:'Não foi possível excluir o formulário.')}
  }

  const openForm=(form:SiteFormDefinition)=>navigate(`/app/site/formularios/${form.id}`)

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Formulários',description:'Defina formulários do site sem misturar configuração, publicação e operação dos dados recebidos.'}} headerAction={{label:'Novo formulário',icon:Plus,onClick:()=>void createForm()}}>
    <AdminNotice title="Fonte central de formulários" description={persisted?'O CMS está conectado às definições versionadas da API. Salvar cria ou atualiza um rascunho persistente; publicar promove uma versão imutável para o runtime público.':'Este build está sem sessão persistente da API. Em desenvolvimento, os rascunhos continuam isolados no navegador e nunca são publicados por engano.'}/>
    {error&&<AdminNotice title="Falha na operação" description={error}/>} 
    {loading&&<AdminNotice title="Sincronizando formulários" description="Carregando as definições administrativas diretamente da API do Portal Lander."/>}
    <div className="tableview-surface cms-tableview-surface"><section className="table-card"><table className="site-forms-table"><thead><tr><th>Formulário</th><th>Origem</th><th>Finalidade</th><th>Destino operacional</th><th>Versão</th><th>Campos</th><th>Consentimentos</th><th>Status</th><th style={{textAlign:'center'}}>Ações</th></tr></thead><tbody>{forms.map(form=>{const Icon=form.purpose==='editorial_submission'?FileInput:UsersRound;return <tr key={form.id}><td><div className="table-primary"><span className="table-avatar"><Icon size={15} aria-hidden="true"/></span><div><b>{form.name}</b><small>/{form.slug}</small></div></div></td><td>{form.source==='system'?'Sistema':persisted?'Personalizado':'Rascunho local'}</td><td>{purposeLabel[form.purpose]}</td><td>{destinationLabel[form.routing.destination]}</td><td>v{form.version}</td><td>{form.fields.length}</td><td>{form.consents.length}</td><td>{statusLabel[form.status]}</td><td><TableRowActionMenu align="center" label={`${form.name} · ações: Editar, Excluir e Duplicar`} onEdit={()=>openForm(form)} onDelete={()=>void deleteDraft(form)} deleteDisabled={form.source!=='custom'} onDuplicate={()=>void duplicateForm(form)}/></td></tr>})}</tbody></table></section></div>
    <AdminNotice title="Publicação e submissões" description={persisted?'A escrita administrativa usa a sessão autenticada do painel. Nenhum segredo persistente da API é enviado ao navegador; versões publicadas continuam sendo a única fonte consumida pelo runtime público.':'A publicação permanece indisponível sem uma sessão administrativa real. O modo local existe apenas para desenvolvimento e validação visual.'}/>
  </AdminShell>
}
