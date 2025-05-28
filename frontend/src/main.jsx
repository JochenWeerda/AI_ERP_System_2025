import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'material-icons/iconfont/material-icons.css'

console.log('main.jsx wird ausgeführt')

const rootElement = document.getElementById('root')

if (rootElement) {
  console.log('Root-Element gefunden, starte Rendering')
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} else {
  console.error('Root-Element nicht gefunden!')
}
