/**
 * Inventur Microservice Module
 * Containerisiertes Modul für die Inventurverwaltung
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse für das Inventur-Modul
 */
class InventurModule extends ModuleBase {
  static moduleName = 'inventur-module';
  
  static template = `
    <div class="inventur-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Inventurverwaltung'"/></h2>
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
        
        <div t-else="" class="inventur-dashboard">
          <!-- Inventur Übersicht -->
          <div class="inventur-card">
            <h3>Inventur Übersicht</h3>
            <div class="summary-stats">
              <div class="stat-item">
                <div class="stat-value"><t t-esc="state.summary.inventurenGesamt"/></div>
                <div class="stat-label">Inventuren</div>
              </div>
              <div class="stat-item">
                <div class="stat-value"><t t-esc="state.summary.aktiveInventuren"/></div>
                <div class="stat-label">Aktiv</div>
              </div>
              <div class="stat-item">
                <div class="stat-value"><t t-esc="state.summary.abgeschlosseneInventuren"/></div>
                <div class="stat-label">Abgeschlossen</div>
              </div>
            </div>
          </div>
          
          <!-- Inventurliste -->
          <div class="inventur-card">
            <h3>Inventuren</h3>
            <div class="toolbar">
              <input type="text" placeholder="Suchen..." t-on-input="onSearch" class="search-input" />
              <button class="btn btn-primary" t-on-click="onCreateInventur">Neue Inventur</button>
            </div>
            
            <div t-if="!state.inventuren.length" class="empty-state">
              <p>Keine Inventuren vorhanden.</p>
            </div>
            <table t-else="" class="data-table">
              <thead>
                <tr>
                  <th>Inventur-Nr.</th>
                  <th>Datum</th>
                  <th>Lager</th>
                  <th>Status</th>
                  <th>Fortschritt</th>
                  <th>Abweichung</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.inventuren" t-as="inventur" t-key="inventur.id">
                  <td><t t-esc="inventur.nummer"/></td>
                  <td><t t-esc="formatDate(inventur.datum)"/></td>
                  <td><t t-esc="inventur.lager"/></td>
                  <td>
                    <span t-attf-class="status-badge status-{{inventur.status}}">
                      <t t-esc="inventur.status"/>
                    </span>
                  </td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" t-att-style="'width: ' + inventur.fortschritt + '%'"></div>
                    </div>
                    <span class="progress-text"><t t-esc="inventur.fortschritt"/>%</span>
                  </td>
                  <td><t t-esc="formatCurrency(inventur.abweichung)"/></td>
                  <td class="actions">
                    <button class="btn-icon" t-on-click="() => onEditInventur(inventur)">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon" t-on-click="() => onViewInventur(inventur)">
                      <span class="material-icons">visibility</span>
                    </button>
                    <button t-if="inventur.status === 'Aktiv'" class="btn-icon" t-on-click="() => onFinalizeInventur(inventur)">
                      <span class="material-icons">check_circle</span>
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
    // Store mit Basisdaten initialisieren
    this.store = createStore(`${this.props.moduleId}-store`, {
      isLoading: true,
      error: null,
      searchQuery: '',
      inventuren: [],
      summary: {
        inventurenGesamt: 0,
        aktiveInventuren: 0,
        abgeschlosseneInventuren: 0
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
    await this.loadInventurData();
    
    // Container-Event auslösen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
  
  async loadInventurData() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Daten vom Container oder API laden
      let inventurData;
      
      if (this.containerStore?.state?.data?.inventur) {
        // Daten aus dem Container-Store laden
        inventurData = this.containerStore.state.data.inventur;
      } else if (this.apiEndpoints.getInventur) {
        // Daten von der API laden
        const response = await fetch(this.apiEndpoints.getInventur);
        
        if (!response.ok) {
          throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
        }
        
        inventurData = await response.json();
      } else {
        // Beispieldaten verwenden
        inventurData = this.getExampleInventurData();
      }
      
      this.store.update({ 
        ...inventurData,
        isLoading: false 
      });
    } catch (error) {
      console.error('Fehler beim Laden der Inventurdaten:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  getExampleInventurData() {
    // Beispieldaten für die Inventurverwaltung
    const currentDate = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(currentDate.getMonth() - 1);
    
    return {
      summary: {
        inventurenGesamt: 5,
        aktiveInventuren: 2,
        abgeschlosseneInventuren: 3
      },
      inventuren: [
        { 
          id: 1, 
          nummer: 'INV-2023-001', 
          datum: lastMonth.toISOString().split('T')[0], 
          lager: 'Hauptlager', 
          status: 'Abgeschlossen', 
          fortschritt: 100, 
          abweichung: -250.75 
        },
        { 
          id: 2, 
          nummer: 'INV-2023-002', 
          datum: lastMonth.toISOString().split('T')[0], 
          lager: 'Nebenlager', 
          status: 'Abgeschlossen', 
          fortschritt: 100, 
          abweichung: 175.50 
        },
        { 
          id: 3, 
          nummer: 'INV-2023-003', 
          datum: lastMonth.toISOString().split('T')[0], 
          lager: 'Außenlager', 
          status: 'Abgeschlossen', 
          fortschritt: 100, 
          abweichung: 0 
        },
        { 
          id: 4, 
          nummer: 'INV-2023-004', 
          datum: currentDate.toISOString().split('T')[0], 
          lager: 'Hauptlager', 
          status: 'Aktiv', 
          fortschritt: 75, 
          abweichung: 0 
        },
        { 
          id: 5, 
          nummer: 'INV-2023-005', 
          datum: currentDate.toISOString().split('T')[0], 
          lager: 'Nebenlager', 
          status: 'Aktiv', 
          fortschritt: 35, 
          abweichung: 0 
        }
      ]
    };
  }
  
  onSearch(event) {
    const searchQuery = event.target.value;
    this.store.update({ searchQuery });
    // In einer realen Anwendung würde hier eine gefilterte Suchanfrage ausgelöst werden
  }
  
  onCreateInventur() {
    // Neue Inventur erstellen
    console.log('Neue Inventur erstellen');
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onEditInventur(inventur) {
    // Inventur bearbeiten
    console.log('Inventur bearbeiten:', inventur);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onViewInventur(inventur) {
    // Inventur anzeigen
    console.log('Inventur anzeigen:', inventur);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onFinalizeInventur(inventur) {
    // Inventur abschließen
    console.log('Inventur abschließen:', inventur);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
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
    this.loadInventurData();
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('inventur-module', InventurModule, {
  title: 'Inventurverwaltung',
  description: 'Verwaltung von Inventuren und Bestandsanpassungen',
  version: '1.0.0',
  apiEndpoints: {
    getInventur: '/api/modules/inventur/liste',
    createInventur: '/api/modules/inventur/create',
    updateInventur: '/api/modules/inventur/update',
    finalizeInventur: '/api/modules/inventur/finalize'
  }
});

// CSS-Stylesheet für das Modul
const style = document.createElement('style');
style.textContent = `
  .inventur-module {
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
  
  .inventur-dashboard {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .inventur-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 16px;
  }
  
  .inventur-card h3 {
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
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }
  
  .status-Aktiv {
    background-color: #c6f6d5;
    color: #22543d;
  }
  
  .status-Abgeschlossen {
    background-color: #e2e8f0;
    color: #2d3748;
  }
  
  .progress-bar {
    width: 100px;
    height: 6px;
    background-color: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
    display: inline-block;
    margin-right: 8px;
  }
  
  .progress-fill {
    height: 100%;
    background-color: #4299e1;
    border-radius: 3px;
  }
  
  .progress-text {
    font-size: 12px;
    color: #4a5568;
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
    .inventur-dashboard {
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
export default InventurModule; 