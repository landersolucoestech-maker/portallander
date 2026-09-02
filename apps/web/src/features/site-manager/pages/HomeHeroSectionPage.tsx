import {useEffect,useState} from 'react'
import {HeroEditor} from '../../../pages/home/components/HeroEditor'
import {loadAdminHeroCmsState} from '../../../pages/home/models/heroCmsRepository'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {HeroBackgroundManager} from '../components/HeroBackgroundManager'

export function HomeHeroSectionPage(){
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{
    let active=true
    void loadAdminHeroCmsState().catch(caught=>{
      if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar a configuração persistida da Hero.')
    }).finally(()=>{if(active)setLoading(false)})
    return()=>{active=false}
  },[])

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Configurar seção: Hero Section',description:'Gerencie a Hero e a imagem de fundo com preview fiel em Desktop, Tablet e Mobile.',backTo:'/app/site/paginas',backLabel:'Páginas'}}>
    {loading&&<AdminNotice title="Sincronizando Hero" description="Carregando a configuração persistida antes de abrir o editor."/>}
    {error&&<AdminNotice title="Falha ao sincronizar a Hero" description={`${error} A última configuração local válida foi preservada; nenhuma alteração foi publicada.`}/>} 
    {!loading&&<><HeroBackgroundManager/><HeroEditor/></>}
  </AdminShell>
}
