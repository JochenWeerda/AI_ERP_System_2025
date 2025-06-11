/**
 * StammdatenModulIntegration.js
 * Beispiel für die Integration von Stammdatenmodulen in das OWL-Framework
 */

import { ModuleBase, registerModule } from '../index.js';
import { createStore } from '../core/StoreManager.js';

/**
 * Basisklasse für Stammdatenmodule
 */
export class StammdatenModuleBase extends ModuleBase {
  static template = `
    <div class="stammdaten-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Stammdaten-Modul'"/></h2>
        <div class="module-actions" t-if="showActions">
          <button class="btn btn-primary" t-on-click="onAdd">
            <i class="icon icon-plus"></i> Neu
          </button>
          <button class="btn btn-secondary" t-on-click="onRefresh">
            <i class="icon icon-refresh"></i> Aktualisieren
          </button>
        </div>
      </div>
      
      <div class="module-content">
        <div t-if="state.isLoading" class="loading-indicator">
          Daten werden geladen...
        </div>
        <div t-elif="state.error" class="error-message">
          <p>Fehler beim Laden der Daten:</p>
          <p><t t-esc="state.error"/></p>
          <button class="btn btn-secondary" t-on-click="onRefresh">Erneut versuchen</button>
        </div>
        <div t-elif="!state.items.length" class="empty-state">
          <p>Keine Einträge vorhanden.</p>
          <button class="btn btn-primary" t-on-click="onAdd">Neuen Eintrag anlegen</button>
        </div>
        <div t-else="" class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th t-foreach="columns" t-as="column" t-key="column.key">
                  <t t-esc="column.label"/>
                </th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr t-foreach="state.items" t-as="item" t-key="item.id">
                <td t-foreach="columns" t-as="column" t-key="column.key">
                  <t t-esc="item[column.key]"/>
                </td>
                <td class="actions-cell">
                  <button class="btn btn-icon" t-on-click="() => onEdit(item)">
                    <i class="icon icon-edit"></i>
                  </button>
                  <button class="btn btn-icon" t-on-click="() => onDelete(item)">
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
    // Store mit Basisdaten initialisieren
    this.store = createStore(`${this.props.moduleId}-store`, {
      items: [],
      isLoading: true,
      error: null,
      selectedItem: null
    });
    
    // State aus dem Store übernehmen
    this.state = this.useState(this.store.state);
    
    // Spalten für die Tabelle definieren (kann überschrieben werden)
    this.columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Beschreibung' }
    ];
    
    // Aktionen anzeigen?
    this.showActions = this.props.showActions !== false;
    
    // Daten laden
    this.loadData();
  }
  
  async loadData() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Hier würde normalerweise ein API-Aufruf stehen
      // Für das Beispiel verwenden wir Beispieldaten
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const exampleData = [
        { id: 1, name: 'Beispiel 1', description: 'Beschreibung 1' },
        { id: 2, name: 'Beispiel 2', description: 'Beschreibung 2' },
        { id: 3, name: 'Beispiel 3', description: 'Beschreibung 3' }
      ];
      
      this.store.update({ items: exampleData, isLoading: false });
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  onRefresh() {
    this.loadData();
  }
  
  onAdd() {
    // Hier würde die Logik zum Hinzufügen eines neuen Eintrags implementiert
    console.log('Neuen Eintrag hinzufügen');
    
    // Event auslösen
    this.trigger('module-action', { 
      action: 'add',
      moduleId: this.props.moduleId
    });
  }
  
  onEdit(item) {
    console.log('Eintrag bearbeiten:', item);
    
    // Event auslösen
    this.trigger('module-action', { 
      action: 'edit',
      moduleId: this.props.moduleId,
      data: item
    });
  }
  
  onDelete(item) {
    console.log('Eintrag löschen:', item);
    
    // Bestätigung einholen (in einer realen Anwendung)
    const confirmed = confirm(`Möchten Sie den Eintrag "${item.name}" wirklich löschen?`);
    
    if (confirmed) {
      // Hier würde die Logik zum Löschen implementiert
      // Für das Beispiel entfernen wir den Eintrag aus dem lokalen Array
      const updatedItems = this.state.items.filter(i => i.id !== item.id);
      this.store.update({ items: updatedItems });
      
      // Event auslösen
      this.trigger('module-action', { 
        action: 'delete',
        moduleId: this.props.moduleId,
        data: item
      });
    }
  }
}

/**
 * Spezialisiertes Artikelmodul
 */
export class ArtikelModule extends StammdatenModuleBase {
  setup() {
    super.setup();
    
    // Spalten für die Artikeltabelle überschreiben
    this.columns = [
      { key: 'artikelnummer', label: 'Artikel-Nr.' },
      { key: 'bezeichnung', label: 'Bezeichnung' },
      { key: 'preis', label: 'Preis' },
      { key: 'bestand', label: 'Bestand' }
    ];
  }
  
  async loadData() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Hier würde normalerweise ein API-Aufruf stehen
      // Für das Beispiel verwenden wir Beispieldaten
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const artikelData = [
        { id: 1, artikelnummer: 'A001', bezeichnung: 'Produkt A', preis: '19,99 €', bestand: 150 },
        { id: 2, artikelnummer: 'A002', bezeichnung: 'Produkt B', preis: '29,99 €', bestand: 75 },
        { id: 3, artikelnummer: 'A003', bezeichnung: 'Produkt C', preis: '9,99 €', bestand: 200 }
      ];
      
      this.store.update({ items: artikelData, isLoading: false });
    } catch (error) {
      console.error('Fehler beim Laden der Artikel:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
}

/**
 * Spezialisiertes Lagermodul
 */
export class LagerModule extends StammdatenModuleBase {
  setup() {
    super.setup();
    
    // Spalten für die Lagertabelle überschreiben
    this.columns = [
      { key: 'lagernr', label: 'Lager-Nr.' },
      { key: 'bezeichnung', label: 'Bezeichnung' },
      { key: 'adresse', label: 'Adresse' },
      { key: 'kapazitaet', label: 'Kapazität' }
    ];
  }
  
  async loadData() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Hier würde normalerweise ein API-Aufruf stehen
      // Für das Beispiel verwenden wir Beispieldaten
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const lagerData = [
        { id: 1, lagernr: 'L001', bezeichnung: 'Hauptlager', adresse: 'Hauptstraße 1, 12345 Musterstadt', kapazitaet: '5000 m²' },
        { id: 2, lagernr: 'L002', bezeichnung: 'Außenlager Nord', adresse: 'Nordstraße 25, 54321 Nordstadt', kapazitaet: '2500 m²' },
        { id: 3, lagernr: 'L003', bezeichnung: 'Vertriebslager Süd', adresse: 'Südstraße 18, 67890 Südstadt', kapazitaet: '1800 m²' }
      ];
      
      this.store.update({ items: lagerData, isLoading: false });
    } catch (error) {
      console.error('Fehler beim Laden der Lagerdaten:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
}

/**
 * Spezialisiertes Partnermodul
 */
export class PartnerModule extends StammdatenModuleBase {
  setup() {
    super.setup();
    
    // Spalten für die Partnertabelle überschreiben
    this.columns = [
      { key: 'partnernr', label: 'Partner-Nr.' },
      { key: 'name', label: 'Name' },
      { key: 'typ', label: 'Typ' },
      { key: 'kontakt', label: 'Kontakt' }
    ];
  }
  
  async loadData() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Hier würde normalerweise ein API-Aufruf stehen
      // Für das Beispiel verwenden wir Beispieldaten
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const partnerData = [
        { id: 1, partnernr: 'P001', name: 'Musterfirma GmbH', typ: 'Kunde', kontakt: 'info@musterfirma.de' },
        { id: 2, partnernr: 'P002', name: 'Lieferant AG', typ: 'Lieferant', kontakt: 'kontakt@lieferant.de' },
        { id: 3, partnernr: 'P003', name: 'Partner & Co. KG', typ: 'Kunde/Lieferant', kontakt: 'service@partner.de' }
      ];
      
      this.store.update({ items: partnerData, isLoading: false });
    } catch (error) {
      console.error('Fehler beim Laden der Partnerdaten:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
}

// Module registrieren
registerModule('artikel-module', ArtikelModule);
registerModule('lager-module', LagerModule);
registerModule('partner-module', PartnerModule);

// Für die Verwendung in anderen Modulen exportieren
export default {
  StammdatenModuleBase,
  ArtikelModule,
  LagerModule,
  PartnerModule
}; 