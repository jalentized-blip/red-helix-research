// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    // Allow the specific Web3Modal / WalletConnect host pattern
    // You can use a wildcard for flexibility (e.g., all *.modal.host subdomains)
    allowedHosts: [
      'localhost',
      '.modal.host',              // This wildcard allows any subdomain like ta-01kle...modal.host
      // Or be more specific if you prefer: 'ta-01kle36xxa65pnpxcyt76gv-5173.wo-uewsmsb81k88foxac226b.w.modal.host'
    ],
    
    // Optional: If you're also running on a custom host or Docker, add those too
    // host: '0.0.0.0',  // Uncomment if you need to access from network / Docker
  },

  // If the error mentions "preview.allowedHosts" instead (happens in some cases when previewing builds)
  preview: {
    allowedHosts: [
      '.modal.host',
    ],
  },
})