/**
 * helpers.js
 * Allgemeine Hilfsfunktionen für das OWL-Framework
 */

/**
 * Generiert eine eindeutige ID
 * 
 * @param {string} prefix - Optionales Präfix für die ID
 * @returns {string} - Die generierte ID
 */
export function generateId(prefix = 'owl') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Wartet eine bestimmte Zeit
 * 
 * @param {number} ms - Millisekunden zu warten
 * @returns {Promise} - Promise, das nach der angegebenen Zeit aufgelöst wird
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Führt eine asynchrone Funktion mit Retry-Logik aus
 * 
 * @param {Function} fn - Die auszuführende Funktion
 * @param {Object} options - Optionen für die Retry-Logik
 * @param {number} options.retries - Anzahl der Wiederholungsversuche
 * @param {number} options.delay - Verzögerung zwischen den Versuchen in ms
 * @param {Function} options.onRetry - Callback, der bei jedem Wiederholungsversuch aufgerufen wird
 * @returns {Promise} - Das Ergebnis der Funktion
 */
export async function retry(fn, options = {}) {
  const { 
    retries = 3, 
    delay: delayMs = 1000, 
    onRetry = () => {} 
  } = options;
  
  let lastError;
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      
      if (attempt <= retries) {
        onRetry(error, attempt, retries);
        await delay(delayMs);
      }
    }
  }
  
  throw lastError;
}

/**
 * Debounce-Funktion - führt eine Funktion erst aus, 
 * wenn eine bestimmte Zeit ohne weitere Aufrufe vergangen ist
 * 
 * @param {Function} fn - Die zu debouncende Funktion
 * @param {number} wait - Wartezeit in ms
 * @returns {Function} - Die debounced Funktion
 */
export function debounce(fn, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      fn(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle-Funktion - begrenzt die Anzahl der Aufrufe einer Funktion pro Zeiteinheit
 * 
 * @param {Function} fn - Die zu throttlende Funktion
 * @param {number} limit - Minimale Zeit zwischen Aufrufen in ms
 * @returns {Function} - Die throttled Funktion
 */
export function throttle(fn, limit = 300) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Prüft, ob ein Wert definiert und nicht null ist
 * 
 * @param {*} value - Der zu prüfende Wert
 * @returns {boolean} - true, wenn der Wert definiert und nicht null ist
 */
export function isDefined(value) {
  return value !== undefined && value !== null;
}

/**
 * Deep-Merge für Objekte
 * 
 * @param {Object} target - Zielobjekt
 * @param {Object} source - Quellobjekt
 * @returns {Object} - Das zusammengeführte Objekt
 */
export function deepMerge(target, source) {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }
  
  const merged = { ...target };
  
  Object.keys(source).forEach(key => {
    if (isObject(source[key])) {
      merged[key] = deepMerge(merged[key] || {}, source[key]);
    } else {
      merged[key] = source[key];
    }
  });
  
  return merged;
}

/**
 * Prüft, ob ein Wert ein Objekt ist
 * 
 * @param {*} value - Der zu prüfende Wert
 * @returns {boolean} - true, wenn der Wert ein Objekt ist
 */
export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Formatiert einen Fehler zu einem lesbaren String
 * 
 * @param {Error|string} error - Der zu formatierende Fehler
 * @returns {string} - Der formatierte Fehler
 */
export function formatError(error) {
  if (!error) {
    return 'Unbekannter Fehler';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message || error.toString();
  }
  
  return JSON.stringify(error);
}

/**
 * Lädt ein Skript dynamisch
 * 
 * @param {string} url - URL des Skripts
 * @returns {Promise} - Promise, das aufgelöst wird, wenn das Skript geladen ist
 */
export function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Lädt ein CSS-Stylesheet dynamisch
 * 
 * @param {string} url - URL des Stylesheets
 * @returns {Promise} - Promise, das aufgelöst wird, wenn das Stylesheet geladen ist
 */
export function loadStylesheet(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

export default {
  generateId,
  delay,
  retry,
  debounce,
  throttle,
  isDefined,
  deepMerge,
  isObject,
  formatError,
  loadScript,
  loadStylesheet
};
