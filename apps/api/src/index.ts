import {createServer} from 'node:http'
import {handleRequest} from './http.js'
import {handlePageSectionRequest} from './pageSectionHttp.js'

const port=Number(process.env.PORT||8787)
const server=createServer((req,res)=>{
  void (async()=>{
    if(await handlePageSectionRequest(req,res))return
    await handleRequest(req,res)
  })()
})

server.listen(port,()=>console.log(`@portallander/api listening on http://127.0.0.1:${port}`))
