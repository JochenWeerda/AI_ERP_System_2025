/**
 * setup.js
 * Test-Setup für Jest
 */

// OWL als globale Variable bereitstellen (wie es der Browser tun würde)
import * as owl from 'owl';
global.owl = owl;

// Jest-Erweiterungen
import '@testing-library/jest-dom';

// Mock für localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

// DOM-Umgebung einrichten
global.localStorage = new LocalStorageMock();
global.sessionStorage = new LocalStorageMock();

// Globale Hilfsfunktionen für Tests
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Warnungen unterdrücken (für sauberere Test-Ausgabe)
global.suppressWarnings = () => {
  const originalWarn = console.warn;
  beforeAll(() => {
    console.warn = jest.fn();
  });
  
  afterAll(() => {
    console.warn = originalWarn;
  });
};

// Standard-Timeout erhöhen für asynchrone Tests
jest.setTimeout(10000);

// Erweiterte Matchers für Tests
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
