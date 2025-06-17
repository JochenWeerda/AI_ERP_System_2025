/**
 * VALEO NeuroERP - Browser Test Framework
 * 
 * Dieses Framework ermöglicht automatisierte Tests der VALEO Enterprise Suite
 * mit Hilfe von Browser MCP. Es bietet eine einfache API zum Erstellen und
 * Ausführen von Tests für verschiedene Module.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { program } = require('commander');
const axios = require('axios');

// Konfiguration
const config = {
  browserMcpPort: 9010,
  odooUrl: 'http://localhost:8069',
  username: 'admin',
  password: 'admin',
  database: 'odoo',
  reportDir: path.join(__dirname, '../tests/reports'),
  screenshotDir: path.join(__dirname, '../tests/screenshots')
};

// Versionsinformation
const packageJson = require('../package.json');
const version = packageJson.version || '1.0.0';

// OpenAI API-Konfiguration
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Platzhalter für den API-Schlüssel
const OPENAI_MODEL = 'gpt-3.5-turbo-0125'; // Effizientes Modell für unseren Anwendungsfall

// MCP-Konfiguration
const MCP_CONFIG = {
  LLM_PROVIDER: 'openai',
  LLM_MODEL_NAME: OPENAI_MODEL,
  LLM_API_KEY: OPENAI_API_KEY,
  BROWSER_HEADLESS: false,
  BROWSER_USE_OWN_BROWSER: true,
  BROWSER_CDP_URL: 'http://localhost:9222'
};

// Stellen Sie sicher, dass die Verzeichnisse existieren
[config.reportDir, config.screenshotDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Verzeichnis erstellt: ${dir}`);
  }
});

/**
 * Führt einen Browser MCP-Befehl aus und gibt das Ergebnis zurück
 * @param {string} command - Der auszuführende Befehl
 * @returns {string} - Die Ausgabe des Befehls
 */
function executeBrowserMcpCommand(command) {
  try {
    const result = execSync(`curl -s -X POST http://localhost:${config.browserMcpPort}/mcp -H "Content-Type: application/json" -d '${JSON.stringify({ command })}'`);
    return result.toString();
  } catch (error) {
    console.error(`Fehler beim Ausführen des Browser MCP-Befehls: ${error.message}`);
    return null;
  }
}

/**
 * Test-Suite-Klasse
 */
class TestSuite {
  /**
   * Erstellt eine neue Test-Suite
   * @param {string} name - Der Name der Test-Suite
   * @param {string} description - Die Beschreibung der Test-Suite
   */
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.tests = [];
    this.beforeEach = null;
    this.afterEach = null;
    this.beforeAll = null;
    this.afterAll = null;
  }

  /**
   * Fügt einen Test zur Suite hinzu
   * @param {string} name - Der Name des Tests
   * @param {Function} testFn - Die Test-Funktion
   */
  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  /**
   * Setzt eine Funktion, die vor jedem Test ausgeführt wird
   * @param {Function} fn - Die Funktion
   */
  setBeforeEach(fn) {
    this.beforeEach = fn;
  }

  /**
   * Setzt eine Funktion, die nach jedem Test ausgeführt wird
   * @param {Function} fn - Die Funktion
   */
  setAfterEach(fn) {
    this.afterEach = fn;
  }

  /**
   * Setzt eine Funktion, die vor allen Tests ausgeführt wird
   * @param {Function} fn - Die Funktion
   */
  setBeforeAll(fn) {
    this.beforeAll = fn;
  }

  /**
   * Setzt eine Funktion, die nach allen Tests ausgeführt wird
   * @param {Function} fn - Die Funktion
   */
  setAfterAll(fn) {
    this.afterAll = fn;
  }

  /**
   * Führt alle Tests in der Suite aus
   * @returns {Object} - Die Testergebnisse
   */
  async run() {
    console.log(`\n=== Test-Suite: ${this.name} ===`);
    console.log(this.description);
    console.log('='.repeat(50));

    const results = {
      name: this.name,
      description: this.description,
      passed: 0,
      failed: 0,
      skipped: 0,
      total: this.tests.length,
      tests: [],
      startTime: new Date(),
      endTime: null,
      duration: 0
    };

    // Führe beforeAll aus
    if (this.beforeAll) {
      try {
        await this.beforeAll();
      } catch (error) {
        console.error(`Fehler in beforeAll: ${error.message}`);
        results.tests = this.tests.map(test => ({
          name: test.name,
          status: 'skipped',
          error: `beforeAll fehlgeschlagen: ${error.message}`,
          duration: 0
        }));
        results.skipped = this.tests.length;
        results.endTime = new Date();
        results.duration = results.endTime - results.startTime;
        return results;
      }
    }

    // Führe Tests aus
    for (const test of this.tests) {
      const testResult = {
        name: test.name,
        status: 'pending',
        error: null,
        duration: 0
      };

      console.log(`\n--- Test: ${test.name} ---`);
      
      const testStartTime = new Date();

      try {
        // Führe beforeEach aus
        if (this.beforeEach) {
          await this.beforeEach();
        }

        // Führe Test aus
        await test.testFn();

        // Führe afterEach aus
        if (this.afterEach) {
          await this.afterEach();
        }

        testResult.status = 'passed';
        results.passed++;
        console.log(`✅ Test bestanden: ${test.name}`);
      } catch (error) {
        testResult.status = 'failed';
        testResult.error = error.message;
        results.failed++;
        console.error(`❌ Test fehlgeschlagen: ${test.name}`);
        console.error(`   Fehler: ${error.message}`);
        
        // Erstelle Screenshot bei Fehler
        try {
          const screenshotPath = path.join(config.screenshotDir, `${this.name}_${test.name.replace(/\s+/g, '_')}_error.png`);
          await takeScreenshot(screenshotPath);
          console.log(`   Screenshot gespeichert: ${screenshotPath}`);
        } catch (screenshotError) {
          console.error(`   Fehler beim Erstellen des Screenshots: ${screenshotError.message}`);
        }
      }

      const testEndTime = new Date();
      testResult.duration = testEndTime - testStartTime;
      results.tests.push(testResult);
    }

    // Führe afterAll aus
    if (this.afterAll) {
      try {
        await this.afterAll();
      } catch (error) {
        console.error(`Fehler in afterAll: ${error.message}`);
      }
    }

    results.endTime = new Date();
    results.duration = results.endTime - results.startTime;

    // Erstelle Bericht
    const reportPath = path.join(config.reportDir, `${this.name.replace(/\s+/g, '_')}_report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\nTestbericht gespeichert: ${reportPath}`);

    // Zusammenfassung
    console.log('\n=== Zusammenfassung ===');
    console.log(`Gesamt: ${results.total}`);
    console.log(`Bestanden: ${results.passed}`);
    console.log(`Fehlgeschlagen: ${results.failed}`);
    console.log(`Übersprungen: ${results.skipped}`);
    console.log(`Dauer: ${results.duration}ms`);

    return results;
  }
}

/**
 * Browser-Hilfsfunktionen
 */

/**
 * Navigiert zu einer URL im Browser
 * @param {string} url - Die URL, zu der navigiert werden soll
 */
async function navigateToUrl(url) {
  console.log(`Navigiere zu: ${url}`);
  const command = {
    name: "navigate",
    args: { url }
  };
  executeBrowserMcpCommand(command);
  // Kurze Pause für das Laden der Seite
  await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * Wartet, bis ein Element auf der Seite erscheint
 * @param {string} selector - Der CSS-Selektor des Elements
 * @param {number} timeout - Timeout in Millisekunden
 * @returns {boolean} - True, wenn das Element gefunden wurde, sonst False
 */
async function waitForElement(selector, timeout = 10000) {
  console.log(`Warte auf Element: ${selector}`);
  const command = {
    name: "waitForElement",
    args: { selector, timeout }
  };
  const result = executeBrowserMcpCommand(command);
  return result && result.includes("success");
}

/**
 * Klickt auf ein Element auf der Seite
 * @param {string} selector - Der CSS-Selektor des Elements
 */
async function clickElement(selector) {
  console.log(`Klicke auf Element: ${selector}`);
  const command = {
    name: "click",
    args: { selector }
  };
  executeBrowserMcpCommand(command);
  // Kurze Pause nach dem Klick
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Gibt Text in ein Eingabefeld ein
 * @param {string} selector - Der CSS-Selektor des Elements
 * @param {string} text - Der einzugebende Text
 */
async function typeText(selector, text) {
  console.log(`Gebe Text ein in ${selector}: ${text}`);
  const command = {
    name: "type",
    args: { selector, text }
  };
  executeBrowserMcpCommand(command);
}

/**
 * Führt JavaScript im Browser aus und gibt das Ergebnis zurück
 * @param {string} script - Das auszuführende JavaScript
 * @returns {string} - Das Ergebnis der JavaScript-Ausführung
 */
function executeJavaScript(script) {
  console.log(`Führe JavaScript aus`);
  const command = {
    name: "executeScript",
    args: { script }
  };
  return executeBrowserMcpCommand(command);
}

/**
 * Erstellt einen Screenshot und speichert ihn
 * @param {string} filePath - Der Pfad, unter dem der Screenshot gespeichert werden soll
 */
async function takeScreenshot(filePath) {
  console.log(`Erstelle Screenshot: ${filePath}`);
  const command = {
    name: "screenshot",
    args: { fullPage: true }
  };
  const result = executeBrowserMcpCommand(command);
  
  if (result) {
    try {
      const imageData = JSON.parse(result).data;
      const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      return true;
    } catch (error) {
      console.error(`Fehler beim Speichern des Screenshots: ${error.message}`);
      return false;
    }
  }
  
  return false;
}

/**
 * Assertion-Funktionen
 */

/**
 * Prüft, ob ein Element auf der Seite existiert
 * @param {string} selector - Der CSS-Selektor des Elements
 * @param {string} message - Die Fehlermeldung bei Nichterfüllung
 */
async function assertElementExists(selector, message = null) {
  const exists = await waitForElement(selector, 5000);
  if (!exists) {
    throw new Error(message || `Element nicht gefunden: ${selector}`);
  }
}

/**
 * Prüft, ob ein Element auf der Seite nicht existiert
 * @param {string} selector - Der CSS-Selektor des Elements
 * @param {string} message - Die Fehlermeldung bei Nichterfüllung
 */
async function assertElementNotExists(selector, message = null) {
  const script = `!!document.querySelector('${selector.replace(/'/g, "\\'")}')`;
  const result = executeJavaScript(script);
  
  if (result === 'true') {
    throw new Error(message || `Element existiert, sollte aber nicht existieren: ${selector}`);
  }
}

/**
 * Prüft, ob ein Element sichtbar ist
 * @param {string} selector - Der CSS-Selektor des Elements
 * @param {string} message - Die Fehlermeldung bei Nichterfüllung
 */
async function assertElementVisible(selector, message = null) {
  const script = `
    const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return el.offsetWidth > 0 && el.offsetHeight > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  `;
  const result = executeJavaScript(script);
  
  if (result !== 'true') {
    throw new Error(message || `Element ist nicht sichtbar: ${selector}`);
  }
}

/**
 * Prüft, ob ein Element Text enthält
 * @param {string} selector - Der CSS-Selektor des Elements
 * @param {string} text - Der erwartete Text
 * @param {string} message - Die Fehlermeldung bei Nichterfüllung
 */
async function assertElementContainsText(selector, text, message = null) {
  const script = `
    const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
    if (!el) return false;
    return el.textContent.includes('${text.replace(/'/g, "\\'")}');
  `;
  const result = executeJavaScript(script);
  
  if (result !== 'true') {
    throw new Error(message || `Element enthält nicht den erwarteten Text: ${selector}, Erwartet: ${text}`);
  }
}

/**
 * Odoo-spezifische Hilfsfunktionen
 */

/**
 * Meldet sich bei Odoo an
 * @param {string} username - Der Benutzername
 * @param {string} password - Das Passwort
 * @param {string} database - Die Datenbank
 */
async function loginToOdoo(username = config.username, password = config.password, database = config.database) {
  console.log(`Melde an bei Odoo: ${username}@${database}`);
  
  await navigateToUrl(`${config.odooUrl}/web/login`);
  
  // Warte auf Login-Formular
  await waitForElement('form.oe_login_form', 10000);
  
  // Gebe Anmeldedaten ein
  await typeText('input[name="login"]', username);
  await typeText('input[name="password"]', password);
  
  // Wähle Datenbank, falls nötig
  const hasDatabaseSelector = executeJavaScript('!!document.querySelector("select[name=\'db\']")') === 'true';
  if (hasDatabaseSelector) {
    executeJavaScript(`
      const dbSelect = document.querySelector('select[name="db"]');
      if (dbSelect) {
        const option = Array.from(dbSelect.options).find(opt => opt.value === '${database}');
        if (option) {
          dbSelect.value = '${database}';
        }
      }
    `);
  }
  
  // Klicke auf Login-Button
  await clickElement('button.btn-primary');
  
  // Warte auf erfolgreiche Anmeldung
  const loggedIn = await waitForElement('.o_main_navbar', 10000);
  
  if (!loggedIn) {
    throw new Error('Anmeldung bei Odoo fehlgeschlagen');
  }
  
  console.log('Erfolgreich bei Odoo angemeldet');
}

/**
 * Navigiert zu einem Odoo-Modul
 * @param {string} moduleName - Der Name des Moduls
 */
async function navigateToModule(moduleName) {
  console.log(`Navigiere zu Modul: ${moduleName}`);
  
  // Öffne App-Menü, falls nicht bereits geöffnet
  const isAppMenuOpen = executeJavaScript('!!document.querySelector(".o_app_menu_opened")') === 'true';
  if (!isAppMenuOpen) {
    await clickElement('.o_menu_toggle');
    await waitForElement('.o_app_menu_opened', 5000);
  }
  
  // Suche nach dem Modul und klicke darauf
  const moduleSelector = `.o_app[data-menu-xmlid*="${moduleName}"], .o_app:contains("${moduleName}")`;
  await waitForElement(moduleSelector, 5000);
  await clickElement(moduleSelector);
  
  // Warte auf das Laden des Moduls
  await waitForElement('.o_content', 10000);
}

/**
 * Führt einen MCP-Agenten aus, um eine Aufgabe auszuführen
 * @param {string} task - Die Aufgabe, die der Agent ausführen soll
 * @returns {Promise<string>} - Das Ergebnis der Aufgabe
 */
async function runMcpAgent(task) {
  try {
    console.log(`Führe MCP-Agent aus für Aufgabe: ${task}`);
    
    // Erstelle die Anfrage an den MCP-Server mit OpenAI-Konfiguration
    const response = await axios.post(`${options.mcpUrl}/v1/tools/run_browser_agent`, {
      task: task,
      config: {
        llm_provider: MCP_CONFIG.LLM_PROVIDER,
        llm_model_name: MCP_CONFIG.LLM_MODEL_NAME,
        llm_api_key: MCP_CONFIG.LLM_API_KEY,
        browser_headless: MCP_CONFIG.BROWSER_HEADLESS,
        browser_use_own_browser: MCP_CONFIG.BROWSER_USE_OWN_BROWSER,
        browser_cdp_url: MCP_CONFIG.BROWSER_CDP_URL
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_CONFIG.LLM_API_KEY}`
      }
    });
    
    return response.data.result;
  } catch (error) {
    console.error(`Fehler beim Ausführen des MCP-Agenten: ${error.message}`);
    if (error.response) {
      console.error(`Statuscode: ${error.response.status}`);
      console.error(`Antwort: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Öffnet eine URL im Browser mit MCP
 * @param {string} url - Die zu öffnende URL
 * @returns {Promise<string>} - Das Ergebnis des Öffnens
 */
async function openUrl(url) {
  try {
    console.log(`Öffne URL mit MCP: ${url}`);
    
    // Erstelle die Aufgabenbeschreibung für den MCP-Agenten
    const task = `
      Öffne die folgende URL im Browser: ${url}
      
      Führe folgende Schritte aus:
      1. Öffne einen neuen Tab im Browser
      2. Navigiere zur URL: ${url}
      3. Warte, bis die Seite vollständig geladen ist
      4. Bestätige, dass die Seite erfolgreich geladen wurde
    `;
    
    // Führe den MCP-Agenten aus
    const result = await runMcpAgent(task);
    
    console.log(`URL erfolgreich geöffnet: ${url}`);
    return result;
  } catch (error) {
    console.error(`Fehler beim Öffnen der URL: ${error.message}`);
    throw error;
  }
}

/**
 * Öffnet eine URL im Browser mit MCP-Browser-Use
 * @param {string} url - Die zu öffnende URL
 * @returns {Promise<string>} - Das Ergebnis des Öffnens
 */
async function openUrlWithBrowserUse(url) {
  try {
    console.log(`Öffne URL mit MCP-Browser-Use: ${url}`);
    
    // Sende Anfrage an den Browser-Tools-Server
    const response = await axios.post(`${options.browserToolsUrl}/browser/navigate`, {
      url: url
    });
    
    console.log(`URL erfolgreich geöffnet: ${url}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Öffnen der URL mit Browser-Use: ${error.message}`);
    throw error;
  }
}

/**
 * Führt eine benutzerdefinierte Aufgabe mit MCP aus
 * @param {string} task - Die auszuführende Aufgabe
 * @returns {Promise<string>} - Das Ergebnis der Aufgabe
 */
async function runCustomTask(task) {
  try {
    console.log(`Führe benutzerdefinierte Aufgabe aus: ${task}`);
    
    // Führe den MCP-Agenten aus
    const result = await runMcpAgent(task);
    
    console.log(`Benutzerdefinierte Aufgabe erfolgreich ausgeführt!`);
    return result;
  } catch (error) {
    console.error(`Fehler beim Ausführen der benutzerdefinierten Aufgabe: ${error.message}`);
    throw error;
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  try {
    if (options.debug) {
      console.log('=== DEBUG-MODUS AKTIVIERT ===');
      console.log('Optionen:', options);
      console.log('MCP-Konfiguration:', MCP_CONFIG);
    }
    
    console.log('=== VALEO Enterprise Suite - Browser-Test-Framework ===');
    
    if (options.url) {
      // Öffne die angegebene URL
      await openUrl(options.url);
    } else if (options.task) {
      // Führe die angegebene Aufgabe aus
      await runCustomTask(options.task);
    } else {
      console.error('Fehler: Bitte geben Sie eine URL mit --url oder eine Aufgabe mit --task an.');
      process.exit(1);
    }
    
    console.log('\n=== Test erfolgreich abgeschlossen! ===');
  } catch (error) {
    console.error(`Fehler in der Hauptfunktion: ${error.message}`);
    process.exit(1);
  }
}

// Führe die Hauptfunktion aus
main().catch((error) => {
  console.error(`Unerwarteter Fehler: ${error.message}`);
  process.exit(1);
});

// Konfiguration
program
  .name('browser-test-framework')
  .description('VALEO NeuroERP Browser-Test-Framework')
  .version(version)
  .option('-u, --url <url>', 'URL zum Öffnen')
  .option('--mcp-url <mcpUrl>', 'Die URL des MCP-Servers', 'http://localhost:3025')
  .option('--browser-tools-url <browserToolsUrl>', 'Die URL des Browser-Tools-Servers', 'http://localhost:3026')
  .option('-t, --task <task>', 'Die auszuführende Aufgabe')
  .option('--debug', 'Debug-Modus aktivieren', false)
  .parse(process.argv);

const options = program.opts();

// Exportiert alle Funktionen und Klassen
module.exports = {
  TestSuite,
  // Browser-Funktionen
  navigateToUrl,
  waitForElement,
  clickElement,
  typeText,
  executeJavaScript,
  takeScreenshot,
  // Assertion-Funktionen
  assertElementExists,
  assertElementNotExists,
  assertElementVisible,
  assertElementContainsText,
  // Odoo-Funktionen
  loginToOdoo,
  navigateToModule,
  // Konfiguration
  config
}; 