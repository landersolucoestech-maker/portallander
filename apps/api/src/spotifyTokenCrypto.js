import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto'
import {HttpError} from './editorialService.js'

const ALGORITHM='aes-256-gcm'
const VERSION='v1'

function key(){
  const raw=String(process.env.SPOTIFY_TOKEN_ENCRYPTION_KEY||'').trim()
  if(!raw)throw new HttpError(503,'A criptografia da integração Spotify não está configurada.','SPOTIFY_NOT_CONFIGURED')
  return createHash('sha256').update(raw).digest()
}

export function encryptSpotifySecret(value){
  const plaintext=String(value||'')
  if(!plaintext)return ''
  const iv=randomBytes(12)
  const cipher=createCipheriv(ALGORITHM,key(),iv)
  const encrypted=Buffer.concat([cipher.update(plaintext,'utf8'),cipher.final()])
  const tag=cipher.getAuthTag()
  return [VERSION,iv.toString('base64url'),tag.toString('base64url'),encrypted.toString('base64url')].join('.')
}

export function decryptSpotifySecret(payload){
  const raw=String(payload||'')
  if(!raw)return ''
  const [version,ivRaw,tagRaw,cipherRaw]=raw.split('.')
  if(version!==VERSION||!ivRaw||!tagRaw||!cipherRaw)throw new HttpError(500,'Credencial Spotify armazenada em formato inválido.','SPOTIFY_TOKEN_INVALID')
  try{
    const decipher=createDecipheriv(ALGORITHM,key(),Buffer.from(ivRaw,'base64url'))
    decipher.setAuthTag(Buffer.from(tagRaw,'base64url'))
    return Buffer.concat([decipher.update(Buffer.from(cipherRaw,'base64url')),decipher.final()]).toString('utf8')
  }catch(error){
    if(error instanceof HttpError)throw error
    throw new HttpError(500,'Não foi possível descriptografar a credencial Spotify.','SPOTIFY_TOKEN_DECRYPT_FAILED')
  }
}
