import {access,readFile} from 'node:fs/promises'
import {constants} from 'node:fs'

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const exists=async path=>{try{await access(new URL(`../${path}`,import.meta.url),constants.F_OK);return true}catch{return false}}
const failures=[]
const requireTokens=(path,source,tokens)=>{for(const token of tokens)if(!source.includes(token))failures.push(`${path} deve preservar: ${token}`)}

const requiredFiles=[
  'src/features/site-manager/pageRepository.ts',
  'src/features/site-manager/contentDraftRepository.ts',
  'src/features/site-manager/mediaRepository.ts',
  'src/features/site-manager/mediaKitRepository.ts',
  'src/features/site-manager/mediaKitDomain.ts',
  'src/features/site-manager/forms/draftRepository.ts',
  'src/features/site-manager/forms/SiteFormRenderer.tsx',
  'src/features/site-manager/forms/runtimeOptions.ts',
  'src/features/site-manager/pages/SiteSectionsPage.tsx',
  'src/features/site-manager/pages/SiteContentEditorPage.tsx',
  'src/features/site-manager/pages/SiteFormEditorPage.tsx',
  'src/features/site-manager/pages/SiteFormsPage.tsx',
  'src/features/site-manager/pages/SiteMediaPage.tsx',
  'src/features/site-manager/pages/MediaKitPage.tsx',
  'src/features/editorial/components/EditorialListingPage.tsx',
  'src/features/editorial/components/EditorialContentPage.tsx',
  'src/app/publicSpecialPageRegistry.tsx',
  'src/pages/sobre/SobrePage.tsx',
  'src/pages/contato/ContatoPage.tsx',
]
for(const path of requiredFiles)if(!(await exists(path)))failures.push(`Módulo Site exige ${path}.`)

const routes=await read('src/features/site-manager/SiteManagerRoutes.tsx')
requireTokens('SiteManagerRoutes.tsx',routes,[
  'path="conteudos/:contentId" element={<SiteContentEditorPage/>}',
  'path="conteudos/colaboracoes" element={<SiteCollaborationsPage/>}',
  'path="formularios/:formId" element={<SiteFormEditorPage/>}',
  'path="midia" element={<SiteMediaPage/>}',
  'path="midia-kit" element={<MediaKitPage/>}',
  'path="configuracoes" element={<Navigate to="/app/settings" replace/>}',
])

const pages=await read('src/features/site-manager/pages/SiteSectionsPage.tsx')
requireTokens('SiteSectionsPage.tsx',pages,[
  'isSpecialLayoutPage',
  'isPublishedPage',
  "name:'Template editorial de Notícias'",
  'Páginas de conteúdo herdam o template de Notícias.',
  'Criar página',
  'Editar página',
  'Excluir página',
  'RESERVED_PAGE_SLUGS',
  'to="/app/settings"',
])
if(pages.includes('CUSTOM_LAYOUT_SLUGS'))failures.push('Páginas não pode duplicar a classificação de layouts especiais; use isSpecialLayoutPage do domínio editorial.')
if(pages.includes("to=\"/app/site/configuracoes\""))failures.push('Páginas não pode reintroduzir identidade global dentro do módulo Site.')

const listingTemplate=await read('src/features/editorial/components/EditorialListingPage.tsx')
requireTokens('EditorialListingPage.tsx',listingTemplate,['editorialReadModel.listPageContents(page.id)','editorialReadModel.searchPublicContents(searchQuery)','EditorialListingPage'])
if(listingTemplate.includes("page.slug==='noticias'")||listingTemplate.includes('page.slug === \'noticias\''))failures.push('Template editorial não pode decidir comportamento pelo slug noticias.')
const contentTemplate=await read('src/features/editorial/components/EditorialContentPage.tsx')
requireTokens('EditorialContentPage.tsx',contentTemplate,['EditorialContentPage','to={`/${page.slug}`}','content.body.map'])

const portalApp=await read('src/app/PortalApp.tsx')
requireTokens('PortalApp.tsx',portalApp,['renderPublicSpecialPage','<EditorialListingPage page={page}/>','<EditorialContentPage page={page} content={content}/>'])
const specialRegistry=await read('src/app/publicSpecialPageRegistry.tsx')
requireTokens('publicSpecialPageRegistry.tsx',specialRegistry,['SPECIAL_LAYOUT_PAGE_SLUGS','sobre:page=><SobrePage page={page}/>','colabore:()=> <ColaborePage/>','contato:page=><ContatoPage page={page}/>'])

const formRenderer=await read('src/features/site-manager/forms/SiteFormRenderer.tsx')
requireTokens('SiteFormRenderer.tsx',formRenderer,['form.fields','form.consents','onSubmit','mode===\'preview\'','acceptedConsentIds','fieldKey:string;file:File','files:SiteFormFile[]'])
const formEditor=await read('src/features/site-manager/pages/SiteFormEditorPage.tsx')
requireTokens('SiteFormEditorPage.tsx',formEditor,['PREVIEW EM TEMPO REAL','SiteFormRenderer','resolveSiteFormOptionSets','formDraftRepository.get','formDraftRepository.save','Salvar rascunho'])
const colabore=await read('src/pages/colabore/ColaborePage.tsx')
requireTokens('ColaborePage.tsx',colabore,['SiteFormRenderer','resolveSiteFormOptionSets','submitSiteForm','mode="public"'])
const formDraftRepository=await read('src/features/site-manager/forms/draftRepository.ts')
requireTokens('forms/draftRepository.ts',formDraftRepository,["status:'draft'","source:'custom'"])

const forms=await read('src/features/site-manager/pages/SiteFormsPage.tsx')
requireTokens('SiteFormsPage.tsx',forms,['Novo formulário','Duplicar','formDraftRepository.create','formDraftRepository.duplicate','formDraftRepository.remove'])

const contents=await read('src/features/site-manager/pages/SiteContentsPage.tsx')
requireTokens('SiteContentsPage.tsx',contents,['Novo conteúdo','contentDraftRepository.create','contentDraftRepository.remove','Colaborações recebidas'])

const contentEditor=await read('src/features/site-manager/pages/SiteContentEditorPage.tsx')
requireTokens('SiteContentEditorPage.tsx',contentEditor,['Salvar rascunho','contentDraftRepository.save','PREVIEW DO RASCUNHO'])
const contentDraftRepository=await read('src/features/site-manager/contentDraftRepository.ts')
requireTokens('contentDraftRepository.ts',contentDraftRepository,["status:'draft'",'active:false','noIndex:true'])

const media=await read('src/features/site-manager/pages/SiteMediaPage.tsx')
requireTokens('SiteMediaPage.tsx',media,['mediaRepository.list','Biblioteca conectada ao Data Provider','Biblioteca do Site'])
const readModel=await read('src/features/site-manager/readModel.ts')
requireTokens('readModel.ts',readModel,['getRuntimeDataProvider().editorial.media()'])

const mediaKit=await read('src/features/site-manager/pages/MediaKitPage.tsx')
requireTokens('MediaKitPage.tsx',mediaKit,['mediaKitRepository.read','mediaKitRepository.save','Salvar rascunho','Publicar'])
const mediaKitRepository=await read('src/features/site-manager/mediaKitRepository.ts')
requireTokens('mediaKitRepository.ts',mediaKitRepository,["status:'draft'"])

const editorialModel=await read('src/features/editorial/model.ts')
requireTokens('editorial/model.ts',editorialModel,['SPECIAL_LAYOUT_PAGE_SLUGS','isPublishedPage','isSpecialLayoutPage','isPublicEditorialPage','export const isPublicPage=isPublicEditorialPage'])

if(failures.length){console.error('Falha na arquitetura do módulo Site:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Site module architecture OK')