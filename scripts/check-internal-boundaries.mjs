import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'

const read = path => readFile(new URL(`../${path}`, import.meta.url),'utf8')
const failures=[]

const publicStyles=await read('src/styles/public-styles.css')
for(const forbidden of ['admin-system','admin-workspaces','admin-entry','admin-header','admin-dashboard','admin-brand','admin-responsive','admin-accessibility','admin-access.css','header-brand-manager.css','brand-assets-manager.css','home-ad-manager.css','hero-editable.css','clickable-cards.css'])if(publicStyles.includes(forbidden))failures.push(`public-styles.css não pode carregar stylesheet administrativo/legado: ${forbidden}`)
for(const required of ['hero-public.css','home-ad-public.css'])if(!publicStyles.includes(required))failures.push(`public-styles.css deve carregar ${required}.`)

const globalStyles=await read('src/styles/styles.css')
for(const selector of ['.app-shell{','.sidebar{','.workspace-top{','.admin-kpi-grid{'])if(globalStyles.includes(selector))failures.push(`styles.css contém seletor administrativo legado: ${selector}`)

const main=await read('src/main.tsx')
if(main.includes('Bridge'))failures.push('main.tsx deve permanecer livre de bridges globais.')
if(!main.includes('<React.StrictMode><HashRouter><App/></HashRouter></React.StrictMode>'))failures.push('main.tsx deve montar somente App dentro do HashRouter.')

const portalApp=await read('src/app/PortalApp.tsx')
if(portalApp.includes('LegacyApp'))failures.push('PortalApp não pode depender de LegacyApp.')
for(const required of ["import InternalApp from './InternalApp'","import { PublicHome } from '../pages/home/PublicHome'","import { ColaborePage } from '../pages/colabore/ColaborePage'","import { AnunciePage } from '../pages/anuncie/AnunciePage'","import { PublicNotFound } from '../shared/public/PublicNotFound'"])if(!portalApp.includes(required))failures.push(`PortalApp deve manter ${required}.`)
if(portalApp.includes('return null'))failures.push('PortalApp não pode produzir tela vazia para rotas desconhecidas.')
if(!portalApp.includes('return <PublicNotFound/>'))failures.push('PortalApp deve renderizar 404 explícito para rotas desconhecidas.')
for(const forbidden of ['const stories','const ranked','const releases','const agenda','function HomeContent','function Card('])if(portalApp.includes(forbidden))failures.push(`PortalApp voltou a concentrar implementação da Home: ${forbidden}`)

const internalApp=await read('src/app/InternalApp.tsx')
for(const required of ["from '../features/access/LoginPage'","from '../features/access/WorkspacePage'",'path="/app/login"','path="/app/workspaces"','to="/app/login"'])if(!internalApp.includes(required))failures.push(`InternalApp deve manter o fluxo de acesso explícito: ${required}`)
for(const forbidden of ['function WorkspaceHome','workspace-picker','workspace-card'])if(internalApp.includes(forbidden))failures.push(`InternalApp não pode voltar a embutir a antiga seleção de workspace: ${forbidden}`)

const loginPage=await read('src/features/access/LoginPage.tsx')
if(!loginPage.includes('Autenticação ainda não conectada'))failures.push('Login deve informar explicitamente que a autenticação não está conectada.')
if(!loginPage.includes('nenhuma credencial digitada aqui será aceita ou simulada'))failures.push('Login não pode simular credenciais ou sessão autenticada.')
if(!loginPage.includes('to="/app/workspaces"'))failures.push('Login deve expor somente a entrada explícita para o ambiente frontend atual.')
for(const forbidden of ['localStorage.setItem','sessionStorage.setItem','setAuthenticated(true)','loginSuccess'])if(loginPage.includes(forbidden))failures.push(`Login não pode fabricar autenticação local: ${forbidden}`)

const workspacePage=await read('src/features/access/WorkspacePage.tsx')
for(const required of ['to="/app/crm"','to="/app/site"','Esta tela não representa uma sessão autenticada.'])if(!workspacePage.includes(required))failures.push(`WorkspacePage deve manter: ${required}`)

const publicHome=await read('src/pages/home/PublicHome.tsx')
if(!publicHome.includes("from './models/homeReadModel'"))failures.push('PublicHome deve consumir models/homeReadModel.')
if(!publicHome.includes("from './components/HomeAdSection'"))failures.push('PublicHome deve renderizar HomeAdSection diretamente.')
for(const forbidden of ['const IMG=','const stories:','const ranked=','const releases=','const agenda=','document.querySelector','innerHTML','createPortal'])if(publicHome.includes(forbidden))failures.push(`PublicHome voltou a usar implementação proibida: ${forbidden}`)

const publicChrome=await read('src/shared/public/PublicChrome.tsx')
for(const required of ["from '../branding/models/headerBrandModel'","from '../branding/models/footerBrandModel'",'to="/app/login"'])if(!publicChrome.includes(required))failures.push(`PublicChrome deve consumir/manter ${required}.`)
for(const forbidden of ['MutationObserver','document.querySelector','innerHTML','HeaderBrandBridge','BrandAssetsBridge','PublicSearchSuggestionsBridge'])if(publicChrome.includes(forbidden))failures.push(`PublicChrome não pode usar comportamento imperativo: ${forbidden}`)
if(!publicChrome.includes('editorialReadModel.contents'))failures.push('As sugestões de busca devem ser derivadas do catálogo editorial real.')
if(!publicChrome.includes('Newsletter ainda não conectada. Nenhuma inscrição foi enviada.'))failures.push('Newsletter deve informar explicitamente quando não existe integração de inscrição.')

const adminUi=await read('src/shared/internal/AdminUi.tsx')
if(!adminUi.includes('to="/app/workspaces"'))failures.push('AdminUi deve apontar Trocar workspace para /app/workspaces.')
if(!adminUi.includes('to="/app/login"'))failures.push('AdminUi deve manter acesso explícito à tela de login local.')

const homeAd=await read('src/pages/home/components/HomeAdSection.tsx')
if(!homeAd.includes('pl-ad-logo'))failures.push('HomeAdSection deve renderizar a logo publicitária configurada.')

const editorialListing=await read('src/features/editorial/components/EditorialListingPage.tsx')
if(!editorialListing.includes("from '../../../pages/noticias/components/NewsAdSection'"))failures.push('EditorialListingPage deve renderizar a publicidade de Notícias declarativamente.')
if(!editorialListing.includes("page.slug==='noticias'"))failures.push('O slot lateral deve ser limitado à página Notícias.')
if(!editorialListing.includes('has-news-ad'))failures.push('A listagem deve ativar a composição de três colunas + anúncio quando a campanha for válida.')

const homeManager=await read('src/features/site-manager/pages/HomeManagerPage.tsx')
if(!homeManager.includes("from '../../../pages/home/models/homeReadModel'"))failures.push('HomeManagerPage deve consumir o mesmo homeReadModel da Home pública.')
if(!homeManager.includes('/app/site/home/anuncio'))failures.push('HomeManagerPage deve expor o editor oficial do anúncio da Home.')

const colabore=await read('src/pages/colabore/ColaborePage.tsx')
for(const forbidden of ['Material recebido.','setSent(true)','Obrigado por colaborar. A equipe editorial fará a análise.','useLocation'])if(colabore.includes(forbidden))failures.push(`Colabore não pode usar implementação obsoleta: ${forbidden}`)
if(!colabore.includes('Nenhum material foi enviado.'))failures.push('Colabore deve informar explicitamente quando não existe endpoint de envio.')
if(!colabore.includes("from '../../shared/public/PublicChrome'"))failures.push('Colabore deve usar PublicChrome diretamente, sem ciclo por PortalApp.')

const anuncie=await read('src/pages/anuncie/AnunciePage.tsx')
if(!anuncie.includes('Nenhuma solicitação é simulada por esta página.'))failures.push('Anuncie deve permanecer honesta sobre ausência de canal comercial persistente.')

const removedPaths=[
  'src/app/LegacyApp.tsx','src/app/HeroSection.tsx','src/app/brandAsset.ts',
  'src/features/crm/CrmDirectoryPages.tsx','src/features/crm/CrmOperations.tsx','src/features/crm/CrmWorkspace.tsx',
  'src/features/site-manager/SiteManagerCatalogPages.tsx','src/features/site-manager/SiteManagerOperations.tsx','src/features/site-manager/SiteManagerWorkspace.tsx',
  'src/pages/home/components/HomeAdBridge.tsx','src/pages/home/components/HomePageAdjustmentsBridge.tsx','src/pages/home/components/HomeSidebarAdBridge.tsx',
  'src/pages/colabore/components/ColaborePageBridge.tsx',
  'src/shared/branding/components/HeaderBrandBridge.tsx','src/shared/branding/components/BrandAssetsBridge.tsx',
  'src/shared/behaviors/components/ClickableCardsBridge.tsx','src/shared/behaviors/components/PublicSearchSuggestionsBridge.tsx','src/shared/behaviors/styles/clickable-cards.css',
  'src/pages/noticias/components/NewsAdBridge.tsx','src/pages/home/styles/home-ad-manager.css','src/pages/home/styles/hero-editable.css','src/styles/admin-hero-bridge.css',
]
for(const removedPath of removedPaths){try{await access(new URL(`../${removedPath}`,import.meta.url),constants.F_OK);failures.push(`${removedPath} deve permanecer removido.`)}catch{}}

const crmRoutes=await read('src/features/crm/CrmRoutes.tsx')
for(const forbidden of ['CrmDirectoryPages','CrmOperations','CrmWorkspace'])if(crmRoutes.includes(forbidden))failures.push(`CrmRoutes não pode depender de ${forbidden}.`)
if(/path=["']\/app\/crm/.test(crmRoutes))failures.push('CrmRoutes deve usar paths relativos ao escopo /app/crm/*.')
if(!crmRoutes.includes('<Route index'))failures.push('CrmRoutes deve declarar o dashboard como rota index.')

const siteRoutes=await read('src/features/site-manager/SiteManagerRoutes.tsx')
for(const forbidden of ['SiteManagerCatalogPages','SiteManagerOperations','SiteManagerWorkspace'])if(siteRoutes.includes(forbidden))failures.push(`SiteManagerRoutes não pode depender de ${forbidden}.`)
if(/path=["']\/app\/site/.test(siteRoutes))failures.push('SiteManagerRoutes deve usar paths relativos ao escopo /app/site/*.')
if(!siteRoutes.includes('<Route index'))failures.push('SiteManagerRoutes deve declarar o dashboard como rota index.')
for(const required of ['path="home"','path="home/anuncio"','path="marca"','path="cabecalho"','path="noticias/anuncio"'])if(!siteRoutes.includes(required))failures.push(`SiteManagerRoutes deve manter a rota ${required}.`)

const adminEntry=await read('src/styles/admin-entry.css')
for(const required of ['admin-system.css','admin-workspaces.css','admin-brand.css','admin-home.css','admin-hero.css','admin-hero-editor.css','admin-home-ad-editor.css','admin-access.css','header-brand-manager.css','brand-assets-manager.css','admin-responsive.css','admin-accessibility.css'])if(!adminEntry.includes(required))failures.push(`admin-entry.css deve carregar ${required}.`)

if(failures.length){console.error('Falha nos boundaries da aplicação:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Application boundaries OK')
