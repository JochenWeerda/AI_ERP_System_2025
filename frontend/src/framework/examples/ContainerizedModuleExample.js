/**
 * ContainerizedModuleExample.js
 * Beispiel für ein containerisiertes Modul mit dem ModulContainer
 */

import { ModuleBase } from '../core/ModuleBase.js';
import { registerContainerModule } from './ModulContainer.js';

/**
 * Containerisiertes Artikelverwaltungsmodul
 */
class ArtikelContainerModule extends ModuleBase {
  static moduleName = 'artikel-container';
  
  static template = `
    <div class="artikel-container-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Artikelverwaltung'"/></h2>
        <div class="module-actions">
          <button class="btn btn-primary" t-on-click="onAddArtikel">
            <i class="icon icon-plus"></i> Neuer Artikel
          </button>
          <button class="btn btn-secondary" t-on-click="onRefresh">
            <i class="icon icon-refresh"></i> Aktualisieren
          </button>
        </div>
      </div>
      
      <div class="module-content">
        <div t-if="state.isLoading" class="loading-indicator">
          Artikel werden geladen...
        </div>
        <div t-elif="state.error" class="error-message">
          <p>Fehler beim Laden der Artikel:</p>
          <p><t t-esc="state.error"/></p>
          <button class="btn btn-secondary" t-on-click="onRefresh">Erneut versuchen</button>
        </div>
        <div t-elif="!state.artikel.length" class="empty-state">
          <p>Keine Artikel vorhanden.</p>
          <button class="btn btn-primary" t-on-click="onAddArtikel">Neuen Artikel anlegen</button>
        </div>
        <div t-else="" class="artikel-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Artikel-Nr.</th>
                <th>Bezeichnung</th>
                <th>Preis</th>
                <th>Bestand</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr t-foreach="state.artikel" t-as="artikel" t-key="artikel.id">
                <td><t t-esc="artikel.artikelnummer"/></td>
                <td><t t-esc="artikel.bezeichnung"/></td>
                <td><t t-esc="formatCurrency(artikel.preis)"/></td>
                <td><t t-esc="artikel.bestand"/></td>
                <td><span class="status-badge" t-att-data-status="artikel.status"><t t-esc="artikel.status"/></span></td>
                <td class="actions-cell">
                  <button class="btn btn-icon" t-on-click="() => onViewArtikel(artikel)" title="Anzeigen">
                    <i class="icon icon-eye"></i>
                  </button>
                  <button class="btn btn-icon" t-on-click="() => onEditArtikel(artikel)" title="Bearbeiten">
                    <i class="icon icon-edit"></i>
                  </button>
                  <button class="btn btn-icon danger" t-on-click="() => onDeleteArtikel(artikel)" title="Löschen">
                    <i class="icon icon-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  setup() {
    // Containerisiertes Setup mit API-Integration
    this.state = this.useState({
      artikel: [],
      isLoading: true,
      error: null,
      selectedArtikel: null
    });
    
    // Container-Store nutzen, falls vorhanden
    this.containerStore = this.props.containerStore;
    
    // API-Endpunkte aus den Props übernehmen
    this.apiEndpoints = this.props.apiEndpoints || {};
    
    // Initialisierung
    this.init();
  }
  
  async init() {
    // Artikel laden
    await this.loadArtikel();
    
    // Container-Event auslösen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
  
  async loadArtikel() {
    try {
      this.state.isLoading = true;
      this.state.error = null;
      
      // Daten vom Container oder API laden
      let artikelData;
      
      if (this.containerStore?.state?.data?.artikel) {
        // Daten aus dem Container-Store laden
        artikelData = this.containerStore.state.data.artikel;
      } else if (this.apiEndpoints.getArtikel) {
        // Daten von der API laden
        const response = await fetch(this.apiEndpoints.getArtikel);
        
        if (!response.ok) {
          throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
        }
        
        artikelData = await response.json();
      } else {
        // Beispieldaten verwenden
        artikelData = this.getExampleArtikel();
      }
      
      this.state.artikel = artikelData;
      this.state.isLoading = false;
    } catch (error) {
      console.error('Fehler beim Laden der Artikel:', error);
      this.state.error = error.message;
      this.state.isLoading = false;
    }
  }
  
  getExampleArtikel() {
    // Beispieldaten für Artikel
    return [
      { 
        id: 1, 
        artikelnummer: 'A001', 
        bezeichnung: 'Produkt A', 
        preis: 19.99, 
        bestand: 150,
        status: 'aktiv'
      },
      { 
        id: 2, 
        artikelnummer: 'A002', 
        bezeichnung: 'Produkt B', 
        preis: 29.99, 
        bestand: 75,
        status: 'aktiv'
      },
      { 
        id: 3, 
        artikelnummer: 'A003', 
        bezeichnung: 'Produkt C', 
        preis: 9.99, 
        bestand: 200,
        status: 'aktiv'
      },
      { 
        id: 4, 
        artikelnummer: 'A004', 
        bezeichnung: 'Produkt D', 
        preis: 49.99, 
        bestand: 0,
        status: 'inaktiv'
      }
    ];
  }
  
  formatCurrency(value) {
    return value.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR'
    });
  }
  
  onRefresh() {
    this.loadArtikel();
  }
  
  onAddArtikel() {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'add',
        moduleId: this.props.moduleId
      });
    }
  }
  
  onViewArtikel(artikel) {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'view',
        moduleId: this.props.moduleId,
        data: artikel
      });
    }
  }
  
  onEditArtikel(artikel) {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'edit',
        moduleId: this.props.moduleId,
        data: artikel
      });
    }
  }
  
  onDeleteArtikel(artikel) {
    // Bestätigung einholen
    const confirmed = confirm(`Möchten Sie den Artikel "${artikel.bezeichnung}" wirklich löschen?`);
    
    if (confirmed) {
      // Event auslösen für Container
      if (typeof this.props.onAction === 'function') {
        this.props.onAction({
          action: 'delete',
          moduleId: this.props.moduleId,
          data: artikel
        });
      }
      
      // In einer realen Implementierung würde hier ein API-Aufruf stehen
      // Für das Beispiel entfernen wir den Artikel aus dem lokalen Array
      this.state.artikel = this.state.artikel.filter(a => a.id !== artikel.id);
    }
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('artikel-container', ArtikelContainerModule, {
  title: 'Containerisierte Artikelverwaltung',
  description: 'Artikelverwaltungsmodul als eigenständiger Container',
  version: '1.0.0',
  apiEndpoints: {
    getArtikel: '/api/artikel',
    getArtikelById: '/api/artikel/:id',
    createArtikel: '/api/artikel',
    updateArtikel: '/api/artikel/:id',
    deleteArtikel: '/api/artikel/:id'
  }
});

// Exportieren des Moduls
export default ArtikelContainerModule; 