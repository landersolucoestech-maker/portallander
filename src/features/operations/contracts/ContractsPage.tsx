import { AlertCircle, CheckCircle, Clock, DollarSign, FileStack, FileText, PenLine, Plus, Search, Send, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { TableRowActionMenu } from '../../../shared/internal/TableRowActionMenu'

type Contract={id:string;title:string;client:string;type:string;platform:string;status:string;start:string;end:string;value:number}
type WizardState={template:string;category:string;contractor:string;contracted:string;variables:Record<string,string>;content:string;signers:{name:string;email:string;order:number;platform:string}[];title:string;start:string;end:string;status:string;notes:string}

const INITIAL:Contract[]=[
  {id:'ctr-1',title:'Pacote de mídia · Norte Produções',client:'Norte Produções',type:'Publicidade',platform:'Autentique',status:'Aguardando Assinatura',start:'2026-09-01',end:'2026-09-30',value:18000},
  {id:'ctr-2',title:'Cobertura · Festival Órbita',client:'Festival Órbita',type:'Evento',platform:'—',status:'Rascunho',start:'2026-09-10',end:'2026-09-12',value:12000},
  {id:'ctr-3',title:'Parceria · Studio Sul',client:'Studio Sul',type:'Parceria',platform:'Autentique',status:'Vigente',start:'2026-08-01',end:'2027-07-31',value:9000},
]

const EMPTY_WIZARD:WizardState={
  template:'Contrato de Prestação de Serviços',category:'Comercial',contractor:'Portal Lander',contracted:'',
  variables:{'{{EMPRESA.RAZAO_SOCIAL}}':'Portal Lander','{{CLIENTE.NOME}}':'','{{CONTRATO.NUMERO}}':'CTR-2026-004','{{CONTRATO.VALOR}}':''},
  content:'',signers:[{name:'',email:'',order:1,platform:'autentique'}],title:'',start:'',end:'',status:'Rascunho',notes:''
}

const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
function Section({title,children}:{title:string;children:ReactNode}){return <section className="reference-form-section"><h3>{title}</h3>{children}</section>}

export function ContractsPage(){
  const [contracts,setContracts]=useState<Contract[]>(INITIAL)
  const [query,setQuery]=useState('')
  const [type,setType]=useState('Todos os tipos')
  const [status,setStatus]=useState('Todos os status')
  const [platform,setPlatform]=useState('Todas as plataformas')
  const [selected,setSelected]=useState<string[]>([])
  const [wizard,setWizard]=useState(false)
  const [step,setStep]=useState(1)
  const [wizardState,setWizardState]=useState<WizardState>(EMPTY_WIZARD)
  const [viewing,setViewing]=useState<Contract|null>(null)
  const [viewTab,setViewTab]=useState('resumo')
  const [editing,setEditing]=useState<Contract|null>(null)
  const [signing,setSigning]=useState(false)
  const [signMessage,setSignMessage]=useState('Olá, segue o contrato para assinatura digital.')
  const [signDeadline,setSignDeadline]=useState('')

  const filtered=useMemo(()=>{
    const q=query.trim().toLocaleLowerCase('pt-BR')
    return contracts.filter(c=>(!q||`${c.title} ${c.client} ${c.type}`.toLocaleLowerCase('pt-BR').includes(q))&&(type==='Todos os tipos'||c.type===type)&&(status==='Todos os status'||c.status===status)&&(platform==='Todas as plataformas'||c.platform===platform))
  },[contracts,query,type,status,platform])

  const counts={
    vigentes:contracts.filter(c=>c.status==='Vigente').length,
    assinados:contracts.filter(c=>c.status==='Assinado').length,
    aguardando:contracts.filter(c=>c.status==='Aguardando Assinatura').length,
    analise:contracts.filter(c=>!['Vigente','Assinado','Aguardando Assinatura','Encerrado','Expirado','Rescindido','Cancelado'].includes(c.status)).length,
    encerrados:contracts.filter(c=>['Encerrado','Expirado','Rescindido','Cancelado'].includes(c.status)).length,
  }
  const totalValue=contracts.filter(c=>['Vigente','Assinado'].includes(c.status)).reduce((sum,c)=>sum+c.value,0)
  const allSelected=filtered.length>0&&filtered.every(c=>selected.includes(c.id))
  const hasFilters=Boolean(query)||type!=='Todos os tipos'||status!=='Todos os status'||platform!=='Todas as plataformas'
  const toggleAll=()=>setSelected(allSelected?selected.filter(id=>!filtered.some(c=>c.id===id)):[...new Set([...selected,...filtered.map(c=>c.id)])])
  const clearFilters=()=>{setQuery('');setType('Todos os tipos');setStatus('Todos os status');setPlatform('Todas as plataformas')}
  const removeSelected=()=>{setContracts(items=>items.filter(c=>!selected.includes(c.id)));setSelected([])}
  const openWizard=()=>{setWizardState(EMPTY_WIZARD);setStep(1);setWizard(true)}
  const openView=(contract:Contract)=>{setViewing(contract);setViewTab('resumo')}
  const deleteContract=(id:string)=>{setContracts(items=>items.filter(c=>c.id!==id));setSelected(ids=>ids.filter(x=>x!==id));if(viewing?.id===id)setViewing(null)}
  const saveEdit=()=>{if(!editing)return;setContracts(items=>items.map(c=>c.id===editing.id?editing:c));setEditing(null)}
  const createContract=()=>{
    const title=wizardState.title.trim()||`${wizardState.template} · ${wizardState.contracted||'Novo cliente'}`
    const platformLabel=wizardState.signers[0]?.platform==='none'?'—':wizardState.signers[0]?.platform==='autentique'?'Autentique':wizardState.signers[0]?.platform==='clicksign'?'Clicksign':'DocuSign'
    setContracts(items=>[{id:`ctr-${Date.now()}`,title,client:wizardState.contracted||'—',type:wizardState.category,platform:platformLabel,status:wizardState.status,start:wizardState.start||new Date().toISOString().slice(0,10),end:wizardState.end||new Date().toISOString().slice(0,10),value:Number(wizardState.variables['{{CONTRATO.VALOR}}']||0)},...items])
    setWizard(false)
  }
  const updateSigner=(index:number,key:'name'|'email'|'platform',value:string)=>setWizardState(state=>({...state,signers:state.signers.map((s,i)=>i===index?{...s,[key]:value}:s)}))
  const sendForSigning=()=>{if(viewing){const updated={...viewing,status:'Aguardando Assinatura',platform:viewing.platform==='—'?'Autentique':viewing.platform};setContracts(items=>items.map(c=>c.id===viewing.id?updated:c));setViewing(updated)}setSigning(false)}

  return <AdminShell
    area="crm"
    items={CRM_NAV}
    header={{title:'Contratos',description:'Gerencie contratos e documentação legal'}}
    headerAction={{label:'Novo Contrato',onClick:openWizard}}
  >
    <div className="zip-stack contracts-page">
      <div className="zip-kpi-grid contracts">{[
        ['Total de Contratos',String(contracts.length),'na base',<FileStack size={18}/>],
        ['Vigentes',String(counts.vigentes),'em vigor',<CheckCircle size={18}/>],
        ['Assinados',String(counts.assinados),'aguardando vigência',<PenLine size={18}/>],
        ['Aguardando Assinatura',String(counts.aguardando),'pendentes de assinar',<Clock size={18}/>],
        ['Em Análise',String(counts.analise),'rascunho / negociação',<FileText size={18}/>],
        ['Encerrados',String(counts.encerrados),'expirados / rescindidos / cancelados',<AlertCircle size={18}/>],
        ['Valor Total',money(totalValue),'vigentes + assinados',<DollarSign size={18}/>],
      ].map(([title,value,description,icon])=><article className="zip-metric" key={String(title)}><div className="zip-metric-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{description}</small></div></article>)}</div>

      <div className="zip-toolbar contracts-toolbar">
        <label className="zip-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por artista, tipo ou título…"/></label>
        <select value={type} onChange={e=>setType(e.target.value)}><option>Todos os tipos</option><option>Agenciamento</option><option>Distribuição</option><option>Licenciamento</option><option>Edição</option><option>Publicidade</option><option>Evento</option><option>Parceria</option></select>
        <select value={status} onChange={e=>setStatus(e.target.value)}><option>Todos os status</option><option>Assinado</option><option>Vigente</option><option>Aguardando Assinatura</option><option>Pendente</option><option>Rascunho</option><option>Expirado</option><option>Rescindido</option><option>Cancelado</option></select>
        <select value={platform} onChange={e=>setPlatform(e.target.value)}><option>Todas as plataformas</option><option>Autentique</option><option>Clicksign</option><option>DocuSign</option><option>—</option></select>
        {hasFilters&&<button className="zip-button secondary" type="button" onClick={clearFilters}><X size={14}/> Limpar</button>}
        {hasFilters&&<span className="contracts-filter-count">{filtered.length} de {contracts.length} contratos</span>}
      </div>

      <section className="zip-panel contracts-table-panel">
        <header className="zip-panel-head"><div><h2>Lista de Contratos</h2><p>Acompanhe todos os contratos e seus vencimentos · {filtered.length} registro(s)</p></div><div className="contracts-inline-actions"><label><input type="checkbox" checked={allSelected} onChange={toggleAll}/> {selected.length?`${selected.length} selecionado(s)`:'Selecionar todos'}</label>{selected.length>0&&<button className="zip-button danger" type="button" onClick={removeSelected}>Excluir ({selected.length})</button>}</div></header>
        <div className="zip-table-wrap"><table className="zip-table"><thead><tr><th></th><th>Título</th><th>Artista / Cliente</th><th>Tipo</th><th>Plataforma</th><th>Status</th><th>Período</th><th>Valor</th><th className="actions-col">Ações</th></tr></thead><tbody>{filtered.length?filtered.map(c=>{
          const days=Math.ceil((new Date(c.end).getTime()-Date.now())/86400000)
          const nearExpiry=days>=0&&days<=30
          return <tr key={c.id}><td><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>setSelected(ids=>ids.includes(c.id)?ids.filter(id=>id!==c.id):[...ids,c.id])}/></td><td><strong>{c.title}</strong></td><td>{c.client}</td><td>{c.type}</td><td>{c.platform}</td><td><div className="contracts-status-cell"><span className={`zip-badge ${c.status==='Vigente'?'zip-badge-success':c.status==='Aguardando Assinatura'?'zip-badge-warning':''}`}>{c.status}</span>{nearExpiry&&<small className="contracts-expiry-badge"><AlertCircle size={11}/>{days}d</small>}</div></td><td>{new Date(c.start).toLocaleDateString('pt-BR')} – {new Date(c.end).toLocaleDateString('pt-BR')}</td><td>{c.value?money(c.value):'—'}</td><td className="actions-col"><TableRowActionMenu label={c.title} onView={()=>openView(c)} onEdit={()=>setEditing({...c})} onDelete={()=>deleteContract(c.id)}/></td></tr>
        }):<tr><td colSpan={9} className="contracts-empty-row">{hasFilters?'Nenhum contrato corresponde aos filtros aplicados.':'Nenhum contrato cadastrado.'}</td></tr>}</tbody></table></div>
        {!filtered.length&&!hasFilters&&<div className="contracts-empty-action"><button className="zip-button" type="button" onClick={openWizard}><Plus size={14}/> Novo Contrato</button></div>}
      </section>
    </div>

    {editing&&<div className="reference-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setEditing(null)}><section className="reference-modal"><header className="reference-modal-head"><div><span>CONTRATOS</span><h2>Editar Contrato</h2></div><button className="reference-modal-close" onClick={()=>setEditing(null)}><X size={17}/></button></header><div className="reference-modal-body reference-form"><div className="reference-form-grid"><label className="wide"><span>Título</span><input value={editing.title} onChange={e=>setEditing(v=>v?{...v,title:e.target.value}:v)}/></label><label><span>Artista / Cliente</span><input value={editing.client} onChange={e=>setEditing(v=>v?{...v,client:e.target.value}:v)}/></label><label><span>Tipo</span><input value={editing.type} onChange={e=>setEditing(v=>v?{...v,type:e.target.value}:v)}/></label><label><span>Status</span><select value={editing.status} onChange={e=>setEditing(v=>v?{...v,status:e.target.value}:v)}><option>Rascunho</option><option>Aguardando Assinatura</option><option>Assinado</option><option>Vigente</option><option>Encerrado</option></select></label><label><span>Plataforma</span><select value={editing.platform} onChange={e=>setEditing(v=>v?{...v,platform:e.target.value}:v)}><option>—</option><option>Autentique</option><option>Clicksign</option><option>DocuSign</option></select></label><label><span>Início</span><input type="date" value={editing.start} onChange={e=>setEditing(v=>v?{...v,start:e.target.value}:v)}/></label><label><span>Fim</span><input type="date" value={editing.end} onChange={e=>setEditing(v=>v?{...v,end:e.target.value}:v)}/></label><label><span>Valor</span><input type="number" value={editing.value} onChange={e=>setEditing(v=>v?{...v,value:Number(e.target.value)}:v)}/></label></div></div><footer className="reference-modal-footer"><button className="zip-button secondary" onClick={()=>setEditing(null)}>Cancelar</button><button className="zip-button" onClick={saveEdit}>Salvar Alterações</button></footer></section></div>}

    {wizard&&<div className="reference-modal-backdrop"><section className="reference-modal reference-modal-xl contracts-wizard-modal"><header className="reference-modal-head"><div><span>NOVO CONTRATO</span><h2>Assistente · Etapa {step} de 6</h2></div><button className="reference-modal-close" onClick={()=>setWizard(false)}><X size={17}/></button></header><div className="contracts-wizard-layout"><aside className="contracts-wizard-steps">{['Template','Partes','Variáveis','Documento','Signatários','Revisão'].map((name,index)=><button type="button" key={name} className={step===index+1?'active':''} disabled={index+1>step} onClick={()=>index+1<=step&&setStep(index+1)}><span>{index+1}</span><div><strong>{name}</strong><small>{['Escolha a base','Defina os envolvidos','Preencha placeholders','Revise o conteúdo','Configure assinaturas','Confirme e conclua'][index]}</small></div></button>)}</aside><div className="reference-modal-body reference-form contracts-wizard-content">
      {step===1&&<Section title="Template do contrato"><div className="reference-form-grid"><label className="wide"><span>Template</span><select value={wizardState.template} onChange={e=>setWizardState(s=>({...s,template:e.target.value}))}><option>Contrato de Prestação de Serviços</option><option>Contrato de Publicidade</option><option>Contrato de Parceria Comercial</option><option>Contrato de Licenciamento</option></select></label><label><span>Categoria</span><select value={wizardState.category} onChange={e=>setWizardState(s=>({...s,category:e.target.value}))}><option>Comercial</option><option>Prestação de Serviços</option><option>Eventos</option><option>Licenciamento</option></select></label><label><span>Número</span><input value={wizardState.variables['{{CONTRATO.NUMERO}}']} onChange={e=>setWizardState(s=>({...s,variables:{...s.variables,'{{CONTRATO.NUMERO}}':e.target.value}}))}/></label></div></Section>}
      {step===2&&<Section title="Partes do contrato"><div className="reference-form-grid"><label><span>Contratante</span><input value={wizardState.contractor} onChange={e=>setWizardState(s=>({...s,contractor:e.target.value}))}/></label><label><span>Contratada / Cliente</span><input value={wizardState.contracted} onChange={e=>setWizardState(s=>({...s,contracted:e.target.value,variables:{...s.variables,'{{CLIENTE.NOME}}':e.target.value}}))}/></label><label><span>CPF / CNPJ</span><input/></label><label><span>E-mail</span><input type="email"/></label><label className="wide"><span>Endereço</span><input/></label></div></Section>}
      {step===3&&<Section title="Variáveis do template"><div className="reference-form-grid">{Object.entries(wizardState.variables).map(([key,value])=><label key={key}><span>{key}</span><input value={value} onChange={e=>setWizardState(s=>({...s,variables:{...s.variables,[key]:e.target.value}}))}/></label>)}</div></Section>}
      {step===4&&<><Section title="Conteúdo do contrato"><div className="reference-form-grid"><label className="wide"><span>Documento</span><textarea rows={14} value={wizardState.content} onChange={e=>setWizardState(s=>({...s,content:e.target.value}))}/></label><label className="wide"><span>Importar documento</span><input type="file" accept=".pdf,.doc,.docx,.txt"/></label></div></Section><div className="reference-contract-preview"><div className="reference-a4"><h1>{wizardState.template.toUpperCase()}</h1><p>{wizardState.content||'Pré-visualização A4 do conteúdo contratual.'}</p></div></div></>}
      {step===5&&<Section title="Signatários">{wizardState.signers.map((signer,index)=><div className="reference-form-grid" key={index}><label><span>Nome</span><input value={signer.name} onChange={e=>updateSigner(index,'name',e.target.value)}/></label><label><span>E-mail</span><input type="email" value={signer.email} onChange={e=>updateSigner(index,'email',e.target.value)}/></label><label><span>Ordem</span><input readOnly value={signer.order}/></label><label><span>Plataforma</span><select value={signer.platform} onChange={e=>updateSigner(index,'platform',e.target.value)}><option value="none">Sem plataforma</option><option value="autentique">Autentique</option><option value="clicksign">Clicksign</option><option value="docusign">DocuSign</option></select></label></div>)}<button type="button" className="zip-button secondary" onClick={()=>setWizardState(s=>({...s,signers:[...s.signers,{name:'',email:'',order:s.signers.length+1,platform:'autentique'}]}))}><Plus size={14}/> Adicionar signatário</button></Section>}
      {step===6&&<><Section title="Revisão"><div className="reference-detail-grid"><div><span>Template</span><strong>{wizardState.template}</strong></div><div><span>Categoria</span><strong>{wizardState.category}</strong></div><div><span>Contratante</span><strong>{wizardState.contractor}</strong></div><div><span>Contratada</span><strong>{wizardState.contracted||'—'}</strong></div><div><span>Signatários</span><strong>{wizardState.signers.length}</strong></div><div><span>Status inicial</span><strong>{wizardState.status}</strong></div></div><div className="reference-form-grid"><label className="wide"><span>Título do contrato</span><input value={wizardState.title} onChange={e=>setWizardState(s=>({...s,title:e.target.value}))}/></label><label><span>Data de início</span><input type="date" value={wizardState.start} onChange={e=>setWizardState(s=>({...s,start:e.target.value}))}/></label><label><span>Data de término</span><input type="date" value={wizardState.end} onChange={e=>setWizardState(s=>({...s,end:e.target.value}))}/></label><label className="wide"><span>Observações</span><textarea rows={3} value={wizardState.notes} onChange={e=>setWizardState(s=>({...s,notes:e.target.value}))}/></label></div></Section><div className="reference-contract-preview"><div className="reference-a4"><h1>{(wizardState.title||wizardState.template).toUpperCase()}</h1><p>{wizardState.content||'Documento pronto para geração.'}</p></div></div></>}
    </div></div><footer className="reference-modal-footer"><button className="zip-button secondary" onClick={()=>setWizard(false)}>Cancelar</button><button className="zip-button secondary" disabled={step===1} onClick={()=>setStep(v=>Math.max(1,v-1))}>Voltar</button>{step<6?<button className="zip-button" onClick={()=>setStep(v=>Math.min(6,v+1))}>Continuar</button>:<button className="zip-button" onClick={createContract}>Criar Contrato</button>}</footer></section></div>}

    {viewing&&<div className="reference-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setViewing(null)}><section className="reference-modal reference-modal-xl"><header className="reference-modal-head"><div><span>CONTRATO</span><h2>{viewing.title}</h2><p>{viewing.client} · {viewing.type}</p></div><button className="reference-modal-close" onClick={()=>setViewing(null)}><X size={17}/></button></header><div className="reference-modal-body"><div className="zip-tabs"><button className={viewTab==='resumo'?'active':''} onClick={()=>setViewTab('resumo')}>Resumo</button><button className={viewTab==='assinatura'?'active':''} onClick={()=>setViewTab('assinatura')}>Assinatura</button><button className={viewTab==='documento'?'active':''} onClick={()=>setViewTab('documento')}>Documento</button><button className={viewTab==='historico'?'active':''} onClick={()=>setViewTab('historico')}>Histórico</button></div>{viewTab==='resumo'&&<div className="reference-detail-grid"><div><span>Status</span><strong>{viewing.status}</strong></div><div><span>Plataforma</span><strong>{viewing.platform}</strong></div><div><span>Período</span><strong>{new Date(viewing.start).toLocaleDateString('pt-BR')} – {new Date(viewing.end).toLocaleDateString('pt-BR')}</strong></div><div><span>Valor</span><strong>{money(viewing.value)}</strong></div><div><span>Tipo</span><strong>{viewing.type}</strong></div><div><span>Artista / Cliente</span><strong>{viewing.client}</strong></div></div>}{viewTab==='assinatura'&&<Section title="Assinatura digital"><div className="reference-detail-grid"><div><span>Plataforma</span><strong>{viewing.platform}</strong></div><div><span>Status</span><strong>{viewing.status}</strong></div></div><button className="zip-button" type="button" onClick={()=>setSigning(true)}><Send size={14}/> Enviar para assinatura</button></Section>}{viewTab==='documento'&&<div className="reference-contract-preview"><div className="reference-a4"><h1>{viewing.title.toUpperCase()}</h1><p>CONTRATANTE: Portal Lander.</p><p>CONTRATADA: {viewing.client}.</p><h2>OBJETO</h2><p>Documento contratual gerado a partir do template e das variáveis registradas.</p><h2>VALOR</h2><p>{money(viewing.value)}</p></div></div>}{viewTab==='historico'&&<div className="reference-timeline"><div><span/><div><strong>Contrato criado</strong><small>{new Date(viewing.start).toLocaleDateString('pt-BR')} · Administrador local</small></div></div><div><span/><div><strong>Documento preparado</strong><small>Preview A4 e variáveis resolvidas</small></div></div>{viewing.status==='Aguardando Assinatura'&&<div><span/><div><strong>Enviado para assinatura</strong><small>{viewing.platform}</small></div></div>}{viewing.status==='Vigente'&&<div><span/><div><strong>Contrato vigente</strong><small>Documento assinado e em vigor</small></div></div>}</div>}</div><footer className="reference-modal-footer"><button className="zip-button secondary" onClick={()=>setViewing(null)}>Fechar</button><button className="zip-button secondary" onClick={()=>{setEditing({...viewing});setViewing(null)}}>Editar</button></footer></section></div>}

    {signing&&viewing&&<div className="reference-modal-backdrop"><section className="reference-modal"><header className="reference-modal-head"><div><span>ASSINATURA DIGITAL</span><h2>Enviar para assinatura</h2></div><button className="reference-modal-close" onClick={()=>setSigning(false)}><X size={17}/></button></header><div className="reference-modal-body reference-form"><div className="reference-form-grid"><label><span>Plataforma</span><select value={viewing.platform==='—'?'Autentique':viewing.platform} onChange={e=>setViewing({...viewing,platform:e.target.value})}><option>Autentique</option><option>Clicksign</option><option>DocuSign</option></select></label><label><span>Prazo para assinatura</span><input type="date" value={signDeadline} onChange={e=>setSignDeadline(e.target.value)}/></label><label className="wide"><span>Mensagem aos signatários</span><textarea rows={4} value={signMessage} onChange={e=>setSignMessage(e.target.value)}/></label></div></div><footer className="reference-modal-footer"><button className="zip-button secondary" onClick={()=>setSigning(false)}>Cancelar</button><button className="zip-button" onClick={sendForSigning}><Send size={14}/> Enviar Documento</button></footer></section></div>}
  </AdminShell>
}
