/**
 * Vite-Konfiguration für das ERP-Frontend
 * 
 * Diese Konfiguration wurde nach den Frontend-Development-Setup-Mustern optimiert,
 * um eine konsistente Entwicklungsumgebung zu gewährleisten und typische Probleme zu vermeiden.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Diese Konfiguration ist notwendig, um React korrekt zu laden
      include: '**/*.{jsx,tsx}',
      jsxImportSource: 'react',
      jsxRuntime: 'automatic',
      babel: {
        plugins: []
      }
    })
  ],
  
  // Verbesserte Alias-Konfiguration für Import-Pfade
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },

  // Server-Konfiguration
  server: {
    port: 5173,
    strictPort: false, // Fallback auf anderen Port, wenn 5173 belegt ist
    open: true, // Browser automatisch öffnen
    cors: true, // CORS für API-Anfragen aktivieren
    proxy: {
      // API-Proxy-Konfiguration für Backend-Anfragen
      '/api': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/v1': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/api/v1': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },

  // Build-Konfiguration
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2018', // Kompatibilität mit älteren Browsern
    terserOptions: {
      compress: {
        drop_console: true // Console-Ausgaben in Produktionsbuilds entfernen
      }
    }
  },

  // Optimierungen
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material'
    ]
  }
}); 
