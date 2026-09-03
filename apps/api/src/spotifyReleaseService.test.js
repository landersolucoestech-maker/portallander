import assert from 'node:assert/strict'
import test from 'node:test'
import {normalizeSpotifyPlaylistItem,parseSpotifyPlaylistId} from './spotifyReleaseService.js'

test('playlist parser accepts stable Spotify identifiers and canonical URLs',()=>{
  assert.equal(parseSpotifyPlaylistId('37i9dQZF1DXcBWIGoYBM5M'),'37i9dQZF1DXcBWIGoYBM5M')
  assert.equal(parseSpotifyPlaylistId('spotify:playlist:37i9dQZF1DXcBWIGoYBM5M'),'37i9dQZF1DXcBWIGoYBM5M')
  assert.equal(parseSpotifyPlaylistId('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc'),'37i9dQZF1DXcBWIGoYBM5M')
})

test('playlist parser rejects arbitrary URLs',()=>{
  assert.throws(()=>parseSpotifyPlaylistId('https://example.com/playlist/abc'),error=>error?.code==='SPOTIFY_PLAYLIST_INVALID')
})

test('normalization preserves playlist order and official Spotify URL',()=>{
  const item=normalizeSpotifyPlaylistItem({added_at:'2026-09-01T10:00:00Z',item:{id:'track-1',type:'track',is_local:false,name:'Faixa',duration_ms:123000,explicit:false,external_urls:{spotify:'https://open.spotify.com/track/track-1'},artists:[{name:'Artista A'},{name:'Artista B'}],album:{name:'Álbum',images:[{url:'https://i.scdn.co/image/cover'}]}}},4)
  assert.deepEqual(item,{id:'track-1',position:4,title:'Faixa',artists:['Artista A','Artista B'],artistLabel:'Artista A, Artista B',albumName:'Álbum',coverUrl:'https://i.scdn.co/image/cover',spotifyUrl:'https://open.spotify.com/track/track-1',durationMs:123000,explicit:false,addedAt:'2026-09-01T10:00:00Z'})
})

test('normalization skips local or incomplete tracks',()=>{
  assert.equal(normalizeSpotifyPlaylistItem({item:{id:'x',type:'track',is_local:true,name:'Local',external_urls:{spotify:'https://open.spotify.com/track/x'}}},0),null)
  assert.equal(normalizeSpotifyPlaylistItem({item:{id:'x',type:'track',is_local:false,name:'Sem URL',external_urls:{}}},0),null)
})
