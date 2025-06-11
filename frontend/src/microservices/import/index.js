/**
 * Import Microservice Module
 * Containerisiertes Modul für CSV-Importfunktionen
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse für das Import-Modul
 */
class ImportModule extends ModuleBase {
  static moduleName = 'import-module';
  
  setup() {
    // Store mit Basisdaten initialisieren
    this.store = createStore(${this.props.moduleId}-store, {
      isLoading: true,
      error: null,
      activeStep: 0,
      importSource: 'L3',
      mappings: [],
      files: []
    });
    
    // State aus dem Store übernehmen
    this.state = this.useState(this.store.state);
  }
  
  async init() {
    await this.loadData();
    
    // Container-Event auslösen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('import-module', ImportModule, {
  title: 'CSV-Import',
  description: 'Tool zur Übernahme von Daten aus dem Warenwirtschaftsprogramm L3',
  version: '1.0.0',
  apiEndpoints: {
    getImport: '/api/modules/import/data'
  }
});

// Für die Verwendung in anderen Modulen exportieren
export default ImportModule;
