/**
 * Partner Microservice Module
 * Containerisiertes Modul für Partnerverwaltung
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse für das Partner-Modul
 */
class PartnerModule extends ModuleBase {
  static moduleName = 'partner-module';
  
  static template = `
    <div class="partner-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Partner'"/></h2>
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
        
        <!-- Kunden Tab -->
        <div t-if="state.activeTab === 'kunden'" class="tab-content">
          <div class="tab-actions">
            <button class="btn btn-primary" t-on-click="onAddKunde">
              <i class="icon icon-plus"></i> Neuer Kunde
            </button>
            <button class="btn btn-secondary" t-on-click="onRefreshKunden">
              <i class="icon icon-refresh"></i> Aktualisieren
            </button>
          </div>
          
          <div t-if="!state.kunden.length" class="empty-state">
            <p>Keine Kunden vorhanden.</p>
            <button class="btn btn-primary" t-on-click="onAddKunde">Neuen Kunden anlegen</button>
          </div>
          <div t-else="" class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kunden-Nr.</th>
                  <th>Name</th>
                  <th>Ansprechpartner</th>
                  <th>Telefon</th>
                  <th>E-Mail</th>
                  <th>Status</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.kunden" t-as="kunde" t-key="kunde.id">
                  <td><t t-esc="kunde.kundennummer"/></td>
                  <td><t t-esc="kunde.name"/></td>
                  <td><t t-esc="kunde.ansprechpartner"/></td>
                  <td><t t-esc="kunde.telefon"/></td>
                  <td><t t-esc="kunde.email"/></td>
                  <td><span class="status-badge" t-att-data-status="kunde.status"><t t-esc="kunde.status"/></span></td>
                  <td class="actions-cell">
                    <button class="btn btn-icon" t-on-click="() => onViewPartner(kunde, 'kunde')" title="Anzeigen">
                      <i class="icon icon-eye"></i>
                    </button>
                    <button class="btn btn-icon" t-on-click="() => onEditPartner(kunde, 'kunde')" title="Bearbeiten">
                      <i class="icon icon-edit"></i>
                    </button>
                    <button class="btn btn-icon danger" t-on-click="() => onDeletePartner(kunde, 'kunde')" title="Löschen">
                      <i class="icon icon-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Lieferanten Tab -->
        <div t-if="state.activeTab === 'lieferanten'" class="tab-content">
          <div class="tab-actions">
            <button class="btn btn-primary" t-on-click="onAddLieferant">
              <i class="icon icon-plus"></i> Neuer Lieferant
            </button>
            <button class="btn btn-secondary" t-on-click="onRefreshLieferanten">
              <i class="icon icon-refresh"></i> Aktualisieren
            </button>
          </div>
          
          <div t-if="!state.lieferanten.length" class="empty-state">
            <p>Keine Lieferanten vorhanden.</p>
            <button class="btn btn-primary" t-on-click="onAddLieferant">Neuen Lieferanten anlegen</button>
          </div>
          <div t-else="" class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Lieferanten-Nr.</th>
                  <th>Name</th>
                  <th>Ansprechpartner</th>
                  <th>Telefon</th>
                  <th>E-Mail</th>
                  <th>Lieferzeit</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.lieferanten" t-as="lieferant" t-key="lieferant.id">
                  <td><t t-esc="lieferant.lieferantennummer"/></td>
                  <td><t t-esc="lieferant.name"/></td>
                  <td><t t-esc="lieferant.ansprechpartner"/></td>
                  <td><t t-esc="lieferant.telefon"/></td>
                  <td><t t-esc="lieferant.email"/></td>
                  <td><t t-esc="lieferant.lieferzeit"/> Tage</td>
                  <td class="actions-cell">
                    <button class="btn btn-icon" t-on-click="() => onViewPartner(lieferant, 'lieferant')" title="Anzeigen">
                      <i class="icon icon-eye"></i>
                    </button>
                    <button class="btn btn-icon" t-on-click="() => onEditPartner(lieferant, 'lieferant')" title="Bearbeiten">
                      <i class="icon icon-edit"></i>
                    </button>
                    <button class="btn btn-icon danger" t-on-click="() => onDeletePartner(lieferant, 'lieferant')" title="Löschen">
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
    // Tabs für die Partnerverwaltung
    this.tabs = [
      { id: 'kunden', label: 'Kunden' },
      { id: 'lieferanten', label: 'Lieferanten' }
    ];
    
    // Store mit Basisdaten initialisieren
    this.store = createStore(`${this.props.moduleId}-store`, {
      activeTab: 'kunden',
      isLoading: true,
      error: null,
      
      // Partner-Daten
      kunden: [],
      lieferanten: [],
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
    // Kunden laden
    await this.loadKunden();
    
    // Lieferanten laden
    await this.loadLieferanten();
    
    // Container-Event auslösen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
  
  setActiveTab(tabId) {
    this.store.update({ activeTab: tabId });
  }
  
  async loadKunden() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Beispieldaten verwenden
      const kundenData = this.getExampleKunden();
      
      this.store.update({ kunden: kundenData, isLoading: false });
    } catch (error) {
      console.error('Fehler beim Laden der Kunden:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  async loadLieferanten() {
    try {
      // Beispieldaten verwenden
      const lieferantenData = this.getExampleLieferanten();
      
      this.store.update({ lieferanten: lieferantenData });
    } catch (error) {
      console.error('Fehler beim Laden der Lieferanten:', error);
    }
  }
  
  getExampleKunden() {
    return [
      { 
        id: 1, 
        kundennummer: 'K001', 
        name: 'Musterfirma GmbH', 
        ansprechpartner: 'Max Mustermann',
        telefon: '+49 123 456789',
        email: 'info@musterfirma.de',
        status: 'aktiv'
      },
      { 
        id: 2, 
        kundennummer: 'K002', 
        name: 'Beispiel AG', 
        ansprechpartner: 'Erika Musterfrau',
        telefon: '+49 987 654321',
        email: 'kontakt@beispiel-ag.de',
        status: 'aktiv'
      },
      { 
        id: 3, 
        kundennummer: 'K003', 
        name: 'Test GmbH & Co. KG', 
        ansprechpartner: 'Thomas Test',
        telefon: '+49 456 789123',
        email: 'info@test-gmbh.de',
        status: 'inaktiv'
      }
    ];
  }
  
  getExampleLieferanten() {
    return [
      { 
        id: 1, 
        lieferantennummer: 'L001', 
        name: 'Großhandel GmbH', 
        ansprechpartner: 'Karl Kaufmann',
        telefon: '+49 111 222333',
        email: 'verkauf@grosshandel.de',
        lieferzeit: 3
      },
      { 
        id: 2, 
        lieferantennummer: 'L002', 
        name: 'Hersteller AG', 
        ansprechpartner: 'Hans Hersteller',
        telefon: '+49 444 555666',
        email: 'vertrieb@hersteller-ag.de',
        lieferzeit: 5
      },
      { 
        id: 3, 
        lieferantennummer: 'L003', 
        name: 'Zulieferer KG', 
        ansprechpartner: 'Zora Zulieferer',
        telefon: '+49 777 888999',
        email: 'info@zulieferer.de',
        lieferzeit: 2
      }
    ];
  }
  
  // Kunden-Tab-Methoden
  onRefreshKunden() {
    this.loadKunden();
  }
  
  onAddKunde() {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'add',
        moduleId: this.props.moduleId,
        entity: 'kunde'
      });
    }
  }
  
  // Lieferanten-Tab-Methoden
  onRefreshLieferanten() {
    this.loadLieferanten();
  }
  
  onAddLieferant() {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'add',
        moduleId: this.props.moduleId,
        entity: 'lieferant'
      });
    }
  }
  
  // Gemeinsame Methoden für Partner
  onViewPartner(partner, partnerTyp) {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'view',
        moduleId: this.props.moduleId,
        entity: partnerTyp,
        data: partner
      });
    }
  }
  
  onEditPartner(partner, partnerTyp) {
    // Event auslösen für Container
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        action: 'edit',
        moduleId: this.props.moduleId,
        entity: partnerTyp,
        data: partner
      });
    }
  }
  
  onDeletePartner(partner, partnerTyp) {
    // Bestätigung einholen
    const partnerName = partnerTyp === 'kunde' ? 'Kunden' : 'Lieferanten';
    const confirmed = confirm(`Möchten Sie den ${partnerName} "${partner.name}" wirklich löschen?`);
    
    if (confirmed) {
      // Event auslösen für Container
      if (typeof this.props.onAction === 'function') {
        this.props.onAction({
          action: 'delete',
          moduleId: this.props.moduleId,
          entity: partnerTyp,
          data: partner
        });
      }
      
      // In einer realen Implementierung würde hier ein API-Aufruf stehen
      // Für das Beispiel entfernen wir den Partner aus dem lokalen Array
      if (partnerTyp === 'kunde') {
        this.store.update({ 
          kunden: this.state.kunden.filter(k => k.id !== partner.id) 
        });
      } else {
        this.store.update({ 
          lieferanten: this.state.lieferanten.filter(l => l.id !== partner.id) 
        });
      }
    }
  }
  
  onRefresh() {
    if (this.state.activeTab === 'kunden') {
      this.loadKunden();
    } else if (this.state.activeTab === 'lieferanten') {
      this.loadLieferanten();
    }
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('partner-container', PartnerModule, {
  title: 'Partnerverwaltung',
  description: 'Verwaltung von Kunden und Lieferanten',
  version: '1.0.0',
  apiEndpoints: {
    getKunden: '/api/kunden',
    getKundeById: '/api/kunden/:id',
    createKunde: '/api/kunden',
    updateKunde: '/api/kunden/:id',
    deleteKunde: '/api/kunden/:id',
    
    getLieferanten: '/api/lieferanten',
    getLieferantById: '/api/lieferanten/:id',
    createLieferant: '/api/lieferanten',
    updateLieferant: '/api/lieferanten/:id',
    deleteLieferant: '/api/lieferanten/:id'
  }
});

// CSS-Stylesheet für das Modul
const style = document.createElement('style');
style.textContent = `
  .partner-module {
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
export default PartnerModule;