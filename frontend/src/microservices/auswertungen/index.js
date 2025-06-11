/**
 * Auswertungen Microservice Module
 * Containerisiertes Modul für Auswertungen
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse für das Auswertungen-Modul
 */
class AuswertungenModule extends ModuleBase {
  static moduleName = 'auswertungen-module';
  
  static template = `
    <div class="auswertungen-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Auswertungen'"/></h2>
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
        
        <!-- Umsatzauswertung Tab -->
        <div t-if="state.activeTab === 'umsatz'" class="tab-content">
          <div class="auswertung-container">
            <div class="filter-section">
              <div class="filter-group">
                <label>Zeitraum</label>
                <select t-on-change="onPeriodChange">
                  <option value="month">Aktueller Monat</option>
                  <option value="quarter">Aktuelles Quartal</option>
                  <option value="year">Aktuelles Jahr</option>
                  <option value="custom">Benutzerdefiniert</option>
                </select>
              </div>
              <button class="btn btn-primary" t-on-click="onGenerateReport">
                <i class="icon icon-chart"></i> Auswertung generieren
              </button>
            </div>
            
            <div class="chart-container">
              <h3>Umsatzentwicklung</h3>
              <div class="chart-placeholder">
                <div class="chart-bars">
                  <div t-foreach="state.umsatzDaten" t-as="eintrag" t-key="eintrag.id" 
                       class="chart-bar" t-att-style="'height: ' + calculateBarHeight(eintrag.wert) + '%;'">
                    <div class="chart-tooltip">
                      <div><t t-esc="eintrag.label"/></div>
                      <div><t t-esc="formatCurrency(eintrag.wert)"/></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="report-table-container">
              <h3>Umsatz nach Kategorien</h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Kategorie</th>
                    <th>Umsatz</th>
                    <th>Anteil</th>
                  </tr>
                </thead>
                <tbody>
                  <tr t-foreach="state.umsatzKategorien" t-as="kategorie" t-key="kategorie.id">
                    <td><t t-esc="kategorie.name"/></td>
                    <td><t t-esc="formatCurrency(kategorie.umsatz)"/></td>
                    <td><t t-esc="kategorie.anteil"/>%</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th>Gesamt</th>
                    <th><t t-esc="formatCurrency(state.umsatzGesamt)"/></th>
                    <th>100%</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Lagerbestand Tab -->
        <div t-if="state.activeTab === 'lager'" class="tab-content">
          <div class="auswertung-container">
            <div class="filter-section">
              <div class="filter-group">
                <label>Lager</label>
                <select t-on-change="onLagerChange">
                  <option value="all">Alle Lager</option>
                  <option t-foreach="state.lagerListe" t-as="lager" t-key="lager.id" t-att-value="lager.id">
                    <t t-esc="lager.name"/>
                  </option>
                </select>
              </div>
              <button class="btn btn-primary" t-on-click="onGenerateReport">
                <i class="icon icon-chart"></i> Auswertung generieren
              </button>
            </div>
            
            <div class="report-table-container">
              <h3>Lagerbestandsübersicht</h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Artikel-Nr.</th>
                    <th>Bezeichnung</th>
                    <th>Aktueller Bestand</th>
                    <th>Min. Bestand</th>
                    <th>Wert</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr t-foreach="state.lagerbestandDaten" t-as="artikel" t-key="artikel.id">
                    <td><t t-esc="artikel.artikelnummer"/></td>
                    <td><t t-esc="artikel.bezeichnung"/></td>
                    <td><t t-esc="artikel.bestand"/></td>
                    <td><t t-esc="artikel.minBestand"/></td>
                    <td><t t-esc="formatCurrency(artikel.wert)"/></td>
                    <td>
                      <span class="status-badge" t-att-data-status="getBestandStatus(artikel)">
                        <t t-esc="getBestandStatusText(artikel)"/>
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="4">Gesamtwert</th>
                    <th><t t-esc="formatCurrency(state.lagerbestandGesamt)"/></th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setup() {
    // Tabs für die Auswertungen
    this.tabs = [
      { id: 'umsatz', label: 'Umsatzauswertung' },
      { id: 'lager', label: 'Lagerbestand' }
    ];
    
    // Store mit Basisdaten initialisieren
    this.store = createStore(`${this.props.moduleId}-store`, {
      activeTab: 'umsatz',
      isLoading: true,
      error: null,
      
      // Umsatzauswertung
      umsatzDaten: [],
      umsatzKategorien: [],
      umsatzGesamt: 0,
      
      // Lagerbestand
      lagerListe: [],
      lagerbestandDaten: [],
      lagerbestandGesamt: 0,
      
      // Filter
      selectedPeriod: 'month',
      selectedLager: 'all'
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
    // Umsatzdaten laden
    await this.loadUmsatzDaten();
    
    // Lagerbestandsdaten laden
    await this.loadLagerbestandDaten();
    
    // Container-Event auslösen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
  
  setActiveTab(tabId) {
    this.store.update({ activeTab: tabId });
  }
  
  // Methoden für Umsatzauswertung
  async loadUmsatzDaten() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Beispieldaten verwenden
      const umsatzData = this.getExampleUmsatzDaten();
      
      this.store.update({ 
        umsatzDaten: umsatzData.zeitreihe,
        umsatzKategorien: umsatzData.kategorien,
        umsatzGesamt: umsatzData.gesamt,
        isLoading: false 
      });
    } catch (error) {
      console.error('Fehler beim Laden der Umsatzdaten:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  // Methoden für Lagerbestandsauswertung
  async loadLagerbestandDaten() {
    try {
      // Beispieldaten verwenden
      const lagerData = this.getExampleLagerDaten();
      
      this.store.update({ 
        lagerListe: lagerData.lager,
        lagerbestandDaten: lagerData.artikel,
        lagerbestandGesamt: lagerData.gesamtwert,
        isLoading: false 
      });
    } catch (error) {
      console.error('Fehler beim Laden der Lagerbestandsdaten:', error);
    }
  }
  
  // Beispieldaten für Umsatzauswertung
  getExampleUmsatzDaten() {
    return {
      zeitreihe: [
        { id: 1, label: 'Jan', wert: 10250.50 },
        { id: 2, label: 'Feb', wert: 11350.75 },
        { id: 3, label: 'Mär', wert: 9850.25 },
        { id: 4, label: 'Apr', wert: 12450.00 },
        { id: 5, label: 'Mai', wert: 13150.75 },
        { id: 6, label: 'Jun', wert: 14750.50 }
      ],
      kategorien: [
        { id: 1, name: 'Hardware', umsatz: 35750.50, anteil: 45 },
        { id: 2, name: 'Software', umsatz: 25250.75, anteil: 32 },
        { id: 3, name: 'Dienstleistungen', umsatz: 12450.25, anteil: 16 },
        { id: 4, name: 'Sonstiges', umsatz: 5750.25, anteil: 7 }
      ],
      gesamt: 79201.75
    };
  }
  
  // Beispieldaten für Lagerbestandsauswertung
  getExampleLagerDaten() {
    return {
      lager: [
        { id: 1, name: 'Hauptlager' },
        { id: 2, name: 'Außenlager Nord' },
        { id: 3, name: 'Vertriebslager Süd' }
      ],
      artikel: [
        { id: 1, artikelnummer: 'A001', bezeichnung: 'Produkt A', bestand: 150, minBestand: 50, wert: 2998.50 },
        { id: 2, artikelnummer: 'A002', bezeichnung: 'Produkt B', bestand: 75, minBestand: 30, wert: 2249.25 },
        { id: 3, artikelnummer: 'A003', bezeichnung: 'Produkt C', bestand: 200, minBestand: 100, wert: 1998.00 },
        { id: 4, artikelnummer: 'A004', bezeichnung: 'Produkt D', bestand: 5, minBestand: 10, wert: 249.95 }
      ],
      gesamtwert: 7495.70
    };
  }
  
  // Hilfsmethoden
  calculateBarHeight(wert) {
    // Höchsten Wert finden
    const maxWert = Math.max(...this.state.umsatzDaten.map(d => d.wert));
    // Prozentsatz berechnen (maximal 90%)
    return Math.round((wert / maxWert) * 90);
  }
  
  formatCurrency(value) {
    return value.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR'
    });
  }
  
  getBestandStatus(artikel) {
    if (artikel.bestand <= 0) {
      return 'kritisch';
    } else if (artikel.bestand < artikel.minBestand) {
      return 'warnung';
    } else {
      return 'ok';
    }
  }
  
  getBestandStatusText(artikel) {
    const status = this.getBestandStatus(artikel);
    
    switch (status) {
      case 'kritisch':
        return 'Nicht verfügbar';
      case 'warnung':
        return 'Nachbestellen';
      case 'ok':
        return 'Ausreichend';
      default:
        return '';
    }
  }
  
  // Event-Handler
  onPeriodChange(event) {
    this.store.update({ selectedPeriod: event.target.value });
  }
  
  onLagerChange(event) {
    this.store.update({ selectedLager: event.target.value });
  }
  
  onGenerateReport() {
    if (this.state.activeTab === 'umsatz') {
      this.loadUmsatzDaten();
    } else if (this.state.activeTab === 'lager') {
      this.loadLagerbestandDaten();
    }
  }
  
  onRefresh() {
    if (this.state.activeTab === 'umsatz') {
      this.loadUmsatzDaten();
    } else if (this.state.activeTab === 'lager') {
      this.loadLagerbestandDaten();
    }
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('auswertung-container', AuswertungenModule, {
  title: 'Auswertungen',
  description: 'Umsatz- und Lagerauswertungen',
  version: '1.0.0',
  apiEndpoints: {
    getUmsatzDaten: '/api/auswertungen/umsatz',
    getLagerbestandDaten: '/api/auswertungen/lagerbestand'
  }
});

// CSS-Stylesheet für das Modul
const style = document.createElement('style');
style.textContent = `
  .auswertungen-module {
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
  
  .auswertung-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .filter-section {
    display: flex;
    gap: 16px;
    align-items: flex-end;
    background-color: #f7fafc;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .filter-group label {
    font-size: 14px;
    font-weight: 500;
    color: #4a5568;
  }
  
  .filter-group select {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    background-color: white;
    min-width: 200px;
  }
  
  .chart-container {
    background-color: white;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
  
  .chart-container h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
    color: #2d3748;
  }
  
  .chart-placeholder {
    height: 250px;
    display: flex;
    flex-direction: column;
  }
  
  .chart-bars {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 200px;
    margin-top: auto;
  }
  
  .chart-bar {
    flex: 1;
    background-color: #4299e1;
    margin: 0 4px;
    min-height: 10px;
    border-radius: 2px 2px 0 0;
    position: relative;
  }
  
  .chart-bar:hover {
    background-color: #3182ce;
  }
  
  .chart-bar:hover .chart-tooltip {
    display: block;
  }
  
  .chart-tooltip {
    display: none;
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #2d3748;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
    text-align: center;
  }
  
  .report-table-container {
    background-color: white;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
  
  .report-table-container h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
    color: #2d3748;
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
  
  .data-table tfoot th {
    background-color: #edf2f7;
    font-weight: 600;
  }
  
  .data-table tr:hover {
    background-color: #f7fafc;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-badge[data-status="ok"] {
    background-color: #c6f6d5;
    color: #22543d;
  }
  
  .status-badge[data-status="warnung"] {
    background-color: #fefcbf;
    color: #744210;
  }
  
  .status-badge[data-status="kritisch"] {
    background-color: #fed7d7;
    color: #742a2a;
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
export default AuswertungenModule;