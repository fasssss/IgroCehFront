import { defineConfig } from 'vite';
import * as path from "path";
import react from '@vitejs/plugin-react'
import svgLoader from 'vite-svg-loader'
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), 
    svgLoader({
      defaultImport: 'raw'
    }),
  ],
  server: {
    host: "0.0.0.0",
    watch: {
      usePolling: true
    },
    // NOTE: hmr for development purposes only
    // hmr: {
    //   port: 6436,

    // },
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
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
