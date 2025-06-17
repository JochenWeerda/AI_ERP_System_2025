#!/usr/bin/env node

/**
 * VALEO NeuroERP - Tools CLI
 * 
 * Dieses Skript dient als zentraler Einstiegspunkt für alle VALEO Tools.
 * Es bietet eine Kommandozeilen-Schnittstelle, um verschiedene Werkzeuge
 * auszuführen, wie z.B. XML-Extraktion, XML-Integration und Tests.
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');

// Versionsinformation
const packageJson = require('../package.json');
const version = packageJson.version || '1.0.0';

// OpenAI API-Konfiguration
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Platzhalter für den API-Schlüssel
const OPENAI_MODEL = 'gpt-3.5-turbo-0125'; // Effizientes Modell für unseren Anwendungsfall

// Konfiguration
program
  .name('valeo-tools')
  .description('VALEO NeuroERP Tools CLI')
  .version(version);

/**
 * Führt ein Skript aus
 * @param {string} scriptPath - Der Pfad zum Skript
 * @param {Array} args - Die Argumente für das Skript
 */
function runScript(scriptPath, args = []) {
  try {
    const result = execSync(`node ${scriptPath} ${args.join(' ')}`, { stdio: 'inherit' });
    return result;
  } catch (error) {
    console.error(`Fehler beim Ausführen des Skripts: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Startet einen Prozess im Hintergrund
 * @param {string} command - Der auszuführende Befehl
 * @param {Array} args - Die Argumente für den Befehl
 * @param {Object} options - Optionen für den Prozess
 */
function startProcess(command, args = [], options = {}) {
  const proc = spawn(command, args, {
    ...options,
    stdio: 'inherit',
    shell: true,
    detached: true
  });
  
  proc.on('error', (error) => {
    console.error(`Fehler beim Starten des Prozesses: ${error.message}`);
  });
  
  console.log(`Prozess gestartet mit PID: ${proc.pid}`);
  return proc;
}

// Setup-Befehl
program
  .command('setup')
  .description('Richtet die Entwicklungsumgebung ein')
  .action(() => {
    console.log('Richte Entwicklungsumgebung ein...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('Entwicklungsumgebung erfolgreich eingerichtet.');
    } catch (error) {
      console.error(`Fehler beim Einrichten der Entwicklungsumgebung: ${error.message}`);
      process.exit(1);
    }
  });

// XML-Extraktion
program
  .command('extract-xml')
  .description('Extrahiert XML-Definitionen aus Odoo Studio')
  .option('-t, --type <type>', 'Widget-Typ (kpi, chart, list, filter)')
  .action((options) => {
    const scriptPath = path.join(__dirname, 'studio_xml_extractor.js');
    const args = [];
    
    if (options.type) {
      args.push(`--type ${options.type}`);
    }
    
    runScript(scriptPath, args);
  });

// XML-Integration
program
  .command('integrate-xml')
  .description('Integriert extrahierte XML-Definitionen in die Odoo-Module')
  .option('-s, --source <source>', 'Quellverzeichnis für XML-Dateien')
  .option('-d, --destination <destination>', 'Zielverzeichnis für XML-Dateien')
  .action((options) => {
    const scriptPath = path.join(__dirname, 'xml_integrator.js');
    const args = [];
    
    if (options.source) {
      args.push(`--source ${options.source}`);
    }
    
    if (options.destination) {
      args.push(`--destination ${options.destination}`);
    }
    
    runScript(scriptPath, args);
  });

// Tests ausführen
program
  .command('run-tests')
  .description('Führt Tests aus')
  .option('-t, --type <type>', 'Test-Typ (unit, integration, all)')
  .action((options) => {
    const scriptPath = path.join(__dirname, '../tests/run_tests.js');
    const args = [];
    
    if (options.type) {
      args.push(`--type ${options.type}`);
    }
    
    runScript(scriptPath, args);
  });

// Browser-Tools-Server starten
program
  .command('start-browser-tools')
  .description('Startet den Browser-Tools-Server')
  .option('-p, --port <port>', 'Port für den Browser-Tools-Server', '3027')
  .action((options) => {
    console.log(`Starte Browser-Tools-Server auf Port ${options.port}...`);
    try {
      const proc = startProcess('npx', ['@agentdeskai/browser-tools-server', `--port=${options.port}`]);
      console.log(`Browser-Tools-Server gestartet. Drücken Sie Strg+C, um zu beenden.`);
    } catch (error) {
      console.error(`Fehler beim Starten des Browser-Tools-Servers: ${error.message}`);
      process.exit(1);
    }
  });

// MCP-Server starten
program
  .command('start-mcp')
  .description('Startet den MCP-Server für die Browser-Automatisierung')
  .option('-p, --port <port>', 'Port für den MCP-Server', '9009')
  .action((options) => {
    console.log(`Starte MCP-Server auf Port ${options.port} mit OpenAI-Integration...`);
    try {
      // Setze Umgebungsvariablen für den MCP-Server
      process.env.MCP_LLM_PROVIDER = 'openai';
      process.env.MCP_LLM_MODEL_NAME = OPENAI_MODEL;
      process.env.MCP_LLM_API_KEY = OPENAI_API_KEY;
      process.env.MCP_BROWSER_HEADLESS = 'false';
      process.env.MCP_BROWSER_USE_OWN_BROWSER = 'true';
      process.env.MCP_BROWSER_CDP_URL = 'http://localhost:9222';
      
      const proc = startProcess('npx', [
        '@agentdeskai/browser-tools-mcp',
        'serve',
        `-e`,
        `MCP_LLM_PROVIDER=openai`,
        `-e`,
        `MCP_LLM_MODEL_NAME=${OPENAI_MODEL}`,
        `-e`,
        `MCP_LLM_API_KEY=${OPENAI_API_KEY}`,
        `-e`,
        `MCP_BROWSER_HEADLESS=false`,
        `-e`,
        `MCP_BROWSER_USE_OWN_BROWSER=true`,
        `-e`,
        `MCP_BROWSER_CDP_URL=http://localhost:9222`
      ]);
      
      console.log(`MCP-Server mit OpenAI-Integration (${OPENAI_MODEL}) gestartet. Drücken Sie Strg+C, um zu beenden.`);
    } catch (error) {
      console.error(`Fehler beim Starten des MCP-Servers: ${error.message}`);
      process.exit(1);
    }
  });

// Browser-Use starten
program
  .command('start-browser-use')
  .description('Startet Browser-Use für die Odoo Studio Automatisierung')
  .option('-u, --url <url>', 'URL der Odoo-Instanz', 'http://localhost:8069')
  .option('-d, --database <database>', 'Odoo-Datenbank', 'odoo')
  .option('-l, --login <login>', 'Odoo-Benutzername', 'admin')
  .option('-p, --password <password>', 'Odoo-Passwort', 'admin')
  .action((options) => {
    console.log(`Starte Browser-Use für Odoo Studio Automatisierung...`);
    try {
      // Erstelle temporäre Konfigurationsdatei für Browser-Use
      const configPath = path.join(__dirname, 'browser_use_config.json');
      const config = {
        url: options.url,
        database: options.database,
        login: options.login,
        password: options.password,
        studioMode: true
      };
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      // Starte Playwright-basierte Browser-Automatisierung
      const scriptPath = path.join(__dirname, 'browser_use_launcher.js');
      const scriptContent = `
        const { chromium } = require('playwright');
        const fs = require('fs');
        const path = require('path');
        
        // Lade Konfiguration
        const configPath = '${configPath}';
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        (async () => {
          console.log('Starte Browser für Odoo Studio Automatisierung...');
          
          // Browser starten
          const browser = await chromium.launch({
            headless: false,
            slowMo: 100
          });
          
          // Kontext erstellen
          const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
          });
          
          // Seite öffnen
          const page = await context.newPage();
          
          try {
            // Zur Odoo-Anmeldeseite navigieren
            await page.goto(\`\${config.url}/web/login\`);
            
            // Anmelden
            await page.fill('input[name="login"]', config.login);
            await page.fill('input[name="password"]', config.password);
            await page.click('button[type="submit"]');
            
            // Warten auf die Startseite
            await page.waitForSelector('.o_home_menu', { timeout: 30000 });
            
            console.log('Erfolgreich bei Odoo angemeldet!');
            
            // Wenn Studio-Modus aktiviert werden soll
            if (config.studioMode) {
              console.log('Aktiviere Studio-Modus...');
              
              // Zur App-Ansicht navigieren (z.B. Einstellungen)
              await page.click('.o_app[data-menu-xmlid="base.menu_administration"]');
              
              // Warten auf die App-Ansicht
              await page.waitForSelector('.o_main_navbar', { timeout: 30000 });
              
              // Studio-Modus aktivieren
              await page.click('.o_main_navbar .o_web_studio_navbar_item');
              
              // Warten auf Studio-Modus
              await page.waitForSelector('.o_web_studio_client_action', { timeout: 30000 });
              
              console.log('Studio-Modus aktiviert!');
            }
            
            console.log('Browser-Automatisierung bereit. Drücken Sie Strg+C, um zu beenden.');
            
            // Browser offen halten
            await new Promise(() => {});
            
          } catch (error) {
            console.error(\`Fehler bei der Browser-Automatisierung: \${error.message}\`);
            await browser.close();
          }
        })();
      `;
      
      fs.writeFileSync(scriptPath, scriptContent);
      console.log(`Browser-Use-Launcher-Skript erstellt: ${scriptPath}`);
      
      // Führe das Skript aus
      const proc = startProcess('node', [scriptPath]);
      console.log(`Browser-Use für Odoo Studio gestartet. Drücken Sie Strg+C, um zu beenden.`);
    } catch (error) {
      console.error(`Fehler beim Starten von Browser-Use: ${error.message}`);
      process.exit(1);
    }
  });

// Odoo Studio Prototyp erstellen
program
  .command('create-prototype')
  .description('Erstellt einen Prototyp mit Odoo Studio über Browser-Automatisierung')
  .option('-t, --type <type>', 'Prototyp-Typ (form, list, kanban, dashboard)')
  .option('-m, --model <model>', 'Odoo-Modell für den Prototyp')
  .option('-n, --name <n>', 'Name des Prototyps')
  .action((options) => {
    console.log(`Erstelle Odoo Studio Prototyp vom Typ ${options.type} für Modell ${options.model}...`);
    try {
      const scriptPath = path.join(__dirname, 'studio_prototype_creator.js');
      const args = [];
      
      if (options.type) {
        args.push(`--type ${options.type}`);
      }
      
      if (options.model) {
        args.push(`--model ${options.model}`);
      }
      
      if (options.name) {
        args.push(`--name ${options.name}`);
      }
      
      runScript(scriptPath, args);
    } catch (error) {
      console.error(`Fehler beim Erstellen des Odoo Studio Prototyps: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

// Wenn kein Befehl angegeben wurde, zeige die Hilfe an
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 