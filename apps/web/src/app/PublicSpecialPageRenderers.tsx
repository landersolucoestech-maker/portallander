import {lazy,Suspense} from 'react'
import type {EditorialPage} from '../modules/editorial/model'

const LazyAboutPage=lazy(()=>import('../pages/about/AboutPage').then(module=>({default:module.AboutPage})))
const LazyCollaboratePage=lazy(()=>import('../pages/collaborate/CollaboratePage').then(module=>({default:module.CollaboratePage})))
const LazyContactPage=lazy(()=>import('../pages/contact/ContactPage').then(module=>({default:module.ContactPage})))

export function AboutPage({page}:{page:EditorialPage}){
  return <Suspense fallback={null}><LazyAboutPage page={page}/></Suspense>
}

export function CollaboratePage({page}:{page:EditorialPage}){
  return <Suspense fallback={null}><LazyCollaboratePage page={page}/></Suspense>
}

export function ContactPage({page}:{page:EditorialPage}){
  return <Suspense fallback={null}><LazyContactPage page={page}/></Suspense>
}
