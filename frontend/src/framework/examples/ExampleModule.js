/**
 * ExampleModule.js
 * Beispielmodul für die Verwendung des OWL Module Frameworks
 */
import { ModuleBase } from "../core/ModuleBase";
import { xml } from "@odoo/owl";
import { createStore } from "../core/StoreManager";

/**
 * Template für das Beispielmodul
 */
const EXAMPLE_MODULE_TEMPLATE = xml`
<div class="owl-module example-module" t-att-data-module-id="props.moduleId">
  <div class="owl-module-header">
    <h3>Beispielmodul</h3>
    <div class="module-actions">
      <button t-on-click="onRefresh" class="btn btn-secondary">
        <i class="fas fa-sync"></i> Aktualisieren
      </button>
    </div>
  </div>
  
  <div class="owl-module-content">
    <div t-if="state.isLoading" class="module-loading">
      <p>Daten werden geladen...</p>
    </div>
    <div t-elif="state.hasError" class="module-error">
      <p class="error-message"><t t-esc="state.error && state.error.message || 'Ein Fehler ist aufgetreten'"/></p>
      <button t-on-click="retryInit" class="btn btn-secondary">Erneut versuchen</button>
    </div>
    <div t-else class="example-content">
      <div class="counter-section">
        <h4>Zähler: <span class="counter-value"><t t-esc="store.state.counter"/></span></h4>
        <div class="counter-controls">
          <button t-on-click="() => this.store.dispatch('increment')" class="btn btn-primary">
            Erhöhen
          </button>
          <button t-on-click="() => this.store.dispatch('decrement')" 
                  t-att-disabled="store.state.counter <= 0"
                  class="btn btn-secondary">
            Verringern
          </button>
          <button t-on-click="() => this.store.dispatch('reset')" class="btn btn-danger">
            Zurücksetzen
          </button>
        </div>
      </div>
      
      <div class="items-section" t-if="store.state.items.length">
        <h4>Elemente (<t t-esc="store.state.items.length"/>)</h4>
        <ul class="item-list">
          <li t-foreach="store.state.items" t-as="item" t-key="item.id" class="item">
            <span class="item-name"><t t-esc="item.name"/></span>
            <button t-on-click="() => this.removeItem(item.id)" class="btn btn-sm btn-danger">
              <i class="fas fa-trash"></i>
            </button>
          </li>
        </ul>
      </div>
      
      <div class="add-item-form">
        <h4>Neues Element hinzufügen</h4>
        <div class="input-group">
          <input 
            type="text" 
            t-model="state.newItemName" 
            placeholder="Name des Elements" 
            class="form-control"
            t-on-keyup="onInputKeyUp"
          />
          <button 
            t-on-click="addItem" 
            t-att-disabled="!state.newItemName.trim()" 
            class="btn btn-primary">
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <div class="owl-module-footer">
    <div class="module-status">
      <span t-if="state.lastUpdated" class="last-updated">
        Zuletzt aktualisiert: <t t-esc="formatTime(state.lastUpdated)"/>
      </span>
    </div>
  </div>
</div>
`;

/**
 * Beispielmodul-Klasse
 */
export class ExampleModule extends ModuleBase {
  static template = EXAMPLE_MODULE_TEMPLATE;
  
  /**
   * Setup-Methode für das Modul
   */
  setup() {
    // Parent-Setup aufrufen (wichtig!)
    super.setup();
    
    // Eigenen Zustand initialisieren
    this.state.newItemName = "";
    
    // Store für das Modul erstellen
    this.store = createStore(this.moduleInfo.moduleId, {
      counter: 0,
      items: []
    }, {
      // Store-Aktionen definieren
      increment: ({ state }) => {
        state.counter += 1;
      },
      decrement: ({ state }) => {
        if (state.counter > 0) {
          state.counter -= 1;
        }
      },
      reset: ({ state }) => {
        state.counter = 0;
      },
      addItem: ({ state }, item) => {
        state.items.push(item);
      },
      removeItem: ({ state }, itemId) => {
        state.items = state.items.filter(item => item.id !== itemId);
      }
    });
    
    // Store-Änderungen abonnieren
    this.unsubscribe = this.store.subscribe(({ state, action }) => {
      console.log(`Store-Aktion ausgeführt: ${action.type}`, state);
      // Hier könnten wir auf bestimmte Store-Änderungen reagieren
      this.updateState('data', { lastAction: action.type });
    });
  }
  
  /**
   * Wird aufgerufen, wenn die Komponente gemountet wird
   */
  async onMounted() {
    await super.onMounted();
    
    // Beispieldaten laden
    await this.loadExampleData();
  }
  
  /**
   * Wird aufgerufen, wenn die Komponente unmounted wird
   */
  onWillUnmount() {
    super.onWillUnmount();
    
    // Store-Subscription aufräumen
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
  /**
   * Lädt Beispieldaten für das Modul
   */
  async loadExampleData() {
    try {
      this.state.isLoading = true;
      
      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Beispieldaten hinzufügen
      const exampleItems = [
        { id: 1, name: "Beispielelement 1" },
        { id: 2, name: "Beispielelement 2" },
        { id: 3, name: "Beispielelement 3" }
      ];
      
      // Daten im Store speichern
      exampleItems.forEach(item => {
        this.store.dispatch("addItem", item);
      });
      
      this.state.isLoading = false;
      this.state.lastUpdated = new Date();
    } catch (error) {
      this.handleError(error);
    }
  }
  
  /**
   * Event-Handler für Refresh-Button
   */
  onRefresh() {
    this.loadExampleData();
  }
  
  /**
   * Formatiert einen Zeitstempel für die Anzeige
   */
  formatTime(date) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString();
  }
  
  /**
   * Fügt ein neues Element hinzu
   */
  addItem() {
    const name = this.state.newItemName.trim();
    if (!name) return;
    
    const newItem = {
      id: Date.now(),
      name
    };
    
    this.store.dispatch("addItem", newItem);
    this.state.newItemName = "";
    this.state.lastUpdated = new Date();
  }
  
  /**
   * Entfernt ein Element
   */
  removeItem(itemId) {
    this.store.dispatch("removeItem", itemId);
    this.state.lastUpdated = new Date();
  }
  
  /**
   * Event-Handler für Tastatureingaben im Input-Feld
   */
  onInputKeyUp(event) {
    if (event.key === "Enter") {
      this.addItem();
    }
  }
}

export default ExampleModule; 