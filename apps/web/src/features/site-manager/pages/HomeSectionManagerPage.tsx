import { ArrowDown, ArrowLeft, ArrowUp, Eye, EyeOff, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { homeReadModel } from '../../../pages/home/models/homeReadModel'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/home-section-manager.css'

type SectionKey='ticker'|'grid'|'ranking'|'side-ad'|'secondary'|'trending'|'banner'|'videos'|'agenda'|'newsletter'|'footer'
type ManagedItem={id:string;title:string;meta:string;active:boolean}
type SectionDefinition={title:string;description:string;rule:string;limit?:number;addLabel:string}

const definitions:Record<SectionKey,SectionDefinition>={
  ticker:{title:'Barra Agora',description:'Gerencie a chamada exibida logo abaixo do Hero.',rule:'A posição é fixa abaixo do Hero. Você altera somente o conteúdo.',limit:1,addLabel:'Nova chamada'},
  grid:{title:'Grid principal',description:'Escolha e ordene as matérias do principal bloco editorial da Home.',rule:'Layout fixo: sempre 3 cards por linha no desktop. O Ranking permanece fixo à direita.',addLabel:'Adicionar matéria'},
  ranking:{title:'Ranking 01–10',description:'Gerencie a ordem das matérias exibidas no ranking lateral.',rule:'Layout fixo: sempre à direita do Grid principal, com até 10 posições.',limit:10,addLabel:'Adicionar ao ranking'},
  'side-ad':{title:'Publicidade lateral',description:'Gerencie a campanha exibida abaixo do Ranking.',rule:'Posição fixa: lateral direita, imediatamente abaixo do Ranking.',limit:1,addLabel:'Adicionar campanha'},
  secondary:{title:'Destaques secundários',description:'Gerencie os cards do segundo bloco editorial da Home.',rule:'A estrutura e proporção dos cards são fixas. Você altera apenas conteúdo e ordem.',addLabel:'Adicionar destaque'},
  trending:{title:'Em alta',description:'Gerencie a lista lateral de conteúdos em alta.',rule:'Posição fixa: à direita dos Destaques secundários.',addLabel:'Adicionar conteúdo'},
  banner:{title:'Banner horizontal',description:'Gerencie a campanha horizontal entre os blocos editoriais e vídeos.',rule:'Posição e dimensões responsivas são controladas pelo layout oficial da Home.',limit:1,addLabel:'Adicionar campanha'},
  videos:{title:'Vídeos',description:'Gerencie os vídeos exibidos na seção audiovisual.',rule:'O layout da seção permanece fixo; a página pública recebe apenas os itens ativos e sua ordem.',addLabel:'Adicionar vídeo'},
  agenda:{title:'Agenda / Eventos',description:'Gerencie os próximos eventos exibidos na lateral da seção de vídeos.',rule:'Posição fixa: à direita dos vídeos. A lista é ordenável.',addLabel:'Adicionar evento'},
  newsletter:{title:'Newsletter',description:'Gerencie a chamada de inscrição antes do rodapé.',rule:'Posição fixa antes do Footer.',limit:1,addLabel:'Configurar chamada'},
  footer:{title:'Footer',description:'Gerencie os conteúdos institucionais e links do rodapé.',rule:'A estrutura visual do rodapé permanece fixa.',addLabel:'Adicionar item'},
}

function defaults(section:SectionKey):ManagedItem[]{
  if(section==='grid')return homeReadModel.featuredStories.map((item,index)=>({id:`grid-${index}`,title:item.title,meta:item.category,active:true}))
  if(section==='secondary')return homeReadModel.latestStories.map((item,index)=>({id:`secondary-${index}`,title:item.title,meta:item.category,active:true}))
  if(section==='videos')return homeReadModel.releases.map((item,index)=>({id:`video-${index}`,title:item.title,meta:item.year,active:true}))
  if(section==='agenda')return homeReadModel.agenda.map((item,index)=>({id:`agenda-${index}`,title:item.title,meta:`${item.day} ${item.month} · ${item.place}`,active:true}))
  if(section==='ranking')return Array.from({length:10},(_,index)=>({id:`ranking-${index}`,title:`Posição ${String(index+1).padStart(2,'0')}`,meta:'Selecionar matéria',active:true}))
  if(section==='trending')return homeReadModel.latestStories.slice(0,4).map((item,index)=>({id:`trending-${index}`,title:item.title,meta:item.category,active:true}))
  if(section==='ticker')return [{id:'ticker-1',title:'Novos lançamentos, bastidores e assuntos que estão dominando a conversa.',meta:'AGORA',active:true}]
  if(section==='side-ad')return [{id:'side-ad-1',title:'Publicidade lateral da Home',meta:'Campanha ativa',active:true}]
  if(section==='banner')return [{id:'banner-1',title:'Banner horizontal da Home',meta:'Campanha ativa',active:true}]
  if(section==='newsletter')return [{id:'newsletter-1',title:'Receba as principais notícias direto no seu e-mail!',meta:'Newsletter',active:true}]
  if(section==='footer')return [{id:'footer-1',title:'Navegação e institucional',meta:'Rodapé',active:true}]
  return []
}

function storageKey(section:SectionKey){return `portal-lander:cms:home-section:${section}:v1`}
function load(section:SectionKey){
  try{const raw=localStorage.getItem(storageKey(section));return raw?JSON.parse(raw) as ManagedItem[]:defaults(section)}catch{return defaults(section)}
}

export function HomeSectionManagerPage({section}:{section:SectionKey}){
  const definition=definitions[section]
  const [items,setItems]=useState<ManagedItem[]>(()=>load(section))
  const [saved,setSaved]=useState(false)
  const activeCount=useMemo(()=>items.filter(item=>item.active).length,[items])

  const move=(index:number,delta:number)=>setItems(current=>{
    const target=index+delta
    if(target<0||target>=current.length)return current
    const next=[...current];[next[index],next[target]]=[next[target],next[index]];setSaved(false);return next
  })
  const add=()=>{
    if(definition.limit&&items.length>=definition.limit)return
    const next:ManagedItem={id:`${section}-${Date.now()}`,title:'Novo item',meta:'Clique em editar para configurar',active:true}
    setItems(current=>[...current,next]);setSaved(false)
  }
  const save=()=>{localStorage.setItem(storageKey(section),JSON.stringify(items));setSaved(true)}

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:definition.title,description:definition.description}}>
    <div className="home-section-manager-head">
      <div><Link to="/app/site/home"><ArrowLeft size={15}/> Voltar para Home</Link><p>{definition.rule}</p></div>
      <div className="home-section-manager-actions"><button className="button outline" onClick={add} disabled={Boolean(definition.limit&&items.length>=definition.limit)}><Plus size={16}/> {definition.addLabel}</button><button className="button dark" onClick={save}><Save size={16}/> Salvar</button></div>
    </div>

    {saved&&<div className="home-section-manager-success">Configuração salva neste frontend administrativo.</div>}

    <div className="home-section-manager-summary"><strong>{activeCount}</strong><span>itens ativos</span>{definition.limit&&<small>Limite desta seção: {definition.limit}</small>}</div>

    <section className="home-section-manager-table">
      <div className="home-section-manager-table-head"><span>Posição</span><span>Conteúdo</span><span>Status</span><span>Ações</span></div>
      {items.map((item,index)=><div className="home-section-manager-row" key={item.id}>
        <div className="home-section-manager-position">{String(index+1).padStart(2,'0')}</div>
        <div className="home-section-manager-copy"><strong>{item.title}</strong><small>{item.meta}</small></div>
        <button className={`home-section-manager-status ${item.active?'active':''}`} onClick={()=>{setItems(current=>current.map(entry=>entry.id===item.id?{...entry,active:!entry.active}:entry));setSaved(false)}}>{item.active?<Eye size={14}/>:<EyeOff size={14}/>} {item.active?'Ativo':'Oculto'}</button>
        <div className="home-section-manager-row-actions"><button title="Subir" disabled={index===0} onClick={()=>move(index,-1)}><ArrowUp size={15}/></button><button title="Descer" disabled={index===items.length-1} onClick={()=>move(index,1)}><ArrowDown size={15}/></button><button title="Editar" onClick={()=>{const title=window.prompt('Título / identificação do item',item.title);if(title!==null){setItems(current=>current.map(entry=>entry.id===item.id?{...entry,title}:entry));setSaved(false)}}}><Pencil size={15}/></button><button title="Excluir" onClick={()=>{setItems(current=>current.filter(entry=>entry.id!==item.id));setSaved(false)}}><Trash2 size={15}/></button></div>
      </div>)}
      {!items.length&&<div className="home-section-manager-empty">Nenhum item cadastrado nesta seção.</div>}
    </section>
  </AdminShell>
}
