import {lazy,Suspense} from 'react'
import type {EditorialPage} from '../features/editorial/model'

const SobrePage=lazy(()=>import('../pages/sobre/SobrePage').then(module=>({default:module.SobrePage})))
const ColaborePage=lazy(()=>import('../pages/colabore/ColaborePage').then(module=>({default:module.ColaborePage})))
const ContatoPage=lazy(()=>import('../pages/contato/ContatoPage').then(module=>({default:module.ContatoPage})))

export function LazySobrePage({page}:{page:EditorialPage}){
  return <Suspense fallback={null}><SobrePage page={page}/></Suspense>
}

export function LazyColaborePage(){
  return <Suspense fallback={null}><ColaborePage/></Suspense>
}

export function LazyContatoPage({page}:{page:EditorialPage}){
  return <Suspense fallback={null}><ContatoPage page={page}/></Suspense>
}
