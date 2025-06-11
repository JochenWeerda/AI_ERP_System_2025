/**
 * ModuleBase.js
 * Basisklasse für alle OWL-Module im System
 */
import { Component, xml, useState, useEnv, onMounted, onWillUnmount } from "@odoo/owl";

// Standard-Template für Module (kann von Unterklassen überschrieben werden)
const DEFAULT_MODULE_TEMPLATE = xml`
<div class="owl-module owl-module-default" t-att-data-module-id="props.moduleId">
  <t t-if="!state.hasError">
    <div class="owl-module-header" t-if="moduleInfo.title">
      <h3><t t-esc="moduleInfo.title"/></h3>
    </div>
    <div class="owl-module-content">
      <!-- Hier wird der Modulinhalt angezeigt -->
      <t t-slot="default">
        <div class="module-default-content">
          <p t-if="moduleInfo.description"><t t-esc="moduleInfo.description"/></p>
          <p t-if="!moduleInfo.description">Modulinhalt wird geladen...</p>
        </div>
      </t>
    </div>
  </t>
  <t t-else>
    <div class="owl-module-error">
      <h3>Fehler im Modul</h3>
      <p class="error-message"><t t-esc="state.error && state.error.message || 'Unbekannter Fehler'"/></p>
      <button t-if="moduleInfo.showRetryButton" t-on-click="retryInit" class="btn btn-secondary">
        Erneut versuchen
      </button>
    </div>
  </t>
</div>
`;

/**
 * Basisklasse für alle Module
 * Stellt grundlegende Funktionalitäten für Module bereit
 */
export class ModuleBase extends Component {
  static template = DEFAULT_MODULE_TEMPLATE;
  
  // Standard-Props für alle Module
  static props = {
    moduleId: { type: String, optional: true },
    config: { type: Object, optional: true },
    onAction: { type: Function, optional: true },
    onError: { type: Function, optional: true },
    onUpdate: { type: Function, optional: true },
    className: { type: String, optional: true }
  };
  
  /**
   * Setup-Methode für die Komponente
   * Initialisiert den Zustand und führt Initialisierungslogik aus
   */
  setup() {
    // Umgebungsvariablen
    this.env = useEnv();
    
    // Basis-Zustand für alle Module
    this.state = useState({
      isReady: false,
      isLoading: true,
      hasError: false,
      error: null,
      data: null,
      lastUpdated: null
    });
    
    // Modul-Konfiguration aus Props oder Standard
    this.moduleInfo = {
      moduleId: this.props.moduleId || `module-${Date.now()}`,
      title: this.props.config?.title || '',
      description: this.props.config?.description || '',
      version: this.props.config?.version || '1.0.0',
      showRetryButton: this.props.config?.showRetryButton !== false,
      showFooter: this.props.config?.showFooter !== false,
      showStatus: this.props.config?.showStatus !== false,
      showActions: this.props.config?.showActions !== false,
      showHeaderActions: this.props.config?.showHeaderActions || false,
      showSaveButton: this.props.config?.showSaveButton || false,
      apiEndpoints: this.props.config?.apiEndpoints || {}
    };
    
    // Event-Hooks registrieren
    onMounted(() => this.onMounted());
    onWillUnmount(() => this.onWillUnmount());
  }
  
  /**
   * Initialisiert das Modul
   * Wird im mounted-Hook aufgerufen
   */
  async init() {
    try {
      this.state.isLoading = true;
      this.state.hasError = false;
      this.state.error = null;
      
      // Hier können Unterklassen ihre eigene Initialisierungslogik implementieren
      // Normalerweise würde hier das Laden von Daten stattfinden
      
      this.state.isReady = true;
      this.state.lastUpdated = new Date();
    } catch (error) {
      this.handleError(error);
    } finally {
      this.state.isLoading = false;
    }
  }
  
  /**
   * Hook, der aufgerufen wird, wenn die Komponente gemountet wird
   */
  async onMounted() {
    try {
      await this.init();
    } catch (error) {
      this.handleError(error);
    }
  }
  
  /**
   * Hook, der aufgerufen wird, wenn die Komponente unmounted wird
   */
  onWillUnmount() {
    // Aufräumarbeiten, wenn nötig
    this.cleanup();
  }
  
  /**
   * Behandelt Fehler im Modul
   * 
   * @param {Error} error - Der aufgetretene Fehler
   */
  handleError(error) {
    console.error(`Fehler im Modul ${this.moduleInfo.moduleId}:`, error);
    
    this.state.hasError = true;
    this.state.error = error;
    this.state.isReady = false;
    
    // Fehler-Callback aufrufen, wenn vorhanden
    if (typeof this.props.onError === 'function') {
      this.props.onError({
        moduleId: this.moduleInfo.moduleId,
        error,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Versucht, das Modul neu zu initialisieren
   * Wird aufgerufen, wenn der Retry-Button geklickt wird
   */
  async retryInit() {
    try {
      await this.init();
    } catch (error) {
      this.handleError(error);
    }
  }
  
  /**
   * Löst eine Aktion aus und benachrichtigt Parent-Komponenten
   * 
   * @param {string} action - Name der Aktion
   * @param {Object} payload - Daten, die mit der Aktion gesendet werden
   */
  triggerAction(action, payload = {}) {
    if (typeof this.props.onAction === 'function') {
      this.props.onAction({
        moduleId: this.moduleInfo.moduleId,
        action,
        payload,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Aktualisiert den Modul-Zustand und benachrichtigt Parent-Komponenten
   * 
   * @param {string} type - Typ der Aktualisierung
   * @param {Object} data - Aktualisierungsdaten
   */
  updateState(type, data = {}) {
    // Zustand aktualisieren
    if (data) {
      if (type === 'data') {
        this.state.data = data;
      } else if (type === 'metadata') {
        Object.assign(this.moduleInfo, data);
      }
    }
    
    this.state.lastUpdated = new Date();
    
    // Update-Callback aufrufen, wenn vorhanden
    if (typeof this.props.onUpdate === 'function') {
      this.props.onUpdate({
        moduleId: this.moduleInfo.moduleId,
        type,
        data,
        timestamp: this.state.lastUpdated
      });
    }
  }
  
  /**
   * Führt Aufräumarbeiten durch
   * Wird beim Unmount des Moduls aufgerufen
   */
  cleanup() {
    // Hier können Ressourcen freigegeben werden
    // Unterklassen können diese Methode überschreiben
  }
  
  /**
   * Aktualisiert das Modul
   * Kann von außen aufgerufen werden, um das Modul neu zu laden
   */
  async refresh() {
    try {
      this.state.isLoading = true;
      
      // Hier würde die Aktualisierungslogik implementiert
      // Normalerweise ein erneuter API-Aufruf
      
      this.state.lastUpdated = new Date();
    } catch (error) {
      this.handleError(error);
    } finally {
      this.state.isLoading = false;
    }
  }
}

export default ModuleBase; 