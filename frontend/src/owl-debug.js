/**
 * Owl Debug Integration
 * Diese Datei ermöglicht das direkte Einbinden der Owl-DevTools in die Anwendung
 */

import { __DEBUG__ } from "@odoo/owl";

// Aktiviere die Debug-Funktionen von Owl
export function enableOwlDebug() {
  try {
    // Debug-Modus aktivieren (wirkt sich auf die DevTools aus)
    __DEBUG__.enable = true;
    
    // Owl-Version und Status in der Konsole ausgeben
    const owlVersion = __DEBUG__.version || "Version nicht verfügbar";
    console.log(`Owl Framework erkannt: Version ${owlVersion}`);
    
    // Status des Debug-Modus ausgeben
    console.log(`Owl Debug-Modus: ${__DEBUG__.enable ? 'Aktiviert' : 'Deaktiviert'}`);
    
    // Owl global verfügbar machen (für DevTools)
    window.__OWL_DEBUG__ = __DEBUG__;
    
    return true;
  } catch (error) {
    console.error("Fehler beim Aktivieren der Owl-Debug-Funktionen:", error);
    return false;
  }
}

// Automatisch ausführen
export const owlDebugEnabled = enableOwlDebug(); 