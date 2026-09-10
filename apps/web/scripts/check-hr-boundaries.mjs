import {readFile} from 'node:fs/promises'
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8')
const failures=[]
const requireTokens=(path,source,tokens)=>{for(const token of tokens)if(!source.includes(token))failures.push(`${path} deve preservar: ${token}`)}
const forbidTokens=(path,source,tokens)=>{for(const token of tokens)if(source.includes(token))failures.push(`${path} não pode reintroduzir persistência/autoria local autenticada: ${token}`)}
const page=await read('src/modules/hr/HRPage.tsx'),hooks=await read('src/modules/hr/hooks.ts'),client=await read('src/modules/hr/adminClient.ts')
requireTokens('HRPage.tsx',page,['useHrState','useSaveEmployee','useSavePayroll','useSaveLeave','Upload de documentos ainda não disponível neste ambiente.'])
requireTokens('rh/hooks.ts',hooks,['hrAdminClient',"status==='authenticated'?'api':'development'",'useQuery','useMutation'])
requireTokens('rh/adminClient.ts',client,['/api/hr/state','/api/hr/employees','/api/hr/payroll','/api/hr/leaves',"credentials:'include'"])
forbidTokens('HRPage.tsx',page,['hrRepository.','Admin Portal',"fileUrl:'#'",'approvedBy:e.target.value'])
if(failures.length){console.error('Falha nos boundaries de RH:');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('RH boundaries OK — authenticated mode usa API canônica; aprovação é server-side; upload sem storage está indisponível')
