import { defineConfig } from 'vite';
import * as path from "path";
import react from '@vitejs/plugin-react'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), 
    svgLoader({
      defaultImport: 'raw'
    })
  ],
  server: {
    watch: {
      usePolling: true
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' // or "modern"
      }
    }
  },
  resolve: {
    alias: {
    "root": path.resolve(__dirname, "./src"),
  },
},
})
