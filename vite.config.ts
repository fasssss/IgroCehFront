import { defineConfig } from 'vite';
import * as path from "path";
import react from '@vitejs/plugin-react'
import fs from 'fs';

// certificate for local https, paths can be overridden with DEV_CERT_PATH / DEV_CERT_KEY_PATH
const certPath = process.env.DEV_CERT_PATH ?? './igroceh.xyz+5.pem';
const certKeyPath = process.env.DEV_CERT_KEY_PATH ?? './igroceh.xyz+5-key.pem';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    watch: {
      usePolling: true
    },
    // NOTE: hmr for development purposes only
    // hmr: {
    //   port: 6436,

    // },
    // certificates are needed only to serve the app (dev and preview), "vite build" works without them
    https: command === 'serve' ? {
      key: fs.readFileSync(certKeyPath),
      cert: fs.readFileSync(certPath),
    } : undefined
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
}))
