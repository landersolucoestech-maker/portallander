import {readFile} from 'node:fs/promises'

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const failures=[]
const requireTokens=(path,source,tokens)=>{for(const token of tokens)if(!source.includes(token))failures.push(`${path} deve preservar: ${token}`)}
const forbidTokens=(path,source,tokens)=>{for(const token of tokens)if(source.includes(token))failures.push(`${path} não pode reintroduzir persistência/integração local autenticada: ${token}`)}

const page=await read('src/features/chat/ChatPage.tsx')
const support=await read('src/features/chat/components/SupportCenterView.tsx')
const internal=await read('src/features/chat/components/InternalChatView.tsx')
const settings=await read('src/features/chat/ChatAutomationSettingsPage.tsx')
const hooks=await read('src/features/chat/hooks.ts')
const client=await read('src/features/chat/adminClient.ts')

requireTokens('ChatPage.tsx',page,['useChatState','useCreateSupportConversation'])
requireTokens('SupportCenterView.tsx',support,['useCreateLead','useCreateContact','useCreateAgendaEvent','Gravação de áudio ainda não disponível.','Teste de escalonamento indisponível enquanto não houver runtime configurado.'])
requireTokens('InternalChatView.tsx',internal,['useCreateInternalConversation','useSendInternalMessage'])
requireTokens('ChatAutomationSettingsPage.tsx',settings,['useChatState','useSaveChatAutomation','Runtime de automação não configurado.'])
requireTokens('chat/hooks.ts',hooks,['chatAdminClient',"status==='authenticated'?'api':'development'",'useQuery','useMutation'])
requireTokens('chat/adminClient.ts',client,['/api/chat/state','/api/chat/support','/api/chat/internal','/api/chat/automation',"credentials:'include'"])

for(const [path,source] of [['ChatPage.tsx',page],['SupportCenterView.tsx',support],['InternalChatView.tsx',internal],['ChatAutomationSettingsPage.tsx',settings]])forbidTokens(path,source,['chatRepository.'])
forbidTokens('SupportCenterView.tsx',support,['crmRepository.','agendaRepository.','MediaRecorder','audio-${','size:64000','Teste executado com as regras ativas.'])
forbidTokens('ChatAutomationSettingsPage.tsx',settings,['Configuração salva localmente.','Teste executado com as regras ativas.'])

if(failures.length){console.error('Falha nos boundaries do Chat:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('Chat boundaries OK — authenticated mode usa API canônica; features sem runtime permanecem honestamente indisponíveis')
