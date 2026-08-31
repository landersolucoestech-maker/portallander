import { ArrowLeft, ExternalLink, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { homeReadModel } from '../../../pages/home/models/homeReadModel'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/home-section-manager.css'

export type SectionKey='hero'|'ticker'|'grid'|'ranking'|'side-ad'|'secondary'|'trending'|'banner'|'videos'|'agenda'|'newsletter'|'footer'
type SectionConfig={active:boolean;title:string;subtitle:string;linkLabel:string;linkUrl:string;source:string;quantity:number;width:number;height:number;paddingX:number;paddingY:number;radius:number;background:string;textColor:string;titleColor:string;accentColor:string;borderColor:string}
type Definition={title:string;description:string;position:string;identifier:string;defaultTitle:string;defaultSubtitle:string;defaultQuantity:number;defaultWidth:number;defaultHeight:number;sourceLabel:string;sourceOptions:string[]}

const defs:Record<SectionKey,Definition>={
  hero:{title:'Hero principal',description:'Configuração visual e estrutural do Hero da página inicial.',position:'Primeiro bloco da página',identifier:'home_hero_principal',defaultTitle:'Viva o agora. Conte o que importa.',defaultSubtitle:'Histórias que conectam cultura, música e movimento.',defaultQuantity:1,defaultWidth:100,defaultHeight:560,sourceLabel:'Fonte',sourceOptions:['Destaque principal','Seleção manual']},
  ticker:{title:'Barra Agora',description:'Faixa de chamadas rápidas logo abaixo do Hero.',position:'Logo abaixo do Hero',identifier:'home_barra_agora',defaultTitle:'AGORA',defaultSubtitle:'Fique por dentro do que está acontecendo agora.',defaultQuantity:1,defaultWidth:100,defaultHeight:56,sourceLabel:'Fonte',sourceOptions:['Últimas notícias','Seleção manual','Destaques']},
  grid:{title:'Grid principal',description:'Configuração do bloco editorial principal da Home.',position:'Abaixo da Barra Agora, com Ranking à direita',identifier:'home_grid_principal',defaultTitle:'Últimas notícias',defaultSubtitle:'Confira os destaques e novidades mais recentes.',defaultQuantity:6,defaultWidth:100,defaultHeight:320,sourceLabel:'Fonte dos conteúdos',sourceOptions:['Destaques da Home','Últimas notícias','Seleção manual']},
  ranking:{title:'Ranking',description:'Configuração do ranking lateral ao Grid principal.',position:'Lateral direita do Grid principal',identifier:'home_ranking',defaultTitle:'Ranking',defaultSubtitle:'Conteúdos mais acessados.',defaultQuantity:10,defaultWidth:300,defaultHeight:520,sourceLabel:'Tipo de ranking',sourceOptions:['Mais lidas','Mais recentes','Seleção manual']},
  'side-ad':{title:'Publicidade lateral',description:'Configuração do slot publicitário abaixo do Ranking.',position:'Abaixo do Ranking, lateral direita',identifier:'home_pub_lateral',defaultTitle:'Publicidade',defaultSubtitle:'Campanha lateral ativa.',defaultQuantity:1,defaultWidth:300,defaultHeight:600,sourceLabel:'Slot',sourceOptions:['HOME_SIDEBAR_01','HOME_SIDEBAR_02']},
  secondary:{title:'Destaques secundários',description:'Configuração do segundo bloco editorial da Home.',position:'Abaixo do bloco principal',identifier:'home_destaques_secundarios',defaultTitle:'Em destaque',defaultSubtitle:'Seleção editorial em evidência.',defaultQuantity:4,defaultWidth:100,defaultHeight:280,sourceLabel:'Fonte dos conteúdos',sourceOptions:['Seleção manual','Destaques da Home','Últimas notícias']},
  trending:{title:'Em alta',description:'Configuração da lista lateral dos Destaques.',position:'Lateral dos Destaques secundários',identifier:'home_em_alta',defaultTitle:'Em alta',defaultSubtitle:'Conteúdos que estão em alta.',defaultQuantity:4,defaultWidth:300,defaultHeight:360,sourceLabel:'Fonte',sourceOptions:['Em alta','Mais lidas','Seleção manual']},
  banner:{title:'Banner horizontal',description:'Configuração do banner publicitário horizontal.',position:'Entre Destaques e Vídeos',identifier:'home_banner_horizontal',defaultTitle:'Banner horizontal',defaultSubtitle:'Campanha horizontal ativa.',defaultQuantity:1,defaultWidth:100,defaultHeight:180,sourceLabel:'Slot',sourceOptions:['HOME_BANNER_01','HOME_BANNER_02']},
  videos:{title:'Vídeos',description:'Configuração da seção audiovisual da Home.',position:'Abaixo do Banner horizontal',identifier:'home_videos',defaultTitle:'Vídeos',defaultSubtitle:'Conteúdos audiovisuais em destaque.',defaultQuantity:4,defaultWidth:100,defaultHeight:420,sourceLabel:'Fonte dos conteúdos',sourceOptions:['Vídeos em destaque','Mais recentes','Seleção manual']},
  agenda:{title:'Agenda / Eventos',description:'Configuração da agenda exibida ao lado dos vídeos.',position:'Lateral de Vídeos',identifier:'home_agenda',defaultTitle:'Agenda',defaultSubtitle:'Próximos eventos.',defaultQuantity:6,defaultWidth:300,defaultHeight:420,sourceLabel:'Fonte',sourceOptions:['Próximos eventos','Seleção manual']},
  newsletter:{title:'Newsletter',description:'Configuração da faixa de inscrição antes do rodapé.',position:'Acima do Footer',identifier:'home_newsletter',defaultTitle:'Receba nossas novidades',defaultSubtitle:'Inscreva-se e receba conteúdos exclusivos no seu e-mail.',defaultQuantity:1,defaultWidth:100,defaultHeight:200,sourceLabel:'Serviço',sourceOptions:['MailerLite','Resend','Interno']},
  footer:{title:'Footer',description:'Configuração visual e institucional do rodapé.',position:'Último bloco da página',identifier:'home_footer',defaultTitle:'Portal Lander',defaultSubtitle:'Conteúdo, cultura e movimento.',defaultQuantity:1,defaultWidth:100,defaultHeight:300,sourceLabel:'Estrutura',sourceOptions:['Padrão do Portal','Personalizada']},
}

const defaultConfig=(d:Definition):SectionConfig=>({active:true,title:d.defaultTitle,subtitle:d.defaultSubtitle,linkLabel:'Ver todos',linkUrl:'#',source:d.sourceOptions[0],quantity:d.defaultQuantity,width:d.defaultWidth,height:d.defaultHeight,paddingX:24,paddingY:24,radius:0,background:'#ffffff',textColor:'#333333',titleColor:'#111111',accentColor:'#e50914',borderColor:'#e5e5e5'})
const key=(s:SectionKey)=>`portal-lander:cms:section-config:${s}:v4`
function load(section:SectionKey,d:Definition){try{const raw=localStorage.getItem(key(section));return raw?{...defaultConfig(d),...JSON.parse(raw)}:defaultConfig(d)}catch{return defaultConfig(d)}}

export function HomeSectionManagerPage({section}:{section:SectionKey}){
  const d=defs[section]
  const [config,setConfig]=useState<SectionConfig>(()=>load(section,d))
  const [saved,setSaved]=useState(false)
  const patch=(p:Partial<SectionConfig>)=>{setConfig(c=>({...c,...p}));setSaved(false)}
  const previewItems=useMemo(()=>section==='grid'?homeReadModel.featuredStories.slice(0,3):section==='secondary'?homeReadModel.latestStories.slice(0,4):section==='videos'?homeReadModel.releases.slice(0,4):section==='agenda'?homeReadModel.agenda.slice(0,6):section==='ranking'?homeReadModel.mostRead.slice(0,5):section==='trending'?homeReadModel.latestStories.slice(0,4):[],[section])
  const save=()=>{localStorage.setItem(key(section),JSON.stringify(config));setSaved(true)}
  const widthValue=config.width<=100?1200:config.width

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:`Configurar seção: ${d.title}`,description:d.description}}>
    <div className="section-editor-toolbar"><div><Link to="/app/site/secoes"><ArrowLeft size={14}/> Seções das Páginas</Link><span className="section-editor-status"><input type="checkbox" checked={config.active} onChange={e=>patch({active:e.target.checked})}/> {config.active?'Ativo':'Inativo'}</span></div><div><Link className="button outline" to="/app/site/secoes">Cancelar</Link><button className="button dark" onClick={save}><Save size={15}/> Salvar alterações</button></div></div>
    {saved&&<div className="home-section-manager-success">Alterações salvas para esta seção.</div>}

    <div className="section-editor-layout">
      <section className="section-editor-card">
        <h2>Configurações gerais</h2>
        <label>Título da seção<input value={config.title} onChange={e=>patch({title:e.target.value})}/></label>
        <label>Subtítulo<input value={config.subtitle} onChange={e=>patch({subtitle:e.target.value})}/></label>
        <div className="section-editor-two"><label>Texto “Ver todos”<input value={config.linkLabel} onChange={e=>patch({linkLabel:e.target.value})}/></label><label>Link<input value={config.linkUrl} onChange={e=>patch({linkUrl:e.target.value})}/></label></div>
        <label>{d.sourceLabel}<select value={config.source} onChange={e=>patch({source:e.target.value})}>{d.sourceOptions.map(o=><option key={o}>{o}</option>)}</select></label>
        <label>Quantidade exibida<input type="number" min="1" max="20" value={config.quantity} onChange={e=>patch({quantity:Number(e.target.value)})}/><small>{section==='grid'?'A estrutura continua fixa em 3 cards por linha no desktop.':''}</small></label>

        <h2>Aparência e dimensões</h2>
        <div className="section-editor-slider"><span>Largura</span><input type="range" min="220" max="1600" value={widthValue} onChange={e=>patch({width:Number(e.target.value)})}/><b>{config.width<=100?'Auto':`${config.width}px`}</b></div>
        <div className="section-editor-slider"><span>Altura</span><input type="range" min="40" max="900" value={config.height} onChange={e=>patch({height:Number(e.target.value)})}/><b>{config.height}px</b></div>
        <div className="section-editor-slider"><span>Padding horizontal</span><input type="range" min="0" max="80" value={config.paddingX} onChange={e=>patch({paddingX:Number(e.target.value)})}/><b>{config.paddingX}px</b></div>
        <div className="section-editor-slider"><span>Padding vertical</span><input type="range" min="0" max="80" value={config.paddingY} onChange={e=>patch({paddingY:Number(e.target.value)})}/><b>{config.paddingY}px</b></div>
        <div className="section-editor-slider"><span>Arredondamento</span><input type="range" min="0" max="32" value={config.radius} onChange={e=>patch({radius:Number(e.target.value)})}/><b>{config.radius}px</b></div>
        <div className="section-editor-colors">
          {([['background','Cor de fundo'],['titleColor','Cor do título'],['textColor','Cor do texto'],['accentColor','Cor de destaque'],['borderColor','Cor da borda']] as const).map(([field,label])=><label key={field}>{label}<span><input type="color" value={config[field]} onChange={e=>patch({[field]:e.target.value} as Partial<SectionConfig>)}/><input value={config[field]} onChange={e=>patch({[field]:e.target.value} as Partial<SectionConfig>)}/></span></label>)}
        </div>
      </section>

      <section className="section-editor-preview-column">
        <div className="section-editor-card"><h2>Prévia da seção</h2><div className="section-preview" style={{background:config.background,color:config.textColor,minHeight:config.height,borderColor:config.borderColor,borderRadius:config.radius,padding:`${config.paddingY}px ${config.paddingX}px`}}><div className="section-preview-head"><h3 style={{color:config.titleColor}}>{config.title}</h3>{config.linkLabel&&<span style={{color:config.accentColor}}>{config.linkLabel} →</span>}</div><p>{config.subtitle}</p>{previewItems.length>0?<div className={`section-preview-items ${section}`}>{previewItems.map((item:any,index:number)=><div className="section-preview-item" key={index}>{'image' in item&&item.image?<img src={item.image} alt=""/>:<span className="section-preview-number" style={{color:config.accentColor}}>{String(index+1).padStart(2,'0')}</span>}<strong>{item.title}</strong>{'category' in item&&<small>{item.category}</small>}{'place' in item&&<small>{item.place}</small>}</div>)}</div>:<div className="section-preview-placeholder" style={{borderColor:config.borderColor}}>{section==='side-ad'||section==='banner'?'SUA MARCA AQUI':section==='newsletter'?'Seu melhor e-mail     INSCREVER-SE':section==='footer'?'PORTAL LANDER · NAVEGAÇÃO · INSTITUCIONAL · REDES SOCIAIS':section==='hero'?'IMAGEM / DESTAQUE PRINCIPAL':config.subtitle}</div>}</div></div>
        <div className="section-editor-card section-details"><h2>Detalhes da seção</h2><dl><dt>Identificador</dt><dd>{d.identifier}</dd><dt>Posição na página</dt><dd>{d.position}</dd><dt>Comportamento</dt><dd>Posição fixa; conteúdo editorial administrado fora deste módulo</dd><dt>Responsividade</dt><dd>Adaptativa para desktop, tablet e mobile</dd></dl><div className="section-editor-note"><ExternalLink size={16}/><span>Este módulo manipula apenas a seção. Conteúdos continuam sendo administrados em Conteúdos e campanhas em Publicidade.</span></div></div>
      </section>
    </div>
  </AdminShell>
}
