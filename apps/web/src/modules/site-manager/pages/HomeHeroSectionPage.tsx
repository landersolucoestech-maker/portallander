import {useEffect,useRef,useState} from 'react'
import {HeroEditor} from '../../../pages/home/components/HeroEditor'
import {HERO_APPEARANCE_EVENT} from '../../../pages/home/models/heroAppearanceModel'
import {
  loadAdminHeroCmsState,
  readCachedHeroCmsState,
  restoreCachedHeroCmsState,
  saveHeroCmsState,
  type HeroCmsState,
} from '../../../pages/home/models/heroCmsRepository'
import {AdminNotice,AdminShell} from '../../../shared/internal/AdminUi'
import {SITE_MANAGER_NAV} from '../../../shared/internal/adminNavigation'
import {HeroBackgroundManager} from '../components/HeroBackgroundManager'
import {HeroFullPagePreview} from '../components/HeroFullPagePreview'
import '../../../styles/admin-hero-editor-layout.css'
import '../../../styles/home-hero-section-page.css'

const HERO_CONTENT_EVENT='portal-lander:hero-updated'

export function HomeHeroSectionPage(){
  const [loading,setLoading]=useState(true)
  const [syncing,setSyncing]=useState(false)
  const [error,setError]=useState('')
  const [editorKey,setEditorKey]=useState(0)
  const persistedRef=useRef<HeroCmsState|null>(null)
  const timerRef=useRef<number|null>(null)
  const synchronizingRef=useRef(false)

  useEffect(()=>{
    let active=true
    void loadAdminHeroCmsState().then(state=>{
      if(active)persistedRef.current=state
    }).catch(caught=>{
      if(active)setError(caught instanceof Error?caught.message:'Não foi possível carregar a configuração persistida da Hero.')
    }).finally(()=>{if(active)setLoading(false)})
    return()=>{active=false}
  },[])

  useEffect(()=>{
    if(loading)return
    const persist=()=>{
      if(synchronizingRef.current||!persistedRef.current)return
      if(timerRef.current!==null)window.clearTimeout(timerRef.current)
      setSyncing(true)
      timerRef.current=window.setTimeout(()=>{
        timerRef.current=null
        synchronizingRef.current=true
        const candidate=readCachedHeroCmsState()
        void saveHeroCmsState(candidate).then(saved=>{
          persistedRef.current=saved
          setError('')
        }).catch(caught=>{
          const previous=persistedRef.current
          if(previous)restoreCachedHeroCmsState(previous)
          setEditorKey(value=>value+1)
          setError(caught instanceof Error?`${caught.message} A última configuração persistida da Hero foi restaurada.`:'Falha ao persistir a Hero. A última configuração persistida foi restaurada.')
        }).finally(()=>{
          synchronizingRef.current=false
          setSyncing(false)
        })
      },80)
    }
    window.addEventListener(HERO_CONTENT_EVENT,persist)
    window.addEventListener(HERO_APPEARANCE_EVENT,persist)
    return()=>{
      if(timerRef.current!==null)window.clearTimeout(timerRef.current)
      window.removeEventListener(HERO_CONTENT_EVENT,persist)
      window.removeEventListener(HERO_APPEARANCE_EVENT,persist)
    }
  },[loading])

  return <AdminShell area="cms" items={SITE_MANAGER_NAV} header={{title:'Configurar seção: Hero Section',description:'Configure a Hero no painel rolável à esquerda e acompanhe a Página Inicial completa no preview fixo à direita.',backTo:'/app/site/paginas',backLabel:'Páginas'}}>
    {loading&&<AdminNotice title="Sincronizando Hero" description="Carregando a configuração persistida antes de abrir o editor."/>}
    {syncing&&<AdminNotice title="Persistindo Hero" description="Validando e salvando a configuração antes de torná-la oficial no frontend."/>}
    {error&&<AdminNotice title="Falha ao sincronizar a Hero" description={`${error} Nenhuma falha de persistência é tratada como sucesso.`}/>} 
    {!loading&&<div className="home-hero-section-workbench">
      <div className="home-hero-config-rail" aria-label="Configurações da Hero Section">
        <HeroBackgroundManager key={`background-${editorKey}`}/>
        <HeroEditor key={`editor-${editorKey}`}/>
      </div>
      <HeroFullPagePreview/>
    </div>}
  </AdminShell>
}
