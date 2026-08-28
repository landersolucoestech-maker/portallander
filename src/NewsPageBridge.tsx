import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function slugify(value:string){
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[“”"'’]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
}

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
      if(meta&&!meta.querySelector('.bookmark')){meta.classList.add('news-reference-meta');const b=document.createElement('span');b.className='bookmark';b.textContent='♡';meta.appendChild(b)}
    })

    const originals=Array.from(grid.children)
    for(let i=0;i<4&&originals.length;i++) grid.appendChild(originals[i%originals.length].cloneNode(true))
    const baseCards=Array.from(grid.children) as HTMLElement[]
    const categoryMap=['funk','trap','rap','cultura','entretenimento','funk','trap','rap','cultura','entretenimento','funk','rap']
    baseCards.forEach((card,i)=>{
      const title=(card.querySelector('h3')?.textContent||'').trim()
      card.dataset.category=categoryMap[i%categoryMap.length]
      card.dataset.title=title.toLowerCase()
      card.dataset.articleSlug=slugify(title)
    })

    grid.innerHTML=''
    for(let page=0;page<15;page++){
      for(let i=0;i<baseCards.length;i++){
        const source=baseCards[(i+page)%baseCards.length]
        const clone=source.cloneNode(true) as HTMLElement
        clone.dataset.pageSource=String(page+1)
        clone.dataset.articleSlug=source.dataset.articleSlug||''
        clone.dataset.clickableCard='true'
        clone.tabIndex=0
        clone.setAttribute('role','link')
        clone.setAttribute('aria-label',`Abrir ${clone.querySelector('h3')?.textContent?.trim()||'notícia'}`)
        clone.style.cursor='pointer'
        grid.appendChild(clone)
      }
    }

    const controls=document.createElement('div')
    controls.className='news-reference-controls'
    controls.innerHTML='<div class="news-reference-tabs"><button class="active" data-filter="todas">Todas</button><button data-filter="funk">Funk</button><button data-filter="trap">Trap</button><button data-filter="rap">Rap</button><button data-filter="cultura">Cultura</button><button data-filter="entretenimento">Entretenimento</button></div><button class="news-reference-sort">Mais recentes <span>⌄</span></button><label class="news-reference-search"><input placeholder="Buscar notícias..."/><span>⌕</span></label>'
    layout.parentElement?.insertBefore(controls,layout)

    let activeFilter='todas'
    let search=''
    let currentPage=1
    const pageSize=12
    const allCards=Array.from(grid.children) as HTMLElement[]

    const openCard=(card:HTMLElement)=>{
      const slug=card.dataset.articleSlug||slugify(card.querySelector('h3')?.textContent||'')
      if(!slug) return
      window.location.hash=`/noticia/${slug}`
    }

    const onGridClick=(event:MouseEvent)=>{
      const target=event.target as HTMLElement
      if(target.closest('.bookmark')) return
      const card=target.closest<HTMLElement>('.news-reference-card')
      if(card) openCard(card)
    }
    const onGridKeyDown=(event:KeyboardEvent)=>{
      if(event.key!=='Enter'&&event.key!==' ') return
      const card=(event.target as HTMLElement).closest<HTMLElement>('.news-reference-card')
      if(!card) return
      event.preventDefault()
      openCard(card)
    }
    grid.addEventListener('click',onGridClick)
    grid.addEventListener('keydown',onGridKeyDown)

    const buildPagination=(totalPages:number)=>{
      if(!pagination) return
      pagination.classList.remove('pl-pagination')
      pagination.classList.add('news-reference-pagination')
      const pages:number[]=[]
      if(totalPages<=7){for(let i=1;i<=totalPages;i++)pages.push(i)}
      else if(currentPage<=4){pages.push(1,2,3,4,5,-1,totalPages)}
      else if(currentPage>=totalPages-3){pages.push(1,-1,totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages)}
      else{pages.push(1,-1,currentPage-1,currentPage,currentPage+1,-1,totalPages)}
      pagination.innerHTML=pages.map(p=>p===-1?'<button type="button" disabled>...</button>':`<button type="button" data-page="${p}" class="${p===currentPage?'active':''}">${p}</button>`).join('')+`<button type="button" data-next="true" ${currentPage>=totalPages?'disabled':''}>PRÓXIMA →</button>`
    }

    const render=()=>{
      const filtered=allCards.filter(card=>{
        const category=card.dataset.category||''
        const title=card.dataset.title||''
        return (activeFilter==='todas'||category===activeFilter) && (!search||title.includes(search))
      })
      const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize))
      if(currentPage>totalPages) currentPage=totalPages
      allCards.forEach(card=>card.style.display='none')
      const start=(currentPage-1)*pageSize
      filtered.slice(start,start+pageSize).forEach(card=>card.style.display='')
      buildPagination(totalPages)
    }

    controls.querySelectorAll<HTMLButtonElement>('.news-reference-tabs button').forEach(button=>{
      button.addEventListener('click',()=>{
        activeFilter=button.dataset.filter||'todas'
        currentPage=1
        controls.querySelectorAll('.news-reference-tabs button').forEach(item=>item.classList.remove('active'))
        button.classList.add('active')
        render()
      })
    })

    const input=controls.querySelector<HTMLInputElement>('.news-reference-search input')
    input?.addEventListener('input',()=>{
      search=(input.value||'').trim().toLowerCase()
      currentPage=1
      render()
    })

    pagination?.addEventListener('click',(event)=>{
      const button=(event.target as HTMLElement).closest('button') as HTMLButtonElement|null
      if(!button||button.disabled) return
      if(button.dataset.page) currentPage=Number(button.dataset.page)
      else if(button.dataset.next==='true') currentPage+=1
      render()
      controls.scrollIntoView({behavior:'smooth',block:'start'})
    })

    render()

    const banner=document.createElement('div')
    banner.className='news-reference-banner'
    const logo=(document.querySelector('.public-brand img') as HTMLImageElement|null)?.src||''
    banner.innerHTML=`<img src="${logo}" alt="Portal Lander"><strong>ANUNCIE AQUI <span>SUA MARCA NO RITMO CERTO!</span></strong><a href="#/anuncie">SAIBA MAIS →</a>`
    section.appendChild(banner)

    return ()=>{
      grid.removeEventListener('click',onGridClick)
      grid.removeEventListener('keydown',onGridKeyDown)
    }
  },[location.pathname])
  return null
}
