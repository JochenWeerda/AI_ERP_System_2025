/**
 * ModulContainer.js
 * Container-Wrapper für Module als eigenständige Microservices
 */

import { ModuleBase } from '../core/ModuleBase.js';
import { createStore } from '../core/StoreManager.js';

/**
 * Container-Klasse für eigenständige Module
 * Ermöglicht die Kommunikation zwischen Frontend und Modul über definierte Schnittstellen
 */
export class ModuleContainer {
  /**
   * Erstellt einen neuen Modul-Container
   * @param {Object} config - Konfigurationsobjekt
   * @param {String} config.moduleId - Eindeutige Modul-ID
   * @param {Class} config.ModuleClass - Modulklasse (erweitert ModuleBase)
   * @param {Object} config.initialData - Initiale Daten für das Modul
   * @param {Object} config.apiEndpoints - API-Endpunkte für das Modul
   * @param {Function} config.onEvent - Event-Handler-Funktion
   */
  constructor(config) {
    this.moduleId = config.moduleId;
    this.ModuleClass = config.ModuleClass;
    this.initialData = config.initialData || {};
    this.apiEndpoints = config.apiEndpoints || {};
    this.onEvent = config.onEvent || (() => {});
    this.instance = null;
    this.mountElement = null;
    this.isReady = false;
    this.apiCache = {};
  }

  /**
   * Initialisiert das Modul
   * @returns {Promise} Promise, das nach Initialisierung aufgelöst wird
   */
  async init() {
    try {
      // API-Endpunkte validieren
      if (!this.validateApiEndpoints()) {
        throw new Error(`Ungültige API-Endpunkte für Modul ${this.moduleId}`);
      }

      // Store erstellen und mit initialen Daten befüllen
      this.store = createStore(`${this.moduleId}-container-store`, {
        isLoading: false,
        error: null,
        data: this.initialData,
        lifecycle: {
          state: 'initialized',
          timestamp: new Date().toISOString()
        }
      });

      // Container als bereit markieren
      this.isReady = true;
      
      console.log(`Modul-Container ${this.moduleId} initialisiert`);
      
      return true;
    } catch (error) {
      console.error(`Fehler bei der Initialisierung von Modul ${this.moduleId}:`, error);
      this.store?.update({
        error: error.message,
        lifecycle: {
          state: 'error',
          timestamp: new Date().toISOString()
        }
      });
      
      throw error;
    }
  }

  /**
   * Montiert das Modul in einem DOM-Element
   * @param {HTMLElement} element - DOM-Element, in dem das Modul gemountet werden soll
   * @param {Object} props - Props für das Modul
   * @returns {Promise} Promise, das nach dem Mounten aufgelöst wird
   */
  async mount(element, props = {}) {
    if (!this.isReady) {
      await this.init();
    }

    try {
      this.mountElement = element;
      
      // Mount-Status aktualisieren
      this.store.update({
        isLoading: true,
        lifecycle: {
          state: 'mounting',
          timestamp: new Date().toISOString()
        }
      });

      // Modul-Props mit Container-Daten erweitern
      const moduleProps = {
        ...props,
        moduleId: this.moduleId,
        apiEndpoints: this.apiEndpoints,
        containerStore: this.store,
        onAction: (action) => this.handleModuleAction(action)
      };

      // OWL-Instanz erstellen und mounten
      const { mount } = owl;
      this.instance = await mount(this.ModuleClass, element, { props: moduleProps });
      
      // Mount-Status aktualisieren
      this.store.update({
        isLoading: false,
        lifecycle: {
          state: 'mounted',
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(`Modul ${this.moduleId} erfolgreich gemountet`);
      
      return this.instance;
    } catch (error) {
      console.error(`Fehler beim Mounten von Modul ${this.moduleId}:`, error);
      this.store.update({
        isLoading: false,
        error: error.message,
        lifecycle: {
          state: 'error',
          timestamp: new Date().toISOString()
        }
      });
      
      throw error;
    }
  }

  /**
   * Unmountet das Modul
   * @returns {Promise} Promise, das nach dem Unmounten aufgelöst wird
   */
  async unmount() {
    if (!this.instance) {
      return false;
    }

    try {
      // Unmount-Status aktualisieren
      this.store.update({
        lifecycle: {
          state: 'unmounting',
          timestamp: new Date().toISOString()
        }
      });

      // OWL-Instanz unmounten
      await this.instance.destroy();
      this.instance = null;
      
      // DOM-Element leeren
      if (this.mountElement) {
        this.mountElement.innerHTML = '';
      }
      
      // Unmount-Status aktualisieren
      this.store.update({
        lifecycle: {
          state: 'unmounted',
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(`Modul ${this.moduleId} erfolgreich unmounted`);
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Unmounten von Modul ${this.moduleId}:`, error);
      this.store.update({
        error: error.message,
        lifecycle: {
          state: 'error',
          timestamp: new Date().toISOString()
        }
      });
      
      throw error;
    }
  }

  /**
   * Aktualisiert die Modul-Daten
   * @param {Object} data - Neue Daten für das Modul
   * @returns {Promise} Promise, das nach der Aktualisierung aufgelöst wird
   */
  async updateData(data) {
    if (!this.isReady) {
      await this.init();
    }

    try {
      // Daten im Store aktualisieren
      this.store.update({
        data: { ...this.store.state.data, ...data }
      });
      
      // Modul-Instanz aktualisieren, falls vorhanden
      if (this.instance && typeof this.instance.updateProps === 'function') {
        this.instance.updateProps({ data: this.store.state.data });
      }
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren der Daten von Modul ${this.moduleId}:`, error);
      this.store.update({
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Führt eine API-Anfrage durch
   * @param {String} endpoint - API-Endpunkt-Name
   * @param {Object} params - Parameter für die Anfrage
   * @param {Boolean} useCache - Ob Cache verwendet werden soll
   * @returns {Promise} Promise mit dem Ergebnis der Anfrage
   */
  async callApi(endpoint, params = {}, useCache = false) {
    if (!this.apiEndpoints[endpoint]) {
      throw new Error(`API-Endpunkt '${endpoint}' nicht definiert für Modul ${this.moduleId}`);
    }

    // Cache-Schlüssel erstellen
    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
    
    // Wenn Cache verwendet werden soll und ein Cache-Eintrag vorhanden ist
    if (useCache && this.apiCache[cacheKey]) {
      return this.apiCache[cacheKey];
    }

    try {
      // URL des Endpunkts
      const url = this.apiEndpoints[endpoint];
      
      // Anfrage senden
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Ergebnis im Cache speichern
      if (useCache) {
        this.apiCache[cacheKey] = data;
      }
      
      return data;
    } catch (error) {
      console.error(`Fehler bei API-Anfrage '${endpoint}' für Modul ${this.moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Löscht den API-Cache
   * @param {String} endpoint - API-Endpunkt-Name (optional, wenn nicht angegeben, wird der gesamte Cache gelöscht)
   */
  clearApiCache(endpoint = null) {
    if (endpoint) {
      // Nur Cache für einen bestimmten Endpunkt löschen
      Object.keys(this.apiCache).forEach(key => {
        if (key.startsWith(`${endpoint}-`)) {
          delete this.apiCache[key];
        }
      });
    } else {
      // Gesamten Cache löschen
      this.apiCache = {};
    }
  }

  /**
   * Verarbeitet eine Modul-Aktion
   * @param {Object} action - Aktionsobjekt
   * @private
   */
  handleModuleAction(action) {
    console.log(`Modul-Aktion von ${this.moduleId}:`, action);
    
    // Event an übergeordneten Handler weiterleiten
    if (typeof this.onEvent === 'function') {
      this.onEvent({
        type: 'module-action',
        moduleId: this.moduleId,
        action
      });
    }
  }

  /**
   * Validiert die API-Endpunkte
   * @returns {Boolean} Ob die API-Endpunkte gültig sind
   * @private
   */
  validateApiEndpoints() {
    if (!this.apiEndpoints) {
      return true; // Keine API-Endpunkte definiert, das ist ok
    }
    
    // Alle API-Endpunkte müssen gültige URLs sein
    for (const [key, url] of Object.entries(this.apiEndpoints)) {
      try {
        new URL(url);
      } catch (error) {
        console.error(`Ungültiger API-Endpunkt '${key}' für Modul ${this.moduleId}: ${url}`);
        return false;
      }
    }
    
    return true;
  }
}

/**
 * Factory-Funktion zur Erstellung eines Modul-Containers
 * @param {Object} config - Container-Konfiguration
 * @returns {ModuleContainer} Modul-Container-Instanz
 */
export function createModuleContainer(config) {
  return new ModuleContainer(config);
}

/**
 * Registriert ein Modul für die Verwendung als Container
 * @param {String} moduleId - Modul-ID
 * @param {Class} ModuleClass - Modulklasse
 * @param {Object} options - Weitere Optionen
 */
export function registerContainerModule(moduleId, ModuleClass, options = {}) {
  // Prüfen, ob die Modulklasse von ModuleBase erbt
  if (!(ModuleClass.prototype instanceof ModuleBase)) {
    throw new Error(`Modulklasse für '${moduleId}' muss von ModuleBase erben`);
  }
  
  // Registrierung im globalen Namespace (für Container-übergreifende Kommunikation)
  if (typeof window !== 'undefined') {
    window.__OWL_MODULE_CONTAINERS__ = window.__OWL_MODULE_CONTAINERS__ || {};
    window.__OWL_MODULE_CONTAINERS__[moduleId] = {
      ModuleClass,
      options
    };
  }
  
  console.log(`Modul '${moduleId}' für Container-Verwendung registriert`);
}

/**
 * Lädt ein Container-Modul asynchron
 * @param {String} moduleId - Modul-ID
 * @param {String} url - URL des Modul-Skripts
 * @returns {Promise} Promise, das nach dem Laden aufgelöst wird
 */
export async function loadContainerModule(moduleId, url) {
  try {
    // Skript laden
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    
    // Prüfen, ob das Modul registriert wurde
    if (typeof window !== 'undefined' && 
        window.__OWL_MODULE_CONTAINERS__ && 
        window.__OWL_MODULE_CONTAINERS__[moduleId]) {
      return window.__OWL_MODULE_CONTAINERS__[moduleId];
    } else {
      throw new Error(`Modul '${moduleId}' wurde nicht korrekt registriert`);
    }
  } catch (error) {
    console.error(`Fehler beim Laden des Moduls '${moduleId}':`, error);
    throw error;
  }
}

export default {
  ModuleContainer,
  createModuleContainer,
  registerContainerModule,
  loadContainerModule
};