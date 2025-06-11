/**
 * StoreManager.js
 * Zentrale Zustandsverwaltung für OWL-Module
 */
import { reactive, markRaw } from "@odoo/owl";

// Zentraler Speicher für Modulzustände
const moduleStores = new Map();

// Speicher für Store-Definitionen
const storeDefinitions = new Map();

// Speicher für Subscribers
const storeSubscribers = new Map();

/**
 * Erstellt und registriert einen Store für ein Modul
 * 
 * @param {string} moduleId - ID des Moduls
 * @param {Object} initialState - Anfangszustand des Stores
 * @param {Object} actions - Aktionen, die auf dem Store ausgeführt werden können
 * @returns {Object} - Der erstellte Store
 */
export function createStore(moduleId, initialState = {}, actions = {}) {
  if (!moduleId) {
    throw new Error('ModuleId ist erforderlich für die Store-Erstellung');
  }

  // Prüfen, ob bereits ein Store für dieses Modul existiert
  if (moduleStores.has(moduleId)) {
    console.warn(`Store für Modul "${moduleId}" existiert bereits und wird überschrieben.`);
    // Existierenden Store löschen
    destroyStore(moduleId);
  }

  // Reaktiven Zustand erstellen
  const state = reactive(initialState);

  // Store-Objekt erstellen
  const store = {
    state,
    dispatch: createDispatcher(moduleId, actions, state),
    getState: () => state,
    subscribe: createSubscriber(moduleId)
  };

  // Store und Definition speichern
  moduleStores.set(moduleId, store);
  storeDefinitions.set(moduleId, {
    initialState: { ...initialState },
    actions: markRaw(actions)
  });

  // Subscriber-Liste für diesen Store initialisieren
  storeSubscribers.set(moduleId, new Set());

  console.log(`Store für Modul "${moduleId}" erfolgreich erstellt.`);
  return store;
}

/**
 * Erstellt einen Dispatcher für einen Store
 * 
 * @param {string} moduleId - ID des Moduls
 * @param {Object} actions - Aktionen, die auf dem Store ausgeführt werden können
 * @param {Object} state - Reaktiver Zustand des Stores
 * @returns {Function} - Dispatcher-Funktion
 */
function createDispatcher(moduleId, actions, state) {
  return async function dispatch(actionType, payload) {
    if (!actions[actionType]) {
      console.error(`Aktion "${actionType}" ist nicht definiert für Modul "${moduleId}"`);
      return;
    }

    try {
      // Aktion ausführen
      const result = await actions[actionType]({ state, dispatch: this.dispatch }, payload);

      // Subscribers über die Änderung informieren
      notifySubscribers(moduleId, actionType, payload);

      return result;
    } catch (error) {
      console.error(`Fehler beim Ausführen der Aktion "${actionType}" für Modul "${moduleId}":`, error);
      throw error;
    }
  };
}

/**
 * Erstellt eine Subscribe-Funktion für einen Store
 * 
 * @param {string} moduleId - ID des Moduls
 * @returns {Function} - Subscribe-Funktion
 */
function createSubscriber(moduleId) {
  return function subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Subscriber muss eine Funktion sein');
    }

    // Prüfen, ob Subscribers für dieses Modul existieren
    if (!storeSubscribers.has(moduleId)) {
      storeSubscribers.set(moduleId, new Set());
    }

    const subscribers = storeSubscribers.get(moduleId);
    subscribers.add(callback);

    // Funktion zum Unsubscribe zurückgeben
    return function unsubscribe() {
      subscribers.delete(callback);
    };
  };
}

/**
 * Benachrichtigt alle Subscribers eines Stores über eine Änderung
 * 
 * @param {string} moduleId - ID des Moduls
 * @param {string} actionType - Typ der ausgeführten Aktion
 * @param {*} payload - Payload der Aktion
 */
function notifySubscribers(moduleId, actionType, payload) {
  if (!storeSubscribers.has(moduleId)) {
    return;
  }

  const subscribers = storeSubscribers.get(moduleId);
  const store = moduleStores.get(moduleId);

  if (!store) {
    return;
  }

  const storeSnapshot = {
    state: { ...store.state },
    action: {
      type: actionType,
      payload
    }
  };

  subscribers.forEach(callback => {
    try {
      callback(storeSnapshot);
    } catch (error) {
      console.error('Fehler in Store-Subscriber:', error);
    }
  });
}

/**
 * Gibt den Store eines Moduls zurück
 * 
 * @param {string} moduleId - ID des Moduls
 * @returns {Object|null} - Der Store oder null, wenn nicht gefunden
 */
export function getStore(moduleId) {
  if (!moduleStores.has(moduleId)) {
    console.warn(`Store für Modul "${moduleId}" nicht gefunden.`);
    return null;
  }

  return moduleStores.get(moduleId);
}

/**
 * Zerstört einen Store und gibt alle Ressourcen frei
 * 
 * @param {string} moduleId - ID des Moduls
 * @returns {boolean} - true, wenn der Store erfolgreich zerstört wurde
 */
export function destroyStore(moduleId) {
  if (!moduleStores.has(moduleId)) {
    console.warn(`Store für Modul "${moduleId}" nicht gefunden. Nichts zu zerstören.`);
    return false;
  }

  moduleStores.delete(moduleId);
  storeDefinitions.delete(moduleId);

  // Alle Subscribers entfernen
  if (storeSubscribers.has(moduleId)) {
    storeSubscribers.delete(moduleId);
  }

  console.log(`Store für Modul "${moduleId}" erfolgreich zerstört.`);
  return true;
}

/**
 * Setzt einen Store auf seinen Initialzustand zurück
 * 
 * @param {string} moduleId - ID des Moduls
 * @returns {boolean} - true, wenn der Store erfolgreich zurückgesetzt wurde
 */
export function resetStore(moduleId) {
  if (!moduleStores.has(moduleId) || !storeDefinitions.has(moduleId)) {
    console.warn(`Store für Modul "${moduleId}" nicht gefunden. Kann nicht zurückgesetzt werden.`);
    return false;
  }

  const store = moduleStores.get(moduleId);
  const definition = storeDefinitions.get(moduleId);
  const initialState = definition.initialState;

  // Zustand zurücksetzen
  Object.keys(store.state).forEach(key => {
    delete store.state[key];
  });

  Object.entries(initialState).forEach(([key, value]) => {
    store.state[key] = value;
  });

  // Subscribers benachrichtigen
  notifySubscribers(moduleId, 'RESET_STORE', null);

  console.log(`Store für Modul "${moduleId}" erfolgreich zurückgesetzt.`);
  return true;
}

/**
 * Gibt eine Liste aller Store-IDs zurück
 * 
 * @returns {Array<string>} - Liste der Store-IDs
 */
export function getStoreIds() {
  return Array.from(moduleStores.keys());
}

/**
 * Gibt ein Snapshot des aktuellen Zustands eines Stores zurück
 * 
 * @param {string} moduleId - ID des Moduls
 * @returns {Object|null} - Snapshot des Zustands oder null, wenn nicht gefunden
 */
export function getStoreSnapshot(moduleId) {
  const store = getStore(moduleId);
  
  if (!store) {
    return null;
  }
  
  return { ...store.state };
}

/**
 * Aktualisiert den Zustand eines Stores direkt (ohne Actions)
 * Nur für Spezialfälle verwenden!
 * 
 * @param {string} moduleId - ID des Moduls
 * @param {Object} newState - Neuer Zustand (wird mit bestehendem zusammengeführt)
 * @returns {boolean} - true, wenn der Store erfolgreich aktualisiert wurde
 */
export function updateStoreState(moduleId, newState) {
  const store = getStore(moduleId);
  
  if (!store) {
    return false;
  }
  
  Object.entries(newState).forEach(([key, value]) => {
    store.state[key] = value;
  });
  
  // Subscribers benachrichtigen
  notifySubscribers(moduleId, 'UPDATE_STATE', newState);
  
  return true;
}

export default {
  createStore,
  getStore,
  destroyStore,
  resetStore,
  getStoreIds,
  getStoreSnapshot,
  updateStoreState
}; 