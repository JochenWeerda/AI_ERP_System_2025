import { Component, mount, xml, useState } from '@odoo/owl';

/**
 * Eine einfache Owl-Zähler-Komponente
 */
class OwlCounter extends Component {
  static template = xml`
    <div class="owl-counter-standalone">
      <h2>Eigenständige Owl-Komponente</h2>
      <p>Aktueller Wert: <t t-esc="state.count"/></p>
      <div class="actions">
        <button t-on-click="increment" class="btn-inc">Erhöhen</button>
        <button t-on-click="decrement" class="btn-dec">Verringern</button>
        <button t-on-click="reset" class="btn-reset">Zurücksetzen</button>
      </div>
    </div>
  `;
  
  setup() {
    this.state = useState({ count: 0 });
  }
  
  increment() {
    this.state.count++;
  }
  
  decrement() {
    this.state.count = Math.max(0, this.state.count - 1);
  }
  
  reset() {
    this.state.count = 0;
  }
}

/**
 * Eine Container-Komponente, die mehrere Owl-Komponenten enthält
 */
class OwlApp extends Component {
  static template = xml`
    <div class="owl-app">
      <h1>Owl 2.7.0 Demo</h1>
      <p>Diese Seite ist mit Owl Framework erstellt worden</p>
      
      <div class="counter-section">
        <t t-esc="state.message"/>
        <OwlCounter />
      </div>
      
      <div class="info-section">
        <p>Debug aktiviert: <t t-esc="debugEnabled ? 'Ja' : 'Nein'"/></p>
        <button t-on-click="toggleDebug">Debug <t t-esc="debugEnabled ? 'deaktivieren' : 'aktivieren'"/></button>
      </div>
    </div>
  `;
  
  static components = { OwlCounter };
  
  setup() {
    this.state = useState({
      message: "Willkommen beim Owl Demo!",
      debug: false
    });
    
    this.debugEnabled = false;
    this.enableDebug();
  }
  
  enableDebug() {
    try {
      // Debug-Modus aktivieren (in Owl 2.7.0 funktioniert es anders)
      // Stellen wir Owl global zur Verfügung für DevTools
      window.__OWL__ = { Component };
      
      // Debug-Flag setzen
      this.debugEnabled = true;
      console.log("Owl DEBUG aktiviert");
      
      // Hook für DevTools bereitstellen
      window.__OWL_DEVTOOLS_HOOK__ = {
        Component,
        componentsById: new Map(),
        componentsTree: []
      };
    } catch (error) {
      console.error("Fehler beim Aktivieren des Owl DEBUG-Modus:", error);
      this.debugEnabled = false;
    }
  }
  
  toggleDebug() {
    if (this.debugEnabled) {
      this.debugEnabled = false;
      // Debug-Hook entfernen
      delete window.__OWL_DEVTOOLS_HOOK__;
    } else {
      this.debugEnabled = true;
      // Debug-Hook wieder hinzufügen
      window.__OWL_DEVTOOLS_HOOK__ = {
        Component,
        componentsById: new Map(),
        componentsTree: []
      };
    }
    this.render();
  }
}

/**
 * Startet die Owl-Anwendung
 * @param {HTMLElement} target - Das DOM-Element, an das die Anwendung gemountet werden soll
 */
export function startOwlApp(target) {
  if (!target) {
    console.error("Kein Ziel-Element angegeben");
    return null;
  }
  
  console.log("Starte Owl-Anwendung");
  
  try {
    const app = mount(OwlApp, target, { dev: true });
    console.log("Owl-Anwendung erfolgreich gestartet");
    return app;
  } catch (error) {
    console.error("Fehler beim Starten der Owl-Anwendung:", error);
    return null;
  }
}

// Automatische Initialisierung, wenn ein Element mit ID 'owl-app' vorhanden ist
document.addEventListener('DOMContentLoaded', () => {
  const target = document.getElementById('owl-app');
  if (target) {
    startOwlApp(target);
  }
}); 