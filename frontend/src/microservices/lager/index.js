/**
 * Lager Microservice Module
 * Containerisiertes Modul für die Lagerverwaltung
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse für das Lager-Modul
 */
class LagerModule extends ModuleBase {
  static moduleName = 'lager-module';
  
  static template = `
    <div class="lager-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Lagerverwaltung'"/></h2>
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
        
        <div t-else="" class="lager-dashboard">
          <!-- Lagerbestand Übersicht -->
          <div class="lager-card">
            <h3>Lagerbestand Übersicht</h3>
            <div class="summary-stats">
              <div class="stat-item">
                <div class="stat-value"><t t-esc="state.summary.artikelGesamt"/></div>
                <div class="stat-label">Artikel</div>
              </div>
              <div class="stat-item">
                <div class="stat-value"><t t-esc="state.summary.lagerAnzahl"/></div>
                <div class="stat-label">Lager</div>
              </div>
              <div class="stat-item">
                <div class="stat-value"><t t-esc="formatCurrency(state.summary.bestandswert)"/></div>
                <div class="stat-label">Bestandswert</div>
              </div>
            </div>
          </div>
          
          <!-- Artikelliste -->
          <div class="lager-card">
            <h3>Artikelbestand</h3>
            <div class="toolbar">
              <input type="text" placeholder="Suchen..." t-on-input="onSearch" class="search-input" />
              <button class="btn btn-primary" t-on-click="onOpenLagerKorrektur">Lagerkorrektur</button>
            </div>
            
            <div t-if="!state.artikelListe.length" class="empty-state">
              <p>Keine Artikel im Lager vorhanden.</p>
            </div>
            <table t-else="" class="data-table">
              <thead>
                <tr>
                  <th>Artikel-Nr.</th>
                  <th>Bezeichnung</th>
                  <th>Lager</th>
                  <th>Bestand</th>
                  <th>Einheit</th>
                  <th>Wert</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.artikelListe" t-as="artikel" t-key="artikel.id">
                  <td><t t-esc="artikel.artikelnummer"/></td>
                  <td><t t-esc="artikel.bezeichnung"/></td>
                  <td><t t-esc="artikel.lager"/></td>
                  <td><t t-esc="artikel.bestand"/></td>
                  <td><t t-esc="artikel.einheit"/></td>
                  <td><t t-esc="formatCurrency(artikel.wert)"/></td>
                  <td class="actions">
                    <button class="btn-icon" t-on-click="() => onEditArtikel(artikel)">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon" t-on-click="() => onShowHistory(artikel)">
                      <span class="material-icons">history</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div class="pagination">
              <button 
                t-att-disabled="state.currentPage <= 1" 
                t-on-click="() => onChangePage(state.currentPage - 1)" 
                class="btn btn-text"
              >
                Zurück
              </button>
              <span class="page-info">
                Seite <t t-esc="state.currentPage"/> von <t t-esc="state.totalPages"/>
              </span>
              <button 
                t-att-disabled="state.currentPage >= state.totalPages" 
                t-on-click="() => onChangePage(state.currentPage + 1)" 
                class="btn btn-text"
              >
                Weiter
              </button>
            </div>
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
      searchQuery: '',
      currentPage: 1,
      totalPages: 1,
      artikelListe: [],
      summary: {
        artikelGesamt: 0,
        lagerAnzahl: 0,
        bestandswert: 0
      }
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
    await this.loadLagerData();
    
    // Container-Event auslösen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
  
  async loadLagerData() {
    try {
      this.store.update({ isLoading: true, error: null });
      
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
        lagerData = this.getExampleLagerData();
      }
      
      this.store.update({ 
        ...lagerData,
        isLoading: false 
      });
    } catch (error) {
      console.error('Fehler beim Laden der Lagerdaten:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  getExampleLagerData() {
    // Beispieldaten für die Lagerverwaltung
    return {
      summary: {
        artikelGesamt: 156,
        lagerAnzahl: 3,
        bestandswert: 85750.50
      },
      currentPage: 1,
      totalPages: 4,
      artikelListe: [
        { id: 1, artikelnummer: 'A001', bezeichnung: 'Produkt A', lager: 'Hauptlager', bestand: 150, einheit: 'Stk', wert: 3750.00 },
        { id: 2, artikelnummer: 'A002', bezeichnung: 'Produkt B', lager: 'Hauptlager', bestand: 75, einheit: 'Stk', wert: 1875.00 },
        { id: 3, artikelnummer: 'A003', bezeichnung: 'Produkt C', lager: 'Nebenlager', bestand: 25, einheit: 'Kg', wert: 625.00 },
        { id: 4, artikelnummer: 'A004', bezeichnung: 'Produkt D', lager: 'Hauptlager', bestand: 200, einheit: 'Stk', wert: 5000.00 },
        { id: 5, artikelnummer: 'A005', bezeichnung: 'Produkt E', lager: 'Außenlager', bestand: 50, einheit: 'Liter', wert: 1250.00 },
        { id: 6, artikelnummer: 'A006', bezeichnung: 'Produkt F', lager: 'Hauptlager', bestand: 100, einheit: 'Stk', wert: 2500.00 },
        { id: 7, artikelnummer: 'A007', bezeichnung: 'Produkt G', lager: 'Nebenlager', bestand: 35, einheit: 'Stk', wert: 875.00 },
        { id: 8, artikelnummer: 'A008', bezeichnung: 'Produkt H', lager: 'Außenlager', bestand: 15, einheit: 'Kg', wert: 375.00 }
      ]
    };
  }
  
  onSearch(event) {
    const searchQuery = event.target.value;
    this.store.update({ searchQuery, currentPage: 1 });
    // In einer realen Anwendung würde hier eine gefilterte Suchanfrage ausgelöst werden
  }
  
  onChangePage(page) {
    if (page < 1 || page > this.state.totalPages) return;
    this.store.update({ currentPage: page });
    // In einer realen Anwendung würden hier die entsprechenden Daten für die Seite geladen werden
  }
  
  onOpenLagerKorrektur() {
    // Lagerkorrektur-Dialog öffnen
    console.log('Lagerkorrektur öffnen');
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onEditArtikel(artikel) {
    // Artikel bearbeiten
    console.log('Artikel bearbeiten:', artikel);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onShowHistory(artikel) {
    // Artikelhistorie anzeigen
    console.log('Artikelhistorie anzeigen:', artikel);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  formatCurrency(value) {
    return value.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR'
    });
  }
  
  onRefresh() {
    this.loadLagerData();
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('lager-module', LagerModule, {
  title: 'Lagerverwaltung',
  description: 'Verwaltung von Lagerbeständen und Lagerkorrekturen',
  version: '1.0.0',
  apiEndpoints: {
    getLager: '/api/modules/lager/bestand',
    updateLager: '/api/modules/lager/update',
    getLagerHistory: '/api/modules/lager/history'
  }
});

// CSS-Stylesheet für das Modul
const style = document.createElement('style');
style.textContent = `
  .lager-module {
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
  
  .lager-dashboard {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .lager-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 16px;
  }
  
  .lager-card h3 {
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
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .search-input {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 14px;
    width: 250px;
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
  
  .btn-primary:hover {
    background-color: #3182ce;
  }
  
  .btn-secondary {
    background-color: #edf2f7;
    color: #2d3748;
    border: 1px solid #e2e8f0;
  }
  
  .btn-secondary:hover {
    background-color: #e2e8f0;
  }
  
  .btn-text {
    background: none;
    border: none;
    color: #4299e1;
    padding: 4px 8px;
  }
  
  .btn-text:disabled {
    color: #a0aec0;
    cursor: not-allowed;
  }
  
  .btn-icon {
    background: none;
    border: none;
    color: #4a5568;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
  }
  
  .btn-icon:hover {
    background-color: #edf2f7;
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
  
  .actions {
    display: flex;
    gap: 8px;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 16px;
    gap: 16px;
  }
  
  .page-info {
    color: #4a5568;
    font-size: 14px;
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
  
  @media (max-width: 768px) {
    .lager-dashboard {
      grid-template-columns: 1fr;
    }
    
    .toolbar {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .search-input {
      width: 100%;
    }
  }
`;

document.head.appendChild(style);

// Für die Verwendung in anderen Modulen exportieren
export default LagerModule; 