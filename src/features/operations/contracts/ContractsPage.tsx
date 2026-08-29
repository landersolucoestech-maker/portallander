import { AlertCircle, CheckCircle, Clock, DollarSign, FileStack, FileText, MoreHorizontal, PenLine, Plus, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CRM_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'

type Contract={id:string;title:string;client:string;type:string;platform:string;status:string;start:string;end:string;value:number}
const INITIAL:Contract[]=[
  {id:'ctr-1',title:'Pacote de mídia · Norte Produções',client:'Norte Produções',type:'Publicidade',platform:'Autentique',status:'Aguardando Assinatura',start:'2026-09-01',end:'2026-09-30',value:18000},
  {id:'ctr-2',title:'Cobertura · Festival Órbita',client:'Festival Órbita',type:'Evento',platform:'—',status:'Rascunho',start:'2026-09-10',end:'2026-09-12',value:12000},
  {id:'ctr-3',title:'Parceria · Studio Sul',client:'Studio Sul',type:'Parceria',platform:'Autentique',status:'Vigente',start:'2026-08-01',end:'2027-07-31',value:9000},
]
const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})

export function ContractsPage(){
  const [contracts,setContracts]=useState<Contract[]>(INITIAL)
  const [query,setQuery]=useState('')
  const [type,setType]=useState('Todos os tipos')
  const [status,setStatus]=useState('Todos os status')
  const [platform,setPlatform]=useState('Todas as plataformas')
  const [selected,setSelected]=useState<string[]>([])
  const [wizard,setWizard]=useState(false)
  const [step,setStep]=useState(1)
  const filtered=useMemo(()=>{const q=query.trim().toLocaleLowerCase('pt-BR');return contracts.filter(c=>(!q||`${c.title} ${c.client}`.toLocaleLowerCase('pt-BR').includes(q))&&(type==='Todos os tipos'||c.type===type)&&(status==='Todos os status'||c.status===status)&&(platform==='Todas as plataformas'||c.platform===platform))},[contracts,query,type,status,platform])
  const counts={vigentes:contracts.filter(c=>c.status==='Vigente').length,assinados:contracts.filter(c=>c.status==='Assinado').length,aguardando:contracts.filter(c=>c.status==='Aguardando Assinatura').length,analise:contracts.filter(c=>!['Vigente','Assinado','Aguardando Assinatura','Encerrado'].includes(c.status)).length,encerrados:contracts.filter(c=>c.status==='Encerrado').length}
  const totalValue=contracts.filter(c=>['Vigente','Assinado'].includes(c.status)).reduce((sum,c)=>sum+c.value,0)
  const allSelected=filtered.length>0&&selected.length===filtered.length
  const toggleAll=()=>setSelected(allSelected?[]:filtered.map(c=>c.id))
  const clearFilters=()=>{setQuery('');setType('Todos os tipos');setStatus('Todos os status');setPlatform('Todas as plataformas')}
  const hasFilters=Boolean(query)||type!=='Todos os tipos'||status!=='Todos os status'||platform!=='Todas as plataformas'
  const removeSelected=()=>{setContracts(items=>items.filter(c=>!selected.includes(c.id)));setSelected([])}
  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Contratos',description:'Gerencie contratos e documentação legal'}}>
    <div className="zip-stack contracts-page">
      <div className="zip-kpi-grid contracts">
        {[
          ['Total de Contratos',String(contracts.length),'na base',<FileStack size={18}/>],
          ['Vigentes',String(counts.vigentes),'em vigor',<CheckCircle size={18}/>],
          ['Assinados',String(counts.assinados),'aguardando vigência',<PenLine size={18}/>],
          ['Aguardando Assinatura',String(counts.aguardando),'pendentes de assinar',<Clock size={18}/>],
          ['Em Análise',String(counts.analise),'rascunho / negociação',<FileText size={18}/>],
          ['Encerrados',String(counts.encerrados),'expirados / rescindidos / cancelados',<AlertCircle size={18}/>],
          ['Valor Total',money(totalValue),'vigentes + assinados',<DollarSign size={18}/>],
        ].map(([title,value,description,icon])=><article className="zip-metric" key={String(title)}><div className="zip-metric-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{description}</small></div></article>)}
      </div>

      <div className="zip-toolbar contracts-toolbar">
        <label className="zip-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por título, artista ou cliente..."/></label>
        <select value={type} onChange={e=>setType(e.target.value)}><option>Todos os tipos</option><option>Agenciamento</option><option>Distribuição</option><option>Licenciamento</option><option>Edição</option><option>Publicidade</option><option>Evento</option><option>Parceria</option></select>
        <select value={status} onChange={e=>setStatus(e.target.value)}><option>Todos os status</option><option>Assinado</option><option>Vigente</option><option>Aguardando Assinatura</option><option>Rascunho</option><option>Encerrado</option></select>
        <select value={platform} onChange={e=>setPlatform(e.target.value)}><option>Todas as plataformas</option><option>Autentique</option><option>Clicksign</option><option>DocuSign</option><option>—</option></select>
        {hasFilters&&<button className="zip-button secondary" type="button" onClick={clearFilters}><X size={14}/> Limpar</button>}
        <button className="zip-button" type="button" onClick={()=>{setStep(1);setWizard(true)}}><Plus size={14}/> Novo Contrato</button>
      </div>

      <section className="zip-panel contracts-table-panel">
        <header className="zip-panel-head"><div><h2>Lista de Contratos</h2><p>Acompanhe todos os contratos e seus vencimentos · {filtered.length} registro(s)</p></div><div className="contracts-inline-actions"><label><input type="checkbox" checked={allSelected} onChange={toggleAll}/> {selected.length?`${selected.length} selecionado(s)`:'Selecionar todos'}</label>{selected.length>0&&<button className="zip-button secondary" type="button" onClick={removeSelected}>Excluir ({selected.length})</button>}</div></header>
        <div className="zip-table-wrap"><table className="zip-table"><thead><tr><th></th><th>Título</th><th>Artista / Cliente</th><th>Tipo</th><th>Plataforma</th><th>Status</th><th>Período</th><th>Valor</th><th>Ações</th></tr></thead><tbody>{filtered.length?filtered.map(c=><tr key={c.id}><td><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>setSelected(ids=>ids.includes(c.id)?ids.filter(id=>id!==c.id):[...ids,c.id])}/></td><td><strong>{c.title}</strong></td><td>{c.client}</td><td>{c.type}</td><td>{c.platform}</td><td><span className={`zip-badge ${c.status==='Vigente'?'zip-badge-success':c.status==='Aguardando Assinatura'?'zip-badge-warning':''}`}>{c.status}</span></td><td>{new Date(c.start).toLocaleDateString('pt-BR')} – {new Date(c.end).toLocaleDateString('pt-BR')}</td><td>{money(c.value)}</td><td><button className="zip-icon" type="button" title="Ações"><MoreHorizontal size={15}/></button></td></tr>):<tr><td colSpan={9} className="contracts-empty-row">{hasFilters?'Nenhum contrato corresponde aos filtros aplicados.':'Nenhum contrato cadastrado.'}</td></tr>}</tbody></table></div>
      </section>
    </div>

    {wizard&&<div className="reference-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setWizard(false)}><section className="reference-modal reference-modal-xl"><header className="reference-modal-head"><div><span>NOVO CONTRATO</span><h2>Assistente · Etapa {step} de 5</h2></div><button className="reference-modal-close" onClick={()=>setWizard(false)}><X size={17}/></button></header><div className="reference-modal-body reference-form"><div className="zip-segmented five">{['Tipo','Partes','Termos','Documento','Revisão'].map((name,index)=><button type="button" key={name} className={step===index+1?'active':''}>{index+1}. {name}</button>)}</div>{step===1&&<div className="reference-form-grid"><label><span>Tipo de contrato</span><select><option>Prestação de Serviços</option><option>Publicidade</option><option>Parceria</option><option>Licenciamento</option></select></label><label><span>Categoria</span><select><option>Comercial</option><option>Editorial</option><option>Institucional</option></select></label></div>}{step===2&&<div className="reference-form-grid"><label><span>Contratante</span><input placeholder="Buscar pessoa ou organização"/></label><label><span>Contratado</span><input placeholder="Buscar pessoa ou organização"/></label></div>}{step===3&&<div className="reference-form-grid"><label><span>Valor</span><input type="number"/></label><label><span>Forma de pagamento</span><select><option>Fixo</option><option>Percentual</option><option>Híbrido</option></select></label><label><span>Início</span><input type="date"/></label><label><span>Fim</span><input type="date"/></label></div>}{step===4&&<div className="reference-form-grid"><label className="wide"><span>Conteúdo / termos</span><textarea rows={10}/></label><label className="wide"><span>Importar arquivo</span><input type="file" accept=".pdf,.doc,.docx"/></label></div>}{step===5&&<div className="reference-contract-preview"><div className="reference-a4"><h1>CONTRATO</h1><p>Pré-visualização A4 do documento gerado.</p></div></div>}</div><footer className="reference-modal-footer"><button className="zip-button secondary" onClick={()=>setWizard(false)}>Cancelar</button><button className="zip-button secondary" disabled={step===1} onClick={()=>setStep(value=>Math.max(1,value-1))}>Voltar</button>{step<5?<button className="zip-button" onClick={()=>setStep(value=>Math.min(5,value+1))}>Continuar</button>:<button className="zip-button" onClick={()=>setWizard(false)}>Criar Contrato</button>}</footer></section></div>}
  </AdminShell>
}
