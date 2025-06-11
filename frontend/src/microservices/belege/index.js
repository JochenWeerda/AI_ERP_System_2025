/**
 * Belege Microservice Module
 * Containerisiertes Modul für Belegverwaltung
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse für das Belege-Modul
 */
class BelegeModule extends ModuleBase {
  static moduleName = 'belege-module';
  
  static template = `
    <div class="belege-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Belege'"/></h2>
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
        
        <!-- Eingangsbelege Tab -->
        <div t-if="state.activeTab === 'eingang'" class="tab-content">
          <div class="tab-actions">
            <button class="btn btn-primary" t-on-click="onAddEingangsbeleg">
              <i class="icon icon-plus"></i> Neuer Eingangsbeleg
            </button>
            <button class="btn btn-secondary" t-on-click="onRefreshEingangsbelege">
              <i class="icon icon-refresh"></i> Aktualisieren
            </button>
          </div>
          
          <div t-if="!state.eingangsbelege.length" class="empty-state">
            <p>Keine Eingangsbelege vorhanden.</p>
            <button class="btn btn-primary" t-on-click="onAddEingangsbeleg">Neuen Eingangsbeleg anlegen</button>
          </div>
          <div t-else="" class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Beleg-Nr.</th>
                  <th>Datum</th>
                  <th>Lieferant</th>
                  <th>Gesamtbetrag</th>
                  <th>Status</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.eingangsbelege" t-as="beleg" t-key="beleg.id">
                  <td><t t-esc="beleg.belegnummer"/></td>
                  <td><t t-esc="formatDate(beleg.datum)"/></td>
                  <td><t t-esc="beleg.lieferant"/></td>
                  <td><t t-esc="formatCurrency(beleg.gesamtbetrag)"/></td>
                  <td><span class="status-badge" t-att-data-status="beleg.status"><t t-esc="beleg.status"/></span></td>
                  <td class="actions-cell">
                    <button class="btn btn-icon" t-on-click="() => onViewBeleg(beleg, 'eingang')" title="Anzeigen">
                      <i class="icon icon-eye"></i>
                    </button>
                    <button class="btn btn-icon" t-on-click="() => onEditBeleg(beleg, 'eingang')" title="Bearbeiten">
                      <i class="icon icon-edit"></i>
                    </button>
                    <button class="btn btn-icon danger" t-on-click="() => onDeleteBeleg(beleg, 'eingang')" title="Löschen">
                      <i class="icon icon-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Ausgangsbelege Tab -->
        <div t-if="state.activeTab === 'ausgang'" class="tab-content">
          <div class="tab-actions">
            <button class="btn btn-primary" t-on-click="onAddAusgangsbeleg">
              <i class="icon icon-plus"></i> Neuer Ausgangsbeleg
            </button>
            <button class="btn btn-secondary" t-on-click="onRefreshAusgangsbelege">
              <i class="icon icon-refresh"></i> Aktualisieren
            </button>
          </div>
          
          <div t-if="!state.ausgangsbelege.length" class="empty-state">
            <p>Keine Ausgangsbelege vorhanden.</p>
            <button class="btn btn-primary" t-on-click="onAddAusgangsbeleg">Neuen Ausgangsbeleg anlegen</button>
          </div>
          <div t-else="" class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Beleg-Nr.</th>
                  <th>Datum</th>
                  <th>Kunde</th>
                  <th>Gesamtbetrag</th>
                  <th>Status</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.ausgangsbelege" t-as="beleg" t-key="beleg.id">
                  <td><t t-esc="beleg.belegnummer"/></td>
                  <td><t t-esc="formatDate(beleg.datum)"/></td>
                  <td><t t-esc="beleg.kunde"/></td>
                  <td><t t-esc="formatCurrency(beleg.gesamtbetrag)"/></td>
                  <td><span class="status-badge" t-att-data-status="beleg.status"><t t-esc="beleg.status"/></span></td>
                  <td class="actions-cell">
                    <button class="btn btn-icon" t-on-click="() => onViewBeleg(beleg, 'ausgang')" title="Anzeigen">
                      <i class="icon icon-eye"></i>
                    </button>
                    <button class="btn btn-icon" t-on-click="() => onEditBeleg(beleg, 'ausgang')" title="Bearbeiten">
                      <i class="icon icon-edit"></i>
                    </button>
                    <button class="btn btn-icon danger" t-on-click="() => onDeleteBeleg(beleg, 'ausgang')" title="Löschen">
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
    // Tabs für die Belegverwaltung
    this.tabs = [
      { id: 'eingang', label: 'Eingangsbelege' },
      { id: 'ausgang', label: 'Ausgangsbelege' }
    ];
    
    // Store mit Basisdaten initialisieren
    this.store = createStore(`${this.props.moduleId}-store`, {
      activeTab: 'eingang',
      isLoading: true,
      error: null,
      
      // Belege-Daten
      eingangsbelege: [],
      ausgangsbelege: [],
      selectedBeleg: null
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
    // Eingangsbelege laden
    await this.loadEingangsbelege();
    
    // Ausgangsbelege laden
    await this.loadAusgangsbelege();
    
    // Container-Event auslösen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
  
  setActiveTab(tabId) {
    this.store.update({ activeTab: tabId });
  }
  
  async loadEingangsbelege() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Daten vom Container oder API laden
      let belegeData;
      
      if (this.containerStore?.state?.data?.eingangsbelege) {
        // Daten aus dem Container-Store laden
        belegeData = this.containerStore.state.data.eingangsbelege;
      } else if (this.apiEndpoints.getEingangsbelege) {
        // Daten von der API laden
        const response = await fetch(this.apiEndpoints.getEingangsbelege);
        
        if (!response.ok) {
          throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
        }
        
        belegeData = await response.json();
      } else {
        // Beispieldaten verwenden
        belegeData = this.getExampleEingangsbelege();
      }
      
      this.store.update({ eingangsbelege: belegeData, isLoading: false });
    } catch (error) {
      console.error('Fehler beim Laden der Eingangsbelege:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  async loadAusgangsbelege() {
    try {
      // Daten vom Container oder API laden
      let belegeData;
      
      if (this.containerStore?.state?.data?.ausgangsbelege) {
        // Daten aus dem Container-Store laden
        belegeData = this.containerStore.state.data.ausgangsbelege;
      } else if (this.apiEndpoints.getAusgangsbelege) {
        // Daten von der API laden
        const response = await fetch(this.apiEndpoints.getAusgangsbelege);
        
        if (!response.ok) {
          throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
        }
        
        belegeData = await response.json();
      } else {
        // Beispieldaten verwenden
        belegeData = this.getExampleAusgangsbelege();
      }
      
      this.store.update({ ausgangsbelege: belegeData, isLoading: false });
    } catch (error) {
      console.error('Fehler beim Laden der Ausgangsbelege:', error);
    }
  }
  
  getExampleEingangsbelege() {
    // Beispieldaten für Eingangsbelege
    return [
      { 
        id: 1, 
        belegnummer: 'E001', 
        datum: '2023-01-15', 
        lieferant: 'Lieferant AG', 
        gesamtbetrag: 1250.99, 
        status: 'offen'
      },
      { 
        id: 2, 
        belegnummer: 'E002', 
        datum: '2023-01-18', 
        lieferant: 'Großhandel GmbH', 
        gesamtbetrag: 3450.50, 
        status: 'bezahlt'
      },
      { 
        id: 3, 
        belegnummer: 'E003', 
        datum: '2023-01-25', 
        lieferant: 'Zulieferer KG', 
        gesamtbetrag: 780.25, 
        status: 'storniert'
      }
    ];
  }
  
  getExampleAusgangsbelege() {
    // Beispieldaten für Ausgangsbelege
    return [
      { 
        id: 1, 
        belegnummer: 'A001', 
        datum: '2023-01-16', 
        kunde: 'Musterfirma GmbH', 
        gesamtbetrag: 2350.75, 
        status: 'bezahlt'
      },
      { 
        id: 2, 
        belegnummer: 'A002', 
        datum: '2023-01-20', 
        kunde: 'Kunde AG', 
        gesamtbetrag: 1800.00, 
        status: 'offen'
      },
      { 
        id: 3, 
        belegnummer: 'A003', 
        datum: '2023-01-28', 
        kunde: 'Einzelhandel GmbH', 
        gesamtbetrag: 5250.50, 
        status: 'versandt'
      }
    ];
  }
  
  formatCurrency(value) {
    return value.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR'
    });
  }
  
  formatDate(dateString) {
    // Datum formatieren
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  }
  
  // Eingangsbelege-Tab-Methoden
  onRefreshEingangsbelege() {
    this.loadEingangsbelege();
  }
  
  onAddEingangsbeleg() {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'add',
        moduleId: this.props.moduleId,
        entity: 'eingangsbeleg'
      });
    }
  }
  
  // Ausgangsbelege-Tab-Methoden
  onRefreshAusgangsbelege() {
    this.loadAusgangsbelege();
  }
  
  onAddAusgangsbeleg() {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'add',
        moduleId: this.props.moduleId,
        entity: 'ausgangsbeleg'
      });
    }
  }
  
  // Gemeinsame Methoden für Belege
  onViewBeleg(beleg, belegTyp) {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'view',
        moduleId: this.props.moduleId,
        entity: belegTyp === 'eingang' ? 'eingangsbeleg' : 'ausgangsbeleg',
        data: beleg
      });
    }
  }
  
  onEditBeleg(beleg, belegTyp) {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'edit',
        moduleId: this.props.moduleId,
        entity: belegTyp === 'eingang' ? 'eingangsbeleg' : 'ausgangsbeleg',
        data: beleg
      });
    }
  }
  
  onDeleteBeleg(beleg, belegTyp) {
    // Bestätigung einholen
    const belegName = belegTyp === 'eingang' ? 'Eingangsbeleg' : 'Ausgangsbeleg';
    const confirmed = confirm(`Möchten Sie den ${belegName} "${beleg.belegnummer}" wirklich löschen?`);
    
    if (confirmed) {
      // Event auslösen für Container
      if (typeof this.props.onAction === 'function') {
        this.props.onAction({
          action: 'delete',
          moduleId: this.props.moduleId,
          entity: belegTyp === 'eingang' ? 'eingangsbeleg' : 'ausgangsbeleg',
          data: beleg
        });
      }
      
      // In einer realen Implementierung würde hier ein API-Aufruf stehen
      // Für das Beispiel entfernen wir den Beleg aus dem lokalen Array
      if (belegTyp === 'eingang') {
        this.store.update({ 
          eingangsbelege: this.state.eingangsbelege.filter(b => b.id !== beleg.id) 
        });
      } else {
        this.store.update({ 
          ausgangsbelege: this.state.ausgangsbelege.filter(b => b.id !== beleg.id) 
        });
      }
    }
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('beleg-container', BelegeModule, {
  title: 'Belegverwaltung',
  description: 'Verwaltung von Eingangs- und Ausgangsbelegen',
  version: '1.0.0',
  apiEndpoints: {
    getEingangsbelege: '/api/eingangsbelege',
    getEingangsbelegById: '/api/eingangsbelege/:id',
    createEingangsbeleg: '/api/eingangsbelege',
    updateEingangsbeleg: '/api/eingangsbelege/:id',
    deleteEingangsbeleg: '/api/eingangsbelege/:id',
    
    getAusgangsbelege: '/api/ausgangsbelege',
    getAusgangsbelegById: '/api/ausgangsbelege/:id',
    createAusgangsbeleg: '/api/ausgangsbelege',
    updateAusgangsbeleg: '/api/ausgangsbelege/:id',
    deleteAusgangsbeleg: '/api/ausgangsbelege/:id'
  }
});

// CSS-Stylesheet für das Modul
const style = document.createElement('style');
style.textContent = `
  .belege-module {
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
  
  .status-badge[data-status="offen"] {
    background-color: #ebf8ff;
    color: #2b6cb0;
  }
  
  .status-badge[data-status="bezahlt"] {
    background-color: #c6f6d5;
    color: #22543d;
  }
  
  .status-badge[data-status="storniert"] {
    background-color: #fed7d7;
    color: #742a2a;
  }
  
  .status-badge[data-status="versandt"] {
    background-color: #e9d8fd;
    color: #553c9a;
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
export default BelegeModule;