/**
 * ModuleRegistry.test.js
 * Tests für die ModuleRegistry-Komponente
 */

import { ModuleRegistry } from '../core/ModuleRegistry.js';
import { ModuleBase } from '../core/ModuleBase.js';

/**
 * Mock-Modul für Tests
 */
class TestModule extends ModuleBase {
  static moduleName = 'test-module';
  static template = '<div>Test Module</div>';
  
  setup() {
    super.setup();
    this.state = {
      count: 0
    };
  }
  
  increment() {
    this.state.count++;
  }
}

/**
 * Weiteres Mock-Modul für Tests
 */
class AnotherTestModule extends ModuleBase {
  static moduleName = 'another-test-module';
  static template = '<div>Another Test Module</div>';
  
  setup() {
    super.setup();
    this.state = {
      items: []
    };
  }
  
  addItem(item) {
    this.state.items.push(item);
  }
}

/**
 * Test-Suite für die ModuleRegistry
 */
describe('ModuleRegistry', () => {
  let registry;
  
  beforeEach(() => {
    // ModuleRegistry für jeden Test neu erstellen
    registry = new ModuleRegistry();
  });
  
  test('sollte ein Modul registrieren können', () => {
    registry.register('test-module', TestModule);
    expect(registry.getModule('test-module')).toBe(TestModule);
  });
  
  test('sollte mehrere Module registrieren können', () => {
    registry.register('test-module', TestModule);
    registry.register('another-test-module', AnotherTestModule);
    
    expect(registry.getModule('test-module')).toBe(TestModule);
    expect(registry.getModule('another-test-module')).toBe(AnotherTestModule);
  });
  
  test('sollte alle registrierten Module zurückgeben', () => {
    registry.register('test-module', TestModule);
    registry.register('another-test-module', AnotherTestModule);
    
    const modules = registry.getAllModules();
    expect(Object.keys(modules).length).toBe(2);
    expect(modules['test-module']).toBe(TestModule);
    expect(modules['another-test-module']).toBe(AnotherTestModule);
  });
  
  test('sollte false zurückgeben, wenn ein Modul nicht existiert', () => {
    expect(registry.hasModule('non-existent-module')).toBe(false);
  });
  
  test('sollte true zurückgeben, wenn ein Modul existiert', () => {
    registry.register('test-module', TestModule);
    expect(registry.hasModule('test-module')).toBe(true);
  });
  
  test('sollte einen Fehler werfen, wenn ein Modul nicht gefunden wird', () => {
    expect(() => {
      registry.getModule('non-existent-module');
    }).toThrow('Modul "non-existent-module" nicht gefunden');
  });
  
  test('sollte einen Fehler werfen, wenn versucht wird, ein Modul mit einem bestehenden Namen zu registrieren', () => {
    registry.register('test-module', TestModule);
    
    expect(() => {
      registry.register('test-module', AnotherTestModule);
    }).toThrow('Modul "test-module" wurde bereits registriert');
  });
  
  test('sollte ein Modul deregistrieren können', () => {
    registry.register('test-module', TestModule);
    expect(registry.hasModule('test-module')).toBe(true);
    
    registry.unregister('test-module');
    expect(registry.hasModule('test-module')).toBe(false);
  });
  
  test('sollte Modul-Konfigurationen speichern können', () => {
    const config = {
      title: 'Test Module',
      description: 'Ein Testmodul',
      options: {
        showHeader: true
      }
    };
    
    registry.register('test-module', TestModule, config);
    expect(registry.getModuleConfig('test-module')).toEqual(config);
  });
  
  test('sollte die Standardkonfiguration zurückgeben, wenn keine Konfiguration gesetzt wurde', () => {
    registry.register('test-module', TestModule);
    expect(registry.getModuleConfig('test-module')).toEqual({});
  });
  
  test('sollte einen Fehler werfen, wenn die Konfiguration für ein nicht-existierendes Modul abgefragt wird', () => {
    expect(() => {
      registry.getModuleConfig('non-existent-module');
    }).toThrow('Modul "non-existent-module" nicht gefunden');
  });
  
  test('sollte die Modul-Konfiguration aktualisieren können', () => {
    registry.register('test-module', TestModule, { title: 'Original' });
    expect(registry.getModuleConfig('test-module').title).toBe('Original');
    
    registry.updateModuleConfig('test-module', { title: 'Updated' });
    expect(registry.getModuleConfig('test-module').title).toBe('Updated');
  });
  
  test('sollte einen Fehler werfen, wenn die Konfiguration für ein nicht-existierendes Modul aktualisiert wird', () => {
    expect(() => {
      registry.updateModuleConfig('non-existent-module', { title: 'Updated' });
    }).toThrow('Modul "non-existent-module" nicht gefunden');
  });
});

/**
 * Integrationstests für ModuleRegistry
 */
describe('ModuleRegistry Integration', () => {
  let registry;
  
  beforeEach(() => {
    registry = new ModuleRegistry();
  });
  
  test('sollte mit einer Modul-Factory funktionieren', () => {
    // Factory-Funktion, die ein Modul erstellt
    const createTestModule = (options) => {
      class DynamicTestModule extends ModuleBase {
        static moduleName = options.name;
        static template = '<div>Dynamic Test Module</div>';
        
        setup() {
          super.setup();
          this.state = {
            options: options
          };
        }
      }
      
      return DynamicTestModule;
    };
    
    const moduleOptions = {
      name: 'dynamic-test-module',
      value: 'Dynamisch erstellt'
    };
    
    const DynamicModule = createTestModule(moduleOptions);
    registry.register(moduleOptions.name, DynamicModule);
    
    expect(registry.hasModule('dynamic-test-module')).toBe(true);
    expect(registry.getModule('dynamic-test-module')).toBe(DynamicModule);
  });
  
  test('sollte Module mit Abhängigkeiten handhaben können', () => {
    // Erstes Modul registrieren
    registry.register('test-module', TestModule);
    
    // Zweites Modul mit Abhängigkeit zum ersten
    class DependentModule extends ModuleBase {
      static moduleName = 'dependent-module';
      static dependencies = ['test-module'];
      static template = '<div>Dependent Module</div>';
      
      setup() {
        super.setup();
        
        // TestModule-Instanz abrufen (in echtem Code)
        this.dependency = registry.getModule('test-module');
      }
    }
    
    registry.register('dependent-module', DependentModule);
    
    expect(registry.hasModule('dependent-module')).toBe(true);
    expect(DependentModule.dependencies).toContain('test-module');
  });
});
