import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({mode})=>{
  const env=loadEnv(mode,'.','')
  const configuredBase=String(env.VITE_PUBLIC_BASE||'/portallander/').trim()||'/'
  const publicBase=configuredBase.startsWith('/')?configuredBase:`/${configuredBase}`

  return {
    plugins:[react()],
    base:publicBase.endsWith('/')?publicBase:`${publicBase}/`,
    build:{
      rolldownOptions:{
        output:{
          codeSplitting:true,
        },
      },
    },
  }
})
