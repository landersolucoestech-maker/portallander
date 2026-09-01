import { Eye, Pencil, Plus, Settings2, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { editorialReadModel } from '../../editorial/repository'
import '../../../styles/site-sections.css'

type SiteSection={id:string;name:string;summary:string;target?:string;kind:'section';locked?:boolean}
type CmsPageOption={id:string;title:string;slug:string;source:'system'|'local'}
type StoredPageSection={id:string;name:string;slug:string}
type StoredPageSections=Record<string,StoredPageSection[]>

const HOME_SECTIONS:SiteSection[]=[
  {id:'hero',name:'Hero Section',summary:'Hero oficial da Homepage, incluindo o Ticker integrado.',target:'/app/site/paginas/home/hero',kind:'section',locked:true},
]

const LOCAL_PAGES_KEY='portal-lander:cms:pages:local:v1'
const PAGE_SECTIONS_KEY='portal-lander:cms:page-sections:v1'

const LEGACY_SECTION_KEYS=[
  'portal-lander:cms:section-config:grid:v4',
  'portal-lander:cms:section-config:ranking:v4',
  'portal-lander:cms:section-config:most-read:v4',
  'portal-lander:cms:section-config:secondary:v4',
  'portal-lander:cms:section-config:trending:v4',
  'portal-lander:cms:section-config:banner:v4',
  'portal-lander:cms:section-config:videos:v4',
  'portal-lander:cms:section-config:newsletter:v4',
  'portal-lander:cms:section-config:grid:v1',
  'portal-lander:cms:section-config:em-destaque:v1',
  'portal-lander:cms:section-config:mais-lidas:v1',
  'portal-lander:cms:section-config:ultimas-noticias:v1',
  'portal-lander:cms:section-config:em-alta:v1',
  'portal-lander:cms:section-config:horizontal-ad:v1',
  'portal-lander:cms:section-config:secao-anuncie-aqui:v1',
  'portal-lander:cms:section-config:releases:v1',
  'portal-lander:cms:section-config:lancamentos:v1',
  'portal-lander:cms:section-config:agenda:v1',
  'portal-lander:cms:section-config:footer:v1',
  'portal-lander:cms:section-config:rodape:v1',
]

function purgeLegacySectionData(){for(const key of LEGACY_SECTION_KEYS)localStorage.removeItem(key)}
function normalizeSlug(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}
function readLocalPages():CmsPageOption[]{try{const parsed=JSON.parse(localStorage.getItem(LOCAL_PAGES_KEY)||'[]');return Array.isArray(parsed)?parsed:[]}catch{return []}}
function writeLocalPages(pages:CmsPageOption[]){localStorage.setItem(LOCAL_PAGES_KEY,JSON.stringify(pages))}
function readPageSections():StoredPageSections{try{const parsed=JSON.parse(localStorage.getItem(PAGE_SECTIONS_KEY)||'{}');return parsed&&typeof parsed==='object'?parsed:{}}catch{return {}}}
function writePageSections(sections:StoredPageSections){localStorage.setItem(PAGE_SECTIONS_KEY,JSON.stringify(sections))}

export function SiteSectionsPage(){
  const [localPages,setLocalPages]=useState<CmsPageOption[]>(()=>readLocalPages())
  const [storedSections,setStoredSections]=useState<StoredPageSections>(()=>readPageSections())
  const [selectedPage,setSelectedPage]=useState('home')
  const [createOpen,setCreateOpen]=useState(false)
  const [sectionOpen,setSectionOpen]=useState(false)
  const [editingSectionId,setEditingSectionId]=useState<string|null>(null)
  const [title,setTitle]=useState('')
  const [slug,setSlug]=useState('')
  const [sectionName,setSectionName]=useState('')
  const [sectionSlug,setSectionSlug]=useState('')
  const [error,setError]=useState('')

  useEffect(()=>{purgeLegacySectionData()},[])

  const pages=useMemo<CmsPageOption[]>(()=>{
    const systemPages=editorialReadModel.pages.map(page=>({id:page.id,title:page.title,slug:page.slug,source:'system' as const}))
    return [{id:'home',title:'Página inicial',slug:'',source:'system' as const},...systemPages,...localPages]
  },[localPages])

  const selected=pages.find(page=>page.id===selectedPage)??pages[0]
  const customSections=storedSections[selectedPage]??[]
  const pageSections:SiteSection[]=[...(selectedPage==='home'?HOME_SECTIONS:[]),...customSections.map(section=>({id:section.id,name:section.name,summary:`Seção criada para ${selected?.title||'esta página'}.`,kind:'section' as const}))]

  const createPage=()=>{
    const cleanTitle=title.trim()
    const cleanSlug=normalizeSlug(slug||title)
    if(!cleanTitle){setError('Informe o nome da página.');return}
    if(!cleanSlug){setError('Informe um slug válido.');return}
    if(pages.some(page=>page.slug===cleanSlug)){setError('Já existe uma página com este slug.');return}
    const page:CmsPageOption={id:`local-${Date.now()}`,title:cleanTitle,slug:cleanSlug,source:'local'}
    const next=[...localPages,page]
    setLocalPages(next);writeLocalPages(next);setSelectedPage(page.id)
    setTitle('');setSlug('');setError('');setCreateOpen(false)
  }

  const openCreateSection=()=>{setEditingSectionId(null);setSectionName('');setSectionSlug('');setError('');setSectionOpen(true)}
  const openEditSection=(section:StoredPageSection)=>{setEditingSectionId(section.id);setSectionName(section.name);setSectionSlug(section.slug);setError('');setSectionOpen(true)}
  const saveSection=()=>{
    const cleanName=sectionName.trim()
    const cleanSlug=normalizeSlug(sectionSlug||sectionName)
    if(!cleanName){setError('Informe o nome da seção.');return}
    if(!cleanSlug){setError('Informe um identificador válido para a seção.');return}
    const current=storedSections[selectedPage]??[]
    if(current.some(section=>section.slug===cleanSlug&&section.id!==editingSectionId)){setError('Já existe uma seção com este identificador nesta página.');return}
    const nextSections=editingSectionId
      ? current.map(section=>section.id===editingSectionId?{...section,name:cleanName,slug:cleanSlug}:section)
      : [...current,{id:`section-${Date.now()}`,name:cleanName,slug:cleanSlug}]
    const next={...storedSections,[selectedPage]:nextSections}
    setStoredSections(next);writePageSections(next);setSectionOpen(false);setEditingSectionId(null);setSectionName('');setSectionSlug('');setError('')
  }
  const removeSection=(id:string)=>{
    const next={...storedSections,[selectedPage]:(storedSections[selectedPage]??[]).filter(section=>section.id!==id)}
    setStoredSections(next);writePageSections(next)
  }

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Páginas',description:'Crie páginas, selecione-as pelo menu e monte somente as seções próprias de cada página. Cabeçalho e Rodapé são globais e ficam em Configurações > Identidade do Site.'}}>
    <div className="site-sections-toolbar">
      <div style={{display:'flex',alignItems:'flex-end',gap:10,flexWrap:'wrap'}}>
        <label>Página<select value={selectedPage} onChange={event=>setSelectedPage(event.target.value)}>{pages.map(page=><option key={page.id} value={page.id}>{page.title}</option>)}</select></label>
        <button type="button" className="site-sections-configure" onClick={()=>{setCreateOpen(true);setError('')}}><Plus size={15}/> Criar página</button>
        <button type="button" className="site-sections-configure" onClick={openCreateSection}><Plus size={15}/> Criar seção</button>
      </div>
      <a href={selected?.slug?`${new URL(import.meta.env.BASE_URL,window.location.origin).toString()}#/${selected.slug}`:new URL(import.meta.env.BASE_URL,window.location.origin).toString()} target="_blank" rel="noreferrer"><Eye size={15}/> Ver página pública</a>
    </div>

    <div className="section-editor-card" style={{marginBottom:16}}><strong>Estrutura global automática</strong><p style={{margin:'6px 0 0'}}>Todas as páginas usam o mesmo Cabeçalho antes das seções e o mesmo Rodapé após a última seção. Essas configurações não variam por página.</p><Link className="site-sections-configure" style={{marginTop:10,display:'inline-flex'}} to="/app/site/configuracoes"><Settings2 size={15}/> Configurar Identidade do Site</Link></div>

    <div className="site-sections-list" role="table" aria-label={`Seções de ${selected?.title||'página selecionada'}`}>
      <div className="site-sections-head" role="row"><span>SEÇÃO</span><span>ESTRUTURA</span><span>STATUS</span><span>AÇÕES</span></div>
      {pageSections.length?pageSections.map((section,index)=><div className="site-sections-row" role="row" key={`${selectedPage}-${section.id}`}>
        <div className="site-sections-name"><strong>{String(index+1).padStart(2,'0')}</strong><span><b>{section.name}</b><small>{section.summary}</small></span></div>
        <span className="site-sections-structure">Seção de {selected?.title||'página'}</span>
        <span className="site-sections-status"><i/> Ativo</span>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',alignItems:'center'}}>
          {section.target&&<Link className="site-sections-configure" to={section.target}><Settings2 size={15}/> Configurar</Link>}
          {!section.locked&&<>
            <button type="button" className="site-sections-configure" onClick={()=>{const current=(storedSections[selectedPage]??[]).find(item=>item.id===section.id);if(current)openEditSection(current)}}><Pencil size={15}/> Editar</button>
            <button type="button" className="site-sections-configure" onClick={()=>removeSection(section.id)} aria-label={`Excluir ${section.name}`}><Trash2 size={15}/> Excluir</button>
          </>}
        </div>
      </div>):<div className="site-sections-row" role="row"><div className="site-sections-name"><strong>—</strong><span><b>Nenhuma seção criada</b><small>Crie a primeira seção desta página. Cabeçalho e Rodapé globais serão aplicados automaticamente no site.</small></span></div><span className="site-sections-structure">Sem seções próprias</span><span className="site-sections-status">—</span><span/></div>}
    </div>

    {createOpen&&<div role="presentation" style={{position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,.55)',display:'grid',placeItems:'center',padding:20}} onMouseDown={event=>{if(event.currentTarget===event.target)setCreateOpen(false)}}>
      <section role="dialog" aria-modal="true" aria-labelledby="create-page-title" className="section-editor-card" style={{width:'min(560px,100%)',boxShadow:'0 24px 80px rgba(0,0,0,.28)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><div><h2 id="create-page-title" style={{marginBottom:4}}>Criar página</h2><p style={{margin:0}}>A nova página será adicionada ao menu Página. O Cabeçalho e o Rodapé globais serão aplicados automaticamente.</p></div><button type="button" onClick={()=>setCreateOpen(false)} aria-label="Fechar"><X size={18}/></button></div>
        <div style={{display:'grid',gap:14,marginTop:20}}>
          <label>Nome da página<input autoFocus value={title} onChange={event=>{setTitle(event.target.value);if(!slug)setSlug(normalizeSlug(event.target.value));setError('')}} placeholder="Ex.: Música"/></label>
          <label>Slug<input value={slug} onChange={event=>{setSlug(normalizeSlug(event.target.value));setError('')}} placeholder="musica"/></label>
          {error&&<div style={{color:'#d00',fontWeight:700,fontSize:13}}>{error}</div>}
          <div style={{display:'flex',justifyContent:'flex-end',gap:10}}><button type="button" className="button outline" onClick={()=>setCreateOpen(false)}>Cancelar</button><button type="button" className="button dark" onClick={createPage}><Plus size={15}/> Criar página</button></div>
        </div>
      </section>
    </div>}

    {sectionOpen&&<div role="presentation" style={{position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,.55)',display:'grid',placeItems:'center',padding:20}} onMouseDown={event=>{if(event.currentTarget===event.target)setSectionOpen(false)}}>
      <section role="dialog" aria-modal="true" aria-labelledby="section-dialog-title" className="section-editor-card" style={{width:'min(560px,100%)',boxShadow:'0 24px 80px rgba(0,0,0,.28)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><div><h2 id="section-dialog-title" style={{marginBottom:4}}>{editingSectionId?'Editar seção':'Criar seção'}</h2><p style={{margin:0}}>Esta configuração afeta somente a página selecionada. Cabeçalho e Rodapé continuam globais.</p></div><button type="button" onClick={()=>setSectionOpen(false)} aria-label="Fechar"><X size={18}/></button></div>
        <div style={{display:'grid',gap:14,marginTop:20}}>
          <label>Nome da seção<input autoFocus value={sectionName} onChange={event=>{setSectionName(event.target.value);if(!sectionSlug)setSectionSlug(normalizeSlug(event.target.value));setError('')}} placeholder="Ex.: Conteúdo principal"/></label>
          <label>Identificador<input value={sectionSlug} onChange={event=>{setSectionSlug(normalizeSlug(event.target.value));setError('')}} placeholder="conteudo-principal"/></label>
          {error&&<div style={{color:'#d00',fontWeight:700,fontSize:13}}>{error}</div>}
          <div style={{display:'flex',justifyContent:'flex-end',gap:10}}><button type="button" className="button outline" onClick={()=>setSectionOpen(false)}>Cancelar</button><button type="button" className="button dark" onClick={saveSection}><Plus size={15}/> {editingSectionId?'Salvar seção':'Criar seção'}</button></div>
        </div>
      </section>
    </div>}
  </AdminShell>
}
