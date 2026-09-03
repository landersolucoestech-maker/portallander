import {lazy,Suspense} from 'react'
import type {EditorialPage} from '../features/editorial/model'

const LazySobrePage=lazy(()=>import('../pages/sobre/SobrePage').then(module=>({default:module.SobrePage})))
const LazyColaborePage=lazy(()=>import('../pages/colabore/ColaborePage').then(module=>({default:module.ColaborePage})))
const LazyContatoPage=lazy(()=>import('../pages/contato/ContatoPage').then(module=>({default:module.ContatoPage})))

export function SobrePage({page}:{page:EditorialPage}){
  return <Suspense fallback={null}><LazySobrePage page={page}/></Suspense>
}

export function ColaborePage(){
  return <Suspense fallback={null}><LazyColaborePage/></Suspense>
}

export function ContatoPage({page}:{page:EditorialPage}){
  return <Suspense fallback={null}><LazyContatoPage page={page}/></Suspense>
}
