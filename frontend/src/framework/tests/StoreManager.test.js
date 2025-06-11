/**
 * StoreManager.test.js
 * Tests für den StoreManager
 */

import { StoreManager } from '../core/StoreManager.js';

// Einfacher Mock-Store für Tests
class MockStore {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.subscribers = [];
  }
  
  getState() {
    return this.state;
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
    return this.state;
  }
  
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

/**
 * Test-Suite für den StoreManager
 */
describe('StoreManager', () => {
  let storeManager;
  
  beforeEach(() => {
    // StoreManager für jeden Test neu erstellen
    storeManager = new StoreManager();
  });
  
  test('sollte einen Store erstellen können', () => {
    const store = storeManager.createStore('test-store', { count: 0 });
    expect(store).toBeDefined();
    expect(storeManager.getStore('test-store')).toBe(store);
  });
  
  test('sollte den Status eines Stores zurückgeben', () => {
    const initialState = { count: 0, name: 'Test' };
    storeManager.createStore('test-store', initialState);
    
    const state = storeManager.getState('test-store');
    expect(state).toEqual(initialState);
  });
  
  test('sollte den Status eines Stores aktualisieren', () => {
    storeManager.createStore('test-store', { count: 0 });
    
    storeManager.updateState('test-store', { count: 1 });
    expect(storeManager.getState('test-store').count).toBe(1);
  });
  
  test('sollte den Status eines Stores teilweise aktualisieren', () => {
    storeManager.createStore('test-store', { count: 0, name: 'Test' });
    
    storeManager.updateState('test-store', { count: 1 });
    expect(storeManager.getState('test-store')).toEqual({ count: 1, name: 'Test' });
  });
  
  test('sollte einen Fehler werfen, wenn ein nicht vorhandener Store abgefragt wird', () => {
    expect(() => {
      storeManager.getStore('non-existent-store');
    }).toThrow('Store "non-existent-store" nicht gefunden');
  });
  
  test('sollte einen Fehler werfen, wenn ein Store doppelt erstellt wird', () => {
    storeManager.createStore('test-store', { count: 0 });
    
    expect(() => {
      storeManager.createStore('test-store', { count: 1 });
    }).toThrow('Store "test-store" existiert bereits');
  });
  
  test('sollte alle Stores zurückgeben', () => {
    storeManager.createStore('store1', { value: 1 });
    storeManager.createStore('store2', { value: 2 });
    
    const stores = storeManager.getAllStores();
    expect(Object.keys(stores).length).toBe(2);
    expect(stores['store1']).toBeDefined();
    expect(stores['store2']).toBeDefined();
  });
  
  test('sollte prüfen, ob ein Store existiert', () => {
    storeManager.createStore('test-store', { count: 0 });
    
    expect(storeManager.hasStore('test-store')).toBe(true);
    expect(storeManager.hasStore('non-existent-store')).toBe(false);
  });
  
  test('sollte einen Store entfernen', () => {
    storeManager.createStore('test-store', { count: 0 });
    expect(storeManager.hasStore('test-store')).toBe(true);
    
    storeManager.removeStore('test-store');
    expect(storeManager.hasStore('test-store')).toBe(false);
  });
  
  test('sollte einen Subscriber für Statusänderungen hinzufügen und entfernen', () => {
    storeManager.createStore('test-store', { count: 0 });
    
    const mockCallback = jest.fn();
    const unsubscribe = storeManager.subscribe('test-store', mockCallback);
    
    storeManager.updateState('test-store', { count: 1 });
    expect(mockCallback).toHaveBeenCalledWith({ count: 1 });
    
    // Unsubscribe
    unsubscribe();
    storeManager.updateState('test-store', { count: 2 });
    expect(mockCallback).toHaveBeenCalledTimes(1); // Callback sollte nicht erneut aufgerufen werden
  });
  
  test('sollte mit Aktionen für einen Store arbeiten', () => {
    // Store mit Aktionen erstellen
    storeManager.createStore('counter-store', { count: 0 }, {
      increment: (state, amount = 1) => ({ count: state.count + amount }),
      decrement: (state, amount = 1) => ({ count: state.count - amount }),
      reset: () => ({ count: 0 })
    });
    
    // Aktionen ausführen
    storeManager.dispatch('counter-store', 'increment');
    expect(storeManager.getState('counter-store').count).toBe(1);
    
    storeManager.dispatch('counter-store', 'increment', 5);
    expect(storeManager.getState('counter-store').count).toBe(6);
    
    storeManager.dispatch('counter-store', 'decrement', 2);
    expect(storeManager.getState('counter-store').count).toBe(4);
    
    storeManager.dispatch('counter-store', 'reset');
    expect(storeManager.getState('counter-store').count).toBe(0);
  });
  
  test('sollte einen Fehler werfen, wenn eine nicht vorhandene Aktion ausgeführt wird', () => {
    storeManager.createStore('test-store', { count: 0 }, {
      increment: (state) => ({ count: state.count + 1 })
    });
    
    expect(() => {
      storeManager.dispatch('test-store', 'unknown-action');
    }).toThrow('Aktion "unknown-action" für Store "test-store" nicht gefunden');
  });
});

/**
 * Integrationstests für StoreManager
 */
describe('StoreManager Integration', () => {
  let storeManager;
  
  beforeEach(() => {
    storeManager = new StoreManager();
  });
  
  test('sollte mit einem benutzerdefinierten Store funktionieren', () => {
    const customStore = new MockStore({ value: 'initial' });
    
    storeManager.registerStore('custom-store', customStore);
    expect(storeManager.getStore('custom-store')).toBe(customStore);
    expect(storeManager.getState('custom-store')).toEqual({ value: 'initial' });
    
    storeManager.updateState('custom-store', { value: 'updated' });
    expect(storeManager.getState('custom-store')).toEqual({ value: 'updated' });
  });
  
  test('sollte Status-Updates über mehrere Stores hinweg verarbeiten', () => {
    // Erster Store: Zähler
    storeManager.createStore('counter-store', { count: 0 }, {
      increment: (state) => ({ count: state.count + 1 }),
      reset: () => ({ count: 0 })
    });
    
    // Zweiter Store: Verlauf
    storeManager.createStore('history-store', { actions: [] }, {
      addAction: (state, action) => ({ 
        actions: [...state.actions, { type: action, timestamp: Date.now() }] 
      }),
      clear: () => ({ actions: [] })
    });
    
    // Ein Subscriber, der Aktionen des ersten Stores im zweiten speichert
    storeManager.subscribe('counter-store', () => {
      storeManager.dispatch('history-store', 'addAction', 'counter-updated');
    });
    
    // Zähler erhöhen
    storeManager.dispatch('counter-store', 'increment');
    expect(storeManager.getState('counter-store').count).toBe(1);
    expect(storeManager.getState('history-store').actions.length).toBe(1);
    expect(storeManager.getState('history-store').actions[0].type).toBe('counter-updated');
    
    // Zähler zurücksetzen
    storeManager.dispatch('counter-store', 'reset');
    expect(storeManager.getState('counter-store').count).toBe(0);
    expect(storeManager.getState('history-store').actions.length).toBe(2);
  });
  
  test('sollte verschachtelte Objekte im State korrekt behandeln', () => {
    storeManager.createStore('nested-store', {
      user: {
        profile: {
          name: 'Test User',
          settings: {
            theme: 'light',
            notifications: true
          }
        },
        isLoggedIn: true
      },
      app: {
        isLoading: false
      }
    });
    
    // Verschachtelte Eigenschaft aktualisieren
    storeManager.updateState('nested-store', {
      user: {
        profile: {
          settings: {
            theme: 'dark'
          }
        }
      }
    });
    
    const state = storeManager.getState('nested-store');
    expect(state.user.profile.settings.theme).toBe('dark');
    
    // Sicherstellen, dass andere Eigenschaften unverändert sind
    expect(state.user.profile.name).toBe('Test User');
    expect(state.user.profile.settings.notifications).toBe(true);
    expect(state.user.isLoggedIn).toBe(true);
    expect(state.app.isLoading).toBe(false);
  });
});
