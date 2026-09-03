import {access,readFile} from 'node:fs/promises'
import {constants} from 'node:fs'

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const exists=async path=>{try{await access(new URL(`../${path}`,import.meta.url),constants.F_OK);return true}catch{return false}}
const failures=[]
const requireTokens=(path,source,tokens)=>{for(const token of tokens)if(!source.includes(token))failures.push(`${path} deve preservar: ${token}`)}

const requiredFiles=[
  'src/features/site-manager/pageRepository.ts','src/features/site-manager/contentDraftRepository.ts','src/features/site-manager/mediaRepository.ts','src/features/site-manager/mediaKitRepository.ts','src/features/site-manager/mediaKitDomain.ts','src/features/site-manager/sectionConfiguration.ts','src/features/site-manager/useSectionConfiguration.ts','src/features/site-manager/components/SiteMediaPicker.tsx','src/features/site-manager/components/SectionEditorUi.tsx','src/features/site-manager/forms/draftRepository.ts','src/features/site-manager/forms/SiteFormRenderer.tsx','src/features/site-manager/forms/runtimeOptions.ts','src/features/site-manager/pages/SiteSectionsPage.tsx','src/features/site-manager/pages/SectionConfigurationPage.tsx','src/features/site-manager/pages/HomeReleasesSectionPage.tsx','src/features/site-manager/spotifyReleaseClient.ts','src/features/site-manager/pages/SiteContentEditorPage.tsx','src/features/site-manager/pages/SiteFormEditorPage.tsx','src/features/site-manager/pages/SiteFormsPage.tsx','src/features/site-manager/pages/SiteMediaPage.tsx','src/features/site-manager/pages/MediaKitPage.tsx','src/features/editorial/adminClient.ts','src/features/editorial/components/EditorialListingPage.tsx','src/features/editorial/components/EditorialContentPage.tsx','src/app/publicSpecialPageRegistry.tsx','src/pages/home/components/SpotifyReleasesSection.tsx','src/pages/home/styles/spotify-releases.css','src/pages/sobre/SobrePage.tsx','src/pages/contato/ContatoPage.tsx','src/styles/section-editor-workbench.css','src/styles/spotify-releases-editor.css',
]
for(const path of requiredFiles)if(!(await exists(path)))failures.push(`Módulo Site exige ${path}.`)

const routes=await read('src/features/site-manager/SiteManagerRoutes.tsx')
requireTokens('SiteManagerRoutes.tsx',routes,[
  'path="paginas/home/secoes/lancamentos" element={<HomeReleasesSectionPage/>}',
  'path="paginas/:pageId/secoes/:sectionId" element={<SectionConfigurationPage/>}',
  'path="conteudos/:contentId" element={<SiteContentEditorPage/>}',
  'path="conteudos/colaboracoes" element={<SiteCollaborationsPage/>}',
  'path="formularios/:formId" element={<SiteFormEditorPage/>}',
  'path="midia" element={<SiteMediaPage/>}',
  'path="midia-kit" element={<MediaKitPage/>}',
  'path="configuracoes" element={<Navigate to="/app/settings" replace/>}',
])
if(routes.includes('<HomeContentSectionPage sectionId="lancamentos"'))failures.push('Lançamentos não pode voltar ao editor genérico dependente do data provider; use HomeReleasesSectionPage.')

const pages=await read('src/features/site-manager/pages/SiteSectionsPage.tsx')
requireTokens('SiteSectionsPage.tsx',pages,['isSpecialLayoutPage','isPublishedPage','EDITORIAL_PAGE_SECTION_DEFINITIONS','HOME_SECTION_DEFINITIONS','openCreatePage','openEditPage','deletePage','openCreateSection','RESERVED_PAGE_SLUGS','to="/app/settings"','createAdminEditorialPage','updateAdminEditorialPage','deleteAdminEditorialPage','/app/site/paginas/${encodeURIComponent(selected.id)}/secoes/${encodeURIComponent(section.id)}','Configurar','site-pages-management','site-pages-management-actions','site-pages-structure','site-pages-structure-header','site-pages-context','site-pages-global-settings','site-sections-list','site-sections-actions','Estrutura editorial herdada de Notícias','Páginas de conteúdo herdam a estrutura canônica de Notícias.','Estrutura de ${selected.title}','Configurações globais do site','pageSections.length'])
if(pages.includes('section.target&&'))failures.push('Páginas não pode condicionar Configurar a target manual; toda seção deve ser configurável.')
if(pages.includes('CUSTOM_LAYOUT_SLUGS'))failures.push('Páginas não pode duplicar a classificação de layouts especiais; use isSpecialLayoutPage do domínio editorial.')
if(pages.includes('to="/app/site/configuracoes"'))failures.push('Páginas não pode reintroduzir identidade global dentro do módulo Site.')
if(pages.includes('<span>ESTRUTURA</span>'))failures.push('Páginas não deve reintroduzir a coluna redundante Estrutura na lista de seções.')
if(pages.includes('Padrão de configuração')||pages.includes('Regra de layout')||pages.includes('Modo de desenvolvimento liberado'))failures.push('Páginas não deve reintroduzir avisos permanentes que competem com a hierarquia principal.')

const sectionModel=await read('src/features/site-manager/sectionConfiguration.ts')
requireTokens('sectionConfiguration.ts',sectionModel,['HOME_SECTION_DEFINITIONS','EDITORIAL_PAGE_SECTION_DEFINITIONS','EDITORIAL_SECTION_DEFINITION','readSectionConfiguration','writeSectionConfiguration','resetSectionConfiguration',"id:'hero'","id:'em-destaque'","id:'mais-lidas'","id:'ultimas-noticias'","id:'publicidade-lateral'","id:'em-alta'","id:'anuncie-aqui'","id:'lancamentos'","id:'agenda'","id:'editorial-hero'","id:'editorial-template'","kind:'standard-hero'","kind:'editorial'","'em-destaque':{title:'EM DESTAQUE',linkLabel:'EXPLORAR DESTAQUES',linkUrl:'/noticias',itemLimit:3,columns:3}","lancamentos:{title:'LANÇAMENTOS',linkLabel:'VER TODOS OS LANÇAMENTOS',linkUrl:'/lancamentos',itemLimit:5,columns:4}"])
const sharedEditorUi=await read('src/features/site-manager/components/SectionEditorUi.tsx')
requireTokens('SectionEditorUi.tsx',sharedEditorUi,['SectionEditorField','SectionEditorTabButton','SectionViewportSwitch','SectionEditorSaveBar','SectionEditorSummaryCard','section-editor-devices','section-editor-savebar'])
const canonicalEditorPages=['SectionConfigurationPage.tsx','HomeContentSectionPage.tsx','HomeMostReadSectionPage.tsx','HomeAdvertisingSectionPage.tsx','HomeFeaturedSectionPage.tsx','HomeReleasesSectionPage.tsx','GlobalHeroEditorPage.tsx']
for(const file of canonicalEditorPages){
  const source=await read(`src/features/site-manager/pages/${file}`)
  requireTokens(file,source,['section-editor-workbench','section-editor-rail','SectionEditorTabButton','SectionViewportSwitch','SectionEditorSaveBar','SectionEditorSummaryCard'])
  if(source.includes('section-config-workbench')||source.includes('PREVIEW AO VIVO'))failures.push(`${file} não pode reintroduzir o workbench legado.`)
  if(source.includes('function Tab({active,label,onClick'))failures.push(`${file} não pode duplicar SectionEditorTabButton localmente.`)
  if(source.includes('className="section-editor-devices"'))failures.push(`${file} não pode duplicar SectionViewportSwitch localmente.`)
  if(source.includes('<div className="section-editor-savebar"'))failures.push(`${file} não pode duplicar SectionEditorSaveBar localmente.`)
}
const sectionEditor=await read('src/features/site-manager/pages/SectionConfigurationPage.tsx')
requireTokens('SectionConfigurationPage.tsx',sectionEditor,['Preview da seção','readSectionConfiguration','writeSectionConfiguration','StandardPreview','homeReadModel','EDITORIAL_PAGE_SECTION_DEFINITIONS',"sectionId==='editorial-hero'","configOwnerId=sectionId==='editorial-template'?'editorial-template':pageId",'definition.kind===\'featured\'','definition.kind===\'ranking\'','definition.kind===\'latest\'','definition.kind===\'trending\'','definition.kind===\'agenda\'','definition.kind===\'ad\'','definition.kind===\'cta\'','definition.kind===\'editorial\'','definition.kind===\'standard-hero\''])
if(sectionEditor.includes("definition.kind==='releases'")||sectionEditor.includes('homeReadModel.releases'))failures.push('SectionConfigurationPage não pode manter preview alternativo/mock de Lançamentos.')
if(sectionEditor.includes('<HeroEditor'))failures.push('SectionConfigurationPage.tsx não pode reintroduzir o HeroEditor legado.')
const workbenchCss=await read('src/styles/section-editor-workbench.css')
requireTokens('section-editor-workbench.css',workbenchCss,['grid-template-columns:minmax(350px,390px)','overflow-y:scroll','section-editor-tab.active','section-editor-devices button.active','section-editor-savebar'])

const releasesEditor=await read('src/features/site-manager/pages/HomeReleasesSectionPage.tsx')
requireTokens('HomeReleasesSectionPage.tsx',releasesEditor,['spotifyReleaseClient.adminState','spotifyReleaseClient.connect','spotifyReleaseClient.setPlaylist','spotifyReleaseClient.sync','Spotify','PLAYLIST VINCULADA','Quantidade de itens a exibir','HomePagePreviewFrame'])
const releasesPublic=await read('src/pages/home/components/SpotifyReleasesSection.tsx')
requireTokens('SpotifyReleasesSection.tsx',releasesPublic,['spotifyReleaseClient.publicState','a.position-b.position','item.spotifyUrl','item.albumName','OUVIR NO SPOTIFY','config.itemLimit','pl-spotify-cover'])
const releasesCss=await read('src/pages/home/styles/spotify-releases.css')
requireTokens('spotify-releases.css',releasesCss,['object-fit:contain','--pl-home-columns-desktop','--pl-home-columns-tablet','--pl-home-columns-mobile'])
const homeRenderer=await read('src/pages/home/HomePageRenderer.tsx')
requireTokens('HomePageRenderer.tsx',homeRenderer,['SpotifyReleasesSection','configuration={sectionConfig(configurations,\'lancamentos\')}'])
if(homeRenderer.includes('homeReadModel.releases'))failures.push('Home pública não pode usar homeReadModel.releases; Spotify cache é a fonte única de Lançamentos.')
const homeReadModel=await read('src/pages/home/models/homeReadModel.ts')
if(homeReadModel.includes('releases'))failures.push('homeReadModel não pode voltar a expor releases mockados.')
const mockProvider=await read('src/shared/data/mockDataProvider.ts')
if(mockProvider.includes('mockHomeReleases')||mockProvider.includes('releases:()=>'))failures.push('Mock runtime provider não pode competir com a integração Spotify de Lançamentos.')
const apiProvider=await read('src/shared/data/apiDataProvider.ts')
if(apiProvider.includes("['home']['releases']")||apiProvider.includes('snapshot.home.releases'))failures.push('Snapshot genérico não pode reintroduzir releases fora da integração Spotify.')
const contentDomain=await read('src/features/site-manager/homeContentSectionConfiguration.ts')
requireTokens('homeContentSectionConfiguration.ts',contentDomain,["'lancamentos':20","const spotify=sectionId==='lancamentos'","homeSelectionMode:spotify?'automatic'","homeSortMode:spotify?'provider'"])

const listingTemplate=await read('src/features/editorial/components/EditorialListingPage.tsx')
requireTokens('EditorialListingPage.tsx',listingTemplate,['editorialReadModel.listPageContents(page.id)','editorialReadModel.searchPublicContents(searchQuery)','EditorialListingPage',"useSectionConfiguration(page.id,'editorial-hero'","useSectionConfiguration('editorial-template','editorial-template'",'editorial-page-hero','hero.imageUrl','hero.eyebrow','hero.title','hero.description'])
if(listingTemplate.includes("page.slug==='noticias'")||listingTemplate.includes("page.slug === 'noticias'"))failures.push('Template editorial não pode decidir comportamento pelo slug noticias.')
const contentTemplate=await read('src/features/editorial/components/EditorialContentPage.tsx')
requireTokens('EditorialContentPage.tsx',contentTemplate,['EditorialContentPage','to={`/${page.slug}`}','content.body.map'])

const portalApp=await read('src/app/PortalApp.tsx')
requireTokens('PortalApp.tsx',portalApp,['renderPublicSpecialPage','<EditorialListingPage page={page}/>','<EditorialContentPage page={page} content={content}/>'])
const specialRegistry=await read('src/app/publicSpecialPageRegistry.tsx')
requireTokens('publicSpecialPageRegistry.tsx',specialRegistry,['SPECIAL_LAYOUT_PAGE_SLUGS','sobre:page=><SobrePage page={page}/>','colabore:()=> <ColaborePage/>','contato:page=><ContatoPage page={page}/>'])

const formRenderer=await read('src/features/site-manager/forms/SiteFormRenderer.tsx')
requireTokens('forms/SiteFormRenderer.tsx',formRenderer,['form.fields','form.consents','onSubmit','mode===\'preview\'','acceptedConsentIds','fieldKey:string;file:File','files:SiteFormFile[]'])
const formEditor=await read('src/features/site-manager/pages/SiteFormEditorPage.tsx')
requireTokens('SiteFormEditorPage.tsx',formEditor,['PREVIEW EM TEMPO REAL','SiteFormRenderer','resolveSiteFormOptionSets','formDraftRepository.get','formDraftRepository.save','Salvar rascunho','getAdminSiteForm','saveAdminSiteForm','publishAdminSiteForm'])
const colabore=await read('src/pages/colabore/ColaborePage.tsx')
requireTokens('ColaborePage.tsx',colabore,['SiteFormRenderer','resolveSiteFormOptionSets','submitSiteForm','mode="public"'])
const formDraftRepository=await read('src/features/site-manager/forms/draftRepository.ts')
requireTokens('forms/draftRepository.ts',formDraftRepository,["status:'draft'","source:'custom'"])
const forms=await read('src/features/site-manager/pages/SiteFormsPage.tsx')
requireTokens('SiteFormsPage.tsx',forms,['Novo formulário','Duplicar','formDraftRepository.create','formDraftRepository.duplicate','formDraftRepository.remove','createAdminSiteForm','deleteAdminSiteForm'])

const contents=await read('src/features/site-manager/pages/SiteContentsPage.tsx')
requireTokens('SiteContentsPage.tsx',contents,['Novo conteúdo','contentDraftRepository.create','contentDraftRepository.remove','createAdminEditorialContent','Colaborações recebidas'])
const contentEditor=await read('src/features/site-manager/pages/SiteContentEditorPage.tsx')
requireTokens('SiteContentEditorPage.tsx',contentEditor,['getAdminEditorialContent','updateAdminEditorialContent','deleteAdminEditorialContent','contentDraftRepository.save','Salvar alterações','PREVIEW DO CONTEÚDO','SiteMediaPicker','Escolher da biblioteca'])
const mediaPicker=await read('src/features/site-manager/components/SiteMediaPicker.tsx')
requireTokens('SiteMediaPicker.tsx',mediaPicker,['mediaRepository.list','Selecionar imagem de capa',"item.type.startsWith('image/')",'onSelect(item)'])
const contentDraftRepository=await read('src/features/site-manager/contentDraftRepository.ts')
requireTokens('contentDraftRepository.ts',contentDraftRepository,["status:'draft'",'active:false','noIndex:true'])
const editorialAdminClient=await read('src/features/editorial/adminClient.ts')
requireTokens('editorial/adminClient.ts',editorialAdminClient,['getAdminEditorialContent','createAdminEditorialContent','updateAdminEditorialContent','deleteAdminEditorialContent'])

const media=await read('src/features/site-manager/pages/SiteMediaPage.tsx')
requireTokens('SiteMediaPage.tsx',media,['mediaRepository.list','mediaRepository.upload','mediaRepository.remove','Biblioteca persistente conectada','Storage persistente'])
const mediaRepository=await read('src/features/site-manager/mediaRepository.ts')
requireTokens('mediaRepository.ts',mediaRepository,['adminApiBase','/api/editorial/media','new ApiMediaRepository','new ReadOnlyMediaRepository'])
const readModel=await read('src/features/site-manager/readModel.ts')
requireTokens('readModel.ts',readModel,['getRuntimeDataProvider().editorial.media()'])

const mediaKit=await read('src/features/site-manager/pages/MediaKitPage.tsx')
requireTokens('MediaKitPage.tsx',mediaKit,['mediaKitRepository.read','mediaKitRepository.save','mediaKitRepository.reset','mediaKitRepository.publish','isMediaKitPersistenceConfigured','Salvar rascunho','Publicar','Mídia Kit versionado e persistente'])
const mediaKitRepository=await read('src/features/site-manager/mediaKitRepository.ts')
requireTokens('mediaKitRepository.ts',mediaKitRepository,['adminApiBase','/api/media-kit','new ApiMediaKitRepository','new LocalMediaKitRepository',"status:'draft'"])
const editorialModel=await read('src/features/editorial/model.ts')
requireTokens('editorial/model.ts',editorialModel,['SPECIAL_LAYOUT_PAGE_SLUGS','isPublishedPage','isSpecialLayoutPage','isPublicEditorialPage','export const isPublicPage=isPublicEditorialPage'])

if(failures.length){console.error('Falha na arquitetura do módulo Site:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Site module architecture OK — workbench canônico compartilhado e Lançamentos com Spotify como fonte única, sem fallback mock concorrente')