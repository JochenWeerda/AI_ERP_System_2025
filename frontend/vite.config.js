import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Hört auf alle verfügbaren Netzwerkschnittstellen
    https: false, // auf false setzen, wenn keine Zertifikate vorhanden sind
    port: 3001,
    strictPort: false, // Auf false gesetzt, damit ein alternativer Port verwendet wird, falls 3001 belegt ist
    cors: true, // Erlaubt CORS für alle Ursprünge
    open: true, // Öffnet automatisch den Browser
    proxy: {
      // Proxy-Konfiguration für API-Anfragen
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Erweiterte Build-Konfiguration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // Hilft bei der Fehlerbehebung
    chunkSizeWarningLimit: 1000, // Erhöht die Warnschwelle für Chunk-Größen
  },
  
  // Warnung unterdrücken
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
  },
  
  // Devtools-Konfiguration
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  }
})
