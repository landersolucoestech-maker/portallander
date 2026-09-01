import { Eye, Plus, Settings2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { editorialReadModel } from '../../editorial/repository'
import '../../../styles/site-sections.css'

type SiteSection={name:string;summary:string;target:string;kind:'module'|'section'}
type CmsPageOption={id:string;title:string;slug:string;source:'system'|'local'}

const HEADER_SECTION:SiteSection={name:'Cabeçalho',summary:'Cabeçalho obrigatório da página. Sempre ocupa a primeira posição.',target:'/app/site/cabecalho',kind:'module'}
const HOME_MIDDLE_SECTIONS:SiteSection[]=[
  {name:'Hero Section',summary:'Hero oficial da Homepage, incluindo o Ticker integrado.',target:'/app/site/secoes/home/hero',kind:'section'},
]
const FOOTER_SECTION:SiteSection={name:'Rodapé',summary:'Rodapé obrigatório da página. Sempre ocupa a última posição.',target:'/app/site/rodape',kind:'module'}

const LOCAL_PAGES_KEY='portal-lander:cms:pages:local:v1'

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
function sectionsForPage(pageId:string):SiteSection[]{
  const middle=pageId==='home'?HOME_MIDDLE_SECTIONS:[]
  return [HEADER_SECTION,...middle,FOOTER_SECTION]
}

export function SiteSectionsPage(){
  const [localPages,setLocalPages]=useState<CmsPageOption[]>(()=>readLocalPages())
  const [selectedPage,setSelectedPage]=useState('home')
  const [createOpen,setCreateOpen]=useState(false)
  const [title,setTitle]=useState('')
  const [slug,setSlug]=useState('')
  const [error,setError]=useState('')

  useEffect(()=>{purgeLegacySectionData()},[])

  const pages=useMemo<CmsPageOption[]>(()=>{
    const systemPages=editorialReadModel.pages.map(page=>({id:page.id,title:page.title,slug:page.slug,source:'system' as const}))
    return [{id:'home',title:'Página inicial',slug:'',source:'system' as const},...systemPages,...localPages]
  },[localPages])

  const selected=pages.find(page=>page.id===selectedPage)??pages[0]
  const pageSections=sectionsForPage(selectedPage)

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

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Seções das Páginas',description:'Crie páginas, selecione-as pelo menu e configure suas seções. Cabeçalho e Rodapé são módulos próprios e permanecem, respectivamente, no início e no final de toda página.'}}>
    <div className="site-sections-toolbar">
      <div style={{display:'flex',alignItems:'flex-end',gap:10,flexWrap:'wrap'}}>
        <label>Página<select value={selectedPage} onChange={event=>setSelectedPage(event.target.value)}>{pages.map(page=><option key={page.id} value={page.id}>{page.title}</option>)}</select></label>
        <button type="button" className="site-sections-configure" onClick={()=>{setCreateOpen(true);setError('')}}><Plus size={15}/> Criar página</button>
      </div>
      <a href={selected?.slug?`${new URL(import.meta.env.BASE_URL,window.location.origin).toString()}#/${selected.slug}`:new URL(import.meta.env.BASE_URL,window.location.origin).toString()} target="_blank" rel="noreferrer"><Eye size={15}/> Ver página pública</a>
    </div>

    <div className="site-sections-list" role="table" aria-label={`Seções de ${selected?.title||'página selecionada'}`}>
      <div className="site-sections-head" role="row"><span>SEÇÃO</span><span>ESTRUTURA</span><span>STATUS</span><span>AÇÕES</span></div>
      {pageSections.map((section,index)=><div className="site-sections-row" role="row" key={`${selectedPage}-${section.name}`}>
        <div className="site-sections-name"><strong>{String(index+1).padStart(2,'0')}</strong><span><b>{section.name}</b><small>{section.summary}</small></span></div>
        <span className="site-sections-structure">{section.kind==='module'?'Módulo próprio':`Seção de ${selected?.title||'página'}`}</span>
        <span className="site-sections-status"><i/> Ativo</span>
        <Link className="site-sections-configure" to={section.target}><Settings2 size={15}/> Configurar</Link>
      </div>)}
    </div>

    {createOpen&&<div role="presentation" style={{position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,.55)',display:'grid',placeItems:'center',padding:20}} onMouseDown={event=>{if(event.currentTarget===event.target)setCreateOpen(false)}}>
      <section role="dialog" aria-modal="true" aria-labelledby="create-page-title" className="section-editor-card" style={{width:'min(560px,100%)',boxShadow:'0 24px 80px rgba(0,0,0,.28)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><div><h2 id="create-page-title" style={{marginBottom:4}}>Criar página</h2><p style={{margin:0}}>A nova página será adicionada imediatamente ao menu Página e já receberá Cabeçalho no início e Rodapé no final.</p></div><button type="button" onClick={()=>setCreateOpen(false)} aria-label="Fechar"><X size={18}/></button></div>
        <div style={{display:'grid',gap:14,marginTop:20}}>
          <label>Nome da página<input autoFocus value={title} onChange={event=>{setTitle(event.target.value);if(!slug)setSlug(normalizeSlug(event.target.value));setError('')}} placeholder="Ex.: Música"/></label>
          <label>Slug<input value={slug} onChange={event=>{setSlug(normalizeSlug(event.target.value));setError('')}} placeholder="musica"/></label>
          {error&&<div style={{color:'#d00',fontWeight:700,fontSize:13}}>{error}</div>}
          <div style={{display:'flex',justifyContent:'flex-end',gap:10}}><button type="button" className="button outline" onClick={()=>setCreateOpen(false)}>Cancelar</button><button type="button" className="button dark" onClick={createPage}><Plus size={15}/> Criar página</button></div>
        </div>
      </section>
    </div>}
  </AdminShell>
}
