/**
 * Import Microservice Module
 * Containerisiertes Modul f�r CSV-Importfunktionen
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse f�r das Import-Modul
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
    
    // State aus dem Store �bernehmen
    this.state = this.useState(this.store.state);
  }
  
  async init() {
    await this.loadData();
    
    // Container-Event ausl�sen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
}

// Modul f�r Container-Verwendung registrieren
registerContainerModule('import-module', ImportModule, {
  title: 'CSV-Import',
  description: 'Tool zur �bernahme von Daten aus dem Warenwirtschaftsprogramm L3',
  version: '1.0.0',
  apiEndpoints: {
    getImport: '/api/modules/import/data'
  }
});

// F�r die Verwendung in anderen Modulen exportieren
export default ImportModule;
