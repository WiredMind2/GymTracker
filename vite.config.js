import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/GymTracker/',
  server: {
    // Configure dev server to serve on /GymTracker/ path like production
    host: true,
    port: 5173,
    // This makes the dev server accessible at http://localhost:5173/GymTracker/
    // matching the production GitHub Pages URL structure
    // Note: You'll need to access http://localhost:5173/GymTracker/ during development
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
