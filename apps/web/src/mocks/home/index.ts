import type {HomeAgendaItem,HomeRelease,HomeStory} from '../../pages/home/models/homeReadModel'

const images=['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85','https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=1200&q=85','https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85','https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=85'] as const
const titles=['Cidade em Movimento','Radar de lançamentos da semana','Por dentro da produção','Mercado criativo em expansão','Novos formatos de colaboração','Estética urbana em transformação','Do briefing à publicação','Agenda independente cresce fora dos grandes eixos'] as const
const categories=['Cultura','Lançamentos','Bastidores','Notícias'] as const
export const mockHomeStories:HomeStory[]=Array.from({length:24},(_,index)=>({category:categories[index%categories.length],title:index<titles.length?titles[index]:`${titles[index%titles.length]} · atualização ${Math.floor(index/titles.length)+1}`,meta:`Há ${1+(index%18)} horas`,views:`${(2.4+index*0.73).toFixed(1)}K`,image:images[index%images.length]}))
export const mockHomeMostRead=mockHomeStories.slice().sort((a,b)=>Number.parseFloat(b.views)-Number.parseFloat(a.views)).slice(0,10).map(item=>item.title)
export const mockHomeReleases:HomeRelease[]=Array.from({length:12},(_,index)=>({title:['Pulso — Horizonte','Norte 021 — Conexões','Coletivo Prisma — Movimento','Linha 8 — Frequência'][index%4]+(index>3?` ${Math.floor(index/4)+1}`:''),image:images[(index+1)%images.length],year:index<10?'2026':'2025'}))
export const mockHomeAgenda:HomeAgendaItem[]=[
 {day:'05',month:'SET',title:'Circuito Cidade em Movimento',place:'São Paulo, SP'},{day:'12',month:'SET',title:'Encontro Criativo Norte',place:'Recife, PE'},{day:'19',month:'SET',title:'Festival Trama Cultural',place:'Salvador, BA'},{day:'26',month:'SET',title:'Mostra Audiovisual Órbita',place:'Rio de Janeiro, RJ'},{day:'03',month:'OUT',title:'Summit Comunicação & Cultura',place:'Belo Horizonte, MG'},{day:'10',month:'OUT',title:'Conexões Urbanas',place:'Curitiba, PR'},
]
