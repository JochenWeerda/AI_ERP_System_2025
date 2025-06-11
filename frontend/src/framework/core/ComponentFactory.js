/**
 * ComponentFactory.js
 * Factory für dynamische Erstellung von OWL-Komponenten
 */
import { Component, useState, xml, reactive } from "@odoo/owl";
import { ModuleBase } from "./ModuleBase";

// Speicher für komponentenspezifische Templates
const componentTemplates = new Map();

// Speicher für Komponentenklassen
const componentClasses = new Map();

/**
 * Registriert ein wiederverwendbares Template für Komponenten
 * 
 * @param {string} templateId - Eindeutige ID des Templates
 * @param {string} xmlTemplate - Das XML-Template als String
 * @returns {boolean} - true, wenn die Registrierung erfolgreich war
 */
export function registerTemplate(templateId, xmlTemplate) {
  if (!templateId || !xmlTemplate) {
    console.error('Template-ID und XML-Template sind erforderlich');
    return false;
  }

  try {
    // OWL-Template erstellen
    const template = xml`${xmlTemplate}`;
    
    // Template im Speicher registrieren
    componentTemplates.set(templateId, template);
    
    return true;
  } catch (error) {
    console.error(`Fehler beim Registrieren des Templates "${templateId}":`, error);
    return false;
  }
}

/**
 * Gibt ein registriertes Template zurück
 * 
 * @param {string} templateId - ID des Templates
 * @returns {Object|null} - Das Template oder null, wenn nicht gefunden
 */
export function getTemplate(templateId) {
  if (!componentTemplates.has(templateId)) {
    console.warn(`Template "${templateId}" nicht gefunden.`);
    return null;
  }

  return componentTemplates.get(templateId);
}

/**
 * Erstellt eine neue OWL-Komponente mit dem angegebenen Template und Props
 * 
 * @param {string|xml} template - XML-Template für die Komponente
 * @param {Object} options - Optionen für die Komponente
 * @returns {Class} - Eine neue Komponentenklasse
 */
export function createComponent(template, options = {}) {
  const {
    name = 'DynamicComponent',
    props = {},
    state = {},
    methods = {},
    hooks = {},
    setup: customSetup,
    parent = Component
  } = options;

  // Wenn ein String als Template übergeben wird, konvertieren wir es zu xml
  const processedTemplate = typeof template === 'string' ? xml`${template}` : template;

  // Erstellen einer neuen Komponente
  class DynamicComponent extends parent {
    static template = processedTemplate;
    static props = props;

    // Standard-Setup mit State-Management
    setup() {
      // Parent-Setup aufrufen, wenn vorhanden
      if (super.setup) {
        super.setup();
      }

      // Reaktiven Zustand erstellen
      this.state = useState({ ...state });

      // Benutzerdefiniertes Setup aufrufen, wenn vorhanden
      if (typeof customSetup === 'function') {
        customSetup.call(this);
      }

      // Hooks registrieren
      if (hooks.onMounted) this.env.onMounted(hooks.onMounted.bind(this));
      if (hooks.onWillUnmount) this.env.onWillUnmount(hooks.onWillUnmount.bind(this));
      if (hooks.onWillStart) this.env.onWillStart(hooks.onWillStart.bind(this));
      if (hooks.onWillUpdateProps) this.env.onWillUpdateProps(hooks.onWillUpdateProps.bind(this));
      if (hooks.onRendered) this.env.onRendered(hooks.onRendered.bind(this));
      if (hooks.onPatched) this.env.onPatched(hooks.onPatched.bind(this));
    }
  }

  // Namen der Komponente für Debug-Zwecke setzen
  Object.defineProperty(DynamicComponent, 'name', { value: name });

  // Methoden zur Komponente hinzufügen
  Object.entries(methods).forEach(([methodName, methodFn]) => {
    if (typeof methodFn === 'function') {
      DynamicComponent.prototype[methodName] = methodFn;
    }
  });

  return DynamicComponent;
}

/**
 * Erstellt eine neue Modulkomponente, die von ModuleBase erbt
 * 
 * @param {string|xml} template - XML-Template für das Modul
 * @param {Object} options - Optionen für das Modul
 * @returns {Class} - Eine neue Modulklasse
 */
export function createModule(template, options = {}) {
  return createComponent(template, {
    ...options,
    parent: ModuleBase
  });
}

/**
 * Erstellt eine HOC (Higher Order Component), die eine bestehende Komponente umschließt
 * 
 * @param {Class} WrappedComponent - Die zu umschließende Komponente
 * @param {Function} hocFactory - Factory-Funktion für die HOC
 * @returns {Class} - Eine neue Komponentenklasse
 */
export function createHOC(WrappedComponent, hocFactory) {
  if (typeof hocFactory !== 'function') {
    throw new Error('hocFactory muss eine Funktion sein');
  }

  return hocFactory(WrappedComponent);
}

/**
 * Gibt eine registrierte Komponente zurück
 * 
 * @param {string} componentId - ID der Komponente
 * @returns {Class|null} - Die Komponentenklasse oder null, wenn nicht gefunden
 */
export function getComponent(componentId) {
  if (!componentClasses.has(componentId)) {
    console.warn(`Komponente "${componentId}" nicht gefunden.`);
    return null;
  }

  return componentClasses.get(componentId);
}

/**
 * Gibt eine Liste aller registrierten Komponenten-IDs zurück
 * 
 * @returns {Array<string>} - Liste der Komponenten-IDs
 */
export function getRegisteredComponentIds() {
  return Array.from(componentClasses.keys());
}

/**
 * Gibt eine Liste aller registrierten Template-IDs zurück
 * 
 * @returns {Array<string>} - Liste der Template-IDs
 */
export function getRegisteredTemplateIds() {
  return Array.from(componentTemplates.keys());
}

export default {
  registerTemplate,
  getTemplate,
  createComponent,
  getComponent,
  getRegisteredComponentIds,
  getRegisteredTemplateIds,
  createModule,
  createHOC
}; 