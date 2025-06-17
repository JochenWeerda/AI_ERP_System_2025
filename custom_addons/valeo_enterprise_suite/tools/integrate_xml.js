/**
 * VALEO NeuroERP - XML Integration
 * 
 * Dieses Skript integriert extrahierte XML-Definitionen aus Odoo Studio
 * in die VALEO Enterprise Suite. Es liest XML-Dateien aus dem Extraktionsverzeichnis,
 * verarbeitet sie und fügt sie in die entsprechenden Odoo-XML-Dateien ein.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

// Konfiguration
const config = {
  extractedDir: path.join(__dirname, '../views/extracted'),
  viewsDir: path.join(__dirname, '../views'),
  backupDir: path.join(__dirname, '../views/backups')
};

// Stellen Sie sicher, dass die Verzeichnisse existieren
[config.extractedDir, config.backupDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Verzeichnis erstellt: ${dir}`);
  }
});

/**
 * Liest alle XML-Dateien aus dem Extraktionsverzeichnis
 * @returns {Array<Object>} - Liste der extrahierten XML-Dateien mit Metadaten
 */
function readExtractedXmlFiles() {
  const files = fs.readdirSync(config.extractedDir).filter(file => file.endsWith('.xml'));
  
  return files.map(file => {
    const filePath = path.join(config.extractedDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extrahiere Modellname und View-Typ aus dem Dateinamen
    const match = file.match(/(.+)_(.+)_view\.xml$/);
    if (!match) {
      console.warn(`Ungültiger Dateiname: ${file}, überspringe...`);
      return null;
    }
    
    const [, modelName, viewType] = match;
    
    return {
      file,
      path: filePath,
      content,
      modelName: modelName.replace(/_/g, '.'),
      viewType
    };
  }).filter(Boolean);
}

/**
 * Bestimmt die Zieldatei für die Integration
 * @param {string} modelName - Der Name des Modells
 * @returns {string} - Der Pfad zur Zieldatei
 */
function determineTargetFile(modelName) {
  // Bestimme Modul basierend auf dem Modellnamen
  let module = 'valeo_dashboard';
  
  if (modelName.includes('document')) {
    module = 'valeo_documents';
  } else if (modelName.includes('signature')) {
    module = 'valeo_esign';
  } else if (modelName.includes('analytics') || modelName.includes('report')) {
    module = 'valeo_analytics';
  }
  
  return path.join(config.viewsDir, `${module}_views.xml`);
}

/**
 * Erstellt ein Backup einer Datei
 * @param {string} filePath - Der Pfad zur Datei
 */
function backupFile(filePath) {
  const fileName = path.basename(filePath);
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupPath = path.join(config.backupDir, `${fileName}.${timestamp}.bak`);
  
  fs.copyFileSync(filePath, backupPath);
  console.log(`Backup erstellt: ${backupPath}`);
}

/**
 * Integriert eine XML-Definition in eine Zieldatei
 * @param {Object} xmlData - Die XML-Daten
 * @param {string} targetFile - Die Zieldatei
 */
function integrateXml(xmlData, targetFile) {
  console.log(`Integriere ${xmlData.file} in ${targetFile}`);
  
  // Erstelle Backup
  backupFile(targetFile);
  
  // Lese Zieldatei
  const targetContent = fs.readFileSync(targetFile, 'utf-8');
  
  // Parse XML
  const parser = new DOMParser();
  const targetDoc = parser.parseFromString(targetContent, 'text/xml');
  const extractedDoc = parser.parseFromString(xmlData.content, 'text/xml');
  
  // Extrahiere <record> Elemente aus der extrahierten XML
  const extractedData = extractedDoc.getElementsByTagName('data')[0];
  if (!extractedData) {
    console.warn(`Keine <data>-Elemente in ${xmlData.file} gefunden, überspringe...`);
    return;
  }
  
  const records = Array.from(extractedData.getElementsByTagName('record'));
  if (records.length === 0) {
    console.warn(`Keine <record>-Elemente in ${xmlData.file} gefunden, überspringe...`);
    return;
  }
  
  // Finde <data> Element in der Zieldatei
  const targetData = targetDoc.getElementsByTagName('data')[0];
  if (!targetData) {
    console.error(`Keine <data>-Elemente in ${targetFile} gefunden`);
    return;
  }
  
  // Füge jedes <record> Element hinzu
  records.forEach(record => {
    // Prüfe, ob ein ähnlicher Record bereits existiert
    const id = record.getAttribute('id');
    const existingRecords = Array.from(targetData.getElementsByTagName('record'))
      .filter(r => r.getAttribute('id') === id || r.getAttribute('id').endsWith(id));
    
    if (existingRecords.length > 0) {
      console.log(`Record mit ID ${id} existiert bereits, ersetze...`);
      existingRecords.forEach(existing => {
        targetData.replaceChild(targetDoc.importNode(record, true), existing);
      });
    } else {
      console.log(`Füge neuen Record mit ID ${id} hinzu`);
      targetData.appendChild(targetDoc.importNode(record, true));
    }
  });
  
  // Serialisiere XML
  const serializer = new XMLSerializer();
  const updatedContent = serializer.serializeToString(targetDoc);
  
  // Schreibe aktualisierte XML
  fs.writeFileSync(targetFile, formatXml(updatedContent), 'utf-8');
  console.log(`${xmlData.file} erfolgreich in ${targetFile} integriert`);
}

/**
 * Formatiert XML für bessere Lesbarkeit
 * @param {string} xml - Die zu formatierende XML
 * @returns {string} - Die formatierte XML
 */
function formatXml(xml) {
  // Einfache Formatierung mit Einrückungen
  let formatted = xml;
  formatted = formatted.replace(/<(\/?[^>]+)>/g, '\n<$1>');
  formatted = formatted.replace(/></g, '>\n<');
  
  // Füge Einrückungen hinzu
  const lines = formatted.split('\n');
  let indent = 0;
  const indentSize = 4;
  
  return lines.map(line => {
    line = line.trim();
    if (!line) return '';
    
    if (line.match(/<\/[^>]+>/) && !line.match(/<[^>]+>[^<]+<\/[^>]+>/)) {
      indent -= indentSize;
    }
    
    const result = ' '.repeat(indent) + line;
    
    if (line.match(/<[^>]+>/) && !line.match(/<\/[^>]+>/) && !line.match(/<[^>]+\/>/)) {
      indent += indentSize;
    }
    
    return result;
  }).join('\n');
}

/**
 * Hauptfunktion
 */
function main() {
  console.log('=== VALEO NeuroERP - XML Integration ===');
  
  try {
    // Lese extrahierte XML-Dateien
    const xmlFiles = readExtractedXmlFiles();
    console.log(`${xmlFiles.length} XML-Dateien gefunden`);
    
    if (xmlFiles.length === 0) {
      console.log('Keine XML-Dateien zum Integrieren gefunden');
      return;
    }
    
    // Integriere jede XML-Datei
    xmlFiles.forEach(xmlData => {
      const targetFile = determineTargetFile(xmlData.modelName);
      
      if (!fs.existsSync(targetFile)) {
        console.warn(`Zieldatei ${targetFile} existiert nicht, erstelle...`);
        fs.writeFileSync(targetFile, `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data>
        <!-- Generiert durch VALEO XML Integration -->
    </data>
</odoo>`, 'utf-8');
      }
      
      integrateXml(xmlData, targetFile);
    });
    
    console.log('\n=== XML-Integration abgeschlossen ===');
  } catch (error) {
    console.error(`Fehler bei der XML-Integration: ${error.message}`);
  }
}

// Starte das Skript
main(); 