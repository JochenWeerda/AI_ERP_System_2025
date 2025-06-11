/**
 * validation.js
 * Validierungsfunktionen für Module und Komponenten
 */
import { ModuleBase } from "../core/ModuleBase";
import { Component } from "@odoo/owl";

/**
 * Prüft, ob eine Klasse eine gültige OWL-Komponente ist
 * 
 * @param {Class} ComponentClass - Die zu prüfende Klasse
 * @returns {boolean} - true, wenn es sich um eine gültige OWL-Komponente handelt
 */
export function isValidOwlComponent(ComponentClass) {
  if (!ComponentClass || typeof ComponentClass !== 'function') {
    return false;
  }

  // Prüfen, ob es sich um eine OWL-Komponente handelt
  const isComponent = ComponentClass.prototype instanceof Component;
  
  // Prüfen, ob die Komponente ein Template hat
  const hasTemplate = !!ComponentClass.template;
  
  return isComponent && hasTemplate;
}

/**
 * Prüft, ob eine Klasse ein gültiges Modul ist (von ModuleBase erbt)
 * 
 * @param {Class} ModuleClass - Die zu prüfende Klasse
 * @returns {boolean} - true, wenn es sich um ein gültiges Modul handelt
 */
export function isValidModule(ModuleClass) {
  if (!isValidOwlComponent(ModuleClass)) {
    return false;
  }
  
  // Prüfen, ob die Klasse von ModuleBase erbt
  return ModuleClass.prototype instanceof ModuleBase;
}

/**
 * Validiert ein Modul-Konfigurationsobjekt
 * 
 * @param {Object} config - Die zu validierende Konfiguration
 * @returns {Object} - Objekt mit Validierungsergebnis und ggf. Fehlern
 */
export function validateModuleConfig(config) {
  const errors = [];
  
  if (!config) {
    errors.push('Keine Konfiguration angegeben');
    return { isValid: false, errors };
  }
  
  // Pflichtfelder prüfen
  if (!config.moduleId) {
    errors.push('moduleId ist erforderlich');
  }
  
  // Optionale Felder mit Typprüfung
  if (config.title && typeof config.title !== 'string') {
    errors.push('title muss ein String sein');
  }
  
  if (config.description && typeof config.description !== 'string') {
    errors.push('description muss ein String sein');
  }
  
  if (config.version && typeof config.version !== 'string') {
    errors.push('version muss ein String sein');
  }
  
  if (config.apiEndpoints && !Array.isArray(config.apiEndpoints)) {
    errors.push('apiEndpoints muss ein Array sein');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validiert Props für eine OWL-Komponente
 * 
 * @param {Object} props - Die zu validierenden Props
 * @param {Object} propTypes - Die Typ-Definitionen für die Props
 * @returns {Object} - Objekt mit Validierungsergebnis und ggf. Fehlern
 */
export function validateProps(props, propTypes) {
  const errors = [];
  
  if (!props || !propTypes) {
    return { isValid: true, errors };
  }
  
  Object.entries(propTypes).forEach(([propName, propType]) => {
    // Prüfen, ob es sich um ein Pflichtfeld handelt
    const isRequired = propType.required === true;
    
    // Prüfen, ob das Feld vorhanden ist
    const propExists = propName in props;
    
    // Fehler für fehlende Pflichtfelder
    if (isRequired && !propExists) {
      errors.push(`Pflichtfeld "${propName}" fehlt`);
      return;
    }
    
    // Wenn das Feld nicht vorhanden ist, aber optional, dann überspringen
    if (!propExists) {
      return;
    }
    
    // Typprüfung
    const propValue = props[propName];
    
    if (propType.type === 'string' && typeof propValue !== 'string') {
      errors.push(`"${propName}" sollte vom Typ String sein`);
    } else if (propType.type === 'number' && typeof propValue !== 'number') {
      errors.push(`"${propName}" sollte vom Typ Number sein`);
    } else if (propType.type === 'boolean' && typeof propValue !== 'boolean') {
      errors.push(`"${propName}" sollte vom Typ Boolean sein`);
    } else if (propType.type === 'function' && typeof propValue !== 'function') {
      errors.push(`"${propName}" sollte vom Typ Function sein`);
    } else if (propType.type === 'object' && (typeof propValue !== 'object' || propValue === null)) {
      errors.push(`"${propName}" sollte vom Typ Object sein`);
    } else if (propType.type === 'array' && !Array.isArray(propValue)) {
      errors.push(`"${propName}" sollte vom Typ Array sein`);
    }
    
    // Benutzerdefinierte Validierung
    if (propType.validate && typeof propType.validate === 'function') {
      try {
        const validationResult = propType.validate(propValue);
        
        if (validationResult !== true) {
          errors.push(validationResult || `"${propName}" ist ungültig`);
        }
      } catch (error) {
        errors.push(`Fehler bei der Validierung von "${propName}": ${error.message}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validiert ein XML-Template
 * 
 * @param {string} xmlTemplate - Das zu validierende XML-Template
 * @returns {Object} - Objekt mit Validierungsergebnis und ggf. Fehlern
 */
export function validateTemplate(xmlTemplate) {
  const errors = [];
  
  if (!xmlTemplate || typeof xmlTemplate !== 'string') {
    errors.push('Template muss ein String sein');
    return { isValid: false, errors };
  }
  
  try {
    // Einfache Validierung des XML-Formats
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlTemplate, 'text/xml');
    
    const parserErrors = doc.getElementsByTagName('parsererror');
    
    if (parserErrors.length > 0) {
      errors.push('Ungültiges XML-Format');
    }
  } catch (error) {
    errors.push(`Fehler beim Parsen des Templates: ${error.message}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  isValidOwlComponent,
  isValidModule,
  validateModuleConfig,
  validateProps,
  validateTemplate
};
