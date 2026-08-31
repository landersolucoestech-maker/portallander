import { ArrowRight, CalendarDays, Image as ImageIcon, LayoutGrid, ListOrdered, Megaphone, Newspaper, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homeReadModel } from '../../../pages/home/models/homeReadModel'
import { SITE_MANAGER_NAV } from '../../../shared/internal/adminNavigation'
import { AdminShell } from '../../../shared/internal/AdminUi'
import '../../../styles/home-section-manager.css'

type HomeCard={title:string;description:string;meta:string;to:string;icon:'image'|'news'|'grid'|'ranking'|'ad'|'video'|'agenda'}

const cards:HomeCard[]=[
  {title:'Hero',description:'Destaque principal, textos, imagem, CTAs e slides.',meta:'Editor dedicado',to:'/app/site/home/hero',icon:'image'},
  {title:'Barra Agora',description:'Chamada fixa exibida imediatamente abaixo do Hero.',meta:'1 chamada ativa',to:'/app/site/home/barra-agora',icon:'news'},
  {title:'Grid principal',description:'Matérias do principal bloco editorial.',meta:`${homeReadModel.featuredStories.length} matérias · 3 por linha`,to:'/app/site/home/grid-principal',icon:'grid'},
  {title:'Ranking 01–10',description:'Conteúdos exibidos na lateral direita do Grid principal.',meta:'Até 10 posições',to:'/app/site/home/ranking',icon:'ranking'},
  {title:'Publicidade lateral',description:'Campanha fixa abaixo do Ranking.',meta:'1 posição comercial',to:'/app/site/home/publicidade-lateral',icon:'ad'},
  {title:'Destaques secundários',description:'Segundo bloco de cards editoriais da Home.',meta:`${homeReadModel.latestStories.length} conteúdos atuais`,to:'/app/site/home/destaques',icon:'grid'},
  {title:'Em alta',description:'Lista lateral fixa ao lado dos Destaques.',meta:'Ordenação administrável',to:'/app/site/home/em-alta',icon:'news'},
  {title:'Banner horizontal',description:'Campanha horizontal entre os blocos editoriais e vídeos.',meta:'1 posição comercial',to:'/app/site/home/banner-horizontal',icon:'ad'},
  {title:'Vídeos',description:'Conteúdo audiovisual exibido na seção fixa de mídia.',meta:`${homeReadModel.releases.length} vídeos atuais`,to:'/app/site/home/videos',icon:'video'},
  {title:'Agenda / Eventos',description:'Eventos exibidos na lateral direita da seção de vídeos.',meta:`${homeReadModel.agenda.length} eventos atuais`,to:'/app/site/home/agenda',icon:'agenda'},
  {title:'Newsletter',description:'Chamada fixa para captura de e-mail antes do rodapé.',meta:'1 bloco',to:'/app/site/home/newsletter',icon:'news'},
  {title:'Footer',description:'Conteúdo institucional, navegação e links do rodapé.',meta:'Estrutura fixa',to:'/app/site/home/footer',icon:'grid'},
]

function CardIcon({type}:{type:HomeCard['icon']}){
  if(type==='image')return <ImageIcon size={18}/>
  if(type==='news')return <Newspaper size={18}/>
  if(type==='ranking')return <ListOrdered size={18}/>
  if(type==='ad')return <Megaphone size={18}/>
  if(type==='video')return <Video size={18}/>
  if(type==='agenda')return <CalendarDays size={18}/>
  return <LayoutGrid size={18}/>
}

export function HomeManagerPage(){
  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Página inicial',description:'Gerencie o conteúdo de cada área da Home sem alterar a estrutura visual oficial.'}}>
    <div className="home-overview-intro"><div><strong>Layout oficial fixo</strong><p>Você não precisa montar a página. Grid principal permanece com 3 cards por linha, Ranking fica à direita, Publicidade lateral fica abaixo do Ranking, Em Alta permanece ao lado dos Destaques e Agenda ao lado dos Vídeos.</p></div><a className="button outline" href={new URL(import.meta.env.BASE_URL,window.location.origin).toString()} target="_blank" rel="noreferrer">Ver Home pública</a></div>
    <div className="home-overview-fixed-layout"><strong>Regra do CMS:</strong> o código controla posição, colunas, proporções e responsividade. O painel controla conteúdo, ordem, status, imagens, textos e campanhas.</div>
    <div className="home-overview-grid">{cards.map(card=><Link className="home-overview-card" to={card.to} key={card.title}><div className="home-overview-card-top"><span className="home-overview-card-icon"><CardIcon type={card.icon}/></span><small>{card.meta}</small></div><h2>{card.title}</h2><p>{card.description}</p><footer><span>Gerenciar</span><ArrowRight size={15}/></footer></Link>)}</div>
  </AdminShell>
}
