import {createServer} from 'node:http'
import {handleRequest} from './http.js'
import {handleAgenticRequest} from './agenticHttp.js'
import {handleAgendaRequest} from './agendaHttp.js'
import {handleAnalyticsRequest} from './analyticsHttp.js'
import {handleCrmRequest} from './crmHttp.js'
import {handleIntegrationProviderRequest} from './integrationProviderHttp.js'
import {handleNewsletterRequest} from './newsletterHttp.js'
import {handlePageSectionRequest} from './pageSectionHttp.js'
import {handleSectionConfigurationRequest} from './sectionConfigurationHttp.js'
import {handleSpotifyReleaseRequest} from './spotifyReleaseHttp.js'

const port=Number(process.env.PORT||8787)
const server=createServer((req,res)=>{
  void (async()=>{
    if(await handleAgenticRequest(req,res))return
    if(await handleAgendaRequest(req,res))return
    if(await handleAnalyticsRequest(req,res))return
    if(await handleCrmRequest(req,res))return
    if(await handleIntegrationProviderRequest(req,res))return
    if(await handleNewsletterRequest(req,res))return
    if(await handleSpotifyReleaseRequest(req,res))return
    if(await handleSectionConfigurationRequest(req,res))return
    if(await handlePageSectionRequest(req,res))return
    await handleRequest(req,res)
  })()
})

server.listen(port,()=>console.log(`@portallander/api listening on http://127.0.0.1:${port}`))
