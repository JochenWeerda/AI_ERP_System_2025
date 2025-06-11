/**
 * ModuleBase.test.js
 * Tests für die ModuleBase-Klasse
 */

import { ModuleBase } from '../core/ModuleBase.js';
import { StoreManager } from '../core/StoreManager.js';

/**
 * Mock-Modul für Tests
 */
class TestModule extends ModuleBase {
  static moduleName = 'test-module';
  static template = '<div>Test Module</div>';
  
  setup() {
    super.setup();
    this.initialized = true;
    this.lifecycleEvents = [];
    
    // Event-Methoden überschreiben, um Aufrufe zu verfolgen
    this.onMounted = this._trackLifecycle('mounted');
    this.onDestroyed = this._trackLifecycle('destroyed');
    this.onRendered = this._trackLifecycle('rendered');
    this.onPatched = this._trackLifecycle('patched');
  }
  
  // Hilfsmethode zum Verfolgen von Lifecycle-Events
  _trackLifecycle(event) {
    return () => {
      this.lifecycleEvents.push(event);
    };
  }
  
  // Test-Methoden
  getLifecycleEvents() {
    return this.lifecycleEvents;
  }
  
  triggerAction(action, payload) {
    this.handleAction(action, payload);
  }
  
  triggerError(error) {
    this.handleError(error);
  }
}

/**
 * Test-Suite für ModuleBase
 */
describe('ModuleBase', () => {
  let module;
  let storeManager;
  
  beforeEach(() => {
    storeManager = new StoreManager();
    module = new TestModule({
      moduleId: 'test-module-instance',
      config: {
        title: 'Test Module',
        description: 'Test Description'
      },
      storeManager: storeManager
    });
  });
  
  test('sollte die Basisinitialisierung durchführen', () => {
    expect(module.initialized).toBe(true);
    expect(module.moduleId).toBe('test-module-instance');
    expect(module.config.title).toBe('Test Module');
    expect(module.config.description).toBe('Test Description');
  });
  
  test('sollte einen Store erstellen', () => {
    expect(module.store).toBeDefined();
    expect(storeManager.hasStore('test-module-instance')).toBe(true);
  });
  
  test('sollte den initialen State korrekt setzen', () => {
    expect(module.state).toBeDefined();
    expect(module.state.loading).toBe(false);
    expect(module.state.error).toBe(null);
  });
  
  test('sollte Aktionen verarbeiten', () => {
    const mockHandler = jest.fn();
    module.onAction = mockHandler;
    
    module.triggerAction('test-action', { value: 123 });
    
    expect(mockHandler).toHaveBeenCalledWith({
      action: 'test-action',
      payload: { value: 123 },
      source: 'test-module-instance'
    });
  });
  
  test('sollte Fehler verarbeiten', () => {
    const mockHandler = jest.fn();
    module.onError = mockHandler;
    
    const testError = new Error('Test error');
    module.triggerError(testError);
    
    expect(mockHandler).toHaveBeenCalledWith({
      error: testError,
      source: 'test-module-instance'
    });
  });
  
  test('sollte den Ladevorgang steuern können', () => {
    expect(module.state.loading).toBe(false);
    
    module.startLoading();
    expect(module.state.loading).toBe(true);
    
    module.stopLoading();
    expect(module.state.loading).toBe(false);
  });
  
  test('sollte Fehler im State verwalten können', () => {
    expect(module.state.error).toBe(null);
    
    const testError = new Error('Test state error');
    module.setError(testError);
    expect(module.state.error).toBe(testError);
    
    module.clearError();
    expect(module.state.error).toBe(null);
  });
});

/**
 * Erweitertes Modul für Integrationstests
 */
class IntegrationTestModule extends ModuleBase {
  static moduleName = 'integration-test-module';
  static template = '<div>Integration Test Module</div>';
  
  setup() {
    super.setup();
    
    // Modul-spezifischer State
    this.state = {
      ...this.state,
      counter: 0,
      items: []
    };
    
    // Store-Aktionen definieren
    this.setupActions({
      increment: this.increment.bind(this),
      decrement: this.decrement.bind(this),
      addItem: this.addItem.bind(this),
      reset: this.reset.bind(this)
    });
  }
  
  // Aktionsmethoden
  increment(amount = 1) {
    this.store.updateState({
      counter: this.state.counter + amount
    });
  }
  
  decrement(amount = 1) {
    this.store.updateState({
      counter: this.state.counter - amount
    });
  }
  
  addItem(item) {
    this.store.updateState({
      items: [...this.state.items, item]
    });
  }
  
  reset() {
    this.store.updateState({
      counter: 0,
      items: []
    });
  }
}

/**
 * Integrationstests für ModuleBase
 */
describe('ModuleBase Integration', () => {
  let module;
  let storeManager;
  
  beforeEach(() => {
    storeManager = new StoreManager();
    module = new IntegrationTestModule({
      moduleId: 'integration-test',
      config: {},
      storeManager: storeManager
    });
  });
  
  test('sollte Store-Aktionen korrekt verarbeiten', () => {
    expect(module.state.counter).toBe(0);
    
    module.store.dispatch('increment');
    expect(module.state.counter).toBe(1);
    
    module.store.dispatch('increment', 5);
    expect(module.state.counter).toBe(6);
    
    module.store.dispatch('decrement', 2);
    expect(module.state.counter).toBe(4);
    
    module.store.dispatch('reset');
    expect(module.state.counter).toBe(0);
  });
  
  test('sollte mit Arrays im State umgehen können', () => {
    expect(module.state.items.length).toBe(0);
    
    module.store.dispatch('addItem', 'Item 1');
    expect(module.state.items.length).toBe(1);
    expect(module.state.items[0]).toBe('Item 1');
    
    module.store.dispatch('addItem', 'Item 2');
    expect(module.state.items.length).toBe(2);
    expect(module.state.items[1]).toBe('Item 2');
    
    module.store.dispatch('reset');
    expect(module.state.items.length).toBe(0);
  });
  
  test('sollte reaktiv auf State-Änderungen reagieren', () => {
    const mockUpdateHandler = jest.fn();
    module.onUpdate = mockUpdateHandler;
    
    module.store.dispatch('increment');
    
    expect(mockUpdateHandler).toHaveBeenCalled();
    const updateArg = mockUpdateHandler.mock.calls[0][0];
    expect(updateArg.type).toBe('state-changed');
    expect(updateArg.source).toBe('integration-test');
  });
}); 