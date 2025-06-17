/**
 * VALEO NeuroERP - Test-Runner
 * 
 * Dieser Test-Runner führt alle Tests für die VALEO Enterprise Suite aus.
 */

const fs = require('fs');
const path = require('path');

// Importiere alle Test-Suiten
const { dashboardTests } = require('./dashboard_tests');
const { documentsTests } = require('./documents_tests');
const { analyticsTests } = require('./analytics_tests');

// Liste aller Test-Suiten
const testSuites = [
  dashboardTests,
  documentsTests,
  analyticsTests,
  // Weitere Test-Suiten hier hinzufügen
];

// Erstelle Ergebnisverzeichnis, falls es nicht existiert
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

/**
 * Führt alle Test-Suiten aus
 */
async function runAllTests() {
  console.log('=== VALEO NeuroERP - Test-Runner ===');
  console.log(`Starte ${testSuites.length} Test-Suiten\n`);
  
  const startTime = new Date();
  const results = {
    total: testSuites.length,
    passed: 0,
    failed: 0,
    suites: [],
    startTime,
    endTime: null,
    duration: 0
  };
  
  for (const suite of testSuites) {
    try {
      console.log(`\n=== Starte Test-Suite: ${suite.name} ===\n`);
      const suiteResult = await suite.run();
      
      results.suites.push({
        name: suite.name,
        passed: suiteResult.passed,
        failed: suiteResult.failed,
        skipped: suiteResult.skipped,
        total: suiteResult.total,
        duration: suiteResult.duration
      });
      
      if (suiteResult.failed === 0) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(`Fehler beim Ausführen der Test-Suite ${suite.name}:`, error);
      results.failed++;
      results.suites.push({
        name: suite.name,
        passed: 0,
        failed: 1,
        skipped: 0,
        total: 1,
        duration: 0,
        error: error.message
      });
    }
  }
  
  results.endTime = new Date();
  results.duration = results.endTime - results.startTime;
  
  // Speichere Gesamtergebnis
  const resultPath = path.join(resultsDir, `test_results_${startTime.toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
  
  // Zeige Zusammenfassung
  console.log('\n=== Test-Zusammenfassung ===');
  console.log(`Gesamt: ${results.total} Test-Suiten`);
  console.log(`Bestanden: ${results.passed} Test-Suiten`);
  console.log(`Fehlgeschlagen: ${results.failed} Test-Suiten`);
  console.log(`Dauer: ${results.duration}ms`);
  console.log(`\nDetaillierte Ergebnisse gespeichert in: ${resultPath}`);
  
  return results;
}

// Führe Tests aus, wenn direkt aufgerufen
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Unerwarteter Fehler beim Ausführen der Tests:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests
}; 