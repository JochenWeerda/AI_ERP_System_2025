/**
 * TSE Microservice Module
 * Containerisiertes Modul für die Technische Sicherheitseinrichtung (TSE)
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse für das TSE-Modul
 */
class TSEModule extends ModuleBase {
  static moduleName = 'tse-module';
  
  static template = `
    <div class="tse-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Technische Sicherheitseinrichtung (TSE)'"/></h2>
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
        
        <div t-else="" class="tse-dashboard">
          <!-- Status-Übersicht -->
          <div class="status-panel">
            <div class="panel-header">
              <h3>TSE-Status</h3>
              <button class="btn-icon refresh-btn" t-on-click="onRefreshStatus">
                <span class="material-icons">refresh</span>
              </button>
            </div>
            
            <div class="status-content">
              <div class="status-item">
                <div class="status-label">Status:</div>
                <div class="status-value">
                  <span t-attf-class="status-badge status-{{state.tseStatus.toLowerCase()}}">
                    <t t-esc="state.tseStatus"/>
                  </span>
                </div>
              </div>
              
              <div class="status-item">
                <div class="status-label">Letzte Prüfung:</div>
                <div class="status-value"><t t-esc="formatDateTime(state.lastCheck)"/></div>
              </div>
              
              <div class="status-item">
                <div class="status-label">Speicherbelegung:</div>
                <div class="status-value">
                  <div class="progress-bar">
                    <div class="progress-fill" t-att-style="'width: ' + state.storageUsage + '%'"></div>
                  </div>
                  <div class="progress-text"><t t-esc="state.storageUsage + '%'"/></div>
                </div>
              </div>
              
              <div class="status-item">
                <div class="status-label">Zertifikat gültig bis:</div>
                <div class="status-value"><t t-esc="formatDate(state.certificateValidUntil)"/></div>
              </div>
              
              <div class="status-item">
                <div class="status-label">Aktive Verbindungen:</div>
                <div class="status-value"><t t-esc="state.activeConnections"/></div>
              </div>
            </div>
            
            <div class="panel-actions">
              <button class="btn btn-primary" t-on-click="onTestConnection">
                Verbindung testen
              </button>
              <button class="btn btn-secondary" t-on-click="onViewLogs">
                Logs anzeigen
              </button>
            </div>
          </div>
          
          <!-- Transaktionen -->
          <div class="transactions-panel">
            <div class="panel-header">
              <h3>Aktuelle Transaktionen</h3>
            </div>
            
            <div class="panel-content">
              <div class="toolbar">
                <div class="search-bar">
                  <input type="text" placeholder="Suchen..." t-on-input="onSearch" class="search-input" />
                  <select t-on-change="onFilterChange" class="filter-select">
                    <option value="alle">Alle Transaktionen</option>
                    <option value="offen">Offene Transaktionen</option>
                    <option value="abgeschlossen">Abgeschlossene Transaktionen</option>
                    <option value="fehlerhaft">Fehlerhafte Transaktionen</option>
                  </select>
                </div>
              </div>
              
              <div t-if="!state.transactions.length" class="empty-state">
                <p>Keine Transaktionen vorhanden.</p>
              </div>
              <table t-else="" class="data-table">
                <thead>
                  <tr>
                    <th>TSE-ID</th>
                    <th>Zeitstempel</th>
                    <th>Beleg</th>
                    <th>Art</th>
                    <th>Status</th>
                    <th>Signatur</th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr t-foreach="state.transactions" t-as="transaction" t-key="transaction.id">
                    <td><t t-esc="transaction.tseId"/></td>
                    <td><t t-esc="formatDateTime(transaction.timestamp)"/></td>
                    <td><t t-esc="transaction.receiptId"/></td>
                    <td><t t-esc="transaction.type"/></td>
                    <td>
                      <span t-attf-class="status-badge status-{{transaction.status.toLowerCase()}}">
                        <t t-esc="transaction.status"/>
                      </span>
                    </td>
                    <td class="signature-cell"><t t-esc="formatSignature(transaction.signature)"/></td>
                    <td class="actions">
                      <button class="btn-icon" t-on-click="() => onViewTransaction(transaction)">
                        <span class="material-icons">visibility</span>
                      </button>
                      <button t-if="transaction.status === 'Offen'" class="btn-icon" t-on-click="() => onFinishTransaction(transaction)">
                        <span class="material-icons">check</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Einstellungen -->
          <div class="settings-panel">
            <div class="panel-header">
              <h3>TSE-Einstellungen</h3>
            </div>
            
            <div class="panel-content">
              <div class="settings-grid">
                <div class="settings-group">
                  <h4>Verbindungseinstellungen</h4>
                  <div class="settings-item">
                    <label>TSE-Typ:</label>
                    <select t-model="state.settings.tseType" class="settings-input">
                      <option value="hardware">Hardware-TSE</option>
                      <option value="cloud">Cloud-TSE</option>
                    </select>
                  </div>
                  <div class="settings-item">
                    <label>Verbindungstyp:</label>
                    <select t-model="state.settings.connectionType" class="settings-input">
                      <option value="local">Lokal</option>
                      <option value="network">Netzwerk</option>
                      <option value="usb">USB</option>
                    </select>
                  </div>
                  <div class="settings-item">
                    <label>Adresse/Pfad:</label>
                    <input type="text" t-model="state.settings.address" class="settings-input" />
                  </div>
                </div>
                
                <div class="settings-group">
                  <h4>Exporteinstellungen</h4>
                  <div class="settings-item">
                    <label>Export-Intervall:</label>
                    <select t-model="state.settings.exportInterval" class="settings-input">
                      <option value="daily">Täglich</option>
                      <option value="weekly">Wöchentlich</option>
                      <option value="monthly">Monatlich</option>
                    </select>
                  </div>
                  <div class="settings-item">
                    <label>Export-Pfad:</label>
                    <input type="text" t-model="state.settings.exportPath" class="settings-input" />
                  </div>
                </div>
              </div>
              
              <div class="settings-actions">
                <button class="btn btn-primary" t-on-click="onSaveSettings">Einstellungen speichern</button>
                <button class="btn btn-secondary" t-on-click="onExportData">Daten exportieren</button>
              </div>
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
      tseStatus: 'Verbunden',
      lastCheck: new Date().toISOString(),
      storageUsage: 27,
      certificateValidUntil: '2025-12-31',
      activeConnections: 3,
      transactions: [],
      settings: {
        tseType: 'hardware',
        connectionType: 'local',
        address: '/dev/tse0',
        exportInterval: 'daily',
        exportPath: '/export/tse'
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
    await this.loadData();
    
    // Container-Event auslösen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
  
  async loadData() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Daten vom Container oder API laden
      let tseData;
      
      if (this.containerStore?.state?.data?.tse) {
        // Daten aus dem Container-Store laden
        tseData = this.containerStore.state.data.tse;
      } else if (this.apiEndpoints.getTSE) {
        // Daten von der API laden
        const response = await fetch(this.apiEndpoints.getTSE);
        
        if (!response.ok) {
          throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
        }
        
        tseData = await response.json();
      } else {
        // Beispieldaten verwenden
        tseData = this.getExampleData();
      }
      
      this.store.update({ 
        ...tseData,
        isLoading: false 
      });
    } catch (error) {
      console.error('Fehler beim Laden der TSE-Daten:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  getExampleData() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    return {
      transactions: [
        {
          id: 1,
          tseId: 'TSE-2023-001',
          timestamp: now.toISOString(),
          receiptId: 'B-2023-1001',
          type: 'Verkauf',
          status: 'Abgeschlossen',
          signature: 'A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8'
        },
        {
          id: 2,
          tseId: 'TSE-2023-002',
          timestamp: now.toISOString(),
          receiptId: 'B-2023-1002',
          type: 'Storno',
          status: 'Abgeschlossen',
          signature: 'B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8'
        },
        {
          id: 3,
          tseId: 'TSE-2023-003',
          timestamp: yesterday.toISOString(),
          receiptId: 'B-2023-1003',
          type: 'Verkauf',
          status: 'Offen',
          signature: ''
        },
        {
          id: 4,
          tseId: 'TSE-2023-004',
          timestamp: yesterday.toISOString(),
          receiptId: 'B-2023-1004',
          type: 'Tagesabschluss',
          status: 'Fehlerhaft',
          signature: 'C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8'
        }
      ]
    };
  }
  
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  }
  
  formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('de-DE');
  }
  
  formatSignature(signature) {
    if (!signature) return '-';
    return signature.substring(0, 8) + '...';
  }
  
  onSearch(event) {
    const searchQuery = event.target.value;
    this.store.update({ searchQuery });
    // In einer realen Anwendung würde hier eine gefilterte Suchanfrage ausgelöst werden
  }
  
  onFilterChange(event) {
    const filterValue = event.target.value;
    console.log('Filter geändert:', filterValue);
    // In einer realen Anwendung würde hier der Filter angewendet werden
  }
  
  onRefreshStatus() {
    console.log('Status aktualisieren');
    this.loadData();
  }
  
  onTestConnection() {
    console.log('TSE-Verbindung testen');
    // Hier würde die Verbindung zur TSE getestet werden
  }
  
  onViewLogs() {
    console.log('TSE-Logs anzeigen');
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onViewTransaction(transaction) {
    console.log('Transaktion anzeigen:', transaction);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onFinishTransaction(transaction) {
    console.log('Transaktion abschließen:', transaction);
    // Hier würde die Transaktion abgeschlossen werden
  }
  
  onSaveSettings() {
    console.log('TSE-Einstellungen speichern:', this.state.settings);
    // Hier würden die Einstellungen gespeichert werden
  }
  
  onExportData() {
    console.log('TSE-Daten exportieren');
    // Hier würde der Export der TSE-Daten gestartet werden
  }
  
  onRefresh() {
    this.loadData();
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('tse-module', TSEModule, {
  title: 'Technische Sicherheitseinrichtung (TSE)',
  description: 'Verwaltung der Technischen Sicherheitseinrichtung für die Fiskalgesetzgebung',
  version: '1.0.0',
  apiEndpoints: {
    getTSE: '/api/modules/tse/data',
    testConnection: '/api/modules/tse/test-connection',
    getLogs: '/api/modules/tse/logs',
    getTransaction: '/api/modules/tse/transaction',
    finishTransaction: '/api/modules/tse/transaction/finish',
    saveSettings: '/api/modules/tse/settings',
    exportData: '/api/modules/tse/export'
  }
});

// CSS-Stylesheet für das Modul
const style = document.createElement('style');
style.textContent = `
  .tse-module {
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
  
  .tse-dashboard {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .status-panel,
  .transactions-panel,
  .settings-panel {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e2e8f0;
    background-color: #f7fafc;
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #2d3748;
  }
  
  .panel-content {
    padding: 16px;
  }
  
  .status-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .status-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .status-label {
    font-weight: 600;
    color: #4a5568;
  }
  
  .status-value {
    color: #2d3748;
  }
  
  .panel-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  
  .progress-bar {
    height: 8px;
    background-color: #edf2f7;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 4px;
  }
  
  .progress-fill {
    height: 100%;
    background-color: #4299e1;
    border-radius: 4px;
  }
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .search-bar {
    display: flex;
    gap: 8px;
  }
  
  .search-input {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 14px;
    width: 250px;
  }
  
  .filter-select {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
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
  
  .signature-cell {
    font-family: monospace;
  }
  
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
  }
  
  .settings-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .settings-group h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
  }
  
  .settings-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .settings-item label {
    font-weight: 500;
    color: #4a5568;
  }
  
  .settings-input {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
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
  
  .refresh-btn {
    padding: 6px;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }
  
  .status-verbunden {
    background-color: #c6f6d5;
    color: #22543d;
  }
  
  .status-getrennt {
    background-color: #fed7d7;
    color: #742a2a;
  }
  
  .status-abgeschlossen {
    background-color: #c6f6d5;
    color: #22543d;
  }
  
  .status-offen {
    background-color: #bee3f8;
    color: #2c5282;
  }
  
  .status-fehlerhaft {
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
  
  @media (max-width: 768px) {
    .status-content {
      grid-template-columns: 1fr;
    }
    
    .settings-grid {
      grid-template-columns: 1fr;
    }
    
    .toolbar {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .search-bar {
      width: 100%;
      flex-direction: column;
    }
    
    .search-input, 
    .filter-select {
      width: 100%;
    }
  }
`;

document.head.appendChild(style);

// Für die Verwendung in anderen Modulen exportieren
export default TSEModule;

