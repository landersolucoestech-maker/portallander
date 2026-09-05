import {createHash} from 'node:crypto'

const clean=value=>String(value??'').trim()
const fold=value=>clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()

export const MUSIC_TERMS=Object.freeze([
  'música','mercado musical','indústria musical','artista','cantor','cantora','rapper','funk','trap',
  'gravadora','selo','distribuidora','editora musical','streaming','spotify','youtube','tiktok','deezer',
  'direitos autorais','royalties','show','festival','turnê','lançamento','álbum','single','playlist',
  'charts','billboard','tecnologia musical','ia e música','inteligência artificial música','fonográfica',
  'fonografica','compositor','compositora','produtor musical','produtora musical'
])

const CATEGORY_RULES=Object.freeze([
  ['Direitos Autorais',['direitos autorais','royalties','ecad','ubc','abramus','compositor']],
  ['Lançamentos',['lançamento','album','álbum','single','ep','playlist']],
  ['Shows / Festivais',['show','festival','turnê','turne','tour']],
  ['Tecnologia',['tecnologia','inteligência artificial','inteligencia artificial','ia ','streaming','plataforma']],
  ['Negócios',['negócio','negocio','gravadora','distribuidora','editora musical','mercado','receita','faturamento']],
  ['Charts / Rankings',['chart','ranking','billboard','top 100','top 200']],
  ['Oportunidades',['edital','oportunidade','inscrição','inscricao','bolsa','vaga','seleção','selecao']],
  ['Artistas',['artista','cantor','cantora','rapper','banda','dupla']]
])

export function normalizeTitle(value){
  return fold(value).replace(/[“”"'’`´]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ')
}

export function titleHash(value){
  return createHash('sha256').update(normalizeTitle(value)).digest('hex')
}

function tokenSet(value){return new Set(normalizeTitle(value).split(' ').filter(token=>token.length>2))}

export function titleSimilarity(a,b){
  const left=tokenSet(a),right=tokenSet(b)
  if(!left.size||!right.size)return 0
  let intersection=0
  for(const token of left)if(right.has(token))intersection+=1
  return intersection/(left.size+right.size-intersection)
}

export function normalizeExternalUrl(value){
  const raw=clean(value)
  if(!raw)return ''
  try{
    const url=new URL(raw)
    if(!['http:','https:'].includes(url.protocol))return ''
    url.hash=''
    for(const key of [...url.searchParams.keys()]){
      const lower=key.toLowerCase()
      if(lower.startsWith('utm_')||['fbclid','gclid','mc_cid','mc_eid','ref','ref_src'].includes(lower))url.searchParams.delete(key)
    }
    url.hostname=url.hostname.toLowerCase()
    if((url.protocol==='https:'&&url.port==='443')||(url.protocol==='http:'&&url.port==='80'))url.port=''
    url.pathname=url.pathname.replace(/\/+$/,'')||'/'
    url.searchParams.sort()
    return url.toString()
  }catch{return ''}
}

export function classifyCandidate(item={},source={}){
  const text=fold(`${item.title||''} ${item.description||''}`)
  for(const [category,terms] of CATEGORY_RULES)if(terms.some(term=>text.includes(fold(term))))return category
  return clean(source.category)||'Atualidades'
}

export function relevanceScore(item={},source={},now=new Date()){
  const text=fold(`${item.title||''} ${item.description||''}`)
  let score=0
  const hits=MUSIC_TERMS.filter(term=>text.includes(fold(term))).length
  score+=Math.min(42,hits*7)
  if(/\bbrasil\b|\bbrasileir[oa]s?\b|\bbrazil\b/.test(text))score+=10
  if(clean(source.country).toUpperCase()==='BR')score+=6
  if(['official_source','rss'].includes(clean(source.provider))&&clean(source.sourceType)==='official')score+=8
  if(clean(source.category))score+=4
  if(clean(source.provider)==='gdelt')score+=3
  const momentum=Number(item.metadata?.momentumScore||0)
  if(clean(source.provider)==='youtube'&&Number.isFinite(momentum))score+=Math.min(12,Math.max(0,Math.round(momentum)))
  const published=item.publishedAt?new Date(item.publishedAt):null
  if(published&&!Number.isNaN(published.getTime())){
    const ageHours=Math.max(0,(now.getTime()-published.getTime())/3_600_000)
    if(ageHours<=24)score+=12
    else if(ageHours<=72)score+=8
    else if(ageHours<=168)score+=4
  }
  return Math.max(0,Math.min(100,score))
}

export function suggestedTags(item={},source={}){
  const text=fold(`${item.title||''} ${item.description||''}`),tags=[]
  for(const term of MUSIC_TERMS)if(text.includes(fold(term)))tags.push(term)
  if(clean(source.category))tags.push(clean(source.category))
  return [...new Set(tags)].slice(0,12)
}
