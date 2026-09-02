import Busboy from 'busboy'
import {HttpError} from './editorialService.js'

const DEFAULT_MAX_FILE_BYTES=25*1024*1024

export function parseMultipart(req,{maxFiles=5,maxFileBytes=Number(process.env.PORTAL_FORM_MAX_FILE_BYTES||DEFAULT_MAX_FILE_BYTES)}={}){
  return new Promise((resolve,reject)=>{
    let busboy
    try{busboy=Busboy({headers:req.headers,limits:{files:maxFiles,fileSize:maxFileBytes,fields:100,fieldSize:1024*1024}})}
    catch{reject(new HttpError(400,'Conteúdo multipart inválido.','FORM_MULTIPART_INVALID'));return}

    const fields={},files=[]
    let failed=false
    const fail=error=>{if(failed)return;failed=true;reject(error)}

    busboy.on('field',(name,value)=>{if(!failed)fields[name]=value})
    busboy.on('file',(fieldName,stream,info)=>{
      const chunks=[]
      let size=0,limited=false
      stream.on('limit',()=>{limited=true;fail(new HttpError(413,`O arquivo ${info.filename||'enviado'} excede o limite permitido.`,'FORM_FILE_TOO_LARGE'))})
      stream.on('data',chunk=>{size+=chunk.length;if(!limited)chunks.push(chunk)})
      stream.on('end',()=>{if(!failed&&!limited&&size>0)files.push({fieldName,filename:info.filename||'arquivo',mimeType:info.mimeType||'application/octet-stream',encoding:info.encoding||'7bit',size,buffer:Buffer.concat(chunks)})})
    })
    busboy.on('filesLimit',()=>fail(new HttpError(413,'Quantidade de anexos excede o limite permitido.','FORM_TOO_MANY_FILES')))
    busboy.on('fieldsLimit',()=>fail(new HttpError(413,'Quantidade de campos excede o limite permitido.','FORM_TOO_MANY_FIELDS')))
    busboy.on('error',()=>fail(new HttpError(400,'Não foi possível processar os dados enviados.','FORM_MULTIPART_INVALID')))
    busboy.on('finish',()=>{if(!failed)resolve({fields,files})})
    req.pipe(busboy)
  })
}
