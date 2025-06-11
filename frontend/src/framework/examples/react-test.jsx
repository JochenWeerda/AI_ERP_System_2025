/**
 * react-test.jsx
 * Beispiel für die Integration des OWL-Frameworks in React
 */
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// OWL-Framework importieren
import { initFramework, registerModule } from '../index.js';
import { ModuleLoader, useOwl } from '../utils/integration.js';
import ExampleModule from './ExampleModule.js';

// Framework initialisieren
initFramework({
  debug: process.env.NODE_ENV !== 'production',
  devTools: process.env.NODE_ENV !== 'production'
});

// Beispielmodul registrieren
registerModule('example-module', ExampleModule, {
  title: 'React Integration Test',
  description: 'Ein Beispiel für die Integration von OWL in React',
  showRetryButton: true,
  showFooter: true
});

/**
 * React-Komponente, die ein OWL-Modul rendert
 */
function ModuleContainer() {
  const [moduleId] = useState('example-module');
  const [config, setConfig] = useState({});
  const [logs, setLogs] = useState([]);
  
  // Log-Funktion
  const addLog = (message, type = 'info') => {
    setLogs(prevLogs => [
      ...prevLogs, 
      { message, type, timestamp: new Date().toLocaleTimeString() }
    ].slice(-10)); // Nur die letzten 10 Logs behalten
  };
  
  // Event-Handler für Modulaktionen
  const handleModuleAction = (action) => {
    console.log('Modul-Aktion:', action);
    addLog(`Aktion: ${action.action}`, 'info');
  };
  
  // Event-Handler für Fehler im Modul
  const handleModuleError = (error) => {
    console.error('Modul-Fehler:', error);
    addLog(`Fehler: ${error.error?.message || 'Unbekannter Fehler'}`, 'error');
  };
  
  // Event-Handler für Updates im Modul
  const handleModuleUpdate = (update) => {
    console.log('Modul-Update:', update);
    addLog(`Update: ${update.type}`, 'info');
  };
  
  return (
    <div className="module-test-container">
      <h2>OWL-Modul in React</h2>
      
      <div className="module-wrapper">
        <ModuleLoader 
          moduleId={moduleId}
          config={config}
          onAction={handleModuleAction}
          onError={handleModuleError}
          onUpdate={handleModuleUpdate}
          className="react-module"
        />
      </div>
      
      <div className="logs-panel">
        <h3>Modul-Logs</h3>
        <div className="logs-container">
          {logs.length === 0 ? (
            <p className="no-logs">Keine Logs vorhanden</p>
          ) : (
            <ul className="logs-list">
              {logs.map((log, index) => (
                <li key={index} className={`log-item ${log.type}`}>
                  <span className="log-time">[{log.timestamp}]</span> {log.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook-Beispiel-Komponente
 */
function HookExample() {
  const { containerRef, owlComponent } = useOwl(ExampleModule, {
    moduleId: 'hook-example',
    config: {
      title: 'Hook-Beispiel',
      description: 'Ein Beispiel für die Verwendung des useOwl-Hooks'
    }
  });
  
  const [componentMounted, setComponentMounted] = useState(false);
  
  useEffect(() => {
    if (owlComponent && !componentMounted) {
      console.log('OWL-Komponente gemountet:', owlComponent);
      setComponentMounted(true);
    }
  }, [owlComponent, componentMounted]);
  
  return (
    <div className="hook-example">
      <h2>useOwl Hook Beispiel</h2>
      <div ref={containerRef} className="owl-container"></div>
      
      {componentMounted && (
        <div className="hook-controls">
          <button 
            className="btn btn-primary" 
            onClick={() => owlComponent.store.dispatch('increment')}
          >
            Zähler erhöhen
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Haupt-App-Komponente
 */
function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>OWL-Framework React-Test</h1>
        <p>Integration von OWL-Modulen in React</p>
      </header>
      
      <main className="app-content">
        <div className="content-row">
          <div className="content-column">
            <ModuleContainer />
          </div>
          <div className="content-column">
            <HookExample />
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>OWL-Framework React-Integration Test</p>
      </footer>
    </div>
  );
}

// React-App rendern
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />); 