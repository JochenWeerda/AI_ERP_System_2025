/**
 * OWL Module Framework
 * Hauptexport-Datei für das Framework
 */

// Core-Module exportieren
export { default as ModuleRegistry, registerModule, getModule, getRegisteredModules, unregisterModule } from './core/ModuleRegistry';
export { ModuleBase } from './core/ModuleBase';
export { default as StoreManager, createStore, getStore, destroyStore } from './core/StoreManager';
export { default as ComponentFactory, createComponent, createModule, registerTemplate, getTemplate } from './core/ComponentFactory';

// Utility-Funktionen exportieren
export { default as integration, useOwl, OwlWrapper, ModuleLoader } from './utils/integration';
export { default as helpers, generateId, deepMerge, debounce, throttle } from './utils/helpers';
export { default as validation, isValidModule, validateProps, validateModuleConfig } from './utils/validation';

// Templates exportieren
export { default as layouts, MODULE_LAYOUT, LIST_MODULE_LAYOUT, FORM_MODULE_LAYOUT, DASHBOARD_MODULE_LAYOUT } from './templates/layout';
export { default as components, BUTTON_TEMPLATE, INPUT_TEMPLATE, SELECT_TEMPLATE, CHECKBOX_TEMPLATE, TABLE_TEMPLATE, MODAL_TEMPLATE } from './templates/components';

// Initialisierungsfunktion für das Framework
export function initFramework(options = {}) {
  const { 
    debug = false, 
    devTools = false,
    defaultConfig = {}
  } = options;

  // Debug-Modus aktivieren/deaktivieren
  if (typeof window !== 'undefined') {
    window.__OWL_MODULE_FRAMEWORK_DEBUG__ = debug;
  }

  // DevTools-Hook registrieren, wenn aktiviert
  if (devTools && typeof window !== 'undefined' && window.__OWL_DEVTOOLS_HOOK__) {
    window.__OWL_MODULE_FRAMEWORK_DEVTOOLS__ = true;
    
    // Framework-Zustand mit DevTools verbinden
    window.__OWL_DEVTOOLS_HOOK__.emit('framework:init', {
      name: 'OWL Module Framework',
      version: '1.0.0',
      modules: getRegisteredModules()
    });
  }

  console.log('OWL Module Framework initialisiert', {
    debug,
    devTools,
    defaultConfig
  });

  return {
    debug,
    devTools,
    defaultConfig
  };
}

// Standard-Export
export default {
  // Core
  ModuleBase,
  ModuleRegistry,
  StoreManager,
  ComponentFactory,
  
  // Utils
  integration,
  helpers,
  validation,
  
  // Templates
  layouts,
  components,
  
  // Initialisierung
  init: initFramework
};

