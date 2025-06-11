/**
 * Dashboard Microservice Module
 * Containerisiertes Modul für das Dashboard
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse für das Dashboard-Modul
 */
class DashboardModule extends ModuleBase {
  static moduleName = 'dashboard-module';
  
  static template = `
    <div class="dashboard-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Dashboard'"/></h2>
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
        
        <div t-else="" class="dashboard-grid">
          <!-- Zusammenfassung -->
          <div class="dashboard-card summary-card">
            <h3>Übersicht</h3>
            <div class="summary-stats">
              <div class="stat-item">
                <div class="stat-value"><t t-esc="state.summary.artikelAnzahl"/></div>
                <div class="stat-label">Artikel</div>
              </div>
              <div class="stat-item">
                <div class="stat-value"><t t-esc="state.summary.belegeAnzahl"/></div>
                <div class="stat-label">Belege</div>
              </div>
              <div class="stat-item">
                <div class="stat-value"><t t-esc="state.summary.partnerAnzahl"/></div>
                <div class="stat-label">Partner</div>
              </div>
              <div class="stat-item">
                <div class="stat-value"><t t-esc="formatCurrency(state.summary.umsatzGesamt)"/></div>
                <div class="stat-label">Umsatz</div>
              </div>
            </div>
          </div>
          
          <!-- Letzte Verkäufe -->
          <div class="dashboard-card">
            <h3>Letzte Verkäufe</h3>
            <div t-if="!state.letzteVerkauefe.length" class="empty-state small">
              <p>Keine Verkäufe vorhanden.</p>
            </div>
            <table t-else="" class="data-table compact">
              <thead>
                <tr>
                  <th>Beleg-Nr.</th>
                  <th>Datum</th>
                  <th>Kunde</th>
                  <th>Betrag</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.letzteVerkauefe" t-as="verkauf" t-key="verkauf.id">
                  <td><t t-esc="verkauf.belegnummer"/></td>
                  <td><t t-esc="formatDate(verkauf.datum)"/></td>
                  <td><t t-esc="verkauf.kunde"/></td>
                  <td><t t-esc="formatCurrency(verkauf.betrag)"/></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Letzte Einkäufe -->
          <div class="dashboard-card">
            <h3>Letzte Einkäufe</h3>
            <div t-if="!state.letzteEinkaeufe.length" class="empty-state small">
              <p>Keine Einkäufe vorhanden.</p>
            </div>
            <table t-else="" class="data-table compact">
              <thead>
                <tr>
                  <th>Beleg-Nr.</th>
                  <th>Datum</th>
                  <th>Lieferant</th>
                  <th>Betrag</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.letzteEinkaeufe" t-as="einkauf" t-key="einkauf.id">
                  <td><t t-esc="einkauf.belegnummer"/></td>
                  <td><t t-esc="formatDate(einkauf.datum)"/></td>
                  <td><t t-esc="einkauf.lieferant"/></td>
                  <td><t t-esc="formatCurrency(einkauf.betrag)"/></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Artikel mit niedrigem Bestand -->
          <div class="dashboard-card">
            <h3>Niedrige Bestände</h3>
            <div t-if="!state.niedrigeBestaende.length" class="empty-state small">
              <p>Keine Artikel mit niedrigem Bestand.</p>
            </div>
            <table t-else="" class="data-table compact">
              <thead>
                <tr>
                  <th>Artikel-Nr.</th>
                  <th>Bezeichnung</th>
                  <th>Bestand</th>
                  <th>Min. Bestand</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.niedrigeBestaende" t-as="artikel" t-key="artikel.id">
                  <td><t t-esc="artikel.artikelnummer"/></td>
                  <td><t t-esc="artikel.bezeichnung"/></td>
                  <td><t t-esc="artikel.bestand"/></td>
                  <td><t t-esc="artikel.minBestand"/></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Umsatzentwicklung (Platzhalter für Chart) -->
          <div class="dashboard-card wide">
            <h3>Umsatzentwicklung</h3>
            <div class="chart-container">
              <div class="chart-placeholder">
                <p>Umsatzentwicklung der letzten 12 Monate</p>
                <div class="chart-bars">
                  <div t-foreach="state.umsatzEntwicklung" t-as="monat" t-key="monat.id" 
                       class="chart-bar" t-att-style="'height: ' + calculateBarHeight(monat.umsatz) + '%;'">
                    <div class="chart-tooltip">
                      <div><t t-esc="monat.name"/></div>
                      <div><t t-esc="formatCurrency(monat.umsatz)"/></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Top Kunden -->
          <div class="dashboard-card">
            <h3>Top Kunden</h3>
            <div t-if="!state.topKunden.length" class="empty-state small">
              <p>Keine Kundendaten vorhanden.</p>
            </div>
            <table t-else="" class="data-table compact">
              <thead>
                <tr>
                  <th>Kunde</th>
                  <th>Umsatz</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.topKunden" t-as="kunde" t-key="kunde.id">
                  <td><t t-esc="kunde.name"/></td>
                  <td><t t-esc="formatCurrency(kunde.umsatz)"/></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Top Produkte -->
          <div class="dashboard-card">
            <h3>Top Produkte</h3>
            <div t-if="!state.topProdukte.length" class="empty-state small">
              <p>Keine Produktdaten vorhanden.</p>
            </div>
            <table t-else="" class="data-table compact">
              <thead>
                <tr>
                  <th>Artikel</th>
                  <th>Verkauft</th>
                  <th>Umsatz</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.topProdukte" t-as="produkt" t-key="produkt.id">
                  <td><t t-esc="produkt.bezeichnung"/></td>
                  <td><t t-esc="produkt.anzahl"/></td>
                  <td><t t-esc="formatCurrency(produkt.umsatz)"/></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setup() {
    // Store mit Basisdaten initialisieren
    this.store = createStore(`${this.props.moduleId}-store`, {
      isLoading: true,
      error: null,
      
      // Dashboard-Daten
      summary: {
        artikelAnzahl: 0,
        belegeAnzahl: 0,
        partnerAnzahl: 0,
        umsatzGesamt: 0
      },
      letzteVerkauefe: [],
      letzteEinkaeufe: [],
      niedrigeBestaende: [],
      umsatzEntwicklung: [],
      topKunden: [],
      topProdukte: []
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
    await this.loadDashboardData();
    
    // Container-Event auslösen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
  
  async loadDashboardData() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Daten vom Container oder API laden
      let dashboardData;
      
      if (this.containerStore?.state?.data?.dashboard) {
        // Daten aus dem Container-Store laden
        dashboardData = this.containerStore.state.data.dashboard;
      } else if (this.apiEndpoints.getDashboard) {
        // Daten von der API laden
        const response = await fetch(this.apiEndpoints.getDashboard);
        
        if (!response.ok) {
          throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
        }
        
        dashboardData = await response.json();
      } else {
        // Beispieldaten verwenden
        dashboardData = this.getExampleDashboardData();
      }
      
      this.store.update({ 
        ...dashboardData,
        isLoading: false 
      });
    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Daten:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  getExampleDashboardData() {
    // Beispieldaten für das Dashboard
    return {
      summary: {
        artikelAnzahl: 247,
        belegeAnzahl: 128,
        partnerAnzahl: 45,
        umsatzGesamt: 125750.85
      },
      letzteVerkauefe: [
        { id: 1, belegnummer: 'A101', datum: '2023-02-15', kunde: 'Musterfirma GmbH', betrag: 2350.75 },
        { id: 2, belegnummer: 'A102', datum: '2023-02-14', kunde: 'Kunde AG', betrag: 1820.50 },
        { id: 3, belegnummer: 'A103', datum: '2023-02-12', kunde: 'Beispiel KG', betrag: 950.25 },
        { id: 4, belegnummer: 'A104', datum: '2023-02-10', kunde: 'Demo GmbH & Co. KG', betrag: 3150.00 }
      ],
      letzteEinkaeufe: [
        { id: 1, belegnummer: 'E201', datum: '2023-02-16', lieferant: 'Lieferant AG', betrag: 1250.99 },
        { id: 2, belegnummer: 'E202', datum: '2023-02-13', lieferant: 'Großhandel GmbH', betrag: 3450.50 },
        { id: 3, belegnummer: 'E203', datum: '2023-02-11', lieferant: 'Zulieferer KG', betrag: 780.25 },
        { id: 4, belegnummer: 'E204', datum: '2023-02-09', lieferant: 'Hersteller & Co.', betrag: 2100.00 }
      ],
      niedrigeBestaende: [
        { id: 1, artikelnummer: 'A001', bezeichnung: 'Produkt A', bestand: 5, minBestand: 10 },
        { id: 2, artikelnummer: 'A015', bezeichnung: 'Produkt B', bestand: 2, minBestand: 5 },
        { id: 3, artikelnummer: 'A032', bezeichnung: 'Produkt C', bestand: 0, minBestand: 3 },
        { id: 4, artikelnummer: 'A048', bezeichnung: 'Produkt D', bestand: 1, minBestand: 2 }
      ],
      umsatzEntwicklung: [
        { id: 1, name: 'Jan', umsatz: 10250.50 },
        { id: 2, name: 'Feb', umsatz: 11350.75 },
        { id: 3, name: 'Mär', umsatz: 9850.25 },
        { id: 4, name: 'Apr', umsatz: 12450.00 },
        { id: 5, name: 'Mai', umsatz: 13150.75 },
        { id: 6, name: 'Jun', umsatz: 14750.50 },
        { id: 7, name: 'Jul', umsatz: 13950.25 },
        { id: 8, name: 'Aug', umsatz: 12850.75 },
        { id: 9, name: 'Sep', umsatz: 15250.50 },
        { id: 10, name: 'Okt', umsatz: 14150.25 },
        { id: 11, name: 'Nov', umsatz: 13750.75 },
        { id: 12, name: 'Dez', umsatz: 16950.50 }
      ],
      topKunden: [
        { id: 1, name: 'Musterfirma GmbH', umsatz: 25350.75 },
        { id: 2, name: 'Kunde AG', umsatz: 18750.50 },
        { id: 3, name: 'Beispiel KG', umsatz: 15950.25 },
        { id: 4, name: 'Demo GmbH & Co. KG', umsatz: 12350.00 },
        { id: 5, name: 'Test GmbH', umsatz: 10750.75 }
      ],
      topProdukte: [
        { id: 1, bezeichnung: 'Produkt A', anzahl: 150, umsatz: 14250.00 },
        { id: 2, bezeichnung: 'Produkt B', anzahl: 120, umsatz: 12750.50 },
        { id: 3, bezeichnung: 'Produkt C', anzahl: 90, umsatz: 8950.25 },
        { id: 4, bezeichnung: 'Produkt D', anzahl: 75, umsatz: 7350.75 },
        { id: 5, bezeichnung: 'Produkt E', anzahl: 60, umsatz: 5950.50 }
      ]
    };
  }
  
  calculateBarHeight(umsatz) {
    // Höchsten Umsatz finden
    const maxUmsatz = Math.max(...this.state.umsatzEntwicklung.map(m => m.umsatz));
    // Prozentsatz berechnen (maximal 90%)
    return Math.round((umsatz / maxUmsatz) * 90);
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
  
  onRefresh() {
    this.loadDashboardData();
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('dashboard-module', DashboardModule, {
  title: 'Dashboard',
  description: 'Übersicht über die wichtigsten Kennzahlen',
  version: '1.0.0',
  apiEndpoints: {
    getDashboard: '/api/dashboard'
  }
});

// CSS-Stylesheet für das Modul
const style = document.createElement('style');
style.textContent = `
  .dashboard-module {
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
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #2d3748;
  }
  
  .module-content {
    flex: 1;
    padding: 16px;
    overflow: auto;
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  
  .dashboard-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 16px;
    overflow: hidden;
  }
  
  .dashboard-card.wide {
    grid-column: span 2;
  }
  
  .dashboard-card.summary-card {
    grid-column: span 2;
  }
  
  .dashboard-card h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
    color: #2d3748;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 8px;
  }
  
  .summary-stats {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 100px;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #2b6cb0;
  }
  
  .stat-label {
    font-size: 14px;
    color: #718096;
    margin-top: 4px;
  }
  
  .data-table.compact {
    font-size: 14px;
  }
  
  .data-table.compact th,
  .data-table.compact td {
    padding: 8px 12px;
  }
  
  .chart-container {
    height: 200px;
    position: relative;
  }
  
  .chart-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .chart-placeholder p {
    text-align: center;
    color: #718096;
    margin-bottom: 16px;
  }
  
  .chart-bars {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 150px;
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
  
  .chart-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px;
    border-style: solid;
    border-color: #2d3748 transparent transparent transparent;
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
  
  .data-table tr:hover {
    background-color: #f7fafc;
  }
  
  .empty-state {
    padding: 32px;
    text-align: center;
    color: #718096;
    background-color: #f7fafc;
    border-radius: 8px;
    border: 1px dashed #e2e8f0;
  }
  
  .empty-state.small {
    padding: 16px;
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
  
  @media (max-width: 768px) {
    .dashboard-card.wide,
    .dashboard-card.summary-card {
      grid-column: span 1;
    }
    
    .summary-stats {
      justify-content: center;
    }
  }
`;

document.head.appendChild(style);

// Für die Verwendung in anderen Modulen exportieren
export default DashboardModule; 