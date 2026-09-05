import {createServer} from 'node:http'
import {handleRequest} from './http.js'
import {handleAgenticRequest} from './agenticHttp.js'
import {handleAgendaRequest} from './agendaHttp.js'
import {handleAnalyticsRequest} from './analyticsHttp.js'
import {handleChatRequest} from './chatHttp.js'
import {handleCrmRequest} from './crmHttp.js'
import {handleEditorialIngestionRequest} from './editorialIngestionHttp.js'
import {handleFinanceRequest} from './financeHttp.js'
import {handleIntegrationProviderRequest} from './integrationProviderHttp.js'
import {handleNewsletterRequest} from './newsletterHttp.js'
import {handlePageSectionRequest} from './pageSectionHttp.js'
import {handleRhRequest} from './rhHttp.js'
import {handleSectionConfigurationRequest} from './sectionConfigurationHttp.js'
import {handleSettingsRequest} from './settingsHttp.js'
import {handleSpotifyReleaseRequest} from './spotifyReleaseHttp.js'

const port=Number(process.env.PORT||8787)
const server=createServer((req,res)=>{
  void (async()=>{
    if(await handleAgenticRequest(req,res))return
    if(await handleAgendaRequest(req,res))return
    if(await handleAnalyticsRequest(req,res))return
    if(await handleChatRequest(req,res))return
    if(await handleCrmRequest(req,res))return
    if(await handleEditorialIngestionRequest(req,res))return
    if(await handleFinanceRequest(req,res))return
    if(await handleIntegrationProviderRequest(req,res))return
    if(await handleNewsletterRequest(req,res))return
    if(await handleRhRequest(req,res))return
    if(await handleSettingsRequest(req,res))return
    if(await handleSpotifyReleaseRequest(req,res))return
    if(await handleSectionConfigurationRequest(req,res))return
    if(await handlePageSectionRequest(req,res))return
    await handleRequest(req,res)
  })()
})

server.listen(port,()=>console.log(`@portallander/api listening on http://127.0.0.1:${port}`))
