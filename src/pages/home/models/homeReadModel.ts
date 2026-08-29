export type HomeStory = { category:string; title:string; meta:string; views:string; image:string }
export type HomeRelease = { title:string; image:string; year:string }
export type HomeAgendaItem = { day:string; month:string; title:string; place:string }

const IMG={
  stage:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85',
  dj:'https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=900&q=85',
  crowd:'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
  concert:'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=900&q=85',
  decks:'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=85',
  live:'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=85',
  festival:'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85',
  singer:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=85',
} as const

const stories:readonly HomeStory[]=[
  {category:'Lançamentos',title:'MC Cabelinho lança “Melhor Só” e faz voô à loucura',meta:'Há 2 horas',views:'12.4K',image:IMG.stage},
  {category:'Bastidores',title:'Bastidores do clipe de Orochi viralizam na web',meta:'Há 5 horas',views:'8.7K',image:IMG.dj},
  {category:'Polêmica',title:'Treta! MC Poze alfineta Oruam nas redes sociais',meta:'Há 7 horas',views:'15.2K',image:IMG.crowd},
  {category:'Cultura',title:'A arte do funk: artistas que transformam a quebrada',meta:'Há 9 horas',views:'6.1K',image:IMG.concert},
  {category:'Notícias',title:'Djonga anuncia pausa na carreira para cuidar da saúde mental',meta:'Há 2 horas',views:'3.1K',image:IMG.singer},
  {category:'Notícias',title:'Tribo da Periferia lança documentário sobre sua trajetória',meta:'Há 2 horas',views:'2.7K',image:IMG.live},
  {category:'Destaques',title:'Filipe Ret solta prévia de faixa inédita e anima fãs',meta:'Há 3 horas',views:'4.6K',image:IMG.decks},
  {category:'Cultura',title:'MC Dricka fala sobre novos projetos e empoderamento',meta:'Há 4 horas',views:'3.8K',image:IMG.festival},
]

const mostRead=Object.freeze([
  'Veigh bate recorde com novo álbum “Dos Prédios Deluxe”',
  'MC Ryan SP cancela show de última hora e web reage',
  'Festival de Trap 2025 anuncia line-up pesado',
  'Ludmilla confirma nova turnê “Numanice 4”',
  'Entenda a treta entre Mainstreet e Pineapple',
])

const releases:readonly HomeRelease[]=[
  {title:'Oruam — Liberado',image:IMG.stage,year:'2026'},
  {title:'Veigh — Dos Prédios Deluxe',image:IMG.dj,year:'2026'},
  {title:'MC Cabelinho — Melhor Só',image:IMG.concert,year:'2026'},
  {title:'Ludmilla — Numanice #4',image:IMG.live,year:'2026'},
  {title:'WIU — Manual de Cria',image:IMG.festival,year:'2026'},
]

const agenda:readonly HomeAgendaItem[]=[
  {day:'24',month:'MAI',title:'Festival de Trap 2025',place:'São Paulo, SP'},
  {day:'31',month:'MAI',title:'Show do Orochi',place:'Rio de Janeiro, RJ'},
  {day:'07',month:'JUN',title:'Ludmilla · Numanice #4',place:'Belo Horizonte, MG'},
  {day:'14',month:'JUN',title:'MC Cabelinho',place:'Curitiba, PR'},
]

export const homeReadModel={
  stories,
  featuredStories:stories.slice(0,6),
  latestStories:stories.slice(4,8),
  mostRead,
  releases,
  agenda,
  source:'bundled-snapshot' as const,
}
