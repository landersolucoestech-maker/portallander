import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const newsFilters=['todas','funk','trap','rap','cultura','entretenimento'] as const

export function NewsPageBridge(){
  const location=useLocation()
  useEffect(()=>{
    const root=document.querySelector('.public-page') as HTMLElement|null
    if(!root) return
    const isNews=location.pathname==='/noticias'
    root.classList.toggle('news-reference-page',isNews)
    document.querySelectorAll('.news-reference-controls,.news-reference-banner').forEach(n=>n.remove())
    if(!isNews) return

    const layout=root.querySelector('.pl-listing-layout') as HTMLElement|null
    const grid=root.querySelector('.pl-listing-grid') as HTMLElement|null
    const pagination=root.querySelector('.pl-pagination') as HTMLElement|null
    if(!layout||!grid) return

    const section=grid.parentElement as HTMLElement
    layout.classList.remove('pl-listing-layout','public-shell')
    layout.querySelector('aside')?.remove()
    section.querySelector('.pl-section-head')?.remove()
    grid.classList.remove('pl-listing-grid')
    grid.classList.add('news-reference-grid')

    Array.from(grid.children).forEach((card,i)=>{
      card.classList.add('news-reference-card')
      const body=card.querySelector('.pl-card-body')
      body?.classList.add('news-reference-card-body')
      const title=card.querySelector('h3')
      const meta=card.querySelector('.pl-meta')
      if(title&&body&&!body.querySelector('p')){
        const p=document.createElement('p')
        p.textContent=['Versos pesados, bastidores e tudo que movimenta a cena do funk e da cultura urbana.','Artistas, lançamentos, polêmicas e acontecimentos que estão repercutindo nas redes.','Acompanhe as histórias e novidades que movimentam o cenário nacional.'][i%3]
        title.insertAdjacentElement('afterend',p)
      }
      if(meta&&!meta.querySelector('.bookmark')){
        meta.classList.add('news-reference-meta')
        const b=document.createElement('span')
        b.className='bookmark'
        b.textContent='♡'
        meta.appendChild(b)
      }
    })

    const originals=Array.from(grid.children)
    for(let i=0;i<4&&originals.length;i++) grid.appendChild(originals[i%originals.length].cloneNode(true))

    const cards=Array.from(grid.children) as HTMLElement[]
    const categoryCycle=['funk','trap','rap','cultura','entretenimento','funk','rap','cultura','trap','entretenimento','funk','rap']
    cards.forEach((card,i)=>{
      card.dataset.newsCategory=categoryCycle[i%categoryCycle.length]
    })

    const controls=document.createElement('div')
    controls.className='news-reference-controls'
    controls.innerHTML='<div class="news-reference-tabs"><button class="active" data-filter="todas">Todas</button><button data-filter="funk">Funk</button><button data-filter="trap">Trap</button><button data-filter="rap">Rap</button><button data-filter="cultura">Cultura</button><button data-filter="entretenimento">Entretenimento</button></div><button class="news-reference-sort">Mais recentes <span>⌄</span></button><label class="news-reference-search"><input placeholder="Buscar notícias..."/><span>⌕</span></label>'
    layout.parentElement?.insertBefore(controls,layout)

    const applyFilter=(filter:string)=>{
      cards.forEach(card=>{
        card.hidden=filter!=='todas'&&card.dataset.newsCategory!==filter
      })
      controls.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button=>{
        const active=button.dataset.filter===filter
        button.classList.toggle('active',active)
        button.setAttribute('aria-pressed',String(active))
      })
    }

    controls.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button=>{
      button.addEventListener('click',()=>{
        const filter=button.dataset.filter||'todas'
        if(newsFilters.includes(filter as typeof newsFilters[number])) applyFilter(filter)
      })
    })

    const searchInput=controls.querySelector<HTMLInputElement>('.news-reference-search input')
    searchInput?.addEventListener('input',()=>{
      const query=(searchInput.value||'').trim().toLocaleLowerCase('pt-BR')
      cards.forEach(card=>{
        const matchesText=!query||(card.textContent||'').toLocaleLowerCase('pt-BR').includes(query)
        const activeFilter=(controls.querySelector<HTMLButtonElement>('[data-filter].active')?.dataset.filter)||'todas'
        const matchesFilter=activeFilter==='todas'||card.dataset.newsCategory===activeFilter
        card.hidden=!(matchesText&&matchesFilter)
      })
    })

    applyFilter('todas')

    if(pagination){
      pagination.classList.remove('pl-pagination')
      pagination.classList.add('news-reference-pagination')
      pagination.innerHTML='<button class="active">1</button><button>2</button><button>3</button><button>4</button><button>5</button><button>...</button><button>15</button><button>PRÓXIMA →</button>'
    }

    const banner=document.createElement('div')
    banner.className='news-reference-banner'
    const logo=(document.querySelector('.public-brand img') as HTMLImageElement|null)?.src||''
    banner.innerHTML=`<img src="${logo}" alt="Portal Lander"><strong>ANUNCIE AQUI <span>SUA MARCA NO RITMO CERTO!</span></strong><a href="#/anuncie">SAIBA MAIS →</a>`
    section.appendChild(banner)
  },[location.pathname])
  return null
}
