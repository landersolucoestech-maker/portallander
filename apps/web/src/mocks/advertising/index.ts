import type {AdvertisingCampaign,AdvertisingFormat} from '../../shared/data/contracts'
import {mockIds} from '../shared'

export const mockAdvertisingFormats:AdvertisingFormat[]=[
 {id:'ad_format_home',title:'Home',description:'Espaços de destaque integrados à página inicial do Portal Lander.',iconKey:'home',active:true,order:1},
 {id:'ad_format_news',title:'Notícias',description:'Publicidade contextual junto ao fluxo editorial da página de notícias.',iconKey:'news',active:true,order:2},
 {id:'ad_format_campaigns',title:'Campanhas',description:'Formatos de presença de marca alinhados ao conteúdo e à audiência do portal.',iconKey:'campaigns',active:true,order:3},
 {id:'ad_format_metrics',title:'Métricas',description:'Mensuração comercial preparada para a futura camada real de analytics.',iconKey:'metrics',active:true,order:4},
]

const advertisers=[mockIds.contacts.aurora,mockIds.contacts.nexo,mockIds.contacts.vertice,mockIds.contacts.lumina,mockIds.contacts.prisma,mockIds.contacts.axis] as const
const names=['Aurora Sabores Urbanos','Nexo Mobilidade em Movimento','Vértice Experience','Lumina Conecta','Prisma Next','Axis Performance'] as const
const placements:AdvertisingCampaign['placement'][]=['home-main','home-sidebar','news-inline','news-sidebar']
export const mockAdvertisingCampaigns:AdvertisingCampaign[]=Array.from({length:16},(_,index)=>({
 id:index===0?'campaign_aurora':`campaign_${String(index+1).padStart(2,'0')}`,
 name:`${names[index%names.length]} · ${index<8?'Q3':'Q4'} 2026`,advertiserContactId:advertisers[index%advertisers.length],placement:placements[index%placements.length],
 title:[`SUA MARCA NO CENTRO DA CONVERSA`,`EXPERIÊNCIAS QUE MOVEM PESSOAS`,`TECNOLOGIA PARA QUEM FAZ ACONTECER`,`PRESENÇA QUE VIRA LEMBRANÇA`][index%4],
 subtitle:index%3===0?'Campanha integrada com presença editorial e mídia de alta visibilidade.':'Comunicação pensada para audiência, contexto e resultado.',ctaLabel:index%2===0?'SAIBA MAIS →':'CONHEÇA →',ctaUrl:'/anuncie',imageUrl:'',startsAt:`2026-${index<8?'08':'09'}-${String(1+index%20).padStart(2,'0')}T00:00:00.000Z`,endsAt:`2026-${index<8?'09':'10'}-${String(8+index%20).padStart(2,'0')}T23:59:59.000Z`,active:index%5!==4,
}))
