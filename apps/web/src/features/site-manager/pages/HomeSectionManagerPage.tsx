import { ArrowDown, ArrowLeft, ArrowUp, Eye, EyeOff, Plus, Save, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { homeReadModel } from '../../../pages/home/models/homeReadModel'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/home-section-manager.css'

type SectionKey='ticker'|'grid'|'ranking'|'side-ad'|'secondary'|'trending'|'banner'|'videos'|'agenda'|'newsletter'|'footer'
type ManagedItem={id:string;title:string;meta:string;url:string;active:boolean}
type SectionDefinition={title:string;description:string;rule:string;limit?:number;addLabel:string;titleLabel:string;metaLabel:string;urlLabel:string}

const definitions:Record<SectionKey,SectionDefinition>={
  ticker:{title:'Barra Agora',description:'Edite a chamada exibida logo abaixo do Hero.',rule:'Posição fixa abaixo do Hero. Sem configuração de layout.',limit:1,addLabel:'Adicionar chamada',titleLabel:'Texto',metaLabel:'Rótulo',urlLabel:'Link'},
  grid:{title:'Grid principal',description:'Adicione, edite, exclua e ordene as matérias do principal bloco editorial.',rule:'Layout travado: 3 cards por linha no desktop. Ranking sempre na lateral direita.',addLabel:'Adicionar matéria',titleLabel:'Matéria',metaLabel:'Categoria',urlLabel:'Link da matéria'},
  ranking:{title:'Ranking 01–10',description:'Defina os conteúdos e a ordem do ranking lateral.',rule:'Posição travada à direita do Grid principal. Máximo de 10 itens.',limit:10,addLabel:'Adicionar item',titleLabel:'Matéria',metaLabel:'Categoria / apoio',urlLabel:'Link'},
  'side-ad':{title:'Publicidade lateral',description:'Configure a campanha exibida abaixo do Ranking.',rule:'Posição travada abaixo do Ranking.',limit:1,addLabel:'Adicionar campanha',titleLabel:'Campanha',metaLabel:'Anunciante / período',urlLabel:'URL de destino'},
  secondary:{title:'Destaques secundários',description:'Gerencie o conteúdo do segundo bloco editorial.',rule:'Layout e proporções travados. Você altera apenas conteúdo e ordem.',addLabel:'Adicionar destaque',titleLabel:'Matéria',metaLabel:'Categoria',urlLabel:'Link'},
  trending:{title:'Em alta',description:'Gerencie a lista lateral exibida ao lado dos Destaques.',rule:'Posição travada à direita dos Destaques secundários.',addLabel:'Adicionar conteúdo',titleLabel:'Matéria',metaLabel:'Categoria / atualização',urlLabel:'Link'},
  banner:{title:'Banner horizontal',description:'Configure a campanha horizontal da Home.',rule:'Posição e dimensões controladas pelo layout oficial.',limit:1,addLabel:'Adicionar campanha',titleLabel:'Campanha',metaLabel:'Anunciante / período',urlLabel:'URL de destino'},
  videos:{title:'Vídeos',description:'Gerencie os conteúdos da seção audiovisual.',rule:'Layout travado. Apenas conteúdo, status e ordem são administráveis.',addLabel:'Adicionar vídeo',titleLabel:'Título do vídeo',metaLabel:'Ano / canal',urlLabel:'URL do vídeo'},
  agenda:{title:'Agenda / Eventos',description:'Gerencie os eventos exibidos ao lado dos vídeos.',rule:'Posição travada à direita da seção de vídeos.',addLabel:'Adicionar evento',titleLabel:'Evento',metaLabel:'Data · cidade / local',urlLabel:'Link / ingresso'},
  newsletter:{title:'Newsletter',description:'Edite a chamada de inscrição antes do rodapé.',rule:'Posição travada antes do Footer.',limit:1,addLabel:'Adicionar chamada',titleLabel:'Chamada',metaLabel:'Texto de apoio',urlLabel:'Ação / endpoint'},
  footer:{title:'Footer',description:'Gerencie textos e links do rodapé sem alterar sua estrutura visual.',rule:'Estrutura visual travada. Os itens abaixo controlam apenas o conteúdo.',addLabel:'Adicionar item',titleLabel:'Título / link',metaLabel:'Grupo',urlLabel:'URL'},
}

function defaults(section:SectionKey):ManagedItem[]{
  if(section==='grid')return homeReadModel.featuredStories.map((item,index)=>({id:`grid-${index}`,title:item.title,meta:item.category,url:'#',active:true}))
  if(section==='secondary')return homeReadModel.latestStories.map((item,index)=>({id:`secondary-${index}`,title:item.title,meta:item.category,url:'#',active:true}))
  if(section==='videos')return homeReadModel.releases.map((item,index)=>({id:`video-${index}`,title:item.title,meta:item.year,url:'#',active:true}))
  if(section==='agenda')return homeReadModel.agenda.map((item,index)=>({id:`agenda-${index}`,title:item.title,meta:`${item.day} ${item.month} · ${item.place}`,url:'#',active:true}))
  if(section==='ranking')return homeReadModel.mostRead.slice(0,10).map((item,index)=>({id:`ranking-${index}`,title:item.title,meta:item.meta,url:'#',active:true}))
  if(section==='trending')return homeReadModel.latestStories.slice(0,4).map((item,index)=>({id:`trending-${index}`,title:item.title,meta:item.category,url:'#',active:true}))
  if(section==='ticker')return [{id:'ticker-1',title:'Novos lançamentos, bastidores e assuntos que estão dominando a conversa.',meta:'AGORA',url:'#',active:true}]
  if(section==='side-ad')return [{id:'side-ad-1',title:'Publicidade lateral da Home',meta:'Campanha ativa',url:'#',active:true}]
  if(section==='banner')return [{id:'banner-1',title:'Banner horizontal da Home',meta:'Campanha ativa',url:'#',active:true}]
  if(section==='newsletter')return [{id:'newsletter-1',title:'Receba as principais notícias direto no seu e-mail!',meta:'Newsletter',url:'#',active:true}]
  if(section==='footer')return [{id:'footer-1',title:'Navegação e institucional',meta:'Rodapé',url:'#',active:true}]
  return []
}

function storageKey(section:SectionKey){return `portal-lander:cms:home-section:${section}:v2`}
function load(section:SectionKey){
  try{const raw=localStorage.getItem(storageKey(section));return raw?JSON.parse(raw) as ManagedItem[]:defaults(section)}catch{return defaults(section)}
}

export function HomeSectionManagerPage({section}:{section:SectionKey}){
  const definition=definitions[section]
  const [items,setItems]=useState<ManagedItem[]>(()=>load(section))
  const [saved,setSaved]=useState(false)
  const activeCount=useMemo(()=>items.filter(item=>item.active).length,[items])

  const change=(id:string,patch:Partial<ManagedItem>)=>{setItems(current=>current.map(item=>item.id===id?{...item,...patch}:item));setSaved(false)}
  const move=(index:number,delta:number)=>setItems(current=>{
    const target=index+delta
    if(target<0||target>=current.length)return current
    const next=[...current];[next[index],next[target]]=[next[target],next[index]];setSaved(false);return next
  })
  const add=()=>{
    if(definition.limit&&items.length>=definition.limit)return
    setItems(current=>[...current,{id:`${section}-${Date.now()}`,title:'',meta:'',url:'',active:true}])
    setSaved(false)
  }
  const save=()=>{localStorage.setItem(storageKey(section),JSON.stringify(items));setSaved(true)}

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:definition.title,description:definition.description}}>
    <div className="home-section-manager-head">
      <div><Link to="/app/site/home"><ArrowLeft size={15}/> Voltar para Página inicial</Link><p>{definition.rule}</p></div>
      <div className="home-section-manager-actions"><button className="button outline" onClick={add} disabled={Boolean(definition.limit&&items.length>=definition.limit)}><Plus size={16}/> {definition.addLabel}</button><button className="button dark" onClick={save}><Save size={16}/> Salvar alterações</button></div>
    </div>

    {saved&&<div className="home-section-manager-success">Alterações salvas no estado administrativo atual.</div>}

    <div className="home-section-manager-summary"><strong>{activeCount}</strong><span>ativos</span><small>{items.length} cadastrados{definition.limit?` · limite ${definition.limit}`:''}</small></div>

    <section className="home-section-manager-list">
      {items.map((item,index)=><article className="home-section-manager-item" key={item.id}>
        <div className="home-section-manager-item-order"><strong>{String(index+1).padStart(2,'0')}</strong><div><button title="Subir" disabled={index===0} onClick={()=>move(index,-1)}><ArrowUp size={15}/></button><button title="Descer" disabled={index===items.length-1} onClick={()=>move(index,1)}><ArrowDown size={15}/></button></div></div>
        <div className="home-section-manager-fields">
          <label>{definition.titleLabel}<input value={item.title} onChange={event=>change(item.id,{title:event.target.value})} placeholder={definition.titleLabel}/></label>
          <label>{definition.metaLabel}<input value={item.meta} onChange={event=>change(item.id,{meta:event.target.value})} placeholder={definition.metaLabel}/></label>
          <label className="wide">{definition.urlLabel}<input value={item.url} onChange={event=>change(item.id,{url:event.target.value})} placeholder="https://... ou rota interna"/></label>
        </div>
        <div className="home-section-manager-item-actions"><button className={`home-section-manager-status ${item.active?'active':''}`} onClick={()=>change(item.id,{active:!item.active})}>{item.active?<Eye size={14}/>:<EyeOff size={14}/>} {item.active?'Ativo':'Oculto'}</button><button className="home-section-manager-delete" title="Excluir" onClick={()=>{setItems(current=>current.filter(entry=>entry.id!==item.id));setSaved(false)}}><Trash2 size={15}/> Excluir</button></div>
      </article>)}
      {!items.length&&<div className="home-section-manager-empty"><strong>Nenhum item cadastrado.</strong><span>Use “{definition.addLabel}” para começar.</span></div>}
    </section>
  </AdminShell>
}
