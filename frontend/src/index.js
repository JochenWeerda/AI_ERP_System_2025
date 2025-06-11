import { startOwlApp } from './components/StandaloneOwl';
import { Component } from '@odoo/owl';

// Debug-Informationen global verfügbar machen
window.__OWL__ = { Component };

// DevTools Hook bereitstellen
window.__OWL_DEVTOOLS_HOOK__ = {
  Component,
  componentsById: new Map(),
  componentsTree: []
};

console.log('Owl Framework (Version 2.7.0) wurde initialisiert');
console.log('Debug-Modus wurde aktiviert');

// Hauptfunktion zum Starten der Anwendung
function main() {
  const owlContainer = document.getElementById('owl-app');
  if (owlContainer) {
    startOwlApp(owlContainer);
  } else {
    console.log('Kein #owl-app Element gefunden. Owl-Anwendung wurde nicht gestartet.');
  }
}

// Starte die Anwendung, wenn das DOM geladen ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
} 