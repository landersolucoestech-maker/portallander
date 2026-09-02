import {Inbox,Newspaper,Search} from 'lucide-react'
import {useEffect,useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import {AdminEmpty,AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {listContentCollaborations} from '../forms/collaborationsClient'
import type {CollaborationStatus,ContentCollaboration} from '../forms/domain'

const statusOptions:readonly ['all'|CollaborationStatus,string][]=[['all','Todos os status'],['received','Recebido'],['triage','Em triagem'],['review','Em análise'],['approved','Aprovado'],['production','Em produção'],['published','Publicado'],['rejected','Rejeitado'],['duplicate','Duplicado'],['spam','Spam'],['archived','Arquivado']]
const statusLabel=Object.fromEntries(statusOptions.filter(([value])=>value!=='all')) as Record<CollaborationStatus,string>
const priorityLabel={low:'Baixa',normal:'Normal',high:'Alta'} as const

function ContentTabs(){return <div className="admin-toolbar"><div className="admin-toolbar-group"><Link className="button outline" to="/app/site/conteudos"><Newspaper size={15}/>Publicações</Link><Link className="button" to="/app/site/conteudos/colaboracoes"><Inbox size={15}/>Colaborações recebidas</Link></div></div>}

export function SiteCollaborationsPage(){
  const [items,setItems]=useState<ContentCollaboration[]>([])
  const [loading,setLoading]=useState(true)
  const [unavailable,setUnavailable]=useState(false)
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState<'all'|CollaborationStatus>('all')

  useEffect(()=>{
    const controller=new AbortController()
    listContentCollaborations(controller.signal).then(data=>{setItems(data);setUnavailable(false)}).catch(error=>{if(error instanceof DOMException&&error.name==='AbortError')return;setItems([]);setUnavailable(true)}).finally(()=>setLoading(false))
    return()=>controller.abort()
  },[])

  const filtered=useMemo(()=>{
    const normalized=query.trim().toLocaleLowerCase('pt-BR')
    return items.filter(item=>{
      const matchesStatus=status==='all'||item.status===status
      const matchesQuery=!normalized||[item.title,item.type,item.submitterName,item.submitterEmail,item.location,item.message,...item.tags].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
      return matchesStatus&&matchesQuery
    })
  },[items,query,status])

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Conteúdos',description:'Gerencie publicações e materiais enviados pelo público sem misturar os dois fluxos editoriais.'}}>
    <ContentTabs/>
    {unavailable&&<AdminNotice title="Recebimento ainda não conectado" description="A estrutura da fila já está pronta, mas o endpoint persistente do Portal Lander ainda não está disponível. Nenhuma colaboração é simulada ou armazenada localmente."/>}
    <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">Buscar colaborações</span><Search size={17} aria-hidden="true"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar por título, remetente, tipo ou local..."/></label><select className="admin-filter" aria-label="Filtrar colaborações por status" value={status} onChange={event=>setStatus(event.target.value as 'all'|CollaborationStatus)}>{statusOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div><span className="admin-breadcrumb">{filtered.length} de {items.length} registros</span></div>
    {loading?<AdminNotice title="Carregando colaborações" description="Consultando a fila editorial do Portal Lander."/>:filtered.length?<div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Título</th><th>Tipo</th><th>Remetente</th><th>Local</th><th>Prioridade</th><th>Status</th><th>Responsável</th><th>Recebido em</th></tr></thead><tbody>{filtered.map(item=><tr key={item.id}><td><div className="table-primary"><span className="table-avatar"><Inbox size={15} aria-hidden="true"/></span><div><b>{item.title}</b><small>{item.submitterEmail}</small></div></div></td><td>{item.type}</td><td>{item.submitterName}</td><td>{item.location||'—'}</td><td>{priorityLabel[item.priority]}</td><td><span className={`status ${item.status}`}>{statusLabel[item.status]}</span></td><td>{item.assignedTo||'Não atribuído'}</td><td>{new Date(item.receivedAt).toLocaleString('pt-BR')}</td></tr>)}</tbody></table></section></div>:<AdminEmpty title="Nenhuma colaboração recebida" description={unavailable?'A fila está pronta, mas depende do backend persistente do Portal Lander para receber e exibir materiais reais.':'Nenhuma colaboração corresponde aos filtros selecionados.'}/>} 
  </AdminShell>
}
