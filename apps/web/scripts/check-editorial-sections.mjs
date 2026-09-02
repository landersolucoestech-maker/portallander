import {readFile} from 'node:fs/promises'

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const failures=[]
const requireTokens=(path,source,tokens)=>{for(const token of tokens)if(!source.includes(token))failures.push(`${path} deve preservar: ${token}`)}

const sectionModel=await read('src/features/site-manager/sectionConfiguration.ts')
requireTokens('sectionConfiguration.ts',sectionModel,[
  "id:'editorial-hero'",
  "id:'editorial-summary'",
  "id:'editorial-ad'",
  "id:'editorial-template'",
  "id:'article-hero'",
  "id:'article-content'",
  "id:'article-tags'",
  'EDITORIAL_PAGE_SECTION_DEFINITIONS',
])

const pages=await read('src/features/site-manager/pages/SiteSectionsPage.tsx')
requireTokens('SiteSectionsPage.tsx',pages,[
  'isEditorialLayout?EDITORIAL_PAGE_SECTION_DEFINITIONS',
  '/app/site/paginas/${encodeURIComponent(selected.id)}/secoes/${encodeURIComponent(section.id)}',
  'Configurar',
])

const listing=await read('src/features/editorial/components/EditorialListingPage.tsx')
requireTokens('EditorialListingPage.tsx',listing,[
  "useSectionConfiguration(page.id,'editorial-ad'",
  "import '../../../styles/editorial-listing-layout.css'",
  'editorial-content-layout',
  'has-advertising',
  'editorial-advertising-sidebar',
  'editorial-advertising-card',
  'advertising.imageUrl',
  '<img className="editorial-advertising-image" src={advertising.imageUrl}',
])

const sectionEditor=await read('src/features/site-manager/pages/SectionConfigurationPage.tsx')
requireTokens('SectionConfigurationPage.tsx',sectionEditor,[
  "import {SectionMediaField} from '../components/SectionMediaField'",
  'imageKind&&<SectionMediaField',
  'value={config.imageUrl}',
  'onChange={imageUrl=>patch({imageUrl})}',
  "label={definition.kind==='ad'?'Arte da publicidade':'Imagem / mídia'}",
])

const mediaField=await read('src/features/site-manager/components/SectionMediaField.tsx')
requireTokens('SectionMediaField.tsx',mediaField,[
  'Carregar imagem',
  'Biblioteca',
  'SiteMediaPicker',
  'mediaRepository.upload',
  'fileToDevelopmentDataUrl',
])

const css=await read('src/styles/editorial-listing-layout.css')
requireTokens('editorial-listing-layout.css',css,[
  '.editorial-content-layout.has-advertising{grid-template-columns:minmax(0,1fr) minmax(260px,320px)}',
  '.editorial-advertising-sidebar',
  'position:sticky',
  '@media(max-width:980px)',
])

if(failures.length){console.error('Falha no contrato editorial configurável:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Editorial sections OK — seções pré-configuradas + publicidade lateral + upload de imagem validados')
