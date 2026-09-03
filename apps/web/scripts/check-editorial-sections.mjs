import {access,readFile} from 'node:fs/promises'
import {constants} from 'node:fs'

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const exists=async path=>{try{await access(new URL(`../${path}`,import.meta.url),constants.F_OK);return true}catch{return false}}
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
  'ContentSidebarLayout',
  'PublicAdvertisementModule',
  'placement="editorial"',
  'PublicMostReadModule',
  'SpotifyReleasesSection',
  'variant="sidebar"',
  'pl-editorial-card-grid',
  'PageHero configuration={hero} variant="editorial"',
  'new URLSearchParams(location.search)',
])
for(const legacy of ["import '../../../styles/editorial-listing-layout.css'",'editorial-content-layout','editorial-advertising-sidebar','editorial-advertising-card','advertising.imageUrl']){
  if(listing.includes(legacy))failures.push(`EditorialListingPage.tsx não pode reintroduzir implementação editorial paralela: ${legacy}`)
}

const sharedModules=await read('src/shared/public/PublicEditorialModules.tsx')
requireTokens('PublicEditorialModules.tsx',sharedModules,[
  'export function PublicAdvertisementModule',
  "withAdvertisingSectionLayout(configuration,'publicidade-lateral')",
  'advertisingResponsiveCssVariables',
  'configured.imageUrl',
  'data-ad-placement={placement}',
  'pl-home-sidebar-ad-image',
  'AdvertisingAreaLink',
  'export function PublicMostReadModule',
])

const architecture=await read('src/shared/public/PublicPageArchitecture.tsx')
requireTokens('PublicPageArchitecture.tsx',architecture,[
  'export function PageShell',
  'export function PageHero',
  'export function ContentSidebarLayout',
  'pl-content-sidebar-layout',
  "sidebar?'has-sidebar':'without-sidebar'",
])

const architectureCss=await read('src/styles/public-page-architecture.css')
requireTokens('public-page-architecture.css',architectureCss,[
  '.pl-content-sidebar-layout.has-sidebar',
  '.pl-secondary-content',
  '.pl-editorial-card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))',
  '@media(max-width:980px)',
  '.pl-editorial-card-grid,.pl-related-grid{grid-template-columns:repeat(2,minmax(0,1fr))}',
  '@media(max-width:600px)',
  '.pl-editorial-card-grid,.pl-related-grid{grid-template-columns:1fr}',
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

for(const removed of [
  'src/pages/article/styles/article-page.css',
  'src/pages/article/styles/article-hero-shared.css',
  'src/pages/article/styles/article-route-fix.css',
  'src/pages/noticias/styles/news-reference-page.css',
  'src/pages/noticias/styles/news-hero-reference.css',
])if(await exists(removed))failures.push(`Legado público removido não pode retornar: ${removed}`)

if(failures.length){console.error('Falha no contrato editorial configurável:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Editorial sections OK — arquitetura global, sidebar compartilhada, publicidade configurável e regressões legadas certificados')
