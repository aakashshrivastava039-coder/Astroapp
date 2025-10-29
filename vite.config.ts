import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Vercel and other hosting platforms inject environment variables directly.
    // We just need to ensure Vite makes them available in the client-side code.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
