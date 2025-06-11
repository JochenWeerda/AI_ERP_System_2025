// Dies ist die Index-Datei der React-Anwendung.
// Da JSX verwendet wird, muss diese Datei als .jsx behandelt werden.
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';

// Fehlerbehandlung für die Anwendung
const handleError = (error) => {
  console.error('Anwendungsfehler:', error);
  // Zeige Fallback-Element an
  const fallbackContainer = document.querySelector('.fallback-container');
  if (fallbackContainer) {
    fallbackContainer.style.display = 'flex';
    const fallbackContent = fallbackContainer.querySelector('.fallback-content');
    if (fallbackContent) {
      fallbackContent.innerHTML = `
        <h1>Folkerts Landhandel ERP-System</h1>
        <p>Es ist ein Fehler aufgetreten:</p>
        <pre style="color: red; text-align: left; overflow: auto;">${error.message || 'Unbekannter Fehler'}</pre>
        <p>Bitte laden Sie die Seite neu oder kontaktieren Sie den Support.</p>
      `;
    }
  }
};

try {
  console.log('Versuche, React-App zu initialisieren...');
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('React wurde erfolgreich initialisiert');

  // Performance-Messung, falls benötigt
  reportWebVitals(console.log);
} catch (error) {
  handleError(error);
} 