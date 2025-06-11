/**
 * Stammdaten Microservice Module
 * Containerisiertes Modul für Stammdatenverwaltung
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse für das Stammdaten-Modul
 */
class StammdatenModule extends ModuleBase {
  static moduleName = 'stammdaten-module';
  
  static template = `
    <div class="stammdaten-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Stammdaten'"/></h2>
        <div class="module-tabs">
          <div 
            t-foreach="tabs" 
            t-as="tab" 
            t-key="tab.id" 
            class="tab" 
            t-att-class="{ active: state.activeTab === tab.id }"
            t-on-click="() => setActiveTab(tab.id)"
          >
            <t t-esc="tab.label"/>
          </div>
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
        
        <!-- Artikel Tab -->
        <div t-if="state.activeTab === 'artikel'" class="tab-content">
          <div class="tab-actions">
            <button class="btn btn-primary" t-on-click="onAddArtikel">
              <i class="icon icon-plus"></i> Neuer Artikel
            </button>
            <button class="btn btn-secondary" t-on-click="onRefreshArtikel">
              <i class="icon icon-refresh"></i> Aktualisieren
            </button>
          </div>
          
          <div t-if="!state.artikel.length" class="empty-state">
            <p>Keine Artikel vorhanden.</p>
            <button class="btn btn-primary" t-on-click="onAddArtikel">Neuen Artikel anlegen</button>
          </div>
          <div t-else="" class="data-table-container">
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
        
        <!-- Lager Tab -->
        <div t-if="state.activeTab === 'lager'" class="tab-content">
          <div class="tab-actions">
            <button class="btn btn-primary" t-on-click="onAddLager">
              <i class="icon icon-plus"></i> Neues Lager
            </button>
            <button class="btn btn-secondary" t-on-click="onRefreshLager">
              <i class="icon icon-refresh"></i> Aktualisieren
            </button>
          </div>
          
          <div t-if="!state.lager.length" class="empty-state">
            <p>Keine Lager vorhanden.</p>
            <button class="btn btn-primary" t-on-click="onAddLager">Neues Lager anlegen</button>
          </div>
          <div t-else="" class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Lager-Nr.</th>
                  <th>Bezeichnung</th>
                  <th>Adresse</th>
                  <th>Kapazität</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.lager" t-as="lager" t-key="lager.id">
                  <td><t t-esc="lager.lagernr"/></td>
                  <td><t t-esc="lager.bezeichnung"/></td>
                  <td><t t-esc="lager.adresse"/></td>
                  <td><t t-esc="lager.kapazitaet"/></td>
                  <td class="actions-cell">
                    <button class="btn btn-icon" t-on-click="() => onViewLager(lager)" title="Anzeigen">
                      <i class="icon icon-eye"></i>
                    </button>
                    <button class="btn btn-icon" t-on-click="() => onEditLager(lager)" title="Bearbeiten">
                      <i class="icon icon-edit"></i>
                    </button>
                    <button class="btn btn-icon danger" t-on-click="() => onDeleteLager(lager)" title="Löschen">
                      <i class="icon icon-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Partner Tab -->
        <div t-if="state.activeTab === 'partner'" class="tab-content">
          <div class="tab-actions">
            <button class="btn btn-primary" t-on-click="onAddPartner">
              <i class="icon icon-plus"></i> Neuer Partner
            </button>
            <button class="btn btn-secondary" t-on-click="onRefreshPartner">
              <i class="icon icon-refresh"></i> Aktualisieren
            </button>
          </div>
          
          <div t-if="!state.partner.length" class="empty-state">
            <p>Keine Partner vorhanden.</p>
            <button class="btn btn-primary" t-on-click="onAddPartner">Neuen Partner anlegen</button>
          </div>
          <div t-else="" class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Partner-Nr.</th>
                  <th>Name</th>
                  <th>Typ</th>
                  <th>Kontakt</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.partner" t-as="partner" t-key="partner.id">
                  <td><t t-esc="partner.partnernr"/></td>
                  <td><t t-esc="partner.name"/></td>
                  <td><t t-esc="partner.typ"/></td>
                  <td><t t-esc="partner.kontakt"/></td>
                  <td class="actions-cell">
                    <button class="btn btn-icon" t-on-click="() => onViewPartner(partner)" title="Anzeigen">
                      <i class="icon icon-eye"></i>
                    </button>
                    <button class="btn btn-icon" t-on-click="() => onEditPartner(partner)" title="Bearbeiten">
                      <i class="icon icon-edit"></i>
                    </button>
                    <button class="btn btn-icon danger" t-on-click="() => onDeletePartner(partner)" title="Löschen">
                      <i class="icon icon-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setup() {
    // Tabs für die Stammdatenverwaltung
    this.tabs = [
      { id: 'artikel', label: 'Artikel' },
      { id: 'lager', label: 'Lager' },
      { id: 'partner', label: 'Partner' }
    ];
    
    // Store mit Basisdaten initialisieren
    this.store = createStore(`${this.props.moduleId}-store`, {
      activeTab: 'artikel',
      isLoading: true,
      error: null,
      
      // Artikel-Daten
      artikel: [],
      selectedArtikel: null,
      
      // Lager-Daten
      lager: [],
      selectedLager: null,
      
      // Partner-Daten
      partner: [],
      selectedPartner: null
    });
    
    // State aus dem Store übernehmen
    this.state = this.useState(this.store.state);
    
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
    
    // Lager laden
    await this.loadLager();
    
    // Partner laden
    await this.loadPartner();
    
    // Container-Event auslösen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
  
  setActiveTab(tabId) {
    this.store.update({ activeTab: tabId });
  }
  
  async loadArtikel() {
    try {
      this.store.update({ isLoading: true, error: null });
      
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
      
      this.store.update({ artikel: artikelData, isLoading: false });
    } catch (error) {
      console.error('Fehler beim Laden der Artikel:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  async loadLager() {
    try {
      // Daten vom Container oder API laden
      let lagerData;
      
      if (this.containerStore?.state?.data?.lager) {
        // Daten aus dem Container-Store laden
        lagerData = this.containerStore.state.data.lager;
      } else if (this.apiEndpoints.getLager) {
        // Daten von der API laden
        const response = await fetch(this.apiEndpoints.getLager);
        
        if (!response.ok) {
          throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
        }
        
        lagerData = await response.json();
      } else {
        // Beispieldaten verwenden
        lagerData = this.getExampleLager();
      }
      
      this.store.update({ lager: lagerData });
    } catch (error) {
      console.error('Fehler beim Laden der Lager:', error);
    }
  }
  
  async loadPartner() {
    try {
      // Daten vom Container oder API laden
      let partnerData;
      
      if (this.containerStore?.state?.data?.partner) {
        // Daten aus dem Container-Store laden
        partnerData = this.containerStore.state.data.partner;
      } else if (this.apiEndpoints.getPartner) {
        // Daten von der API laden
        const response = await fetch(this.apiEndpoints.getPartner);
        
        if (!response.ok) {
          throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
        }
        
        partnerData = await response.json();
      } else {
        // Beispieldaten verwenden
        partnerData = this.getExamplePartner();
      }
      
      this.store.update({ partner: partnerData });
    } catch (error) {
      console.error('Fehler beim Laden der Partner:', error);
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
  
  getExampleLager() {
    // Beispieldaten für Lager
    return [
      { 
        id: 1, 
        lagernr: 'L001', 
        bezeichnung: 'Hauptlager', 
        adresse: 'Hauptstraße 1, 12345 Musterstadt', 
        kapazitaet: '5000 m²'
      },
      { 
        id: 2, 
        lagernr: 'L002', 
        bezeichnung: 'Außenlager Nord', 
        adresse: 'Nordstraße 25, 54321 Nordstadt', 
        kapazitaet: '2500 m²'
      },
      { 
        id: 3, 
        lagernr: 'L003', 
        bezeichnung: 'Vertriebslager Süd', 
        adresse: 'Südstraße 18, 67890 Südstadt', 
        kapazitaet: '1800 m²'
      }
    ];
  }
  
  getExamplePartner() {
    // Beispieldaten für Partner
    return [
      { 
        id: 1, 
        partnernr: 'P001', 
        name: 'Musterfirma GmbH', 
        typ: 'Kunde', 
        kontakt: 'info@musterfirma.de'
      },
      { 
        id: 2, 
        partnernr: 'P002', 
        name: 'Lieferant AG', 
        typ: 'Lieferant', 
        kontakt: 'kontakt@lieferant.de'
      },
      { 
        id: 3, 
        partnernr: 'P003', 
        name: 'Partner & Co. KG', 
        typ: 'Kunde/Lieferant', 
        kontakt: 'service@partner.de'
      }
    ];
  }
  
  formatCurrency(value) {
    return value.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR'
    });
  }
  
  // Artikel-Tab-Methoden
  onRefreshArtikel() {
    this.loadArtikel();
  }
  
  onAddArtikel() {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'add',
        moduleId: this.props.moduleId,
        entity: 'artikel'
      });
    }
  }
  
  onViewArtikel(artikel) {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'view',
        moduleId: this.props.moduleId,
        entity: 'artikel',
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
        entity: 'artikel',
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
          entity: 'artikel',
          data: artikel
        });
      }
      
      // In einer realen Implementierung würde hier ein API-Aufruf stehen
      // Für das Beispiel entfernen wir den Artikel aus dem lokalen Array
      this.store.update({ 
        artikel: this.state.artikel.filter(a => a.id !== artikel.id) 
      });
    }
  }
  
  // Lager-Tab-Methoden
  onRefreshLager() {
    this.loadLager();
  }
  
  onAddLager() {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'add',
        moduleId: this.props.moduleId,
        entity: 'lager'
      });
    }
  }
  
  onViewLager(lager) {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'view',
        moduleId: this.props.moduleId,
        entity: 'lager',
        data: lager
      });
    }
  }
  
  onEditLager(lager) {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'edit',
        moduleId: this.props.moduleId,
        entity: 'lager',
        data: lager
      });
    }
  }
  
  onDeleteLager(lager) {
    // Bestätigung einholen
    const confirmed = confirm(`Möchten Sie das Lager "${lager.bezeichnung}" wirklich löschen?`);
    
    if (confirmed) {
      // Event auslösen für Container
      if (typeof this.props.onAction === 'function') {
        this.props.onAction({
          action: 'delete',
          moduleId: this.props.moduleId,
          entity: 'lager',
          data: lager
        });
      }
      
      // In einer realen Implementierung würde hier ein API-Aufruf stehen
      // Für das Beispiel entfernen wir das Lager aus dem lokalen Array
      this.store.update({ 
        lager: this.state.lager.filter(l => l.id !== lager.id) 
      });
    }
  }
  
  // Partner-Tab-Methoden
  onRefreshPartner() {
    this.loadPartner();
  }
  
  onAddPartner() {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'add',
        moduleId: this.props.moduleId,
        entity: 'partner'
      });
    }
  }
  
  onViewPartner(partner) {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'view',
        moduleId: this.props.moduleId,
        entity: 'partner',
        data: partner
      });
    }
  }
  
  onEditPartner(partner) {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'edit',
        moduleId: this.props.moduleId,
        entity: 'partner',
        data: partner
      });
    }
  }
  
  onDeletePartner(partner) {
    // Bestätigung einholen
    const confirmed = confirm(`Möchten Sie den Partner "${partner.name}" wirklich löschen?`);
    
    if (confirmed) {
      // Event auslösen für Container
      if (typeof this.props.onAction === 'function') {
        this.props.onAction({
          action: 'delete',
          moduleId: this.props.moduleId,
          entity: 'partner',
          data: partner
        });
      }
      
      // In einer realen Implementierung würde hier ein API-Aufruf stehen
      // Für das Beispiel entfernen wir den Partner aus dem lokalen Array
      this.store.update({ 
        partner: this.state.partner.filter(p => p.id !== partner.id) 
      });
    }
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('artikel-container', StammdatenModule, {
  title: 'Stammdatenverwaltung',
  description: 'Verwaltung von Artikeln, Lagern und Partnern',
  version: '1.0.0',
  apiEndpoints: {
    getArtikel: '/api/artikel',
    getArtikelById: '/api/artikel/:id',
    createArtikel: '/api/artikel',
    updateArtikel: '/api/artikel/:id',
    deleteArtikel: '/api/artikel/:id',
    
    getLager: '/api/lager',
    getLagerById: '/api/lager/:id',
    createLager: '/api/lager',
    updateLager: '/api/lager/:id',
    deleteLager: '/api/lager/:id',
    
    getPartner: '/api/partner',
    getPartnerById: '/api/partner/:id',
    createPartner: '/api/partner',
    updatePartner: '/api/partner/:id',
    deletePartner: '/api/partner/:id'
  }
});

// CSS-Stylesheet für das Modul
const style = document.createElement('style');
style.textContent = `
  .stammdaten-module {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .module-header {
    padding: 16px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .module-header h2 {
    margin: 0 0 16px 0;
    font-size: 24px;
    font-weight: 600;
    color: #2d3748;
  }
  
  .module-tabs {
    display: flex;
    gap: 16px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 16px;
  }
  
  .tab {
    padding: 8px 16px;
    cursor: pointer;
    font-weight: 500;
    color: #718096;
    border-bottom: 2px solid transparent;
  }
  
  .tab.active {
    color: #4299e1;
    border-bottom: 2px solid #4299e1;
  }
  
  .module-content {
    flex: 1;
    padding: 16px;
    overflow: auto;
  }
  
  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .tab-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .btn-primary {
    background-color: #4299e1;
    color: white;
    border: none;
  }
  
  .btn-secondary {
    background-color: #edf2f7;
    color: #2d3748;
    border: 1px solid #e2e8f0;
  }
  
  .btn-icon {
    width: 32px;
    height: 32px;
    padding: 4px;
    border-radius: 4px;
    background-color: transparent;
    border: 1px solid #e2e8f0;
    color: #718096;
    cursor: pointer;
  }
  
  .btn-icon:hover {
    background-color: #edf2f7;
  }
  
  .btn-icon.danger {
    color: #e53e3e;
  }
  
  .btn-icon.danger:hover {
    background-color: #fff5f5;
  }
  
  .data-table-container {
    overflow-x: auto;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
  }
  
  .data-table th {
    background-color: #f7fafc;
    font-weight: 600;
    color: #4a5568;
  }
  
  .data-table tr:hover {
    background-color: #f7fafc;
  }
  
  .actions-cell {
    display: flex;
    gap: 8px;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-badge[data-status="aktiv"] {
    background-color: #c6f6d5;
    color: #22543d;
  }
  
  .status-badge[data-status="inaktiv"] {
    background-color: #fed7d7;
    color: #742a2a;
  }
  
  .empty-state {
    padding: 32px;
    text-align: center;
    color: #718096;
    background-color: #f7fafc;
    border-radius: 8px;
    border: 1px dashed #e2e8f0;
  }
  
  .loading-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #718096;
  }
  
  .error-message {
    padding: 16px;
    background-color: #fed7d7;
    color: #742a2a;
    border-radius: 8px;
    margin-bottom: 16px;
  }
`;

document.head.appendChild(style);

// Für die Verwendung in anderen Modulen exportieren
export default StammdatenModule;