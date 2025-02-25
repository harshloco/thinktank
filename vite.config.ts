import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split large libraries into separate chunks
            if (id.includes('firebase') || id.includes('recharts') || id.includes('framer-motion')) {
              return 'vendor';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 500, // increase chunk size warning limit
  },
  server: {
    proxy: {
      '/recaptcha/api/siteverify': {
        target: 'https://www.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/recaptcha/, '')
      }
    }
  }
})
