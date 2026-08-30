import type { EditorialContent, EditorialPage } from '../model'

// Snapshot de compatibilidade dos conteúdos que já existiam no frontend público.
// É somente leitura e não é tratado como persistência de CMS.
export const legacyEditorialPages: EditorialPage[] = [
  {
    id: 'page-noticias',
    title: 'Notícias',
    navigationLabel: 'Notícias',
    slug: 'noticias',
    description: 'As principais notícias do funk, cultura urbana e entretenimento em uma cobertura direta e atualizada.',
    type: 'editorial',
    status: 'published',
    active: true,
    visibility: 'public',
    showInMainMenu: true,
    menuOrder: 10,
    order: 10,
    parentId: null,
    seo: { metaTitle: 'Notícias | Portal Lander', metaDescription: 'Notícias de funk, cultura urbana e entretenimento no Portal Lander.' },
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
    publishedAt: '2026-08-01T00:00:00.000Z',
  },
]

const images = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1500&q=88',
  'https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=1500&q=88',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1500&q=88',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1500&q=88',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1500&q=88',
]

const source = [
  ['mc-cabelinho-lanca-melhor-so-e-fas-vao-a-loucura','MC Cabelinho lança “Melhor Só” e fãs vão à loucura','Novo lançamento chega com produção de alto nível, letra intensa e visualizer impactante.','LANÇAMENTO',0],
  ['bastidores-do-clipe-de-orochi-viralizam-na-web','Bastidores do clipe de Orochi viralizam na web','Imagens de gravação e detalhes da produção movimentaram as redes e chamaram atenção dos fãs.','BASTIDORES',1],
  ['treta-mc-poze-alfineta-oruam-nas-redes-sociais','Treta! MC Poze alfineta Oruam nas redes sociais','Troca de indiretas colocou os artistas no centro das conversas nas redes.','POLÊMICA',2],
  ['a-arte-do-funk-artistas-que-transformam-a-quebrada','A arte do funk: artistas que transformam a quebrada','Música, estética e território se encontram em uma geração que amplia a força cultural das periferias.','CULTURA',3],
  ['djonga-anuncia-pausa-na-carreira-para-cuidar-da-saude-mental','Djonga anuncia pausa na carreira para cuidar da saúde mental','Artista comunicou uma pausa temporária e recebeu apoio imediato de fãs e colegas de cena.','NOTÍCIAS',4],
  ['tribo-da-periferia-lanca-documentario-sobre-sua-trajetoria','Tribo da Periferia lança documentário sobre sua trajetória','Produção revisita momentos importantes da carreira e os caminhos que marcaram o grupo.','NOTÍCIAS',2],
  ['filipe-ret-solta-previa-de-faixa-inedita-e-anima-fas','Filipe Ret solta prévia de faixa inédita e anima fãs','Trecho publicado nas redes aumentou a expectativa para o próximo lançamento do artista.','DESTAQUES',3],
  ['mc-dricka-fala-sobre-novos-projetos-e-empoderamento','MC Dricka fala sobre novos projetos e empoderamento','Cantora comenta nova fase artística e a importância de ampliar vozes femininas na cena.','CULTURA',0],
  ['veigh-bate-recorde-com-novo-album-dos-predios-deluxe','Veigh bate recorde com novo álbum “Dos Prédios Deluxe”','Projeto alcança números expressivos e reforça o momento de alta do artista.','LANÇAMENTO',1],
  ['mc-ryan-sp-cancela-show-de-ultima-hora-e-web-reage','MC Ryan SP cancela show de última hora e web reage','Cancelamento inesperado gerou reação imediata do público e comentários nas redes.','NOTÍCIAS',0],
  ['festival-de-trap-2025-anuncia-line-up-pesado','Festival de Trap 2025 anuncia line-up pesado','Evento confirma nomes de destaque e movimenta a expectativa do público.','DESTAQUES',2],
  ['ludmilla-confirma-nova-turne-numanice-4','Ludmilla confirma nova turnê “Numanice #4”','Nova etapa do projeto chega com agenda ampliada e estrutura renovada.','LANÇAMENTO',3],
  ['entenda-a-treta-entre-mainstreet-e-pineapple','Entenda a treta entre Mainstreet e Pineapple','Relembre os principais pontos da disputa que movimentou artistas, fãs e produtores.','POLÊMICA',4],
  ['como-foi-a-gravacao-do-clipe-malvadao-3-de-xama','Como foi a gravação do clipe “Malvadão 3” de Xamã','Equipe e artistas mostram detalhes de uma produção que levou estética urbana para outra escala.','BASTIDORES',1],
] as const

export const legacyEditorialContents: EditorialContent[] = source.map(([slug,title,summary,category,imageIndex], index) => ({
  id: `content-${index + 1}`,
  pageId: 'page-noticias',
  title,
  slug,
  summary,
  body: [
    { type: 'paragraph', text: summary },
    { type: 'heading', text: 'CONTEXTO' },
    { type: 'paragraph', text: 'O Portal Lander acompanha os principais movimentos da cena e reúne contexto, repercussão e informações relevantes em uma cobertura direta.' },
  ],
  coverImage: images[imageIndex],
  coverImageAlt: title,
  author: 'Portal Lander',
  status: 'published',
  active: true,
  tags: [category],
  media: [],
  seo: { metaTitle: `${title} | Portal Lander`, metaDescription: summary, ogImage: images[imageIndex] },
  createdAt: `2026-08-${String(Math.min(28, 10 + index)).padStart(2,'0')}T12:00:00.000Z`,
  updatedAt: '2026-08-28T12:00:00.000Z',
  publishedAt: `2026-08-${String(Math.min(28, 10 + index)).padStart(2,'0')}T12:00:00.000Z`,
}))
