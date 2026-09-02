import {Images,Search,Trash2,Upload,X} from 'lucide-react'
import {useEffect,useMemo,useState,type FormEvent} from 'react'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {AdminEmpty,AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {TableViewPagination,type TablePageSize} from '../../../shared/internal/TableViewPagination'
import {isMediaPersistenceConfigured,mediaRepository} from '../mediaRepository'
import type {SiteMediaItem} from '../readModel'

const formatSize=(bytes:number)=>bytes>=1024*1024?`${(bytes/(1024*1024)).toLocaleString('pt-BR',{maximumFractionDigits:1})} MB`:`${Math.max(1,Math.round(bytes/1024)).toLocaleString('pt-BR')} KB`
const formatDate=(value:string)=>new Date(value).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})

export function SiteMediaPage(){
  const persistent=isMediaPersistenceConfigured()
  const [query,setQuery]=useState('')
  const [type,setType]=useState('Todos')
  const [page,setPage]=useState(1)
  const [pageSize,setPageSize]=useState<TablePageSize>(10)
  const [media,setMedia]=useState<readonly SiteMediaItem[]>([])
  const [loading,setLoading]=useState(true)
  const [loadError,setLoadError]=useState('')
  const [uploadOpen,setUploadOpen]=useState(false)
  const [file,setFile]=useState<File|null>(null)
  const [alt,setAlt]=useState('')
  const [caption,setCaption]=useState('')
  const [saving,setSaving]=useState(false)

  const reload=async()=>{
    setLoading(true);setLoadError('')
    try{setMedia(await mediaRepository.list())}
    catch(error){setLoadError(error instanceof Error?error.message:'Não foi possível carregar a biblioteca de mídias.')}
    finally{setLoading(false)}
  }

  useEffect(()=>{void reload()},[])

  const availableTypes=useMemo(()=>['Todos',...Array.from(new Set(media.map(item=>item.type))).sort((a,b)=>a.localeCompare(b,'pt-BR'))],[media])
  const normalized=query.trim().toLocaleLowerCase('pt-BR')
  const items=useMemo(()=>media.filter(item=>{
    const matchesQuery=!normalized||[item.name,item.url,item.type].some(value=>value.toLocaleLowerCase('pt-BR').includes(normalized))
    const matchesType=type==='Todos'||item.type===type
    return matchesQuery&&matchesType
  }),[media,normalized,type])
  const totalPages=Math.max(1,Math.ceil(items.length/pageSize)),safePage=Math.min(page,totalPages),visibleItems=items.slice((safePage-1)*pageSize,safePage*pageSize)

  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    if(!file||saving)return
    setSaving(true);setLoadError('')
    try{
      await mediaRepository.upload({file,alt,caption})
      setFile(null);setAlt('');setCaption('');setUploadOpen(false);await reload()
    }catch(error){setLoadError(error instanceof Error?error.message:'Não foi possível enviar a mídia.')}
    finally{setSaving(false)}
  }

  const remove=async(item:SiteMediaItem)=>{
    if(!window.confirm(`Excluir “${item.name}” da biblioteca? O arquivo público também será removido.`))return
    setSaving(true);setLoadError('')
    try{await mediaRepository.remove(item.id);await reload()}
    catch(error){setLoadError(error instanceof Error?error.message:'Não foi possível excluir a mídia.')}
    finally{setSaving(false)}
  }

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Mídias',description:'Biblioteca central de arquivos do Site, separada das referências usadas dentro dos conteúdos.'}} headerAction={{label:'Adicionar mídia',icon:Upload,onClick:()=>setUploadOpen(true),disabled:!persistent,disabledReason:!persistent?'Configure VITE_PORTAL_API_BASE_URL e o storage do Portal Lander para habilitar uploads.':undefined}}>
    <AdminNotice title={persistent?'Biblioteca persistente conectada':'Biblioteca em modo local'} description={persistent?'Upload, listagem e exclusão usam a API autenticada e o bucket público do Portal Lander. Os arquivos permanecem disponíveis por URL pública para os conteúdos editoriais.':'A API administrativa não está configurada neste ambiente. A listagem local continua disponível somente para desenvolvimento e não aceita escrita.'}/>
    {loadError&&<AdminNotice title="Falha na biblioteca de mídias" description={loadError}/>} 

    {uploadOpen&&persistent&&<section className="admin-card" style={{marginBottom:18}}>
      <div className="admin-card-head"><div><span>Nova mídia</span><h2>Adicionar arquivo à biblioteca</h2><p>Imagens, vídeos e PDFs permitidos serão armazenados no bucket público do Site.</p></div><button type="button" className="button outline" onClick={()=>setUploadOpen(false)} disabled={saving}><X size={15}/>Fechar</button></div>
      <form onSubmit={event=>void submit(event)} style={{display:'grid',gap:14}}>
        <label>Arquivo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,application/pdf" onChange={event=>setFile(event.target.files?.[0]??null)} disabled={saving} required/></label>
        <label>Texto alternativo<input value={alt} onChange={event=>setAlt(event.target.value)} placeholder="Descrição acessível da imagem ou arquivo" disabled={saving}/></label>
        <label>Legenda<input value={caption} onChange={event=>setCaption(event.target.value)} placeholder="Legenda opcional para uso editorial" disabled={saving}/></label>
        <div><button type="submit" className="button" disabled={!file||saving}><Upload size={15}/>{saving?'Enviando…':'Enviar mídia'}</button></div>
      </form>
    </section>}

    <div className="admin-toolbar"><div className="admin-toolbar-group"><label className="searchbox"><span className="sr-only">Buscar mídia</span><Search size={16} aria-hidden="true"/><input value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}} placeholder="Buscar arquivo, URL ou tipo..."/></label><label className="sr-only" htmlFor="media-type">Filtrar mídia por tipo</label><select id="media-type" className="admin-filter" value={type} onChange={event=>{setType(event.target.value);setPage(1)}}>{availableTypes.map(value=><option key={value} value={value}>{value==='Todos'?'Todos os tipos':value}</option>)}</select></div><span className="admin-breadcrumb">{items.length} de {media.length} arquivos</span></div>
    {loading?<AdminEmpty title="Carregando mídias" description="Consultando a biblioteca do Site."/>:items.length?<div className="tableview-surface cms-tableview-surface"><section className="table-card"><table><thead><tr><th>Arquivo</th><th>Tipo</th><th>Tamanho</th><th>Adicionado em</th><th>Origem</th><th>Ações</th></tr></thead><tbody>{visibleItems.map(item=><tr key={item.id}><td><div className="table-primary"><span className="table-avatar"><Images size={14} aria-hidden="true"/></span><div><b>{item.name||item.url.split('/').pop()||'Mídia sem nome'}</b><small>{item.url||'Arquivo sem URL pública'}</small></div></div></td><td><span className="status">{item.type}</span></td><td>{formatSize(item.size)}</td><td>{formatDate(item.createdAt)}</td><td>{persistent?'Storage persistente':'Biblioteca local'}</td><td><div style={{display:'flex',gap:8}}><a className="button outline" href={item.url} target="_blank" rel="noreferrer">Abrir</a><button type="button" className="button outline" disabled={!persistent||saving} onClick={()=>void remove(item)}><Trash2 size={14}/>Excluir</button></div></td></tr>)}</tbody></table></section><TableViewPagination page={safePage} totalPages={totalPages} totalRecords={items.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/></div>:<AdminEmpty title="Nenhuma mídia encontrada" description={query||type!=='Todos'?'Nenhum arquivo corresponde aos filtros atuais.':'A biblioteca de mídia está vazia.'}/>} 
  </AdminShell>
}
