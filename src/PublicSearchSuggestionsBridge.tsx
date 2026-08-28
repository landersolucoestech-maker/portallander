import { useEffect } from 'react'

type SearchItem = { title:string; type:string; route:string; terms?:string }

const SEARCH_ITEMS:SearchItem[] = [
  {title:'MC Cabelinho lança “Melhor Só” e fãs vão à loucura',type:'Lançamento',route:'/noticia/mc-cabelinho-lanca-melhor-so-e-fas-vao-a-loucura',terms:'mc cabelinho melhor so'},
  {title:'Bastidores do clipe de Orochi viralizam na web',type:'Bastidores',route:'/noticia/bastidores-do-clipe-de-orochi-viralizam-na-web',terms:'orochi clipe'},
  {title:'Treta! MC Poze alfineta Oruam nas redes sociais',type:'Notícias',route:'/noticia/treta-mc-poze-alfineta-oruam-nas-redes-sociais',terms:'mc poze oruam treta'},
  {title:'A arte do funk: artistas que transformam a quebrada',type:'Cultura',route:'/noticia/a-arte-do-funk-artistas-que-transformam-a-quebrada',terms:'funk cultura quebrada'},
  {title:'Djonga anuncia pausa na carreira para cuidar da saúde mental',type:'Notícias',route:'/noticia/djonga-anuncia-pausa-na-carreira-para-cuidar-da-saude-mental',terms:'djonga pausa carreira'},
  {title:'Tribo da Periferia lança documentário sobre sua trajetória',type:'Notícias',route:'/noticia/tribo-da-periferia-lanca-documentario-sobre-sua-trajetoria',terms:'tribo periferia documentario'},
  {title:'Filipe Ret solta prévia de faixa inédita e anima fãs',type:'Destaques',route:'/noticia/filipe-ret-solta-previa-de-faixa-inedita-e-anima-fas',terms:'filipe ret previa faixa'},
  {title:'MC Dricka fala sobre novos projetos e empoderamento',type:'Cultura',route:'/noticia/mc-dricka-fala-sobre-novos-projetos-e-empoderamento',terms:'mc dricka projetos'},
  {title:'Veigh bate recorde com novo álbum “Dos Prédios Deluxe”',type:'Lançamento',route:'/noticia/veigh-bate-recorde-com-novo-album-dos-predios-deluxe',terms:'veigh dos predios deluxe album'},
  {title:'MC Ryan SP cancela show de última hora e web reage',type:'Notícias',route:'/noticia/mc-ryan-sp-cancela-show-de-ultima-hora-e-web-reage',terms:'mc ryan sp show'},
  {title:'Festival de Trap 2025 anuncia line-up pesado',type:'Destaques',route:'/noticia/festival-de-trap-2025-anuncia-line-up-pesado',terms:'festival trap line up'},
  {title:'Ludmilla confirma nova turnê “Numanice #4”',type:'Lançamento',route:'/noticia/ludmilla-confirma-nova-turne-numanice-4',terms:'ludmilla numanice turne'},
  {title:'Entenda a treta entre Mainstreet e Pineapple',type:'Notícias',route:'/noticia/entenda-a-treta-entre-mainstreet-e-pineapple',terms:'mainstreet pineapple treta'},
  {title:'Como foi a gravação do clipe “Malvadão 3” de Xamã',type:'Bastidores',route:'/noticia/como-foi-a-gravacao-do-clipe-malvadao-3-de-xama',terms:'xama malvadao 3 clipe'},
  {title:'Oruam — Liberado',type:'Música',route:'/lancamentos',terms:'oruam liberado'},
  {title:'WIU — Manual de Cria',type:'Música',route:'/lancamentos',terms:'wiu manual cria'},
]

const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()

export function PublicSearchSuggestionsBridge(){
  useEffect(()=>{
    let currentInput:HTMLInputElement|null=null
    let list:HTMLDivElement|null=null

    const close=()=>{list?.remove();list=null}
    const render=(input:HTMLInputElement)=>{
      const query=normalize(input.value)
      close()
      if(!query)return
      const results=SEARCH_ITEMS.filter(item=>normalize(`${item.title} ${item.type} ${item.terms||''}`).includes(query)).slice(0,6)
      const panel=input.closest('.public-search-panel')
      if(!(panel instanceof HTMLElement)||results.length===0)return
      list=document.createElement('div')
      list.className='public-search-suggestions'
      list.setAttribute('role','listbox')
      results.forEach(item=>{
        const button=document.createElement('button')
        button.type='button'
        button.className='public-search-suggestion'
        button.innerHTML=`<span><small>${item.type}</small><strong>${item.title}</strong></span><b>→</b>`
        button.addEventListener('mousedown',event=>{
          event.preventDefault()
          window.location.hash=`#${item.route}`
          close()
        })
        list!.appendChild(button)
      })
      panel.appendChild(list)
    }
    const bind=()=>{
      const input=document.querySelector('.public-search-panel input')
      if(!(input instanceof HTMLInputElement)||input===currentInput)return
      currentInput=input
      input.addEventListener('input',()=>render(input))
      input.addEventListener('focus',()=>render(input))
      input.addEventListener('keydown',event=>{if(event.key==='Escape')close()})
      render(input)
    }
    const observer=new MutationObserver(bind)
    observer.observe(document.body,{childList:true,subtree:true})
    bind()
    return()=>{observer.disconnect();close()}
  },[])
  return null
}
