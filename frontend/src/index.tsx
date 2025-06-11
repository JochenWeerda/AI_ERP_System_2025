import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Stelle sicher, dass die containerisierten Module geladen werden können
if (!window.customElements) {
  console.warn('Custom Elements werden von diesem Browser nicht unterstützt. Die ERP-Module könnten möglicherweise nicht korrekt funktionieren.');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance-Messung
reportWebVitals(); 