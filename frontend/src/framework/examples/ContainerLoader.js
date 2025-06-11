/**
 * ContainerLoader.js
 * Lädt und zeigt containerisierte Module an
 */

import { createModuleContainer, loadContainerModule } from './ModulContainer.js';

/**
 * Container-Loader für OWL-Module
 * Lädt Module asynchron und zeigt sie in einem Container an
 */
export class ContainerLoader {
  /**
   * Erstellt einen neuen Container-Loader
   * @param {Object} config - Konfigurationsobjekt
   * @param {String} config.containerId - ID des Container-Elements im DOM
   * @param {Array} config.availableModules - Verfügbare Module
   * @param {Function} config.onModuleEvent - Event-Handler-Funktion
   */
  constructor(config) {
    this.containerId = config.containerId;
    this.availableModules = config.availableModules || [];
    this.onModuleEvent = config.onModuleEvent || (() => {});
    this.activeModules = {};
    this.moduleRegistry = {};
    
    // Container-Element
    this.containerElement = document.getElementById(this.containerId);
    if (!this.containerElement) {
      throw new Error(`Container-Element mit ID '${this.containerId}' nicht gefunden`);
    }
    
    // Container initialisieren
    this.init();
  }
  
  /**
   * Initialisiert den Container-Loader
   * @private
   */
  init() {
    console.log('Container-Loader initialisiert');
    console.log('Verfügbare Module:', this.availableModules);
    
    // Event-Listener für den Container-Loader
    if (typeof window !== 'undefined') {
      window.__OWL_CONTAINER_LOADER__ = this;
    }
  }
  
  /**
   * Lädt und registriert alle verfügbaren Module
   * @returns {Promise} Promise, das nach dem Laden aller Module aufgelöst wird
   */
  async loadAllModules() {
    const promises = this.availableModules.map(moduleInfo => 
      this.registerModule(moduleInfo)
    );
    
    await Promise.all(promises);
    console.log('Alle Module geladen und registriert');
  }
  
  /**
   * Registriert ein Modul im Container-Loader
   * @param {Object} moduleInfo - Modul-Informationen
   * @returns {Promise} Promise, das nach der Registrierung aufgelöst wird
   */
  async registerModule(moduleInfo) {
    try {
      // Modul bereits registriert?
      if (this.moduleRegistry[moduleInfo.id]) {
        console.log(`Modul '${moduleInfo.id}' bereits registriert`);
        return;
      }
      
      // Modul laden, falls eine URL angegeben ist
      if (moduleInfo.url) {
        const moduleData = await loadContainerModule(moduleInfo.id, moduleInfo.url);
        moduleInfo.ModuleClass = moduleData.ModuleClass;
        moduleInfo.options = moduleData.options;
      }
      
      // Modul im Registry speichern
      this.moduleRegistry[moduleInfo.id] = {
        ...moduleInfo,
        isLoaded: true,
        loadTime: new Date().toISOString()
      };
      
      console.log(`Modul '${moduleInfo.id}' erfolgreich registriert`);
      
      return this.moduleRegistry[moduleInfo.id];
    } catch (error) {
      console.error(`Fehler beim Registrieren des Moduls '${moduleInfo.id}':`, error);
      
      // Fehler im Registry speichern
      this.moduleRegistry[moduleInfo.id] = {
        ...moduleInfo,
        isLoaded: false,
        error: error.message,
        loadTime: new Date().toISOString()
      };
      
      throw error;
    }
  }
  
  /**
   * Lädt ein Modul in den Container
   * @param {String} moduleId - Modul-ID
   * @param {Object} options - Optionen für das Modul
   * @returns {Promise} Promise, das nach dem Laden aufgelöst wird
   */
  async loadModule(moduleId, options = {}) {
    try {
      // Modul bereits aktiv?
      if (this.activeModules[moduleId]) {
        console.log(`Modul '${moduleId}' bereits aktiv`);
        return this.activeModules[moduleId];
      }
      
      // Modul im Registry suchen
      const moduleInfo = this.moduleRegistry[moduleId];
      if (!moduleInfo) {
        throw new Error(`Modul '${moduleId}' nicht registriert`);
      }
      
      // Container-Element für das Modul erstellen
      const moduleContainer = document.createElement('div');
      moduleContainer.className = 'module-container';
      moduleContainer.id = `module-container-${moduleId}`;
      
      // Container-Element leeren und neues Element hinzufügen
      this.containerElement.innerHTML = '';
      this.containerElement.appendChild(moduleContainer);
      
      // Modul-Container erstellen
      const container = createModuleContainer({
        moduleId: moduleId,
        ModuleClass: moduleInfo.ModuleClass,
        initialData: options.initialData || moduleInfo.initialData || {},
        apiEndpoints: options.apiEndpoints || moduleInfo.apiEndpoints || {},
        onEvent: (event) => this.handleModuleEvent(event)
      });
      
      // Modul initialisieren
      await container.init();
      
      // Modul mounten
      await container.mount(moduleContainer, {
        title: options.title || moduleInfo.title,
        ...options.props
      });
      
      // Modul als aktiv markieren
      this.activeModules[moduleId] = {
        container,
        moduleInfo,
        mountElement: moduleContainer,
        loadTime: new Date().toISOString()
      };
      
      console.log(`Modul '${moduleId}' erfolgreich geladen`);
      
      return this.activeModules[moduleId];
    } catch (error) {
      console.error(`Fehler beim Laden des Moduls '${moduleId}':`, error);
      
      // Fehlermeldung anzeigen
      this.showErrorMessage(moduleId, error.message);
      
      throw error;
    }
  }
  
  /**
   * Entlädt ein aktives Modul
   * @param {String} moduleId - Modul-ID
   * @returns {Promise} Promise, das nach dem Entladen aufgelöst wird
   */
  async unloadModule(moduleId) {
    try {
      // Modul nicht aktiv?
      if (!this.activeModules[moduleId]) {
        console.log(`Modul '${moduleId}' nicht aktiv`);
        return false;
      }
      
      // Modul unmounten
      const { container } = this.activeModules[moduleId];
      await container.unmount();
      
      // Modul aus aktiven Modulen entfernen
      delete this.activeModules[moduleId];
      
      console.log(`Modul '${moduleId}' erfolgreich entladen`);
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Entladen des Moduls '${moduleId}':`, error);
      throw error;
    }
  }
  
  /**
   * Aktualisiert die Daten eines aktiven Moduls
   * @param {String} moduleId - Modul-ID
   * @param {Object} data - Neue Daten für das Modul
   * @returns {Promise} Promise, das nach der Aktualisierung aufgelöst wird
   */
  async updateModuleData(moduleId, data) {
    try {
      // Modul nicht aktiv?
      if (!this.activeModules[moduleId]) {
        console.log(`Modul '${moduleId}' nicht aktiv`);
        return false;
      }
      
      // Modul-Daten aktualisieren
      const { container } = this.activeModules[moduleId];
      await container.updateData(data);
      
      console.log(`Daten für Modul '${moduleId}' erfolgreich aktualisiert`);
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren der Daten für Modul '${moduleId}':`, error);
      throw error;
    }
  }
  
  /**
   * Verarbeitet ein Modul-Event
   * @param {Object} event - Event-Objekt
   * @private
   */
  handleModuleEvent(event) {
    console.log('Modul-Event:', event);
    
    // Event an übergeordneten Handler weiterleiten
    if (typeof this.onModuleEvent === 'function') {
      this.onModuleEvent(event);
    }
  }
  
  /**
   * Zeigt eine Fehlermeldung für ein Modul an
   * @param {String} moduleId - Modul-ID
   * @param {String} errorMessage - Fehlermeldung
   * @private
   */
  showErrorMessage(moduleId, errorMessage) {
    // Container-Element leeren
    this.containerElement.innerHTML = '';
    
    // Fehlermeldung erstellen
    const errorElement = document.createElement('div');
    errorElement.className = 'module-error';
    errorElement.innerHTML = `
      <h3>Fehler beim Laden des Moduls '${moduleId}'</h3>
      <p>${errorMessage}</p>
      <button class="btn btn-secondary" onclick="window.__OWL_CONTAINER_LOADER__.reloadModule('${moduleId}')">
        Erneut versuchen
      </button>
    `;
    
    // Fehlermeldung hinzufügen
    this.containerElement.appendChild(errorElement);
  }
  
  /**
   * Lädt ein Modul neu
   * @param {String} moduleId - Modul-ID
   * @returns {Promise} Promise, das nach dem Neuladen aufgelöst wird
   */
  async reloadModule(moduleId) {
    try {
      // Modul zuerst entladen, falls aktiv
      if (this.activeModules[moduleId]) {
        await this.unloadModule(moduleId);
      }
      
      // Modul neu laden
      return await this.loadModule(moduleId);
    } catch (error) {
      console.error(`Fehler beim Neuladen des Moduls '${moduleId}':`, error);
      throw error;
    }
  }
}

/**
 * Factory-Funktion zur Erstellung eines Container-Loaders
 * @param {Object} config - Loader-Konfiguration
 * @returns {ContainerLoader} Container-Loader-Instanz
 */
export function createContainerLoader(config) {
  return new ContainerLoader(config);
}

/**
 * Beispiel-Konfiguration für den Container-Loader
 */
export const exampleLoaderConfig = {
  containerId: 'module-container',
  availableModules: [
    {
      id: 'artikel-container',
      title: 'Artikelverwaltung',
      description: 'Verwaltung von Artikeln und Produkten',
      url: './ContainerizedModuleExample.js',
      apiEndpoints: {
        getArtikel: '/api/artikel',
        getArtikelById: '/api/artikel/:id',
        createArtikel: '/api/artikel',
        updateArtikel: '/api/artikel/:id',
        deleteArtikel: '/api/artikel/:id'
      }
    },
    {
      id: 'lager-container',
      title: 'Lagerverwaltung',
      description: 'Verwaltung von Lagerbeständen und -bewegungen',
      url: './ContainerizedLagerModule.js',
      apiEndpoints: {
        getLager: '/api/lager',
        getLagerById: '/api/lager/:id',
        createLager: '/api/lager',
        updateLager: '/api/lager/:id',
        deleteLager: '/api/lager/:id'
      }
    },
    {
      id: 'belege-container',
      title: 'Belegverwaltung',
      description: 'Verwaltung von Ein- und Verkaufsbelegen',
      url: './ContainerizedBelegModule.js',
      apiEndpoints: {
        getBelege: '/api/belege',
        getBelegById: '/api/belege/:id',
        createBeleg: '/api/belege',
        updateBeleg: '/api/belege/:id',
        deleteBeleg: '/api/belege/:id'
      }
    }
  ],
  onModuleEvent: (event) => {
    console.log('Container-Loader-Event:', event);
    
    // Hier können spezifische Event-Handler implementiert werden
    switch (event.type) {
      case 'module-action':
        // Aktion verarbeiten
        break;
      case 'module-error':
        // Fehler behandeln
        break;
      default:
        // Sonstige Events
        break;
    }
  }
};

export default {
  ContainerLoader,
  createContainerLoader,
  exampleLoaderConfig
};