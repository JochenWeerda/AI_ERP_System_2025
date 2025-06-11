/**
 * ReactIntegration.js
 * Beispiel für die Integration von OWL-Modulen in React
 */
import React, { useState, useEffect } from 'react';
import { ModuleLoader, useOwl } from '../utils/integration';
import { registerModule } from '../core/ModuleRegistry';
import { initFramework } from '../index';
import ExampleModule from './ExampleModule';

/**
 * Initialisiert das Framework und registriert die Module
 */
initFramework({
  debug: process.env.NODE_ENV !== 'production',
  devTools: process.env.NODE_ENV !== 'production'
});

// Beispielmodul registrieren
registerModule('example-module', ExampleModule, {
  title: 'Beispielmodul',
  description: 'Ein Beispielmodul zur Demonstration des Frameworks',
  showRetryButton: true,
  showFooter: true
});

/**
 * React-Komponente, die ein OWL-Modul rendert
 */
export function ModuleContainer() {
  const [moduleId, setModuleId] = useState('example-module');
  const [config, setConfig] = useState({});
  const [events, setEvents] = useState([]);
  
  // Event-Handler für Modulaktionen
  const handleModuleAction = (action) => {
    console.log('Modul-Aktion:', action);
    addEvent(`Aktion: ${action.action} (${new Date().toLocaleTimeString()})`);
  };
  
  // Event-Handler für Fehler im Modul
  const handleModuleError = (error) => {
    console.error('Modul-Fehler:', error);
    addEvent(`Fehler: ${error.error?.message || 'Unbekannter Fehler'} (${new Date().toLocaleTimeString()})`);
  };
  
  // Event-Handler für Updates im Modul
  const handleModuleUpdate = (update) => {
    console.log('Modul-Update:', update);
    addEvent(`Update: ${update.type} (${new Date().toLocaleTimeString()})`);
  };
  
  // Hilfsfunktion zum Hinzufügen von Events
  const addEvent = (eventText) => {
    setEvents(prevEvents => {
      const newEvents = [...prevEvents, eventText];
      // Maximal 10 Events behalten
      if (newEvents.length > 10) {
        return newEvents.slice(newEvents.length - 10);
      }
      return newEvents;
    });
  };
  
  return (
    <div className="module-integration-demo">
      <h2>OWL-Modul Integration in React</h2>
      
      <div className="module-settings">
        <h3>Modul-Einstellungen</h3>
        <div className="settings-form">
          <div className="form-group">
            <label>Modul-ID:</label>
            <select 
              value={moduleId} 
              onChange={(e) => setModuleId(e.target.value)}
            >
              <option value="example-module">Beispielmodul</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="module-container">
        <h3>Modul</h3>
        <div className="owl-module-wrapper">
          <ModuleLoader 
            moduleId={moduleId}
            config={config}
            onAction={handleModuleAction}
            onError={handleModuleError}
            onUpdate={handleModuleUpdate}
            className="demo-module"
          />
        </div>
      </div>
      
      <div className="module-events">
        <h3>Modul-Events</h3>
        <div className="events-list">
          {events.length === 0 && (
            <p className="no-events">Keine Events vorhanden</p>
          )}
          <ul>
            {events.map((event, index) => (
              <li key={index} className="event-item">{event}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Beispiel für die Verwendung des useOwl-Hooks
 */
export function UseOwlHookExample() {
  const { containerRef, owlComponent } = useOwl(ExampleModule, {
    moduleId: 'example-hook',
    config: {
      title: 'Hook-Beispiel',
      description: 'Ein Beispiel für die Verwendung des useOwl-Hooks'
    }
  });
  
  // Beispiel für die Interaktion mit der OWL-Komponente
  useEffect(() => {
    if (owlComponent) {
      console.log('OWL-Komponente ist bereit:', owlComponent);
      
      // Direkter Zugriff auf die OWL-Komponente ist möglich
      // owlComponent.store.dispatch('increment');
    }
  }, [owlComponent]);
  
  return (
    <div className="use-owl-hook-example">
      <h2>useOwl Hook Beispiel</h2>
      <div ref={containerRef} className="owl-container"></div>
    </div>
  );
}

export default {
  ModuleContainer,
  UseOwlHookExample
};
