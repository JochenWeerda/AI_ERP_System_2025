/**
 * Qualität Microservice Module
 * Containerisiertes Modul für das Qualitätsmanagement
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse für das Qualitäts-Modul
 */
class QualitaetModule extends ModuleBase {
  static moduleName = 'qualitaet-module';
  
  static template = `
    <div class="qualitaet-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Qualitätsmanagement'"/></h2>
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
        
        <div t-else="" class="qualitaet-dashboard">
          <!-- Navigation Tabs -->
          <div class="tab-navigation">
            <button 
              t-foreach="state.tabs" 
              t-as="tab" 
              t-key="tab.id"
              t-att-class="{'tab-button': true, 'active': state.activeTab === tab.id}"
              t-on-click="() => onTabChange(tab.id)"
            >
              <t t-esc="tab.label"/>
            </button>
          </div>
          
          <!-- Prüfungen -->
          <div t-if="state.activeTab === 'pruefungen'" class="tab-content">
            <div class="toolbar">
              <div class="search-bar">
                <input type="text" placeholder="Suchen..." t-on-input="onSearch" class="search-input" />
                <select t-on-change="onFilterChange" class="filter-select">
                  <option value="alle">Alle Status</option>
                  <option value="offen">Offen</option>
                  <option value="in_bearbeitung">In Bearbeitung</option>
                  <option value="abgeschlossen">Abgeschlossen</option>
                  <option value="eskaliert">Eskaliert</option>
                </select>
              </div>
              <button class="btn btn-primary" t-on-click="onCreatePruefung">Neue Prüfung</button>
            </div>
            
            <div t-if="!state.pruefungen.length" class="empty-state">
              <p>Keine Qualitätsprüfungen vorhanden.</p>
            </div>
            <table t-else="" class="data-table">
              <thead>
                <tr>
                  <th>Prüfnr.</th>
                  <th>Datum</th>
                  <th>Artikel</th>
                  <th>Charge</th>
                  <th>Status</th>
                  <th>Verantwortlich</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.pruefungen" t-as="pruefung" t-key="pruefung.id">
                  <td><t t-esc="pruefung.nummer"/></td>
                  <td><t t-esc="formatDate(pruefung.datum)"/></td>
                  <td><t t-esc="pruefung.artikel"/></td>
                  <td><t t-esc="pruefung.charge"/></td>
                  <td>
                    <span t-attf-class="status-badge status-{{pruefung.status}}">
                      <t t-esc="pruefung.statusText"/>
                    </span>
                  </td>
                  <td><t t-esc="pruefung.verantwortlich"/></td>
                  <td class="actions">
                    <button class="btn-icon" t-on-click="() => onEditPruefung(pruefung)">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon" t-on-click="() => onViewPruefung(pruefung)">
                      <span class="material-icons">visibility</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Checklisten -->
          <div t-if="state.activeTab === 'checklisten'" class="tab-content">
            <div class="toolbar">
              <input type="text" placeholder="Suchen..." t-on-input="onSearch" class="search-input" />
              <button class="btn btn-primary" t-on-click="onCreateCheckliste">Neue Checkliste</button>
            </div>
            
            <div t-if="!state.checklisten.length" class="empty-state">
              <p>Keine Checklisten vorhanden.</p>
            </div>
            <table t-else="" class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Kategorie</th>
                  <th>Punkte</th>
                  <th>Erstellt am</th>
                  <th>Letzte Änderung</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.checklisten" t-as="checkliste" t-key="checkliste.id">
                  <td><t t-esc="checkliste.id"/></td>
                  <td><t t-esc="checkliste.name"/></td>
                  <td><t t-esc="checkliste.kategorie"/></td>
                  <td><t t-esc="checkliste.punkteAnzahl"/></td>
                  <td><t t-esc="formatDate(checkliste.erstelltAm)"/></td>
                  <td><t t-esc="formatDate(checkliste.letzteAenderung)"/></td>
                  <td class="actions">
                    <button class="btn-icon" t-on-click="() => onEditCheckliste(checkliste)">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon" t-on-click="() => onViewCheckliste(checkliste)">
                      <span class="material-icons">visibility</span>
                    </button>
                    <button class="btn-icon" t-on-click="() => onDuplicateCheckliste(checkliste)">
                      <span class="material-icons">content_copy</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Chargen -->
          <div t-if="state.activeTab === 'chargen'" class="tab-content">
            <div class="toolbar">
              <input type="text" placeholder="Suchen..." t-on-input="onSearch" class="search-input" />
              <button class="btn btn-primary" t-on-click="onViewChargendetails">Chargendetails</button>
            </div>
            
            <div t-if="!state.chargen.length" class="empty-state">
              <p>Keine Chargen vorhanden.</p>
            </div>
            <table t-else="" class="data-table">
              <thead>
                <tr>
                  <th>Chargennr.</th>
                  <th>Artikel</th>
                  <th>Produktionsdatum</th>
                  <th>Menge</th>
                  <th>MHD</th>
                  <th>QS-Status</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="state.chargen" t-as="charge" t-key="charge.id">
                  <td><t t-esc="charge.nummer"/></td>
                  <td><t t-esc="charge.artikel"/></td>
                  <td><t t-esc="formatDate(charge.produktionsdatum)"/></td>
                  <td><t t-esc="charge.menge + ' ' + charge.einheit"/></td>
                  <td><t t-esc="formatDate(charge.mhd)"/></td>
                  <td>
                    <span t-attf-class="status-badge status-{{charge.qsStatus}}">
                      <t t-esc="charge.qsStatusText"/>
                    </span>
                  </td>
                  <td class="actions">
                    <button class="btn-icon" t-on-click="() => onViewCharge(charge)">
                      <span class="material-icons">visibility</span>
                    </button>
                    <button class="btn-icon" t-on-click="() => onPrintChargenLabel(charge)">
                      <span class="material-icons">print</span>
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
      activeTab: 'pruefungen',
      tabs: [
        { id: 'pruefungen', label: 'Qualitätsprüfungen' },
        { id: 'checklisten', label: 'Checklisten' },
        { id: 'chargen', label: 'Chargen' }
      ],
      pruefungen: [],
      checklisten: [],
      chargen: []
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
      let data;
      
      if (this.containerStore?.state?.data?.qualitaet) {
        // Daten aus dem Container-Store laden
        data = this.containerStore.state.data.qualitaet;
      } else if (this.apiEndpoints.getQualitaet) {
        // Daten von der API laden
        const response = await fetch(this.apiEndpoints.getQualitaet);
        
        if (!response.ok) {
          throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
        }
        
        data = await response.json();
      } else {
        // Beispieldaten verwenden
        data = this.getExampleData();
      }
      
      this.store.update({ 
        ...data,
        isLoading: false 
      });
    } catch (error) {
      console.error('Fehler beim Laden der Qualitätsdaten:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  getExampleData() {
    // Beispieldaten für die Qualitätsverwaltung
    const currentDate = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(currentDate.getDate() - 7);
    
    return {
      pruefungen: [
        { 
          id: 1, 
          nummer: 'QP-2023-001', 
          datum: lastWeek.toISOString().split('T')[0], 
          artikel: 'Testartikel A', 
          charge: 'CH-1234', 
          status: 'abgeschlossen',
          statusText: 'Abgeschlossen',
          verantwortlich: 'Max Mustermann' 
        },
        { 
          id: 2, 
          nummer: 'QP-2023-002', 
          datum: currentDate.toISOString().split('T')[0], 
          artikel: 'Testartikel B', 
          charge: 'CH-1235', 
          status: 'offen',
          statusText: 'Offen',
          verantwortlich: 'Erika Musterfrau' 
        },
        { 
          id: 3, 
          nummer: 'QP-2023-003', 
          datum: currentDate.toISOString().split('T')[0], 
          artikel: 'Testartikel C', 
          charge: 'CH-1236', 
          status: 'in_bearbeitung',
          statusText: 'In Bearbeitung',
          verantwortlich: 'Thomas Test' 
        },
        { 
          id: 4, 
          nummer: 'QP-2023-004', 
          datum: lastWeek.toISOString().split('T')[0], 
          artikel: 'Testartikel D', 
          charge: 'CH-1237', 
          status: 'eskaliert',
          statusText: 'Eskaliert',
          verantwortlich: 'Lisa Probe' 
        }
      ],
      checklisten: [
        {
          id: 1,
          name: 'Tägliche Qualitätskontrolle',
          kategorie: 'Produktion',
          punkteAnzahl: 15,
          erstelltAm: '2023-01-15',
          letzteAenderung: '2023-02-10'
        },
        {
          id: 2,
          name: 'Wareneingang Kontrolle',
          kategorie: 'Lager',
          punkteAnzahl: 10,
          erstelltAm: '2023-01-20',
          letzteAenderung: '2023-02-15'
        },
        {
          id: 3,
          name: 'Endkontrolle',
          kategorie: 'Versand',
          punkteAnzahl: 12,
          erstelltAm: '2023-01-25',
          letzteAenderung: '2023-02-20'
        }
      ],
      chargen: [
        {
          id: 1,
          nummer: 'CH-1234',
          artikel: 'Testartikel A',
          produktionsdatum: '2023-02-01',
          menge: 100,
          einheit: 'Stk',
          mhd: '2024-02-01',
          qsStatus: 'freigegeben',
          qsStatusText: 'Freigegeben'
        },
        {
          id: 2,
          nummer: 'CH-1235',
          artikel: 'Testartikel B',
          produktionsdatum: '2023-02-05',
          menge: 50,
          einheit: 'Kg',
          mhd: '2023-05-05',
          qsStatus: 'in_pruefung',
          qsStatusText: 'In Prüfung'
        },
        {
          id: 3,
          nummer: 'CH-1236',
          artikel: 'Testartikel C',
          produktionsdatum: '2023-02-10',
          menge: 200,
          einheit: 'Stk',
          mhd: '2024-02-10',
          qsStatus: 'freigegeben',
          qsStatusText: 'Freigegeben'
        },
        {
          id: 4,
          nummer: 'CH-1237',
          artikel: 'Testartikel D',
          produktionsdatum: '2023-02-15',
          menge: 75,
          einheit: 'Liter',
          mhd: '2023-05-15',
          qsStatus: 'gesperrt',
          qsStatusText: 'Gesperrt'
        }
      ]
    };
  }
  
  onTabChange(tabId) {
    this.store.update({ activeTab: tabId });
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
  
  onCreatePruefung() {
    console.log('Neue Qualitätsprüfung erstellen');
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onEditPruefung(pruefung) {
    console.log('Qualitätsprüfung bearbeiten:', pruefung);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onViewPruefung(pruefung) {
    console.log('Qualitätsprüfung anzeigen:', pruefung);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onCreateCheckliste() {
    console.log('Neue Checkliste erstellen');
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onEditCheckliste(checkliste) {
    console.log('Checkliste bearbeiten:', checkliste);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onViewCheckliste(checkliste) {
    console.log('Checkliste anzeigen:', checkliste);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onDuplicateCheckliste(checkliste) {
    console.log('Checkliste duplizieren:', checkliste);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onViewChargendetails() {
    console.log('Chargendetails anzeigen');
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onViewCharge(charge) {
    console.log('Charge anzeigen:', charge);
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  onPrintChargenLabel(charge) {
    console.log('Chargenetikett drucken:', charge);
    // Hier würde die Druckfunktion aufgerufen werden
  }
  
  formatDate(dateString) {
    // Datum formatieren
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  }
  
  onRefresh() {
    this.loadData();
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('qualitaet-module', QualitaetModule, {
  title: 'Qualitätsmanagement',
  description: 'Verwaltung von Qualitätsprüfungen, Checklisten und Chargen',
  version: '1.0.0',
  apiEndpoints: {
    getQualitaet: '/api/modules/qualitaet/data',
    createPruefung: '/api/modules/qualitaet/pruefung/create',
    updatePruefung: '/api/modules/qualitaet/pruefung/update',
    createCheckliste: '/api/modules/qualitaet/checkliste/create',
    updateCheckliste: '/api/modules/qualitaet/checkliste/update',
    getChargen: '/api/modules/qualitaet/chargen'
  }
});

// CSS-Stylesheet für das Modul
const style = document.createElement('style');
style.textContent = `
  .qualitaet-module {
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
  
  .qualitaet-dashboard {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .tab-navigation {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 16px;
  }
  
  .tab-button {
    padding: 8px 16px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: #4a5568;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .tab-button:hover {
    color: #2b6cb0;
  }
  
  .tab-button.active {
    color: #2b6cb0;
    border-bottom-color: #2b6cb0;
  }
  
  .tab-content {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 16px;
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
  
  .status-offen {
    background-color: #e2e8f0;
    color: #2d3748;
  }
  
  .status-in_bearbeitung {
    background-color: #bee3f8;
    color: #2c5282;
  }
  
  .status-abgeschlossen {
    background-color: #c6f6d5;
    color: #22543d;
  }
  
  .status-eskaliert {
    background-color: #fed7d7;
    color: #742a2a;
  }
  
  .status-freigegeben {
    background-color: #c6f6d5;
    color: #22543d;
  }
  
  .status-in_pruefung {
    background-color: #bee3f8;
    color: #2c5282;
  }
  
  .status-gesperrt {
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
export default QualitaetModule;