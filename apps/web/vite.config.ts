import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const configuredBase=String(process.env.VITE_PUBLIC_BASE||'/portallander/').trim()||'/'
const publicBase=configuredBase.startsWith('/')?configuredBase:`/${configuredBase}`

export default defineConfig({
  plugins: [react()],
  base: publicBase.endsWith('/')?publicBase:`${publicBase}/`,
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: true,
      },
    },
  },
})
