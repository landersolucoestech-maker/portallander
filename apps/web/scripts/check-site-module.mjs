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
  'src/features/site-manager/pages/SiteSectionsPage.tsx',
  'src/features/site-manager/pages/SiteContentEditorPage.tsx',
  'src/features/site-manager/pages/SiteFormEditorPage.tsx',
  'src/features/site-manager/pages/SiteFormsPage.tsx',
  'src/features/site-manager/pages/SiteMediaPage.tsx',
  'src/features/site-manager/pages/MediaKitPage.tsx',
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
  "CUSTOM_LAYOUT_SLUGS=new Set(['','sobre','colabore','contato'])",
  "name:'Template editorial de Notícias'",
  'Páginas de conteúdo herdam o template de Notícias.',
  'Criar página',
  'Editar página',
  'Excluir página',
  'RESERVED_PAGE_SLUGS',
  'to="/app/settings"',
])
if(pages.includes("to=\"/app/site/configuracoes\""))failures.push('Páginas não pode reintroduzir identidade global dentro do módulo Site.')

const formEditor=await read('src/features/site-manager/pages/SiteFormEditorPage.tsx')
requireTokens('SiteFormEditorPage.tsx',formEditor,[
  'PREVIEW EM TEMPO REAL',
  'formDraftRepository.get',
  'formDraftRepository.save',
  'Salvar rascunho',
  "status:'draft'",
])

const forms=await read('src/features/site-manager/pages/SiteFormsPage.tsx')
requireTokens('SiteFormsPage.tsx',forms,['Novo formulário','Duplicar','formDraftRepository.create','formDraftRepository.duplicate','formDraftRepository.remove'])

const contents=await read('src/features/site-manager/pages/SiteContentsPage.tsx')
requireTokens('SiteContentsPage.tsx',contents,['Novo conteúdo','contentDraftRepository.create','contentDraftRepository.remove','Colaborações recebidas'])

const contentEditor=await read('src/features/site-manager/pages/SiteContentEditorPage.tsx')
requireTokens('SiteContentEditorPage.tsx',contentEditor,['Salvar rascunho','contentDraftRepository.save',"status:'draft'",'noIndex=true','PREVIEW DO RASCUNHO'])

const media=await read('src/features/site-manager/pages/SiteMediaPage.tsx')
requireTokens('SiteMediaPage.tsx',media,['mediaRepository.list','Biblioteca conectada ao Data Provider','Biblioteca do Site'])
const readModel=await read('src/features/site-manager/readModel.ts')
requireTokens('readModel.ts',readModel,['getRuntimeDataProvider().editorial.media()'])

const mediaKit=await read('src/features/site-manager/pages/MediaKitPage.tsx')
requireTokens('MediaKitPage.tsx',mediaKit,['mediaKitRepository.read','mediaKitRepository.save','Salvar rascunho','Publicar'])

const editorialModel=await read('src/features/editorial/model.ts')
requireTokens('editorial/model.ts',editorialModel,['isPublishedPage','isPublicEditorialPage','export const isPublicPage=isPublicEditorialPage'])

if(failures.length){console.error('Falha na arquitetura do módulo Site:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Site module architecture OK')
