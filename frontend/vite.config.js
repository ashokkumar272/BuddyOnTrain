import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // This allows external connections from any IP
    port: 5173,
    strictPort: true, // Fail if port is already in use
    cors: true // Enable CORS for development
  }
})
