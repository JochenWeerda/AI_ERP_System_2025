#!/usr/bin/env node

/**
 * VALEO NeuroERP - Studio Prototype Creator
 * 
 * Dieses Skript automatisiert die Erstellung von Prototypen mit Odoo Studio
 * unter Verwendung von Playwright für die Browser-Automatisierung.
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { execSync } = require('child_process');

// Versionsinformation
const packageJson = require('../package.json');
const version = packageJson.version || '1.0.0';

// Konfiguration
program
  .name('studio-prototype-creator')
  .description('VALEO NeuroERP Studio Prototype Creator')
  .version(version)
  .option('-t, --type <type>', 'Prototyp-Typ (form, list, kanban, dashboard)')
  .option('-m, --model <model>', 'Odoo-Modell für den Prototyp')
  .option('-n, --name <name>', 'Name des Prototyps')
  .option('-u, --url <url>', 'URL der Odoo-Instanz', 'http://localhost:8069')
  .option('-d, --database <database>', 'Odoo-Datenbank', 'odoo')
  .option('-l, --login <login>', 'Odoo-Benutzername', 'admin')
  .option('-p, --password <password>', 'Odoo-Passwort', 'admin')
  .parse(process.argv);

const options = program.opts();

// Überprüfe, ob die erforderlichen Optionen angegeben wurden
if (!options.type) {
  console.error('Fehler: Bitte geben Sie einen Prototyp-Typ mit --type an.');
  process.exit(1);
}

if (!options.model) {
  console.error('Fehler: Bitte geben Sie ein Odoo-Modell mit --model an.');
  process.exit(1);
}

if (!options.name) {
  console.error('Fehler: Bitte geben Sie einen Namen für den Prototyp mit --name an.');
  process.exit(1);
}

// Erstelle das Playwright-Skript für die Odoo Studio Automatisierung
const scriptPath = path.join(__dirname, 'temp_studio_automation.js');
const scriptContent = `
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

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
    await page.goto('${options.url}/web/login');
    
    // Anmelden
    await page.fill('input[name="login"]', '${options.login}');
    await page.fill('input[name="password"]', '${options.password}');
    await page.click('button[type="submit"]');
    
    // Warten auf die Startseite
    await page.waitForSelector('.o_home_menu', { timeout: 30000 });
    console.log('Erfolgreich bei Odoo angemeldet!');
    
    // Zur App-Ansicht navigieren (z.B. Einstellungen)
    await page.click('.o_app[data-menu-xmlid="base.menu_administration"]');
    
    // Warten auf die App-Ansicht
    await page.waitForSelector('.o_main_navbar', { timeout: 30000 });
    
    // Studio-Modus aktivieren
    await page.click('.o_main_navbar .o_web_studio_navbar_item');
    
    // Warten auf Studio-Modus
    await page.waitForSelector('.o_web_studio_client_action', { timeout: 30000 });
    console.log('Studio-Modus aktiviert!');
    
    // Neuen Prototyp erstellen
    await page.click('.o_web_studio_new_app');
    
    // Warten auf den Modell-Konfigurator
    await page.waitForSelector('.o_web_studio_model_configurator', { timeout: 30000 });
    
    // Modell auswählen
    await page.fill('.o_web_studio_model_configurator input[name="model_name"]', '${options.model}');
    
    // Namen eingeben
    await page.fill('.o_web_studio_model_configurator input[name="name"]', '${options.name}');
    
    // Prototyp-Typ auswählen
    const typeSelector = {
      form: '.o_web_studio_model_configurator .o_web_studio_model_configurator_type[data-type="form"]',
      list: '.o_web_studio_model_configurator .o_web_studio_model_configurator_type[data-type="list"]',
      kanban: '.o_web_studio_model_configurator .o_web_studio_model_configurator_type[data-type="kanban"]',
      dashboard: '.o_web_studio_model_configurator .o_web_studio_model_configurator_type[data-type="dashboard"]'
    };
    
    await page.click(typeSelector['${options.type}']);
    console.log('Prototyp-Typ ausgewählt: ${options.type}');
    
    // Bestätigen
    await page.click('.o_web_studio_model_configurator .btn-primary');
    
    // Warten auf die Studio-Bearbeitungsansicht
    await page.waitForSelector('.o_web_studio_view_editor', { timeout: 60000 });
    console.log('Studio-Bearbeitungsansicht geöffnet!');
    
    // Warten, um sicherzustellen, dass die Ansicht vollständig geladen ist
    await page.waitForTimeout(2000);
    
    // Screenshot erstellen
    const screenshotPath = path.join(__dirname, '..', 'screenshots', \`studio_prototype_${options.type}_${options.model.replace(/\\./g, '_')}.png\`);
    await page.screenshot({ path: screenshotPath });
    console.log(\`Screenshot erstellt: \${screenshotPath}\`);
    
    // XML extrahieren
    console.log('Extrahiere XML-Definition...');
    const xmlContent = await page.evaluate(() => {
      // Versuche, das XML aus dem Studio-Editor zu extrahieren
      const viewRenderer = document.querySelector('.o_web_studio_view_renderer');
      if (viewRenderer) {
        return viewRenderer.outerHTML;
      }
      
      // Fallback: Extrahiere die gesamte Ansicht
      return document.querySelector('.o_web_studio_view_editor').outerHTML;
    });
    
    // Erstelle das Verzeichnis, falls es nicht existiert
    const extractedDir = path.join(__dirname, '..', 'views', 'extracted');
    if (!fs.existsSync(extractedDir)) {
      fs.mkdirSync(extractedDir, { recursive: true });
    }
    
    // XML in Datei speichern
    const outputPath = path.join(extractedDir, \`${options.type}_${options.model.replace(/\\./g, '_')}.xml\`);
    fs.writeFileSync(outputPath, xmlContent);
    console.log(\`XML wurde gespeichert unter: \${outputPath}\`);
    
    // Exportiere die XML-Definition aus Odoo Studio
    console.log('Exportiere XML-Definition aus Odoo Studio...');
    
    // Klicke auf den Export-Button
    await page.click('.o_web_studio_sidebar .o_web_studio_export');
    
    // Warte auf den Export-Dialog
    await page.waitForSelector('.o_web_studio_export_dialog', { timeout: 30000 });
    
    // Kopiere den XML-Inhalt
    const studioXml = await page.evaluate(() => {
      const codeElement = document.querySelector('.o_web_studio_export_dialog code');
      return codeElement ? codeElement.textContent : '';
    });
    
    // Speichere die exportierte XML-Definition
    if (studioXml) {
      const studioOutputPath = path.join(extractedDir, \`${options.type}_${options.model.replace(/\\./g, '_')}_studio_export.xml\`);
      fs.writeFileSync(studioOutputPath, studioXml);
      console.log(\`Studio XML-Export wurde gespeichert unter: \${studioOutputPath}\`);
    }
    
    // Schließe den Export-Dialog
    await page.click('.o_web_studio_export_dialog .btn-secondary');
    
    console.log('Prototyp erfolgreich erstellt und XML extrahiert!');
    
  } catch (error) {
    console.error(\`Fehler bei der Browser-Automatisierung: \${error.message}\`);
  } finally {
    // Browser schließen
    await browser.close();
  }
})();
`;

// Erstelle das Verzeichnis für Screenshots, falls es nicht existiert
const screenshotsDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Schreibe das temporäre Skript
fs.writeFileSync(scriptPath, scriptContent);
console.log(`Temporäres Skript erstellt: ${scriptPath}`);

// Führe das Skript aus
try {
  console.log('Führe Browser-Automatisierung aus...');
  execSync(`node ${scriptPath}`, { stdio: 'inherit' });
} catch (error) {
  console.error(`Fehler beim Ausführen des Skripts: ${error.message}`);
  process.exit(1);
} finally {
  // Lösche das temporäre Skript
  fs.unlinkSync(scriptPath);
  console.log('Temporäres Skript gelöscht.');
}

console.log('Prototyp-Erstellung abgeschlossen!'); 