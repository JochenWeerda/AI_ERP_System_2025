import React, { useEffect, useRef } from 'react';
import { Component, mount, xml, useState } from '@odoo/owl';

// Einfache Owl-Komponente für unseren Test
class OwlCounter extends Component {
  static template = xml`
    <div class="owl-counter">
      <h3>Owl Counter Komponente</h3>
      <p>Aktueller Wert: <t t-esc="state.value"/></p>
      <div class="buttons">
        <button t-on-click="increment">+</button>
        <button t-on-click="decrement">-</button>
      </div>
    </div>
  `;
  
  setup() {
    this.state = useState({ value: 0 });
  }
  
  increment() {
    this.state.value++;
    // Optional: Event an React-Wrapper senden
    this.props.onValueChange && this.props.onValueChange(this.state.value);
  }
  
  decrement() {
    this.state.value = Math.max(0, this.state.value - 1);
    // Optional: Event an React-Wrapper senden
    this.props.onValueChange && this.props.onValueChange(this.state.value);
  }
}

// Debug-Modus für Owl aktivieren
const enableOwlDebug = () => {
  try {
    // Owl global verfügbar machen (für DevTools)
    window.__OWL__ = { Component };
    
    // DevTools Hook bereitstellen
    window.__OWL_DEVTOOLS_HOOK__ = {
      Component,
      componentsById: new Map(),
      componentsTree: []
    };
    
    console.log("Owl DEBUG aktiviert");
    return true;
  } catch (error) {
    console.error("Fehler beim Aktivieren des Owl DEBUG-Modus:", error);
    return false;
  }
};

/**
 * React-Komponente, die als Wrapper für eine Owl-Komponente dient
 */
const OwlWrapper = ({ onValueChange }) => {
  const containerRef = useRef(null);
  const owlAppRef = useRef(null);
  const [debugEnabled, setDebugEnabled] = React.useState(false);
  
  useEffect(() => {
    // Debug-Modus aktivieren
    const debug = enableOwlDebug();
    setDebugEnabled(debug);
    
    // Wenn der Container gerendert wurde und Owl-Komponente noch nicht gemountet ist
    if (containerRef.current && !owlAppRef.current) {
      // Owl-Komponente mounten
      owlAppRef.current = mount(OwlCounter, containerRef.current, {
        props: { onValueChange },
        dev: true // Aktiviere Entwicklungsmodus
      });
      
      console.log('Owl-Komponente erfolgreich gemountet');
    }
    
    // Cleanup-Funktion zum Unmounten der Owl-Komponente
    return () => {
      if (owlAppRef.current) {
        // Unmount der Owl-Komponente beim Unmounten der React-Komponente
        owlAppRef.current.destroy();
        owlAppRef.current = null;
        console.log('Owl-Komponente unmounted');
      }
    };
  }, [onValueChange]); // Erneut mounten, wenn sich der onValueChange ändert
  
  return (
    <div className="owl-wrapper">
      <div className="info-box">
        <p>Dies ist eine Owl-Komponente in React eingebettet</p>
        <p>Owl Debug: {debugEnabled ? 'Aktiviert' : 'Deaktiviert'}</p>
      </div>
      <div className="owl-container" ref={containerRef}></div>
    </div>
  );
};

export default OwlWrapper; 