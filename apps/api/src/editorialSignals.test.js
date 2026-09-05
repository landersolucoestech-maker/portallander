import test from 'node:test'
import assert from 'node:assert/strict'
import {classifyCandidate,normalizeExternalUrl,normalizeTitle,relevanceScore,titleHash,titleSimilarity} from './editorialSignals.js'

test('normaliza URL removendo tracking sem destruir parâmetros editoriais',()=>{
  assert.equal(normalizeExternalUrl('https://Example.com/noticia/?utm_source=x&id=7#top'),'https://example.com/noticia?id=7')
})
test('hash e normalização tratam acentos/casing',()=>{
  assert.equal(normalizeTitle('  Lançamento: ÁLBUM! '),'lancamento album')
  assert.equal(titleHash('Álbum novo'),titleHash('album NOVO'))
})
test('similaridade separa fatos diferentes e reconhece variação do mesmo título',()=>{
  assert.ok(titleSimilarity('Spotify anuncia nova ferramenta para artistas','Nova ferramenta para artistas é anunciada pelo Spotify')>=0.7)
  assert.ok(titleSimilarity('Festival confirma atrações em São Paulo','Gravadora divulga balanço anual')<0.3)
})
test('classificação e relevância são determinísticas e explicáveis',()=>{
  const item={title:'Mercado musical brasileiro cresce com streaming e royalties',description:'Brasil amplia receitas da indústria musical',publishedAt:new Date().toISOString()}
  const source={provider:'official_source',sourceType:'official',category:'Mercado Musical',country:'BR'}
  assert.equal(classifyCandidate(item,source),'Direitos Autorais')
  assert.ok(relevanceScore(item,source)>=50)
})
