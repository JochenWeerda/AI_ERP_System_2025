/**
 * VALEO NeuroERP - Studio XML Extractor
 * 
 * Dieses Skript automatisiert die Extraktion von XML-Definitionen aus Odoo Studio.
 * Es verwendet Browser-Automatisierung, um auf die Studio-Oberfläche zuzugreifen
 * und die XML-Definitionen zu extrahieren.
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// Versionsinformation
const packageJson = require('../package.json');
const version = packageJson.version || '1.0.0';

// Konfiguration
program
  .name('studio-xml-extractor')
  .description('VALEO NeuroERP Studio XML Extractor')
  .version(version)
  .option('-t, --type <type>', 'Widget-Typ (kpi, chart, list, filter)')
  .parse(process.argv);

const options = program.opts();

// Hauptfunktion
async function main() {
  console.log('VALEO NeuroERP - Studio XML Extractor');
  console.log('=====================================');
  
  const widgetType = options.type || 'kpi';
  console.log(`Widget-Typ: ${widgetType}`);
  
  try {
    // Browser-Automatisierung starten
    console.log('Starte Browser-Automatisierung...');
    
    // Verbindung zum Browser-Tools-Server herstellen
    const browserTools = await connectToBrowserTools();
    if (!browserTools) {
      console.error('Fehler: Konnte keine Verbindung zum Browser-Tools-Server herstellen.');
      process.exit(1);
    }
    
    // Extrahiere XML basierend auf Widget-Typ
    await extractXmlForWidgetType(browserTools, widgetType);
    
    console.log('XML-Extraktion abgeschlossen.');
  } catch (error) {
    console.error(`Fehler bei der XML-Extraktion: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Verbindung zum Browser-Tools-Server herstellen
 * @returns {Object} Browser-Tools-API
 */
async function connectToBrowserTools() {
  try {
    // Versuche, den Browser-Tools-Server zu finden
    console.log('Suche nach Browser-Tools-Server...');
    
    // Importiere die Browser-Tools-MCP-API mit CommonJS
    let browserToolsMcp;
    try {
      browserToolsMcp = require('@agentdeskai/browser-tools-mcp');
    } catch (error) {
      console.error(`Fehler beim Importieren von @agentdeskai/browser-tools-mcp: ${error.message}`);
      return null;
    }
    
    // Warte auf die Verbindung
    console.log('Verbinde mit Browser-Tools-Server...');
    await browserToolsMcp.waitForConnection();
    
    console.log('Verbindung zum Browser-Tools-Server hergestellt.');
    return browserToolsMcp;
  } catch (error) {
    console.error(`Fehler beim Verbinden mit dem Browser-Tools-Server: ${error.message}`);
    return null;
  }
}

/**
 * Extrahiert XML für einen bestimmten Widget-Typ
 * @param {Object} browserTools - Browser-Tools-API
 * @param {string} widgetType - Widget-Typ (kpi, chart, list, filter)
 */
async function extractXmlForWidgetType(browserTools, widgetType) {
  console.log(`Extrahiere XML für Widget-Typ: ${widgetType}`);
  
  try {
    // Öffne Odoo Studio
    console.log('Öffne Odoo Studio...');
    await browserTools.navigateTo('http://localhost:8069/web#action=studio');
    await browserTools.waitForSelector('.o_studio_client_action');
    
    // Warte auf Studio-Ladevorgang
    console.log('Warte auf Studio-Ladevorgang...');
    await browserTools.waitForSelector('.o_studio_menu');
    
    // Navigiere zum Dashboard-Modul
    console.log('Navigiere zum Dashboard-Modul...');
    await browserTools.click('.o_studio_menu_item[data-menu="valeo_dashboard"]');
    await browserTools.waitForSelector('.o_studio_editor');
    
    // Wähle Widget-Typ
    console.log(`Wähle Widget-Typ: ${widgetType}`);
    await selectWidgetType(browserTools, widgetType);
    
    // Extrahiere XML
    console.log('Extrahiere XML...');
    const xml = await extractXml(browserTools, widgetType);
    
    // Speichere XML
    if (xml) {
      saveXml(xml, widgetType);
    } else {
      console.error('Fehler: Konnte kein XML extrahieren.');
    }
  } catch (error) {
    console.error(`Fehler bei der XML-Extraktion für ${widgetType}: ${error.message}`);
    throw error;
  }
}

/**
 * Wählt einen Widget-Typ in Odoo Studio aus
 * @param {Object} browserTools - Browser-Tools-API
 * @param {string} widgetType - Widget-Typ (kpi, chart, list, filter)
 */
async function selectWidgetType(browserTools, widgetType) {
  // Widget-Typ-Mapping
  const widgetTypeMapping = {
    'kpi': '.o_studio_sidebar_item[data-type="kpi_widget"]',
    'chart': '.o_studio_sidebar_item[data-type="chart_widget"]',
    'list': '.o_studio_sidebar_item[data-type="list_widget"]',
    'filter': '.o_studio_sidebar_item[data-type="filter_widget"]'
  };
  
  const selector = widgetTypeMapping[widgetType];
  if (!selector) {
    throw new Error(`Ungültiger Widget-Typ: ${widgetType}`);
  }
  
  // Klicke auf Widget-Typ
  await browserTools.click(selector);
  await browserTools.waitForSelector('.o_studio_view_editor');
}

/**
 * Extrahiert XML aus Odoo Studio
 * @param {Object} browserTools - Browser-Tools-API
 * @param {string} widgetType - Widget-Typ (kpi, chart, list, filter)
 * @returns {string} Extrahiertes XML
 */
async function extractXml(browserTools, widgetType) {
  // Öffne XML-Editor
  await browserTools.click('.o_studio_sidebar_item[data-type="xml_editor"]');
  await browserTools.waitForSelector('.o_studio_xml_editor');
  
  // Extrahiere XML
  const xml = await browserTools.evaluateInPage(() => {
    const editorElement = document.querySelector('.o_studio_xml_editor .ace_text-input');
    return editorElement ? editorElement.value : null;
  });
  
  return xml;
}

/**
 * Speichert XML in eine Datei
 * @param {string} xml - XML-Inhalt
 * @param {string} widgetType - Widget-Typ (kpi, chart, list, filter)
 */
function saveXml(xml, widgetType) {
  // Erstelle Verzeichnis, falls es nicht existiert
  const extractedDir = path.resolve(__dirname, '../views/extracted');
  if (!fs.existsSync(extractedDir)) {
    fs.mkdirSync(extractedDir, { recursive: true });
  }
  
  // Dateiname basierend auf Widget-Typ
  const fileName = `valeo_dashboard_widget_${widgetType}_${getViewType(xml)}_view.xml`;
  const filePath = path.join(extractedDir, fileName);
  
  // Speichere XML
  fs.writeFileSync(filePath, xml);
  console.log(`XML gespeichert: ${filePath}`);
}

/**
 * Ermittelt den View-Typ aus dem XML
 * @param {string} xml - XML-Inhalt
 * @returns {string} View-Typ (form, list, etc.)
 */
function getViewType(xml) {
  if (xml.includes('<form')) return 'form';
  if (xml.includes('<tree')) return 'list';
  if (xml.includes('<search')) return 'search';
  if (xml.includes('<kanban')) return 'kanban';
  if (xml.includes('<calendar')) return 'calendar';
  if (xml.includes('<graph')) return 'graph';
  if (xml.includes('<pivot')) return 'pivot';
  return 'unknown';
}

// Führe Hauptfunktion aus
main().catch(error => {
  console.error(`Unbehandelter Fehler: ${error.message}`);
  process.exit(1);
}); 