/**
 * ModuleBaseCSS.test.js
 * Test zur Analyse von CSS-Eigenschaften für die ModuleBase-Klasse
 */

import { ModuleBase } from '../core/ModuleBase.js';

/**
 * Einfaches Testmodul zur CSS-Analyse
 */
class CSSTestModule extends ModuleBase {
  static moduleName = 'css-test-module';
  static template = `
    <div class="css-test-container">
      <h1 class="css-test-heading">CSS Test Heading</h1>
      <p class="css-test-paragraph">CSS Test Paragraph</p>
      <button class="css-test-button">CSS Test Button</button>
      <input class="css-test-input" type="text" placeholder="CSS Test Input" />
      <div class="css-test-nested">
        <span class="css-test-span">CSS Test Span</span>
      </div>
    </div>
  `;
  
  setup() {
    super.setup();
  }
}

/**
 * Hilfsfunktion zum Extrahieren der berechneten Stile
 */
function getComputedStyles(element) {
  const styles = window.getComputedStyle(element);
  const result = {};
  
  // Wichtige CSS-Eigenschaften erfassen
  const propertiesToCapture = [
    // Schrift-Eigenschaften
    'font-family', 'font-size', 'font-weight', 'line-height', 'color',
    // Box-Modell
    'margin', 'padding', 'border', 'box-sizing',
    // Layout
    'display', 'position', 'width', 'height',
    // Flex und Grid
    'flex', 'grid', 'justify-content', 'align-items',
    // Hintergrund
    'background-color', 'background-image',
    // Rahmen und Schatten
    'border-radius', 'box-shadow',
    // Übergänge und Animationen
    'transition', 'animation'
  ];
  
  propertiesToCapture.forEach(prop => {
    result[prop] = styles.getPropertyValue(prop);
  });
  
  return result;
}

/**
 * Test-Suite für CSS-Analyse der ModuleBase
 */
describe('ModuleBase CSS-Analyse', () => {
  let container;
  let moduleInstance;
  
  beforeEach(() => {
    // Container für Tests erstellen
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Modul initialisieren und rendern
    moduleInstance = new CSSTestModule({
      moduleId: 'css-test-instance',
      config: {}
    });
    
    // Manuelles Rendering für Tests
    const { mount } = owl;
    return mount(CSSTestModule, container);
  });
  
  afterEach(() => {
    // Aufräumen nach jedem Test
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    moduleInstance = null;
  });
  
  test('sollte die Browser-Standard-CSS-Eigenschaften analysieren', () => {
    // Container-Element finden
    const containerEl = container.querySelector('.css-test-container');
    const headingEl = container.querySelector('.css-test-heading');
    const paragraphEl = container.querySelector('.css-test-paragraph');
    const buttonEl = container.querySelector('.css-test-button');
    const inputEl = container.querySelector('.css-test-input');
    const nestedEl = container.querySelector('.css-test-nested');
    const spanEl = container.querySelector('.css-test-span');
    
    // CSS-Eigenschaften analysieren
    const containerStyles = getComputedStyles(containerEl);
    const headingStyles = getComputedStyles(headingEl);
    const paragraphStyles = getComputedStyles(paragraphEl);
    const buttonStyles = getComputedStyles(buttonEl);
    const inputStyles = getComputedStyles(inputEl);
    const nestedStyles = getComputedStyles(nestedEl);
    const spanStyles = getComputedStyles(spanEl);
    
    // Ergebnisse protokollieren (für Dokumentationszwecke)
    console.log('=== Browser-Standard-CSS-Eigenschaften ===');
    console.log('Container:', containerStyles);
    console.log('Heading:', headingStyles);
    console.log('Paragraph:', paragraphStyles);
    console.log('Button:', buttonStyles);
    console.log('Input:', inputStyles);
    console.log('Nested:', nestedStyles);
    console.log('Span:', spanStyles);
    
    // Ergebnisse als JSON speichern (für Dokumentation)
    const cssResults = {
      container: containerStyles,
      heading: headingStyles,
      paragraph: paragraphStyles,
      button: buttonStyles,
      input: inputStyles,
      nested: nestedStyles,
      span: spanStyles
    };
    
    // JSON in localStorage speichern für späteren Zugriff
    localStorage.setItem('module-base-css-analysis', JSON.stringify(cssResults, null, 2));
    
    // Minimale Prüfungen (die tatsächlichen Werte variieren je nach Browser-Umgebung)
    expect(containerEl).toBeTruthy();
    expect(headingEl).toBeTruthy();
    expect(paragraphEl).toBeTruthy();
    expect(buttonEl).toBeTruthy();
    expect(inputEl).toBeTruthy();
    expect(nestedEl).toBeTruthy();
    expect(spanEl).toBeTruthy();
  });
  
  test('sollte die berechneten Dimensionen analysieren', () => {
    // Container-Element finden
    const containerEl = container.querySelector('.css-test-container');
    
    // Dimensionen ermitteln
    const rect = containerEl.getBoundingClientRect();
    
    // Box-Modell-Werte
    const computedStyle = window.getComputedStyle(containerEl);
    const boxModel = {
      width: rect.width,
      height: rect.height,
      padding: {
        top: parseFloat(computedStyle.paddingTop),
        right: parseFloat(computedStyle.paddingRight),
        bottom: parseFloat(computedStyle.paddingBottom),
        left: parseFloat(computedStyle.paddingLeft)
      },
      margin: {
        top: parseFloat(computedStyle.marginTop),
        right: parseFloat(computedStyle.marginRight),
        bottom: parseFloat(computedStyle.marginBottom),
        left: parseFloat(computedStyle.marginLeft)
      },
      border: {
        top: parseFloat(computedStyle.borderTopWidth),
        right: parseFloat(computedStyle.borderRightWidth),
        bottom: parseFloat(computedStyle.borderBottomWidth),
        left: parseFloat(computedStyle.borderLeftWidth)
      }
    };
    
    // Ergebnisse protokollieren
    console.log('=== Box-Modell-Analyse ===');
    console.log('Box-Modell:', boxModel);
    
    // Minimale Prüfungen
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });
});

/**
 * Test-Suite für interaktive CSS-Zustände
 */
describe('ModuleBase interaktive CSS-Zustände', () => {
  let container;
  
  beforeEach(() => {
    // Container für Tests erstellen
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Modul initialisieren und rendern
    const { mount } = owl;
    return mount(CSSTestModule, container);
  });
  
  afterEach(() => {
    // Aufräumen nach jedem Test
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
  });
  
  test('sollte Hover-Zustände analysieren', () => {
    // Elemente finden
    const buttonEl = container.querySelector('.css-test-button');
    const inputEl = container.querySelector('.css-test-input');
    
    // Ausgangszustand erfassen
    const buttonDefaultStyles = getComputedStyles(buttonEl);
    const inputDefaultStyles = getComputedStyles(inputEl);
    
    // Hover-Event simulieren
    const hoverEvent = new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    buttonEl.dispatchEvent(hoverEvent);
    inputEl.dispatchEvent(hoverEvent);
    
    // Hover-Zustand erfassen
    const buttonHoverStyles = getComputedStyles(buttonEl);
    const inputHoverStyles = getComputedStyles(inputEl);
    
    // Ergebnisse protokollieren
    console.log('=== Hover-Zustand-Analyse ===');
    console.log('Button Default:', buttonDefaultStyles);
    console.log('Button Hover:', buttonHoverStyles);
    console.log('Input Default:', inputDefaultStyles);
    console.log('Input Hover:', inputHoverStyles);
    
    // Minimale Prüfungen
    expect(buttonEl).toBeTruthy();
    expect(inputEl).toBeTruthy();
  });
  
  test('sollte Fokus-Zustände analysieren', () => {
    // Elemente finden
    const buttonEl = container.querySelector('.css-test-button');
    const inputEl = container.querySelector('.css-test-input');
    
    // Ausgangszustand erfassen
    const buttonDefaultStyles = getComputedStyles(buttonEl);
    const inputDefaultStyles = getComputedStyles(inputEl);
    
    // Fokus-Event simulieren
    buttonEl.focus();
    
    // Fokus-Zustand erfassen
    const buttonFocusStyles = getComputedStyles(buttonEl);
    
    // Input fokussieren
    inputEl.focus();
    
    // Input-Fokus-Zustand erfassen
    const inputFocusStyles = getComputedStyles(inputEl);
    
    // Ergebnisse protokollieren
    console.log('=== Fokus-Zustand-Analyse ===');
    console.log('Button Default:', buttonDefaultStyles);
    console.log('Button Focus:', buttonFocusStyles);
    console.log('Input Default:', inputDefaultStyles);
    console.log('Input Focus:', inputFocusStyles);
    
    // Minimale Prüfungen
    expect(buttonEl).toBeTruthy();
    expect(inputEl).toBeTruthy();
  });
}); 