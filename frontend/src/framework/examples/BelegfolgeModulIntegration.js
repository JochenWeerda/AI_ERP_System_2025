/**
 * BelegfolgeModulIntegration.js
 * Beispiel für die Integration von Belegfolge-Modulen in das OWL-Framework
 */

import { ModuleBase, registerModule } from '../index.js';
import { createStore } from '../core/StoreManager.js';

/**
 * Basisklasse für Belegfolge-Module
 */
export class BelegfolgeModuleBase extends ModuleBase {
  static template = `
    <div class="belegfolge-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Belegfolge-Modul'"/></h2>
        <div class="module-actions" t-if="showActions">
          <button class="btn btn-primary" t-on-click="onCreateBeleg">
            <i class="icon icon-plus"></i> Neuer Beleg
          </button>
          <button class="btn btn-secondary" t-on-click="onRefresh">
            <i class="icon icon-refresh"></i> Aktualisieren
          </button>
        </div>
      </div>
      
      <div class="module-content">
        <div class="filter-bar">
          <div class="search-field">
            <input type="text" 
                  placeholder="Belege durchsuchen..." 
                  t-model="state.searchTerm" 
                  t-on-keyup="onSearch" />
          </div>
          <div class="filter-options">
            <select t-model="state.statusFilter" t-on-change="onFilterChange">
              <option value="">Alle Status</option>
              <option value="draft">Entwurf</option>
              <option value="pending">In Bearbeitung</option>
              <option value="completed">Abgeschlossen</option>
              <option value="canceled">Storniert</option>
            </select>
            <select t-model="state.dateFilter" t-on-change="onFilterChange">
              <option value="">Alle Zeiträume</option>
              <option value="today">Heute</option>
              <option value="week">Diese Woche</option>
              <option value="month">Dieser Monat</option>
              <option value="quarter">Dieses Quartal</option>
              <option value="year">Dieses Jahr</option>
            </select>
          </div>
        </div>
        
        <div t-if="state.isLoading" class="loading-indicator">
          Belege werden geladen...
        </div>
        <div t-elif="state.error" class="error-message">
          <p>Fehler beim Laden der Belege:</p>
          <p><t t-esc="state.error"/></p>
          <button class="btn btn-secondary" t-on-click="onRefresh">Erneut versuchen</button>
        </div>
        <div t-elif="!state.belege.length" class="empty-state">
          <p>Keine Belege vorhanden.</p>
          <button class="btn btn-primary" t-on-click="onCreateBeleg">Neuen Beleg erstellen</button>
        </div>
        <div t-else="" class="belege-table-container">
          <table class="belege-table">
            <thead>
              <tr>
                <th>Beleg-Nr.</th>
                <th>Datum</th>
                <th>Partner</th>
                <th>Betrag</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr t-foreach="filteredBelege" t-as="beleg" t-key="beleg.id" 
                 t-att-class="{ 'draft': beleg.status === 'draft', 'completed': beleg.status === 'completed', 'canceled': beleg.status === 'canceled' }">
                <td><t t-esc="beleg.nummer"/></td>
                <td><t t-esc="formatDate(beleg.datum)"/></td>
                <td><t t-esc="beleg.partner"/></td>
                <td><t t-esc="formatCurrency(beleg.betrag)"/></td>
                <td><span class="status-badge" t-att-data-status="beleg.status"><t t-esc="getStatusText(beleg.status)"/></span></td>
                <td class="actions-cell">
                  <button class="btn btn-icon" t-on-click="() => onViewBeleg(beleg)" title="Anzeigen">
                    <i class="icon icon-eye"></i>
                  </button>
                  <button class="btn btn-icon" t-on-click="() => onEditBeleg(beleg)" t-if="canEdit(beleg)" title="Bearbeiten">
                    <i class="icon icon-edit"></i>
                  </button>
                  <button class="btn btn-icon" t-on-click="() => onPrintBeleg(beleg)" title="Drucken">
                    <i class="icon icon-print"></i>
                  </button>
                  <button class="btn btn-icon danger" t-on-click="() => onCancelBeleg(beleg)" t-if="canCancel(beleg)" title="Stornieren">
                    <i class="icon icon-cancel"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="pagination" t-if="state.belege.length > 0">
          <button class="btn btn-secondary" 
                 t-att-disabled="state.currentPage === 1"
                 t-on-click="() => onPageChange(state.currentPage - 1)">
            Vorherige
          </button>
          <span class="page-info">Seite <t t-esc="state.currentPage"/> von <t t-esc="state.totalPages"/></span>
          <button class="btn btn-secondary" 
                 t-att-disabled="state.currentPage === state.totalPages"
                 t-on-click="() => onPageChange(state.currentPage + 1)">
            Nächste
          </button>
        </div>
      </div>
    </div>
  `;
  
  setup() {
    // Store mit Basisdaten initialisieren
    this.store = createStore(`${this.props.moduleId}-store`, {
      belege: [],
      isLoading: true,
      error: null,
      selectedBeleg: null,
      searchTerm: '',
      statusFilter: '',
      dateFilter: '',
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10
    });
    
    // State aus dem Store übernehmen
    this.state = this.useState(this.store.state);
    
    // Aktionen anzeigen?
    this.showActions = this.props.showActions !== false;
    
    // Belege laden
    this.loadBelege();
  }
  
  get filteredBelege() {
    let result = [...this.state.belege];
    
    // Suchbegriff filtern
    if (this.state.searchTerm) {
      const searchTerm = this.state.searchTerm.toLowerCase();
      result = result.filter(beleg => {
        return beleg.nummer.toLowerCase().includes(searchTerm) ||
               beleg.partner.toLowerCase().includes(searchTerm);
      });
    }
    
    // Status filtern
    if (this.state.statusFilter) {
      result = result.filter(beleg => beleg.status === this.state.statusFilter);
    }
    
    // Datum filtern
    if (this.state.dateFilter) {
      const today = new Date();
      const startDate = new Date();
      
      switch (this.state.dateFilter) {
        case 'today':
          // Heute
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          // Diese Woche (Montag)
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1);
          startDate.setDate(diff);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          // Dieser Monat
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'quarter':
          // Dieses Quartal
          const quarter = Math.floor(today.getMonth() / 3);
          startDate.setMonth(quarter * 3);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'year':
          // Dieses Jahr
          startDate.setMonth(0);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
      
      result = result.filter(beleg => {
        const belegDate = new Date(beleg.datum);
        return belegDate >= startDate && belegDate <= today;
      });
    }
    
    // Paginierung anwenden
    const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
    const endIndex = startIndex + this.state.itemsPerPage;
    
    // Gesamtanzahl der Seiten berechnen
    this.store.update({
      totalPages: Math.ceil(result.length / this.state.itemsPerPage) || 1
    });
    
    // Nur die Belege für die aktuelle Seite zurückgeben
    return result.slice(startIndex, endIndex);
  }
  
  async loadBelege() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Hier würde normalerweise ein API-Aufruf stehen
      // Für das Beispiel verwenden wir Beispieldaten
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const belegeData = this.getExampleBelege();
      
      this.store.update({ 
        belege: belegeData, 
        isLoading: false,
        totalPages: Math.ceil(belegeData.length / this.state.itemsPerPage) || 1
      });
    } catch (error) {
      console.error('Fehler beim Laden der Belege:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  getExampleBelege() {
    // Diese Methode wird von abgeleiteten Klassen überschrieben
    return [];
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  }
  
  formatCurrency(amount) {
    return amount.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR'
    });
  }
  
  getStatusText(status) {
    const statusMap = {
      'draft': 'Entwurf',
      'pending': 'In Bearbeitung',
      'completed': 'Abgeschlossen',
      'canceled': 'Storniert'
    };
    
    return statusMap[status] || status;
  }
  
  canEdit(beleg) {
    // Nur Entwürfe und in Bearbeitung befindliche Belege können bearbeitet werden
    return ['draft', 'pending'].includes(beleg.status);
  }
  
  canCancel(beleg) {
    // Nur Entwürfe und in Bearbeitung befindliche Belege können storniert werden
    return ['draft', 'pending'].includes(beleg.status);
  }
  
  onRefresh() {
    this.loadBelege();
  }
  
  onSearch(event) {
    // Bei Enter-Taste suchen
    if (event.key === 'Enter' || !event.key) {
      this.store.update({ currentPage: 1 });
    }
  }
  
  onFilterChange() {
    // Bei Filteränderung zurück zur ersten Seite
    this.store.update({ currentPage: 1 });
  }
  
  onPageChange(page) {
    // Seite wechseln
    this.store.update({ currentPage: page });
  }
  
  onCreateBeleg() {
    console.log('Neuen Beleg erstellen');
    
    // Event auslösen
    this.trigger('module-action', { 
      action: 'create',
      moduleId: this.props.moduleId
    });
  }
  
  onViewBeleg(beleg) {
    console.log('Beleg anzeigen:', beleg);
    
    // Event auslösen
    this.trigger('module-action', { 
      action: 'view',
      moduleId: this.props.moduleId,
      data: beleg
    });
  }
  
  onEditBeleg(beleg) {
    console.log('Beleg bearbeiten:', beleg);
    
    // Event auslösen
    this.trigger('module-action', { 
      action: 'edit',
      moduleId: this.props.moduleId,
      data: beleg
    });
  }
  
  onPrintBeleg(beleg) {
    console.log('Beleg drucken:', beleg);
    
    // Event auslösen
    this.trigger('module-action', { 
      action: 'print',
      moduleId: this.props.moduleId,
      data: beleg
    });
  }
  
  onCancelBeleg(beleg) {
    console.log('Beleg stornieren:', beleg);
    
    // Bestätigung einholen
    const confirmed = confirm(`Möchten Sie den Beleg "${beleg.nummer}" wirklich stornieren?`);
    
    if (confirmed) {
      // Hier würde die Logik zum Stornieren implementiert
      // Für das Beispiel ändern wir den Status
      const updatedBelege = this.state.belege.map(b => {
        if (b.id === beleg.id) {
          return { ...b, status: 'canceled' };
        }
        return b;
      });
      
      this.store.update({ belege: updatedBelege });
      
      // Event auslösen
      this.trigger('module-action', { 
        action: 'cancel',
        moduleId: this.props.moduleId,
        data: beleg
      });
    }
  }
}

/**
 * Spezialisiertes Verkaufsbeleg-Modul
 */
export class VerkaufModule extends BelegfolgeModuleBase {
  getExampleBelege() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return [
      { 
        id: 1, 
        nummer: 'RG-2025-0001', 
        datum: today.toISOString(), 
        partner: 'Musterfirma GmbH', 
        betrag: 1299.99, 
        status: 'draft',
        items: [
          { id: 1, artikel: 'Produkt A', menge: 2, preis: 499.99, summe: 999.98 },
          { id: 2, artikel: 'Produkt B', menge: 1, preis: 300.01, summe: 300.01 }
        ]
      },
      { 
        id: 2, 
        nummer: 'RG-2025-0002', 
        datum: yesterday.toISOString(), 
        partner: 'Beispiel AG', 
        betrag: 2499.50, 
        status: 'pending',
        items: [
          { id: 1, artikel: 'Produkt C', menge: 5, preis: 499.90, summe: 2499.50 }
        ]
      },
      { 
        id: 3, 
        nummer: 'RG-2025-0003', 
        datum: lastWeek.toISOString(), 
        partner: 'Kunde GmbH', 
        betrag: 599.95, 
        status: 'completed',
        items: [
          { id: 1, artikel: 'Produkt D', menge: 1, preis: 599.95, summe: 599.95 }
        ]
      },
      { 
        id: 4, 
        nummer: 'RG-2025-0004', 
        datum: lastMonth.toISOString(), 
        partner: 'Mustermax KG', 
        betrag: 1850.00, 
        status: 'canceled',
        items: [
          { id: 1, artikel: 'Produkt E', menge: 10, preis: 185.00, summe: 1850.00 }
        ]
      }
    ];
  }
}

/**
 * Spezialisiertes Einkaufsbeleg-Modul
 */
export class EinkaufModule extends BelegfolgeModuleBase {
  getExampleBelege() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return [
      { 
        id: 1, 
        nummer: 'BE-2025-0001', 
        datum: today.toISOString(), 
        partner: 'Lieferant AG', 
        betrag: 2459.99, 
        status: 'draft',
        items: [
          { id: 1, artikel: 'Rohstoff A', menge: 100, preis: 10.50, summe: 1050.00 },
          { id: 2, artikel: 'Rohstoff B', menge: 50, preis: 28.20, summe: 1410.00 }
        ]
      },
      { 
        id: 2, 
        nummer: 'BE-2025-0002', 
        datum: yesterday.toISOString(), 
        partner: 'Großhandel GmbH', 
        betrag: 1875.50, 
        status: 'pending',
        items: [
          { id: 1, artikel: 'Produkt X', menge: 25, preis: 75.02, summe: 1875.50 }
        ]
      },
      { 
        id: 3, 
        nummer: 'BE-2025-0003', 
        datum: lastWeek.toISOString(), 
        partner: 'Zulieferer KG', 
        betrag: 3250.00, 
        status: 'completed',
        items: [
          { id: 1, artikel: 'Maschine A', menge: 1, preis: 3250.00, summe: 3250.00 }
        ]
      },
      { 
        id: 4, 
        nummer: 'BE-2025-0004', 
        datum: lastMonth.toISOString(), 
        partner: 'Handelspartner GmbH', 
        betrag: 950.75, 
        status: 'canceled',
        items: [
          { id: 1, artikel: 'Zubehör A', menge: 5, preis: 99.95, summe: 499.75 },
          { id: 2, artikel: 'Zubehör B', menge: 15, preis: 30.00, summe: 450.00 }
        ]
      }
    ];
  }
}

// Module registrieren
registerModule('verkauf-module', VerkaufModule);
registerModule('einkauf-module', EinkaufModule);

// Für die Verwendung in anderen Modulen exportieren
export default {
  BelegfolgeModuleBase,
  VerkaufModule,
  EinkaufModule
};