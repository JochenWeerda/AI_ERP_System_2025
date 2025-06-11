import { Component, mount, useState, xml } from "@odoo/owl";

// Definiere das Template als XML
const MainTemplate = xml`
<div class="owl-container">
  <h1>Owl Framework Demo</h1>
  <div class="counter">
    <p>Zähler: <t t-esc="state.count"/></p>
    <button t-on-click="increment">Erhöhen</button>
    <button t-on-click="decrement">Verringern</button>
  </div>
</div>
`;

// Hauptkomponente
class OwlApp extends Component {
  static template = MainTemplate;
  
  setup() {
    this.state = useState({ count: 0 });
  }
  
  increment() {
    this.state.count++;
  }
  
  decrement() {
    this.state.count = Math.max(0, this.state.count - 1);
  }
}

// Start-Funktion
function startApp() {
  // Überprüfe, ob ein Container vorhanden ist
  const container = document.getElementById('owl-root');
  if (container) {
    // Mounten der Anwendung
    mount(OwlApp, container);
    console.log("Owl-Anwendung erfolgreich gestartet!");
  } else {
    console.error("Container #owl-root nicht gefunden!");
  }
}

// Anwendung starten, wenn DOM geladen ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

// Exportiere Funktionen und Komponenten für externe Verwendung
export { OwlApp, startApp }; 