import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente baseado no modo
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true
    },
    define: {
      // Expor variáveis de ambiente para o frontend
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      'process.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL),
      'process.env.VITE_ENVIRONMENT': JSON.stringify(env.VITE_ENVIRONMENT),
    }
  }
}) 