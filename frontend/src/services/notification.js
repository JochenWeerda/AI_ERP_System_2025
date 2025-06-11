/**
 * Notification Service - Zentrale Stelle für Benachrichtigungen im Frontend
 * Implementiert einen einfachen Event-Bus für Benachrichtigungen
 */

// Speichert alle registrierten Event-Listener
const listeners = {
  success: [],
  error: [],
  warning: [],
  info: []
};

// Speichert den Verlauf der Benachrichtigungen
const history = [];
const MAX_HISTORY = 100;

/**
 * Fügt eine Benachrichtigung zur Historie hinzu
 * @param {Object} notification - Die Benachrichtigung
 */
const addToHistory = (notification) => {
  history.unshift(notification);
  if (history.length > MAX_HISTORY) {
    history.pop();
  }
};

/**
 * Sendet eine Benachrichtigung an alle registrierten Listener
 * @param {string} type - Typ der Benachrichtigung (success, error, warning, info)
 * @param {string} message - Die Nachricht
 * @param {Object} options - Zusätzliche Optionen (timeout, id, etc.)
 */
const notify = (type, message, options = {}) => {
  if (!listeners[type]) {
    console.warn(`Unbekannter Benachrichtigungstyp: ${type}`);
    return;
  }

  const notification = {
    id: options.id || Date.now().toString(),
    type,
    message,
    timestamp: new Date(),
    ...options
  };

  // Zur Historie hinzufügen
  addToHistory(notification);

  // Alle Listener benachrichtigen
  listeners[type].forEach(listener => {
    try {
      listener(notification);
    } catch (error) {
      console.error('Fehler beim Benachrichtigen eines Listeners:', error);
    }
  });

  return notification.id;
};

/**
 * Registriert einen Event-Listener für einen bestimmten Benachrichtigungstyp
 * @param {string} type - Typ der Benachrichtigung (success, error, warning, info)
 * @param {Function} listener - Die Callback-Funktion
 * @returns {Function} - Funktion zum Entfernen des Listeners
 */
const subscribe = (type, listener) => {
  if (!listeners[type]) {
    console.warn(`Unbekannter Benachrichtigungstyp: ${type}`);
    return () => {};
  }

  listeners[type].push(listener);

  // Rückgabe einer Funktion zum Entfernen des Listeners
  return () => {
    const index = listeners[type].indexOf(listener);
    if (index !== -1) {
      listeners[type].splice(index, 1);
    }
  };
};

/**
 * Abonniert alle Benachrichtigungstypen
 * @param {Function} listener - Die Callback-Funktion
 * @returns {Function} - Funktion zum Entfernen aller Listener
 */
const subscribeToAll = (listener) => {
  const unsubscribers = Object.keys(listeners).map(type => 
    subscribe(type, listener)
  );

  // Rückgabe einer Funktion zum Entfernen aller Listener
  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
};

// API für die verschiedenen Benachrichtigungstypen
const success = (message, options = {}) => notify('success', message, options);
const error = (message, options = {}) => notify('error', message, options);
const warning = (message, options = {}) => notify('warning', message, options);
const info = (message, options = {}) => notify('info', message, options);

/**
 * Gibt die Historie der Benachrichtigungen zurück
 * @param {number} limit - Maximale Anzahl der zurückgegebenen Einträge
 * @returns {Array} - Liste der Benachrichtigungen
 */
const getHistory = (limit = MAX_HISTORY) => {
  return history.slice(0, limit);
};

/**
 * Löscht die Historie der Benachrichtigungen
 */
const clearHistory = () => {
  history.length = 0;
};

export default {
  success,
  error,
  warning,
  info,
  subscribe,
  subscribeToAll,
  getHistory,
  clearHistory
}; 