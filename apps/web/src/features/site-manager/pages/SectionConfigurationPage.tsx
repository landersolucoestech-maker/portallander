import {ExternalLink,RotateCcw,Save} from 'lucide-react'
import {useMemo,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {HeroEditor} from '../../../pages/home/components/HeroEditor'
import {homeReadModel,type HomeStory} from '../../../pages/home/models/homeReadModel'
import {editorialReadModel} from '../../editorial/repository'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {sitePageRepository} from '../pageRepository'
import {
  EDITORIAL_SECTION_DEFINITION,
  HOME_SECTION_DEFINITIONS,
  defaultSectionConfiguration,
  readSectionConfiguration,
  resetSectionConfiguration,
  writeSectionConfiguration,
  type SectionConfiguration,
  type SectionDefinition,
} from '../sectionConfiguration'
import '../../../pages/home/styles/home-official-sections.css'
import '../../../styles/section-configuration-editor.css'

function SectionHead({title,linkLabel}:{title:string;linkLabel?:string}){
  return <div className="pl-section-head"><h2>{title}</h2>{linkLabel&&<span>{linkLabel}</span>}</div>
}

function ImageThumb({src,badge}:{src:string;badge?:string}){
  return <div className="pl-thumb has-image" style={{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(0,0,0,.72)),url(${src})`}}>{badge&&<span className="pl-badge">{badge}</span>}</div>
}

function StoryCard({item}:{item:HomeStory}){
  return <article className="pl-card"><ImageThumb src={item.image} badge={item.category}/><div className="pl-card-body"><h3>{item.title}</h3><div className="pl-meta"><span>{item.meta}</span><span>◉ {item.views}</span></div></div></article>
}

function StandardPreview({definition,config}:{definition:SectionDefinition;config:SectionConfiguration}){
  const limit=Math.max(1,Math.min(12,config.itemLimit||1))
  const commonStyle={background:config.background,color:config.textColor,textAlign:config.textAlign as 'left'|'center'|'right'}

  if(!config.active)return <div className="section-preview-disabled">Esta seção está oculta. Ative-a no painel à esquerda para visualizar o resultado.</div>

  if(definition.kind==='featured')return <section className="pl-section official-em-destaque section-preview-real" style={commonStyle}><SectionHead title={config.title} linkLabel={config.linkLabel}/><div className="pl-card-grid" style={{gridTemplateColumns:`repeat(${Math.max(1,Math.min(4,config.columns))},minmax(0,1fr))`}}>{homeReadModel.featuredStories.slice(0,limit).map(story=><StoryCard key={story.title} item={story}/>)}</div></section>

  if(definition.kind==='latest')return <section className="pl-section official-ultimas-noticias section-preview-real" style={commonStyle}><SectionHead title={config.title} linkLabel={config.linkLabel}/><div className="pl-latest-grid" style={{gridTemplateColumns:`repeat(${Math.max(1,Math.min(4,config.columns))},minmax(0,1fr))`}}>{homeReadModel.latestStories.slice(0,limit).map(story=><StoryCard key={story.title} item={story}/>)}</div></section>

  if(definition.kind==='ranking')return <section className="pl-most official-mais-lidas section-preview-real" style={commonStyle}><SectionHead title={config.title}/>{homeReadModel.mostRead.slice(0,limit).map((title,index)=><div className="pl-ranked" key={title}><strong>{String(index+1).padStart(2,'0')}</strong><div><h4>{title}</h4><small>Há {index+3} horas</small></div></div>)}{config.linkLabel&&<span className="pl-outline-button">{config.linkLabel}</span>}</section>

  if(definition.kind==='trending')return <section className="pl-trending official-em-alta section-preview-real" style={commonStyle}><div className="pl-section-head pl-trending-head"><h2>{config.title}</h2>{config.linkLabel&&<span>{config.linkLabel}</span>}</div><div className="pl-trending-list">{homeReadModel.mostRead.slice(0,limit).map((title,index)=><div className="pl-trending-item" key={title}><span className="pl-trending-rank">{String(index+1).padStart(2,'0')}</span><div><strong>{title}</strong><small>Há {index+3} horas</small></div></div>)}</div></section>

  if(definition.kind==='releases')return <section className="pl-section official-lancamentos section-preview-real" style={commonStyle}><SectionHead title={config.title} linkLabel={config.linkLabel}/><div className="pl-release-row">{homeReadModel.releases.slice(0,limit).map(release=><article className="pl-release" key={release.title}><ImageThumb src={release.image} badge="▶"/><div className="pl-card-body"><h3>{release.title}</h3><div className="pl-meta"><span>{release.year}</span></div></div></article>)}</div></section>

  if(definition.kind==='agenda')return <section className="pl-agenda official-agenda section-preview-real" style={commonStyle}><SectionHead title={config.title}/>{homeReadModel.agenda.slice(0,limit).map(item=><div className="pl-agenda-item" key={item.title}><div><strong>{item.day}</strong><span>{item.month}</span></div><div><b>{item.title}</b><small>{item.place}</small></div></div>)}{config.linkLabel&&<span className="pl-outline-button">{config.linkLabel}</span>}</section>

  if(definition.kind==='ad')return <section className="pl-home-sidebar-ad official-publicidade-lateral section-preview-ad"><div className="pl-home-sidebar-ad-inner" style={{background:config.background,color:config.textColor}}>{config.imageUrl&&<img src={config.imageUrl} alt="Preview da publicidade"/>}<span className="pl-home-sidebar-ad-kicker">{config.title}</span>{config.eyebrow&&<h3 style={{color:config.textColor}}>{config.eyebrow}</h3>}{config.description&&<p style={{color:config.accentColor}}>{config.description}</p>}{config.linkLabel&&<span style={{borderColor:config.accentColor,color:config.accentColor}}>{config.linkLabel} →</span>}</div></section>

  if(definition.kind==='cta')return <section className="section-preview-cta" style={commonStyle}>{config.imageUrl&&<img src={config.imageUrl} alt=""/>}<div><small style={{color:config.accentColor}}>{config.eyebrow}</small><h2>{config.title}</h2>{config.description&&<p>{config.description}</p>}{config.linkLabel&&<span className="section-preview-cta-button" style={{background:config.accentColor}}>{config.linkLabel}</span>}</div></section>

  if(definition.kind==='editorial')return <section className="section-preview-editorial" style={commonStyle}><div className="section-preview-editorial-head"><div><small>NOTÍCIAS</small><h2>{config.title}</h2><p>{config.description}</p></div></div><div className="section-preview-editorial-grid" style={{gridTemplateColumns:`repeat(${Math.max(1,Math.min(4,config.columns))},minmax(0,1fr))`}}>{homeReadModel.stories.slice(0,Math.min(limit,6)).map(story=><StoryCard key={story.title} item={story}/>)}</div></section>

  return <section className="section-preview-custom" style={commonStyle}>{config.imageUrl&&<img src={config.imageUrl} alt=""/>}<div><small style={{color:config.accentColor}}>{config.eyebrow}</small><h2>{config.title}</h2>{config.description&&<p>{config.description}</p>}{config.linkLabel&&<span className="section-preview-cta-button" style={{background:config.accentColor}}>{config.linkLabel}</span>}</div></section>
}

function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="section-config-field"><span>{label}</span>{children}</label>}

export function SectionConfigurationPage(){
  const {pageId='home',sectionId=''}=useParams()
  const homeDefinition=HOME_SECTION_DEFINITIONS.find(item=>item.id===sectionId)
  const custom=sitePageRepository.listSections()[pageId]?.find(item=>item.id===sectionId)
  const definition:SectionDefinition=homeDefinition??(sectionId==='editorial-template'?EDITORIAL_SECTION_DEFINITION:{id:sectionId,name:custom?.name||'Seção personalizada',summary:custom?`Seção própria configurável de ${custom.name}.`:'Seção configurável da página.',kind:'custom'})
  const isHero=definition.kind==='hero'
  const [config,setConfig]=useState<SectionConfiguration>(()=>readSectionConfiguration(pageId,sectionId,definition.name))
  const [saved,setSaved]=useState(false)
  const page=editorialReadModel.pages.find(item=>item.id===pageId)
  const localPage=sitePageRepository.listDraftPages().find(item=>item.id===pageId)
  const publicPath=pageId==='home'?'/':`/${page?.slug||localPage?.slug||''}`
  const publicUrl=`${window.location.origin}${window.location.pathname}#${publicPath}`
  const patch=(next:Partial<SectionConfiguration>)=>{setConfig(current=>({...current,...next}));setSaved(false)}
  const save=()=>{writeSectionConfiguration(pageId,sectionId,config);setSaved(true)}
  const reset=()=>{resetSectionConfiguration(pageId,sectionId);setConfig(defaultSectionConfiguration(sectionId,definition.name));setSaved(false)}
  const title=useMemo(()=>`Configurar seção: ${definition.name}`,[definition.name])

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title,description:'Edite a seção à esquerda e visualize o resultado real em tempo real à direita.',backTo:'/app/site/paginas',backLabel:'Páginas'}} headerAction={{label:'Ver no site',icon:ExternalLink,variant:'secondary',onClick:()=>window.open(publicUrl,'_blank','noopener,noreferrer')}}>
    {isHero?<HeroEditor/>:<>
      <AdminNotice title="Preview em tempo real" description="As alterações abaixo são refletidas imediatamente no preview. Salvar grava a configuração desta seção sem alterar outras seções da página."/>
      <div className="section-config-workbench">
        <aside className="section-config-panel">
          <div className="section-config-panel-head"><div><small>SEÇÃO</small><h2>{definition.name}</h2><p>{definition.summary}</p></div><label className="section-config-switch"><input type="checkbox" checked={config.active} onChange={event=>patch({active:event.target.checked})}/><span>Ativa</span></label></div>
          <div className="section-config-fields">
            <Field label="Título"><input value={config.title} onChange={event=>patch({title:event.target.value})}/></Field>
            <Field label="Chamada / kicker"><input value={config.eyebrow} onChange={event=>patch({eyebrow:event.target.value})} placeholder="Opcional"/></Field>
            <Field label="Descrição"><textarea rows={4} value={config.description} onChange={event=>patch({description:event.target.value})} placeholder="Texto opcional da seção"/></Field>
            <div className="section-config-two"><Field label="Texto do botão / link"><input value={config.linkLabel} onChange={event=>patch({linkLabel:event.target.value})}/></Field><Field label="Destino"><input value={config.linkUrl} onChange={event=>patch({linkUrl:event.target.value})} placeholder="/noticias"/></Field></div>
            <Field label="Imagem / mídia"><input value={config.imageUrl} onChange={event=>patch({imageUrl:event.target.value})} placeholder="URL opcional"/></Field>
            <div className="section-config-two"><Field label="Quantidade de itens"><input type="number" min="1" max="12" value={config.itemLimit} onChange={event=>patch({itemLimit:Number(event.target.value)||1})}/></Field><Field label="Colunas"><select value={config.columns} onChange={event=>patch({columns:Number(event.target.value)})}><option value="1">1 coluna</option><option value="2">2 colunas</option><option value="3">3 colunas</option><option value="4">4 colunas</option></select></Field></div>
            <Field label="Alinhamento"><select value={config.textAlign} onChange={event=>patch({textAlign:event.target.value as SectionConfiguration['textAlign']})}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Field>
            <div className="section-config-colors"><Field label="Fundo"><input type="color" value={config.background} onChange={event=>patch({background:event.target.value})}/></Field><Field label="Texto"><input type="color" value={config.textColor} onChange={event=>patch({textColor:event.target.value})}/></Field><Field label="Destaque"><input type="color" value={config.accentColor} onChange={event=>patch({accentColor:event.target.value})}/></Field></div>
          </div>
          <div className="section-config-actions"><button type="button" className="button outline" onClick={reset}><RotateCcw size={15}/> Restaurar padrão</button><button type="button" className="button dark" onClick={save}><Save size={15}/> Salvar alterações</button></div>
          {saved&&<div className="section-config-success">Configuração salva com sucesso.</div>}
        </aside>
        <section className="section-config-preview-column"><div className="section-config-preview-head"><div><small>PREVIEW AO VIVO</small><strong>{definition.name}</strong></div><Link to="/app/site/paginas">Voltar às seções</Link></div><div className="section-config-preview-frame"><StandardPreview definition={definition} config={config}/></div></section>
      </div>
    </>}
  </AdminShell>
}
