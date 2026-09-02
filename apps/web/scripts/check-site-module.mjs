import {access,readFile} from 'node:fs/promises'
import {constants} from 'node:fs'

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const exists=async path=>{try{await access(new URL(`../${path}`,import.meta.url),constants.F_OK);return true}catch{return false}}
const failures=[]
const requireTokens=(path,source,tokens)=>{for(const token of tokens)if(!source.includes(token))failures.push(`${path} deve preservar: ${token}`)}

const requiredFiles=[
  'src/features/site-manager/pageRepository.ts','src/features/site-manager/contentDraftRepository.ts','src/features/site-manager/mediaRepository.ts','src/features/site-manager/mediaKitRepository.ts','src/features/site-manager/mediaKitDomain.ts','src/features/site-manager/sectionConfiguration.ts','src/features/site-manager/useSectionConfiguration.ts','src/features/site-manager/components/SiteMediaPicker.tsx','src/features/site-manager/forms/draftRepository.ts','src/features/site-manager/forms/SiteFormRenderer.tsx','src/features/site-manager/forms/runtimeOptions.ts','src/features/site-manager/pages/SiteSectionsPage.tsx','src/features/site-manager/pages/SectionConfigurationPage.tsx','src/features/site-manager/pages/SiteContentEditorPage.tsx','src/features/site-manager/pages/SiteFormEditorPage.tsx','src/features/site-manager/pages/SiteFormsPage.tsx','src/features/site-manager/pages/SiteMediaPage.tsx','src/features/site-manager/pages/MediaKitPage.tsx','src/features/editorial/adminClient.ts','src/features/editorial/components/EditorialListingPage.tsx','src/features/editorial/components/EditorialContentPage.tsx','src/app/publicSpecialPageRegistry.tsx','src/pages/sobre/SobrePage.tsx','src/pages/contato/ContatoPage.tsx',
]
for(const path of requiredFiles)if(!(await exists(path)))failures.push(`Módulo Site exige ${path}.`)

const routes=await read('src/features/site-manager/SiteManagerRoutes.tsx')
requireTokens('SiteManagerRoutes.tsx',routes,[
  'path="paginas/:pageId/secoes/:sectionId" element={<SectionConfigurationPage/>}',
  'path="conteudos/:contentId" element={<SiteContentEditorPage/>}',
  'path="conteudos/colaboracoes" element={<SiteCollaborationsPage/>}',
  'path="formularios/:formId" element={<SiteFormEditorPage/>}',
  'path="midia" element={<SiteMediaPage/>}',
  'path="midia-kit" element={<MediaKitPage/>}',
  'path="configuracoes" element={<Navigate to="/app/settings" replace/>}',
])

const pages=await read('src/features/site-manager/pages/SiteSectionsPage.tsx')
requireTokens('SiteSectionsPage.tsx',pages,[
  'isSpecialLayoutPage','isPublishedPage','EDITORIAL_PAGE_SECTION_DEFINITIONS','HOME_SECTION_DEFINITIONS',
  'Criar página','Editar','Excluir','RESERVED_PAGE_SLUGS','to="/app/settings"',
  'createAdminEditorialPage','updateAdminEditorialPage','deleteAdminEditorialPage',
  '/app/site/paginas/${encodeURIComponent(selected.id)}/secoes/${encodeURIComponent(section.id)}','Configurar',
  'Estrutura de ${selected.title}','Configurações globais do site','pageSections.length',
  "title={isEditorialLayout?'Estrutura editorial compartilhada':'Estrutura própria da página'}",
  "description={isEditorialLayout?'Esta página herda a composição editorial de Notícias. A Hero continua configurável individualmente.':'Organize e configure as seções próprias desta página.'}",
])
if(pages.includes('section.target&&'))failures.push('Páginas não pode condicionar Configurar a target manual; toda seção deve ser configurável.')
if(pages.includes('CUSTOM_LAYOUT_SLUGS'))failures.push('Páginas não pode duplicar a classificação de layouts especiais; use isSpecialLayoutPage do domínio editorial.')
if(pages.includes('to="/app/site/configuracoes"'))failures.push('Páginas não pode reintroduzir identidade global dentro do módulo Site.')
if(pages.includes('<span>ESTRUTURA</span>'))failures.push('Páginas não deve reintroduzir a coluna redundante Estrutura na lista de seções.')
if(pages.includes('Padrão de configuração')||pages.includes('Regra de layout')||pages.includes('Modo de desenvolvimento liberado'))failures.push('Páginas não deve reintroduzir avisos permanentes que competem com a hierarquia principal.')

const sectionModel=await read('src/features/site-manager/sectionConfiguration.ts')
requireTokens('sectionConfiguration.ts',sectionModel,['HOME_SECTION_DEFINITIONS','EDITORIAL_PAGE_SECTION_DEFINITIONS','EDITORIAL_SECTION_DEFINITION','readSectionConfiguration','writeSectionConfiguration','resetSectionConfiguration',"id:'hero'","id:'em-destaque'","id:'mais-lidas'","id:'ultimas-noticias'","id:'publicidade-lateral'","id:'em-alta'","id:'anuncie-aqui'","id:'lancamentos'","id:'agenda'","id:'editorial-hero'","id:'editorial-template'","kind:'standard-hero'","kind:'editorial'"])
const sectionEditor=await read('src/features/site-manager/pages/SectionConfigurationPage.tsx')
requireTokens('SectionConfigurationPage.tsx',sectionEditor,['HeroEditor','PREVIEW AO VIVO','section-config-workbench','readSectionConfiguration','writeSectionConfiguration','StandardPreview','homeReadModel','EDITORIAL_PAGE_SECTION_DEFINITIONS',"sectionId==='editorial-hero'","configOwnerId=sectionId==='editorial-template'?'editorial-template':pageId",'definition.kind===\'featured\'','definition.kind===\'ranking\'','definition.kind===\'latest\'','definition.kind===\'trending\'','definition.kind===\'releases\'','definition.kind===\'agenda\'','definition.kind===\'ad\'','definition.kind===\'cta\'','definition.kind===\'editorial\'','definition.kind===\'standard-hero\''])

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
requireTokens('SiteFormRenderer.tsx',formRenderer,['form.fields','form.consents','onSubmit','mode===\'preview\'','acceptedConsentIds','fieldKey:string;file:File','files:SiteFormFile[]'])
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
console.log('Site module architecture OK — hierarquia de Páginas + herança editorial validadas')
