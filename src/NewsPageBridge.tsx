import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isNewsAdValid, readNewsAdConfig } from './newsAdModel'

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

  useLayoutEffect(()=>{
    if(location.pathname!=='/noticias')return

    const root=document.querySelector<HTMLElement>('.public-page')
    const grid=document.querySelector<HTMLElement>('.pl-listing-grid,.news-reference-grid')
    if(!root||!grid)return

    root.classList.add('news-reference-page')
    document.querySelectorAll('.news-reference-controls,.news-reference-sidebar-ad').forEach(node=>node.remove())

    grid.classList.remove('pl-listing-grid')
    grid.classList.add('news-reference-grid')

    const legacyFilter=root.querySelector<HTMLElement>('.pl-filter')
    if(legacyFilter)legacyFilter.style.display='none'

    Array.from(grid.children).forEach((card,index)=>{
      const element=card as HTMLElement
      element.classList.add('news-reference-card')
      const body=element.querySelector<HTMLElement>('.pl-card-body')
      body?.classList.add('news-reference-card-body')
      const title=element.querySelector<HTMLElement>('h3')
      const meta=element.querySelector<HTMLElement>('.pl-meta')
      if(title&&body&&!body.querySelector('p')){
        const p=document.createElement('p')
        p.textContent=[
          'Versos pesados, bastidores e tudo que movimenta a cena do funk e da cultura urbana.',
          'Artistas, lançamentos, polêmicas e acontecimentos que estão repercutindo nas redes.',
          'Acompanhe as histórias e novidades que movimentam o cenário nacional.',
        ][index%3]
        title.insertAdjacentElement('afterend',p)
      }
      if(meta&&!meta.querySelector('.bookmark')){
        meta.classList.add('news-reference-meta')
        const bookmark=document.createElement('span')
        bookmark.className='bookmark'
        bookmark.textContent='♡'
        meta.appendChild(bookmark)
      }
    })

    const seed=Array.from(grid.querySelectorAll<HTMLElement>('.news-reference-card'))
    if(seed.length===0)return

    const categoryMap=['funk','trap','rap','cultura','entretenimento','funk','trap','rap','cultura','entretenimento','funk','rap']
    seed.forEach((card,index)=>{
      const title=(card.querySelector('h3')?.textContent||'').trim()
      card.dataset.category=categoryMap[index%categoryMap.length]
      card.dataset.title=title.toLowerCase()
      card.dataset.articleSlug=slugify(title)
    })

    grid.innerHTML=''
    for(let page=0;page<15;page++){
      seed.forEach((source,index)=>{
        const clone=source.cloneNode(true) as HTMLElement
        clone.dataset.category=source.dataset.category||categoryMap[index%categoryMap.length]
        clone.dataset.title=source.dataset.title||''
        clone.dataset.articleSlug=source.dataset.articleSlug||''
        clone.dataset.sourceOrder=String(page*seed.length+index)
        clone.dataset.clickableCard='true'
        clone.tabIndex=0
        clone.setAttribute('role','link')
        clone.setAttribute('aria-label',`Abrir ${clone.querySelector('h3')?.textContent?.trim()||'notícia'}`)
        clone.style.cursor='pointer'
        grid.appendChild(clone)
      })
    }

    const adIsValid=isNewsAdValid(readNewsAdConfig())
    grid.classList.toggle('has-news-ad',adIsValid)
    const adSlot=document.createElement('aside')
    adSlot.className='news-reference-sidebar-ad'
    adSlot.setAttribute('aria-label','Publicidade')
    adSlot.style.display=adIsValid?'':'none'
    grid.appendChild(adSlot)

    const controls=document.createElement('div')
    controls.className='news-reference-controls'
    controls.innerHTML='<div class="news-reference-tabs"><button class="active" data-filter="todas">Todas</button><button data-filter="funk">Funk</button><button data-filter="trap">Trap</button><button data-filter="rap">Rap</button><button data-filter="cultura">Cultura</button><button data-filter="entretenimento">Entretenimento</button></div><select class="news-reference-sort" aria-label="Ordenar notícias"><option value="desc" selected>Mais recentes</option><option value="asc">Mais antigas</option></select>'
    grid.parentElement?.insertBefore(controls,grid)

    let pagination=root.querySelector<HTMLElement>('.pl-pagination,.news-reference-pagination')
    if(!pagination){
      pagination=document.createElement('div')
      grid.parentElement?.appendChild(pagination)
    }
    pagination.classList.remove('pl-pagination')
    pagination.classList.add('news-reference-pagination')

    let activeFilter='todas'
    let currentPage=1
    let sortDirection:'desc'|'asc'='desc'
    const pageSize=14
    const allCards=Array.from(grid.querySelectorAll<HTMLElement>('.news-reference-card'))

    const openCard=(card:HTMLElement)=>{
      const slug=card.dataset.articleSlug||slugify(card.querySelector('h3')?.textContent||'')
      if(slug)window.location.hash=`#/noticia/${slug}`
    }

    const onGridClick=(event:MouseEvent)=>{
      const target=event.target as HTMLElement
      if(target.closest('.bookmark'))return
      const card=target.closest<HTMLElement>('.news-reference-card')
      if(card)openCard(card)
    }
    const onGridKeyDown=(event:KeyboardEvent)=>{
      if(event.key!=='Enter'&&event.key!==' ')return
      const card=(event.target as HTMLElement).closest<HTMLElement>('.news-reference-card')
      if(!card)return
      event.preventDefault()
      openCard(card)
    }
    grid.addEventListener('click',onGridClick)
    grid.addEventListener('keydown',onGridKeyDown)

    const buildPagination=(totalPages:number)=>{
      if(!pagination)return
      const pages:number[]=[]
      if(totalPages<=7){for(let i=1;i<=totalPages;i++)pages.push(i)}
      else if(currentPage<=4){pages.push(1,2,3,4,5,-1,totalPages)}
      else if(currentPage>=totalPages-3){pages.push(1,-1,totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages)}
      else{pages.push(1,-1,currentPage-1,currentPage,currentPage+1,-1,totalPages)}
      pagination.innerHTML=pages.map(page=>page===-1?'<button type="button" disabled>...</button>':`<button type="button" data-page="${page}" class="${page===currentPage?'active':''}">${page}</button>`).join('')+`<button type="button" data-next="true" ${currentPage>=totalPages?'disabled':''}>PRÓXIMA →</button>`
    }

    const render=()=>{
      const filtered=allCards.filter(card=>{
        const category=card.dataset.category||''
        return activeFilter==='todas'||category===activeFilter
      })
      const ordered=sortDirection==='desc'?filtered:[...filtered].reverse()
      const totalPages=Math.max(1,Math.ceil(ordered.length/pageSize))
      if(currentPage>totalPages)currentPage=totalPages
      allCards.forEach(card=>{
        card.style.display='none'
        card.classList.remove('news-reference-first-six')
      })
      const start=(currentPage-1)*pageSize
      ordered.slice(start,start+pageSize).forEach((card,index)=>{
        card.style.display=''
        if(index<6)card.classList.add('news-reference-first-six')
      })
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

    const sortSelect=controls.querySelector<HTMLSelectElement>('.news-reference-sort')
    sortSelect?.addEventListener('change',()=>{
      sortDirection=sortSelect.value==='asc'?'asc':'desc'
      currentPage=1
      render()
    })

    const onPaginationClick=(event:MouseEvent)=>{
      const button=(event.target as HTMLElement).closest('button') as HTMLButtonElement|null
      if(!button||button.disabled)return
      if(button.dataset.page)currentPage=Number(button.dataset.page)
      else if(button.dataset.next==='true')currentPage+=1
      render()
      controls.scrollIntoView({behavior:'smooth',block:'start'})
    }
    pagination.addEventListener('click',onPaginationClick)

    render()

    return()=>{
      grid.removeEventListener('click',onGridClick)
      grid.removeEventListener('keydown',onGridKeyDown)
      pagination?.removeEventListener('click',onPaginationClick)
    }
  },[location.pathname])

  return null
}
