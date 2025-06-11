/**
 * AuswertungModulIntegration.js
 * Beispiel für die Integration von Auswertungsmodulen in das OWL-Framework
 */

import { ModuleBase, registerModule } from '../index.js';
import { createStore } from '../core/StoreManager.js';

/**
 * Basisklasse für Auswertungsmodule
 */
export class AuswertungModuleBase extends ModuleBase {
  static template = `
    <div class="auswertung-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Auswertungs-Modul'"/></h2>
        <div class="module-actions" t-if="showActions">
          <button class="btn btn-secondary" t-on-click="onRefresh">
            <i class="icon icon-refresh"></i> Aktualisieren
          </button>
          <button class="btn btn-secondary" t-on-click="onExport">
            <i class="icon icon-download"></i> Exportieren
          </button>
          <button class="btn btn-secondary" t-on-click="onPrint">
            <i class="icon icon-print"></i> Drucken
          </button>
        </div>
      </div>
      
      <div class="module-content">
        <div class="filter-bar">
          <div class="date-range">
            <label for="start-date">Von:</label>
            <input type="date" id="start-date" t-model="state.startDate" t-on-change="onFilterChange"/>
            <label for="end-date">Bis:</label>
            <input type="date" id="end-date" t-model="state.endDate" t-on-change="onFilterChange"/>
          </div>
          <div class="filter-options">
            <select t-model="state.groupBy" t-on-change="onFilterChange">
              <option value="">Gruppierung wählen...</option>
              <option value="day">Tag</option>
              <option value="week">Woche</option>
              <option value="month">Monat</option>
              <option value="quarter">Quartal</option>
              <option value="year">Jahr</option>
            </select>
            <button class="btn btn-primary" t-on-click="onApplyFilter">Filter anwenden</button>
          </div>
        </div>
        
        <div t-if="state.isLoading" class="loading-indicator">
          Daten werden geladen...
        </div>
        <div t-elif="state.error" class="error-message">
          <p>Fehler beim Laden der Daten:</p>
          <p><t t-esc="state.error"/></p>
          <button class="btn btn-secondary" t-on-click="onRefresh">Erneut versuchen</button>
        </div>
        <div t-elif="!state.data.length" class="empty-state">
          <p>Keine Daten für den ausgewählten Zeitraum vorhanden.</p>
          <button class="btn btn-secondary" t-on-click="onResetFilter">Filter zurücksetzen</button>
        </div>
        <div t-else="" class="visualization-container">
          <div class="chart-container" t-ref="chartContainer">
            <!-- Hier wird das Chart gerendert -->
          </div>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th t-foreach="tableHeaders" t-as="header" t-key="header.key">
                    <t t-esc="header.label"/>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.data" t-as="row" t-key="row.id">
                  <td t-foreach="tableHeaders" t-as="header" t-key="header.key">
                    <t t-if="header.key === 'value'">
                      <t t-esc="formatValue(row[header.key], header.type)"/>
                    </t>
                    <t t-else="">
                      <t t-esc="row[header.key]"/>
                    </t>
                  </td>
                </tr>
              </tbody>
              <tfoot t-if="showTotals">
                <tr>
                  <td t-foreach="tableHeaders" t-as="header" t-key="header.key">
                    <t t-if="header.key === 'value'">
                      <strong><t t-esc="formatValue(calculateTotal(), header.type)"/></strong>
                    </t>
                    <t t-elif="header.key === 'label'">
                      <strong>Gesamt</strong>
                    </t>
                    <t t-else="">
                      <t t-esc=""/>
                    </t>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div class="summary-container" t-if="state.data.length > 0">
          <h3>Zusammenfassung</h3>
          <div class="summary-cards">
            <div class="summary-card">
              <div class="card-label">Gesamt</div>
              <div class="card-value"><t t-esc="formatValue(calculateTotal(), 'currency')"/></div>
            </div>
            <div class="summary-card">
              <div class="card-label">Durchschnitt</div>
              <div class="card-value"><t t-esc="formatValue(calculateAverage(), 'currency')"/></div>
            </div>
            <div class="summary-card">
              <div class="card-label">Maximum</div>
              <div class="card-value"><t t-esc="formatValue(calculateMax(), 'currency')"/></div>
            </div>
            <div class="summary-card">
              <div class="card-label">Minimum</div>
              <div class="card-value"><t t-esc="formatValue(calculateMin(), 'currency')"/></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setup() {
    // Store mit Basisdaten initialisieren
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    
    this.store = createStore(`${this.props.moduleId}-store`, {
      data: [],
      isLoading: true,
      error: null,
      startDate: this.formatDateForInput(defaultStartDate),
      endDate: this.formatDateForInput(new Date()),
      groupBy: 'month'
    });
    
    // State aus dem Store übernehmen
    this.state = this.useState(this.store.state);
    
    // Spaltenköpfe für die Tabelle definieren (kann überschrieben werden)
    this.tableHeaders = [
      { key: 'label', label: 'Zeitraum', type: 'text' },
      { key: 'value', label: 'Wert', type: 'currency' }
    ];
    
    // Aktionen anzeigen?
    this.showActions = this.props.showActions !== false;
    
    // Gesamtsumme anzeigen?
    this.showTotals = true;
    
    // Daten laden
    this.loadData();
  }
  
  async loadData() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Hier würde normalerweise ein API-Aufruf stehen
      // Für das Beispiel verwenden wir Beispieldaten
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const exampleData = this.getExampleData();
      
      this.store.update({ data: exampleData, isLoading: false });
      
      // Chart rendern, wenn die Daten geladen sind
      this.renderChart();
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  getExampleData() {
    // Diese Methode wird von abgeleiteten Klassen überschrieben
    return [];
  }
  
  formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  formatValue(value, type) {
    if (value === undefined || value === null) {
      return '-';
    }
    
    switch (type) {
      case 'currency':
        return value.toLocaleString('de-DE', {
          style: 'currency',
          currency: 'EUR'
        });
      case 'percent':
        return value.toLocaleString('de-DE', {
          style: 'percent',
          minimumFractionDigits: 2
        });
      case 'number':
        return value.toLocaleString('de-DE');
      case 'date':
        return new Date(value).toLocaleDateString('de-DE');
      default:
        return value;
    }
  }
  
  calculateTotal() {
    return this.state.data.reduce((sum, item) => sum + item.value, 0);
  }
  
  calculateAverage() {
    if (this.state.data.length === 0) return 0;
    return this.calculateTotal() / this.state.data.length;
  }
  
  calculateMax() {
    if (this.state.data.length === 0) return 0;
    return Math.max(...this.state.data.map(item => item.value));
  }
  
  calculateMin() {
    if (this.state.data.length === 0) return 0;
    return Math.min(...this.state.data.map(item => item.value));
  }
  
  renderChart() {
    // In einer realen Implementierung würde hier ein Chart-Rendering stehen
    // z.B. mit Chart.js, D3.js oder einer anderen Bibliothek
    console.log('Chart rendern mit Daten:', this.state.data);
    
    const chartContainer = this.refs.chartContainer;
    if (chartContainer) {
      // Beispiel-Implementierung:
      chartContainer.innerHTML = '';
      
      const svgContainer = document.createElement('div');
      svgContainer.innerHTML = `
        <svg width="100%" height="300" style="border: 1px solid #ccc; margin-top: 20px;">
          <text x="50%" y="150" text-anchor="middle" dominant-baseline="middle" font-size="16">
            Chart würde hier mit echten Daten gerendert werden
          </text>
        </svg>
      `;
      
      chartContainer.appendChild(svgContainer);
    }
  }
  
  onRefresh() {
    this.loadData();
  }
  
  onFilterChange() {
    // Filter geändert, aber noch nicht angewendet
    console.log('Filter geändert:', {
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      groupBy: this.state.groupBy
    });
  }
  
  onApplyFilter() {
    // Filter anwenden und Daten neu laden
    console.log('Filter anwenden:', {
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      groupBy: this.state.groupBy
    });
    
    this.loadData();
  }
  
  onResetFilter() {
    // Filter zurücksetzen
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    
    this.store.update({
      startDate: this.formatDateForInput(defaultStartDate),
      endDate: this.formatDateForInput(new Date()),
      groupBy: 'month'
    });
    
    this.loadData();
  }
  
  onExport() {
    console.log('Daten exportieren');
    
    // In einer realen Implementierung würde hier ein Export als CSV, Excel, etc. stehen
    alert('Die Daten würden als CSV exportiert werden.');
    
    // Event auslösen
    this.trigger('module-action', { 
      action: 'export',
      moduleId: this.props.moduleId,
      data: this.state.data
    });
  }
  
  onPrint() {
    console.log('Bericht drucken');
    
    // In einer realen Implementierung würde hier ein Druckdialog geöffnet werden
    window.print();
    
    // Event auslösen
    this.trigger('module-action', { 
      action: 'print',
      moduleId: this.props.moduleId
    });
  }
}

/**
 * Spezialisiertes Finanzauswertungs-Modul
 */
export class FinanzAuswertungModule extends AuswertungModuleBase {
  getExampleData() {
    // Beispieldaten für Finanzauswertung
    return [
      { id: 1, label: 'Januar 2025', value: 25000.50 },
      { id: 2, label: 'Februar 2025', value: 28500.75 },
      { id: 3, label: 'März 2025', value: 32150.20 },
      { id: 4, label: 'April 2025', value: 30750.10 },
      { id: 5, label: 'Mai 2025', value: 35200.60 },
      { id: 6, label: 'Juni 2025', value: 38750.25 }
    ];
  }
  
  setup() {
    super.setup();
    
    // Anpassungen für Finanzauswertung
    this.tableHeaders = [
      { key: 'label', label: 'Monat', type: 'text' },
      { key: 'value', label: 'Umsatz', type: 'currency' }
    ];
  }
}

/**
 * Spezialisiertes Lagerbestandsauswertungs-Modul
 */
export class LagerAuswertungModule extends AuswertungModuleBase {
  getExampleData() {
    // Beispieldaten für Lagerbestandsauswertung
    return [
      { id: 1, label: 'Hauptlager', value: 12500 },
      { id: 2, label: 'Außenlager Nord', value: 8200 },
      { id: 3, label: 'Außenlager Süd', value: 9750 },
      { id: 4, label: 'Warenlager Ost', value: 5300 },
      { id: 5, label: 'Vertriebslager', value: 15800 }
    ];
  }
  
  setup() {
    super.setup();
    
    // Anpassungen für Lagerauswertung
    this.tableHeaders = [
      { key: 'label', label: 'Lager', type: 'text' },
      { key: 'value', label: 'Bestand', type: 'number' }
    ];
  }
  
  formatValue(value, type) {
    if (type === 'number') {
      return value.toLocaleString('de-DE') + ' Stk.';
    }
    
    return super.formatValue(value, type);
  }
}

// Module registrieren
registerModule('finanz-module', FinanzAuswertungModule);
registerModule('lager-auswertung-module', LagerAuswertungModule);

// Für die Verwendung in anderen Modulen exportieren
export default {
  AuswertungModuleBase,
  FinanzAuswertungModule,
  LagerAuswertungModule
};