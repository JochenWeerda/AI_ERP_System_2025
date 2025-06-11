/**
 * ModuleRegistry.js
 * Zentrale Registrierung und Verwaltung aller OWL-Module im System
 */
import { isValidModule } from "../utils/validation";

// Speicher für alle registrierten Module
const moduleRegistry = new Map();

// Speicher für Modulkonfigurationen
const moduleConfigs = new Map();

// Event-Listener für Moduländerungen
const eventListeners = new Set();

/**
 * Registriert ein neues Modul im System
 * 
 * @param {string} moduleId - Eindeutige ID des Moduls
 * @param {Class} ModuleClass - Die Modulklasse (muss von ModuleBase erben)
 * @param {Object} config - Optionale Konfiguration für das Modul
 * @returns {boolean} - true, wenn die Registrierung erfolgreich war
 */
export function registerModule(moduleId, ModuleClass, config = {}) {
  if (!moduleId || typeof moduleId !== 'string') {
    console.error('Ungültige Modul-ID:', moduleId);
    return false;
  }

  if (!ModuleClass) {
    console.error('Keine Modulklasse angegeben für:', moduleId);
    return false;
  }

  // Prüfen, ob das Modul eine gültige OWL-Komponente ist
  if (!isValidModule(ModuleClass)) {
    console.error('Die angegebene Klasse ist kein gültiges OWL-Modul:', moduleId);
    return false;
  }

  // Prüfen, ob bereits ein Modul mit dieser ID registriert ist
  if (moduleRegistry.has(moduleId)) {
    console.warn(`Modul mit ID "${moduleId}" ist bereits registriert und wird überschrieben.`);
  }

  // Modul und Konfiguration registrieren
  moduleRegistry.set(moduleId, ModuleClass);
  moduleConfigs.set(moduleId, config);

  // Listener über die Änderung informieren
  notifyListeners('register', { moduleId, ModuleClass, config });

  console.log(`Modul "${moduleId}" erfolgreich registriert.`);
  return true;
}

/**
 * Gibt ein registriertes Modul zurück
 * 
 * @param {string} moduleId - ID des Moduls
 * @returns {Class|null} - Die Modulklasse oder null, wenn nicht gefunden
 */
export function getModule(moduleId) {
  if (!moduleRegistry.has(moduleId)) {
    console.warn(`Modul "${moduleId}" nicht gefunden.`);
    return null;
  }

  return moduleRegistry.get(moduleId);
}

/**
 * Gibt die Konfiguration eines Moduls zurück
 * 
 * @param {string} moduleId - ID des Moduls
 * @returns {Object|null} - Die Modulkonfiguration oder null, wenn nicht gefunden
 */
export function getModuleConfig(moduleId) {
  if (!moduleConfigs.has(moduleId)) {
    console.warn(`Konfiguration für Modul "${moduleId}" nicht gefunden.`);
    return null;
  }

  return moduleConfigs.get(moduleId);
}

/**
 * Entfernt ein registriertes Modul aus dem System
 * 
 * @param {string} moduleId - ID des zu entfernenden Moduls
 * @returns {boolean} - true, wenn das Modul erfolgreich entfernt wurde
 */
export function unregisterModule(moduleId) {
  if (!moduleRegistry.has(moduleId)) {
    console.warn(`Modul "${moduleId}" nicht gefunden. Nichts zu entfernen.`);
    return false;
  }

  const wasRemoved = moduleRegistry.delete(moduleId);
  moduleConfigs.delete(moduleId);

  // Listener über die Änderung informieren
  if (wasRemoved) {
    notifyListeners('unregister', { moduleId });
    console.log(`Modul "${moduleId}" erfolgreich entfernt.`);
  }

  return wasRemoved;
}

/**
 * Gibt eine Liste aller registrierten Modul-IDs zurück
 * 
 * @returns {Array<string>} - Liste der Modul-IDs
 */
export function getRegisteredModules() {
  return Array.from(moduleRegistry.keys());
}

/**
 * Prüft, ob ein Modul registriert ist
 * 
 * @param {string} moduleId - ID des zu prüfenden Moduls
 * @returns {boolean} - true, wenn das Modul registriert ist
 */
export function isModuleRegistered(moduleId) {
  return moduleRegistry.has(moduleId);
}

/**
 * Registriert einen Event-Listener für Änderungen an der Modulregistrierung
 * 
 * @param {Function} listener - Callback-Funktion, die bei Änderungen aufgerufen wird
 * @returns {Function} - Funktion zum Entfernen des Listeners
 */
export function onModuleRegistryChange(listener) {
  if (typeof listener !== 'function') {
    throw new Error('Der Event-Listener muss eine Funktion sein.');
  }

  eventListeners.add(listener);

  // Funktion zum Entfernen des Listeners zurückgeben
  return () => {
    eventListeners.delete(listener);
  };
}

/**
 * Benachrichtigt alle registrierten Listener über eine Änderung
 * 
 * @param {string} eventType - Typ des Events (z.B. 'register', 'unregister')
 * @param {Object} data - Daten zum Event
 */
function notifyListeners(eventType, data) {
  eventListeners.forEach(listener => {
    try {
      listener(eventType, data);
    } catch (error) {
      console.error('Fehler im ModuleRegistry Event-Listener:', error);
    }
  });
}

/**
 * Aktualisiert die Konfiguration eines Moduls
 * 
 * @param {string} moduleId - ID des Moduls
 * @param {Object} config - Neue Konfiguration (wird mit bestehender zusammengeführt)
 * @returns {boolean} - true, wenn die Konfiguration erfolgreich aktualisiert wurde
 */
export function updateModuleConfig(moduleId, config) {
  if (!moduleRegistry.has(moduleId)) {
    console.warn(`Modul "${moduleId}" nicht gefunden. Konfiguration kann nicht aktualisiert werden.`);
    return false;
  }

  const currentConfig = moduleConfigs.get(moduleId) || {};
  const updatedConfig = { ...currentConfig, ...config };
  
  moduleConfigs.set(moduleId, updatedConfig);
  
  // Listener über die Änderung informieren
  notifyListeners('configUpdate', { moduleId, config: updatedConfig });
  
  return true;
}

export default {
  registerModule,
  getModule,
  getModuleConfig,
  unregisterModule,
  getRegisteredModules,
  isModuleRegistered,
  onModuleRegistryChange,
  updateModuleConfig
}; 