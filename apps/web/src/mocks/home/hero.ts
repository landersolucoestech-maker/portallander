import heroDjStay from '../../pages/home/assets/hero-djstay.jpg'
import type {HeroArticleSource,HeroCarouselConfig,HeroSlide} from '../../pages/home/models/heroModel'

export const mockHeroArticles:HeroArticleSource[]=[
 {id:'dj-stay-setembro',title:'DJ Stay anuncia novo projeto para setembro',slug:'dj-stay-novo-projeto-setembro',category:'Destaques',summary:'Notícias, polêmicas, lançamentos, bastidores e tudo que acontece no funk, na cultura urbana e no entretenimento.',image:heroDjStay,imageAlt:'DJ Stay em destaque no Portal Lander',url:'/destaques'},
 {id:'radar-lancamentos-agosto',title:'Radar de lançamentos: os sons que chegaram fortes nesta semana',slug:'radar-lancamentos-agosto',category:'Lançamentos',summary:'Singles, clipes e projetos que acabaram de chegar no funk e na cultura urbana.',image:'',imageAlt:'Destaque editorial de lançamentos do Portal Lander',url:'/lancamentos'},
]

export const mockDefaultHeroSlide:HeroSlide={
 id:'dj-stay-main',status:'active',order:1,eyebrow:'PORTAL LANDER • EM DESTAQUE',category:'Destaques',
 title:[{text:'O QUE ESTÁ',emphasis:false},{text:'PEGANDO',emphasis:true},{text:'AGORA.',emphasis:true}],
 description:'Notícias, polêmicas, lançamentos, bastidores e tudo que acontece no funk, na cultura urbana e no entretenimento.',
 mediaCaption:'NOTÍCIAS · FUNK · CULTURA · ENTRETENIMENTO',
 image:heroDjStay,imageAlt:'DJ Stay em destaque no Portal Lander',imagePositionX:50,imagePositionY:18,imageScale:1.04,imageOffsetX:0,imageOffsetY:18,
 primaryCtaLabel:'VER AGORA',primaryCtaUrl:'/noticias',secondaryCtaLabel:'EXPLORAR DESTAQUES',secondaryCtaUrl:'/destaques',articleId:'dj-stay-setembro',publishedAt:'2026-08-27T18:00',scheduledAt:'',
}

export const mockDefaultHeroConfig:HeroCarouselConfig={
 autoplay:true,intervalMs:7000,
 ticker:{
  active:true,
  label:'AGORA',
  items:[{id:'ticker-item-1',active:true,text:'Novos lançamentos, bastidores e assuntos que estão dominando a conversa.',url:'/noticias',external:false,order:1}],
  separator:'•',
  direction:'rtl',
  speed:42,
  pauseOnHover:true,
  loop:true,
  gap:28,
  height:48,
  verticalAlign:'center',
  fontFamily:'inherit',
  fontSize:13,
  fontWeight:700,
  textTransform:'none',
  background:'#ef0011',
  textColor:'#ffffff',
  labelColor:'#ffffff',
  separatorColor:'#ffffff',
  hoverColor:'#111111',
  borderEnabled:false,
  borderWidth:0,
  borderColor:'#ef0011',
  hiddenDesktop:false,
  responsive:{tablet:{},mobile:{}},
 },
 slides:[mockDefaultHeroSlide],
}
