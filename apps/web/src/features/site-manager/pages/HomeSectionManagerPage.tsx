import { ExternalLink, Plus, Save, Smartphone, Trash2, Upload } from 'lucide-react'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { defaultHomeAdConfig, readHomeAdConfig, writeHomeAdConfig } from '../../../pages/home/models/adModel'
import { homeReadModel } from '../../../pages/home/models/homeReadModel'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import { loadSidebarAdConfig, saveSidebarAdConfig, SIDEBAR_AD_STORAGE_KEY, type SidebarAdConfig } from '../../../shared/persistence/sidebarAdStorage'
import '../../../styles/home-section-manager.css'
import '../../../styles/home-grid-section-editor.css'

export type SectionKey='em-destaque'|'mais-lidas'|'ultimas-noticias'|'publicidade-lateral'|'em-alta'|'secao-anuncie-aqui'|'lancamentos'|'agenda'|'rodape'
type SectionConfig={active:boolean;title:string;subtitle:string;linkLabel:string;linkUrl:string;source:string;quantity:number;width:number;height:number;paddingX:number;paddingY:number;radius:number;background:string;textColor:string;titleColor:string;accentColor:string;borderColor:string;bodyLines:string[];imageUrl:string;imageAlt:string;imageStored?:boolean}
type Definition={title:string;description:string;position:string;identifier:string;defaultTitle:string;defaultSubtitle:string;defaultQuantity:number;defaultWidth:number;defaultHeight:number;sourceLabel:string;sourceOptions:string[]}
type PreviewItem={title:string;image?:string;category?:string;place?:string;meta?:string}

type PreviewViewport='mobile'

const defs:Record<SectionKey,Definition>={
  'em-destaque':{title:'Em Destaque',description:'Configuração da seção oficial “EM DESTAQUE” da Homepage.',position:'Após o Ticker',identifier:'home_em_destaque',defaultTitle:'EM DESTAQUE',defaultSubtitle:'',defaultQuantity:6,defaultWidth:100,defaultHeight:320,sourceLabel:'Fonte dos conteúdos',sourceOptions:['Destaques da Home','Seleção manual']},
  'mais-lidas':{title:'Mais Lidas',description:'Configuração da seção oficial “MAIS LIDAS” da Homepage.',position:'Após Em Destaque',identifier:'home_mais_lidas',defaultTitle:'MAIS LIDAS',defaultSubtitle:'',defaultQuantity:10,defaultWidth:300,defaultHeight:520,sourceLabel:'Fonte',sourceOptions:['Mais lidas','Seleção manual']},
  'ultimas-noticias':{title:'Últimas Notícias',description:'Configuração da seção oficial “ÚLTIMAS NOTÍCIAS” da Homepage.',position:'Após Mais Lidas',identifier:'home_ultimas_noticias',defaultTitle:'ÚLTIMAS NOTÍCIAS',defaultSubtitle:'',defaultQuantity:4,defaultWidth:100,defaultHeight:320,sourceLabel:'Fonte dos conteúdos',sourceOptions:['Últimas notícias','Seleção manual']},
  'publicidade-lateral':{title:'Publicidade Lateral',description:'Configuração da seção oficial “Publicidade Lateral” da Homepage.',position:'Após Últimas Notícias',identifier:'home_publicidade_lateral',defaultTitle:'PUBLICIDADE',defaultSubtitle:'ANUNCIE AQUI',defaultQuantity:1,defaultWidth:300,defaultHeight:600,sourceLabel:'Slot',sourceOptions:['HOME_SIDEBAR_01','HOME_SIDEBAR_02']},
  'em-alta':{title:'Em Alta',description:'Configuração da seção oficial “EM ALTA” da Homepage.',position:'Após Publicidade Lateral',identifier:'home_em_alta',defaultTitle:'EM ALTA',defaultSubtitle:'',defaultQuantity:4,defaultWidth:300,defaultHeight:360,sourceLabel:'Fonte',sourceOptions:['Em alta','Mais lidas','Seleção manual']},
  'secao-anuncie-aqui':{title:'Seção Anuncie Aqui',description:'Configuração da seção oficial “ANUNCIE AQUI” da Homepage.',position:'Após Em Alta',identifier:'home_secao_anuncie_aqui',defaultTitle:defaultHomeAdConfig.title||'',defaultSubtitle:defaultHomeAdConfig.subtitle||'',defaultQuantity:1,defaultWidth:defaultHomeAdConfig.contentWidth,defaultHeight:defaultHomeAdConfig.height,sourceLabel:'Slot',sourceOptions:['SECAO_ANUNCIE_AQUI']},
  lancamentos:{title:'Lançamentos',description:'Configuração da seção oficial “LANÇAMENTOS” da Homepage.',position:'Após Seção Anuncie Aqui',identifier:'home_lancamentos',defaultTitle:'LANÇAMENTOS',defaultSubtitle:'',defaultQuantity:4,defaultWidth:100,defaultHeight:420,sourceLabel:'Fonte dos conteúdos',sourceOptions:['Lançamentos','Seleção manual']},
  agenda:{title:'Agenda',description:'Configuração da seção oficial “AGENDA” da Homepage.',position:'Após Lançamentos',identifier:'home_agenda',defaultTitle:'AGENDA',defaultSubtitle:'',defaultQuantity:6,defaultWidth:300,defaultHeight:420,sourceLabel:'Fonte',sourceOptions:['Próximos eventos','Seleção manual']},
  rodape:{title:'Rodapé',description:'Configuração do Rodapé oficial da Homepage.',position:'Encerramento da Homepage',identifier:'home_rodape',defaultTitle:'Portal Lander',defaultSubtitle:'',defaultQuantity:1,defaultWidth:100,defaultHeight:300,sourceLabel:'Estrutura',sourceOptions:['Rodapé atual']},
}

const defaultConfig=(d:Definition):SectionConfig=>({active:true,title:d.defaultTitle,subtitle:d.defaultSubtitle,linkLabel:d.identifier==='home_ultimas_noticias'?'VER TODAS AS NOTÍCIAS':d.identifier==='home_secao_anuncie_aqui'?(defaultHomeAdConfig.buttonLabel||''):d.identifier==='home_em_destaque'?'EXPLORAR DESTAQUES':'VER TODOS',linkUrl:d.identifier==='home_secao_anuncie_aqui'?(defaultHomeAdConfig.buttonUrl||'#'):'#',source:d.sourceOptions[0],quantity:d.defaultQuantity,width:d.defaultWidth,height:d.defaultHeight,paddingX:d.identifier==='home_publicidade_lateral'?0:24,paddingY:d.identifier==='home_publicidade_lateral'?0:24,radius:0,background:d.identifier==='home_publicidade_lateral'?'#090909':'#ffffff',textColor:d.identifier==='home_publicidade_lateral'?'#ffffff':'#333333',titleColor:d.identifier==='home_publicidade_lateral'?'#ffffff':'#111111',accentColor:'#e50914',borderColor:d.identifier==='home_publicidade_lateral'?'#090909':'#e5e5e5',bodyLines:d.identifier==='home_publicidade_lateral'?['SUA MARCA NO RITMO CERTO!']:[],imageUrl:'',imageAlt:'',imageStored:false})
const storageKey=(section:SectionKey)=>section==='publicidade-lateral'?SIDEBAR_AD_STORAGE_KEY:`portal-lander:cms:section-config:${section}:v1`
const SECTION_UPDATED_EVENT='portal-lander:section-config-updated'

function load(section:SectionKey,d:Definition):SectionConfig{
  if(section==='secao-anuncie-aqui'){
    const ad=readHomeAdConfig()
    return {...defaultConfig(d),active:ad.active,title:ad.title,subtitle:ad.subtitle,linkLabel:ad.buttonLabel,linkUrl:ad.buttonUrl,width:ad.contentWidth,height:ad.height,imageUrl:ad.image,imageAlt:ad.imageAlt}
  }
  try{const current=localStorage.getItem(storageKey(section));return current?{...defaultConfig(d),...JSON.parse(current)}:defaultConfig(d)}catch{return defaultConfig(d)}
}

function optimizeImage(file:File):Promise<string>{return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Não foi possível ler a imagem.'));reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error('Não foi possível processar a imagem.'));image.onload=()=>{const maxDimension=1600;const ratio=Math.min(1,maxDimension/Math.max(image.naturalWidth,image.naturalHeight));const width=Math.max(1,Math.round(image.naturalWidth*ratio));const height=Math.max(1,Math.round(image.naturalHeight*ratio));const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');if(!context){reject(new Error('Não foi possível preparar a imagem.'));return}context.drawImage(image,0,0,width,height);resolve(canvas.toDataURL('image/webp',.82))};image.src=String(reader.result||'')};reader.readAsDataURL(file)})}

function getPreviewItems(section:SectionKey):PreviewItem[]{
  if(section==='em-destaque')return homeReadModel.featuredStories.map(item=>({title:item.title,image:item.image,category:item.category,meta:item.meta}))
  if(section==='ultimas-noticias')return homeReadModel.latestStories.map(item=>({title:item.title,image:item.image,category:item.category,meta:item.meta}))
  if(section==='em-alta'||section==='mais-lidas')return homeReadModel.mostRead.map((title,index)=>({title,meta:`Há ${index+3} horas`}))
  if(section==='lancamentos')return homeReadModel.releases.map(item=>({title:item.title,image:item.image,meta:item.year}))
  if(section==='agenda')return homeReadModel.agenda.map(item=>({title:item.title,place:item.place,meta:`${item.day} ${item.month}`}))
  return []
}

function Preview({section,config,items,viewport}:{section:SectionKey;config:SectionConfig;items:PreviewItem[];viewport:PreviewViewport}){
  const shell={background:config.background,color:config.textColor,minHeight:config.height,border:`1px solid ${config.borderColor}`,borderRadius:config.radius,padding:`${config.paddingY}px ${config.paddingX}px`,overflow:'hidden'}
  if(section==='publicidade-lateral')return <div className={`section-preview-stage ${viewport}`}><div className="section-preview side-ad-preview" style={shell}>{config.imageUrl&&<img src={config.imageUrl} alt={config.imageAlt} style={{display:'block',width:'100%',height:'auto',objectFit:'contain',margin:0}}/>}{config.title&&<small style={{color:config.textColor}}>{config.title}</small>}{config.subtitle&&<h3 style={{color:config.titleColor,margin:'8px 0'}}>{config.subtitle}</h3>}{config.bodyLines.filter(Boolean).map((line,index)=><p key={`${line}-${index}`} style={{color:config.accentColor,fontWeight:800}}>{line}</p>)}{config.linkLabel&&<span style={{display:'inline-block',marginTop:12,border:`1px solid ${config.accentColor}`,padding:'8px 12px',color:config.accentColor}}>{config.linkLabel} →</span>}</div></div>
  if(section==='secao-anuncie-aqui')return <div className={`section-preview-stage ${viewport}`}><div className="section-preview" style={shell}>{config.imageUrl&&<img src={config.imageUrl} alt={config.imageAlt} style={{display:'block',width:'100%',height:'100%',objectFit:'cover'}}/>}<div style={{padding:16}}>{config.title&&<h3 style={{color:config.titleColor}}>{config.title}</h3>}{config.subtitle&&<p>{config.subtitle}</p>}{config.linkLabel&&<span style={{display:'inline-block',border:`1px solid ${config.accentColor}`,padding:'8px 12px',color:config.accentColor}}>{config.linkLabel}</span>}</div></div></div>
  if(section==='rodape')return <div className={`section-preview-stage ${viewport}`}><div className="section-preview" style={shell}><div className="section-preview-placeholder" style={{borderColor:config.borderColor}}>PORTAL LANDER · NAVEGAÇÃO · INSTITUCIONAL · REDES SOCIAIS</div></div></div>
  const listMode=section==='mais-lidas'||section==='em-alta'||section==='agenda'
  return <div className={`section-preview-stage ${viewport}`}><div className="section-preview" style={shell}><div className="section-preview-head"><h3 style={{color:config.titleColor}}>{config.title}</h3>{config.linkLabel&&<span style={{color:config.accentColor}}>{config.linkLabel} →</span>}</div>{config.subtitle&&<p>{config.subtitle}</p>}<div className={`section-preview-items ${listMode?'ranking':section}`}>{items.slice(0,config.quantity).map((item,index)=><div className="section-preview-item" key={`${item.title}-${index}`}>{item.image?<img src={item.image} alt=""/>:<span className="section-preview-number" style={{color:config.accentColor}}>{section==='agenda'?(item.meta||''):String(index+1).padStart(2,'0')}</span>}<strong>{item.title}</strong>{item.category&&<small>{item.category}</small>}{item.place&&<small>{item.place}</small>}{item.meta&&section!=='agenda'&&<small>{item.meta}</small>}</div>)}</div>{section==='ultimas-noticias'&&<div style={{display:'flex',justifyContent:'center',marginTop:16}}><span style={{border:`1px solid ${config.borderColor}`,padding:'8px 12px',fontSize:10,fontWeight:900,color:config.accentColor}}>VER TODAS AS NOTÍCIAS</span></div>}</div></div>
}

export function HomeSectionManagerPage({section}:{section:SectionKey}){
  const d=defs[section]
  const [config,setConfig]=useState<SectionConfig>(()=>load(section,d))
  const [saved,setSaved]=useState(false)
  const [saveError,setSaveError]=useState('')
  const [imageBusy,setImageBusy]=useState(false)
  const [saving,setSaving]=useState(false)

  useEffect(()=>{let cancelled=false;if(section==='publicidade-lateral')loadSidebarAdConfig(defaultConfig(d) as SidebarAdConfig).then(next=>{if(!cancelled)setConfig(next)});return()=>{cancelled=true}},[section,d])
  const patch=(p:Partial<SectionConfig>)=>{setConfig(c=>({...c,...p}));setSaved(false);setSaveError('')}
  const previewItems=useMemo(()=>getPreviewItems(section),[section])
  const save=async()=>{if(saving||imageBusy)return;setSaving(true);setSaveError('');try{if(section==='publicidade-lateral')await saveSidebarAdConfig(config as SidebarAdConfig);else if(section==='secao-anuncie-aqui'){const current=readHomeAdConfig();writeHomeAdConfig({...current,active:config.active,title:config.title,subtitle:config.subtitle,buttonLabel:config.linkLabel,buttonUrl:config.linkUrl,image:config.imageUrl,imageAlt:config.imageAlt,height:config.height,contentWidth:config.width<=100?current.contentWidth:config.width})}else localStorage.setItem(storageKey(section),JSON.stringify(config));setSaved(true);window.dispatchEvent(new CustomEvent(SECTION_UPDATED_EVENT,{detail:{section}}))}catch(error){setSaved(false);setSaveError(error instanceof Error?`Não foi possível salvar: ${error.message}`:'Não foi possível salvar esta seção.')}finally{setSaving(false)}}
  const widthValue=config.width<=100?1200:config.width
  const openPublicSite=()=>{const publicUrl=`${window.location.origin}${window.location.pathname}#/`;window.open(publicUrl,'_blank','noopener,noreferrer')}
  const updateBodyLine=(index:number,value:string)=>patch({bodyLines:config.bodyLines.map((line,i)=>i===index?value:line)})
  const removeBodyLine=(index:number)=>patch({bodyLines:config.bodyLines.filter((_,i)=>i!==index)})
  const addBodyLine=()=>patch({bodyLines:[...config.bodyLines,'Novo texto']})
  const handlesImage=section==='publicidade-lateral'||section==='secao-anuncie-aqui'
  const handleImageUpload=async(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;setImageBusy(true);setSaveError('');try{const imageUrl=await optimizeImage(file);patch({imageUrl,imageAlt:config.imageAlt||file.name,imageStored:false})}catch(error){setSaveError(error instanceof Error?error.message:'Não foi possível processar a imagem.')}finally{setImageBusy(false);event.target.value=''}}

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:`Configurar seção: ${d.title}`,description:d.description,backTo:'/app/site/secoes',backLabel:'Seções das Páginas'}} headerAction={{label:'Ver no site',icon:ExternalLink,variant:'secondary',onClick:openPublicSite}}>
    <div className="section-editor-layout grid-editor-layout">
      <section className="section-editor-card grid-editor-settings">
        <h2>Configurações gerais</h2>
        <label>Título da seção<input value={config.title} onChange={e=>patch({title:e.target.value})}/></label>
        <label>Subtítulo<input value={config.subtitle} onChange={e=>patch({subtitle:e.target.value})} placeholder="Opcional"/></label>
        <div className="section-editor-two"><label>Texto do botão<input value={config.linkLabel} onChange={e=>patch({linkLabel:e.target.value})}/></label><label>Link<input value={config.linkUrl} onChange={e=>patch({linkUrl:e.target.value})}/></label></div>
        <label>{d.sourceLabel}<select value={config.source} onChange={e=>patch({source:e.target.value})}>{d.sourceOptions.map(option=><option key={option}>{option}</option>)}</select></label>
        <label>Quantidade exibida<input type="number" min="1" max="20" value={config.quantity} onChange={e=>patch({quantity:Number(e.target.value)})}/><small>{d.position}</small></label>

        {section==='publicidade-lateral'&&<><h2>Conteúdo da publicidade</h2><div style={{display:'grid',gap:10}}>{config.bodyLines.map((line,index)=><div key={index} style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,alignItems:'center'}}><input value={line} onChange={e=>updateBodyLine(index,e.target.value)} aria-label={`Texto ${index+1}`}/><button type="button" className="button outline" onClick={()=>removeBodyLine(index)}><Trash2 size={15}/></button></div>)}</div><button type="button" className="button outline" onClick={addBodyLine} style={{marginTop:10}}><Plus size={15}/> Adicionar texto</button></>}

        {handlesImage&&<><h2>Imagem</h2>{config.imageUrl&&<img src={config.imageUrl} alt={config.imageAlt} style={{display:'block',width:'100%',height:'auto',maxHeight:240,objectFit:'contain',border:'1px solid #e5e5e5',marginBottom:10}}/>}<div style={{display:'flex',gap:8,flexWrap:'wrap'}}><label className="button outline" style={{cursor:imageBusy?'wait':'pointer',opacity:imageBusy?.65:1}}><Upload size={15}/> {imageBusy?'Otimizando imagem...':'Fazer upload'}<input type="file" accept="image/*" disabled={imageBusy} onChange={handleImageUpload} style={{display:'none'}}/></label>{config.imageUrl&&<button type="button" className="button outline" onClick={()=>patch({imageUrl:'',imageAlt:'',imageStored:false})}><Trash2 size={15}/> Remover imagem</button>}</div><label style={{marginTop:10}}>URL da imagem<input value={config.imageUrl.startsWith('blob:')?'':config.imageUrl} onChange={e=>patch({imageUrl:e.target.value,imageStored:false})} placeholder="https://..."/></label><label>Texto alternativo<input value={config.imageAlt} onChange={e=>patch({imageAlt:e.target.value})}/></label></>}

        <h2>Aparência e dimensões</h2>
        <div className="section-editor-slider"><span>Largura</span><input type="range" min="220" max="1600" value={widthValue} onChange={e=>patch({width:Number(e.target.value)})}/><b>{config.width<=100?'Auto':`${config.width}px`}</b></div>
        <div className="section-editor-slider"><span>Altura</span><input type="range" min="40" max="900" value={config.height} onChange={e=>patch({height:Number(e.target.value)})}/><b>{config.height}px</b></div>
        <div className="section-editor-slider"><span>Padding horizontal</span><input type="range" min="0" max="80" value={config.paddingX} onChange={e=>patch({paddingX:Number(e.target.value)})}/><b>{config.paddingX}px</b></div>
        <div className="section-editor-slider"><span>Padding vertical</span><input type="range" min="0" max="80" value={config.paddingY} onChange={e=>patch({paddingY:Number(e.target.value)})}/><b>{config.paddingY}px</b></div>
        <div className="section-editor-slider"><span>Arredondamento</span><input type="range" min="0" max="32" value={config.radius} onChange={e=>patch({radius:Number(e.target.value)})}/><b>{config.radius}px</b></div>
        <div className="section-editor-colors">{([['background','Cor de fundo'],['titleColor','Cor do título'],['textColor','Cor do texto'],['accentColor','Cor de destaque'],['borderColor','Cor da borda']] as const).map(([field,label])=><label key={field}>{label}<span><input type="color" value={config[field]} onChange={e=>patch({[field]:e.target.value} as Partial<SectionConfig>)}/><input value={config[field]} onChange={e=>patch({[field]:e.target.value} as Partial<SectionConfig>)}/></span></label>)}</div>
        <div className="section-editor-card section-details grid-details-inline"><h2>Detalhes da seção</h2><dl><dt>Identificador</dt><dd>{d.identifier}</dd><dt>Posição na página</dt><dd>{d.position}</dd><dt>Comportamento</dt><dd>Esta configuração representa exclusivamente a seção oficial com o mesmo nome na Homepage.</dd><dt>Responsividade</dt><dd>Automática pelo frontend</dd></dl></div>
      </section>

      <section className="section-editor-preview-column grid-editor-preview">
        <div className="section-editor-card section-preview-card"><div className="section-preview-toolbar"><div><h2>Prévia da seção</h2><p>Prévia compacta da seção oficial correspondente na Homepage.</p></div><div className="hero-cms-viewports" aria-label="Prévia única"><button type="button" className="active" aria-label="Prévia compacta" title="Prévia compacta"><Smartphone size={17}/></button></div></div><Preview section={section} config={config} items={previewItems} viewport="mobile"/></div>
        <div className="grid-editor-actions"><Link className="button outline" to="/app/site/secoes">Cancelar</Link><button type="button" className="button dark" onClick={save} disabled={imageBusy||saving}><Save size={15}/> {saving?'Salvando...':'Salvar alterações'}</button></div>
        {saveError&&<div className="home-section-manager-error grid-save-error" role="alert" style={{marginTop:10,color:'#b42318',fontWeight:700}}>{saveError}</div>}
        {saved&&<div className="home-section-manager-success grid-save-success">Alterações salvas com sucesso.</div>}
      </section>
    </div>
  </AdminShell>
}
