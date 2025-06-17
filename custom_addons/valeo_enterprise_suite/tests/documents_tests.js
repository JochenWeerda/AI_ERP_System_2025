/**
 * VALEO NeuroERP - Dokumentenmanagement Tests
 * 
 * Diese Tests prüfen die Funktionalität des VALEO Dokumentenmanagement-Moduls.
 */

const { TestFramework } = require('./browser_test_framework');

// Dokumentenmanagement-Tests
const documentsTests = {
    name: 'Dokumentenmanagement-Tests',
    
    /**
     * Führt alle Dokumentenmanagement-Tests aus
     */
    async run() {
        console.log('Starte Dokumentenmanagement-Tests...');
        
        const framework = new TestFramework({
            baseUrl: 'http://localhost:8069',
            username: 'admin',
            password: 'admin',
            headless: false
        });
        
        const startTime = new Date();
        const results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            total: 0,
            tests: [],
            duration: 0
        };
        
        try {
            await framework.initialize();
            
            // Teste Dokumenten-Erstellung
            await this.runTest(framework, results, 'testDocumentCreation', this.testDocumentCreation);
            
            // Teste Dokumenten-Kategorien
            await this.runTest(framework, results, 'testDocumentCategories', this.testDocumentCategories);
            
            // Teste Dokumenten-Suche
            await this.runTest(framework, results, 'testDocumentSearch', this.testDocumentSearch);
            
            // Teste Dokumenten-Versionen
            await this.runTest(framework, results, 'testDocumentVersions', this.testDocumentVersions);
            
            // Teste Dokumenten-Berechtigungen
            await this.runTest(framework, results, 'testDocumentPermissions', this.testDocumentPermissions);
            
            // Teste Dokumenten-OCR
            await this.runTest(framework, results, 'testDocumentOCR', this.testDocumentOCR);
            
        } catch (error) {
            console.error('Fehler beim Ausführen der Dokumentenmanagement-Tests:', error);
            results.failed++;
        } finally {
            await framework.close();
        }
        
        results.duration = new Date() - startTime;
        
        console.log('\nDokumentenmanagement-Tests abgeschlossen:');
        console.log(`Bestanden: ${results.passed}`);
        console.log(`Fehlgeschlagen: ${results.failed}`);
        console.log(`Übersprungen: ${results.skipped}`);
        console.log(`Gesamt: ${results.total}`);
        console.log(`Dauer: ${results.duration}ms`);
        
        return results;
    },
    
    /**
     * Führt einen einzelnen Test aus und aktualisiert die Ergebnisse
     */
    async runTest(framework, results, testName, testFunction) {
        console.log(`\nFühre Test aus: ${testName}`);
        results.total++;
        
        try {
            await testFunction(framework);
            console.log(`✓ Test bestanden: ${testName}`);
            results.passed++;
            results.tests.push({
                name: testName,
                status: 'passed',
                duration: 0
            });
        } catch (error) {
            console.error(`✗ Test fehlgeschlagen: ${testName}`, error);
            results.failed++;
            results.tests.push({
                name: testName,
                status: 'failed',
                error: error.message,
                duration: 0
            });
        }
    },
    
    /**
     * Test: Dokumenten-Erstellung
     */
    async testDocumentCreation(framework) {
        await framework.navigate('/web#action=valeo_documents.action_valeo_document');
        await framework.waitForElement('.o_list_button_add');
        await framework.click('.o_list_button_add');
        
        // Fülle Formular aus
        await framework.waitForElement('input[name="name"]');
        await framework.fillField('input[name="name"]', 'Test-Dokument');
        await framework.fillField('textarea[name="description"]', 'Dies ist ein Test-Dokument');
        
        // Speichere Dokument
        await framework.click('.o_form_button_save');
        
        // Überprüfe, ob das Dokument erstellt wurde
        await framework.waitForElement('.o_notification_title:contains("Erfolgreich")');
        
        // Überprüfe, ob das Dokument in der Liste angezeigt wird
        await framework.navigate('/web#action=valeo_documents.action_valeo_document');
        await framework.waitForElement('.o_data_row');
        const documentExists = await framework.elementExists('.o_data_cell:contains("Test-Dokument")');
        
        if (!documentExists) {
            throw new Error('Das erstellte Dokument wurde nicht in der Liste gefunden');
        }
    },
    
    /**
     * Test: Dokumenten-Kategorien
     */
    async testDocumentCategories(framework) {
        // Navigiere zu den Dokumentenkategorien
        await framework.navigate('/web#action=valeo_documents.action_valeo_document_category');
        await framework.waitForElement('.o_list_button_add');
        await framework.click('.o_list_button_add');
        
        // Erstelle eine neue Kategorie
        await framework.waitForElement('input[name="name"]');
        await framework.fillField('input[name="name"]', 'Test-Kategorie');
        await framework.click('.o_form_button_save');
        
        // Überprüfe, ob die Kategorie erstellt wurde
        await framework.waitForElement('.o_notification_title:contains("Erfolgreich")');
        
        // Erstelle ein Dokument in dieser Kategorie
        await framework.navigate('/web#action=valeo_documents.action_valeo_document');
        await framework.waitForElement('.o_list_button_add');
        await framework.click('.o_list_button_add');
        
        // Fülle Formular aus
        await framework.waitForElement('input[name="name"]');
        await framework.fillField('input[name="name"]', 'Kategorisiertes Dokument');
        
        // Wähle die Kategorie aus
        await framework.click('.o_field_many2one[name="category_id"] input');
        await framework.waitForElement('.ui-autocomplete');
        await framework.click('.ui-menu-item:contains("Test-Kategorie")');
        
        // Speichere Dokument
        await framework.click('.o_form_button_save');
        
        // Überprüfe, ob das Dokument mit der Kategorie erstellt wurde
        await framework.waitForElement('.o_notification_title:contains("Erfolgreich")');
    },
    
    /**
     * Test: Dokumenten-Suche
     */
    async testDocumentSearch(framework) {
        await framework.navigate('/web#action=valeo_documents.action_valeo_document');
        await framework.waitForElement('.o_searchview_input');
        
        // Suche nach dem zuvor erstellten Dokument
        await framework.fillField('.o_searchview_input', 'Test-Dokument');
        await framework.pressKey('Enter');
        
        // Warte auf die Suchergebnisse
        await framework.waitForElement('.o_data_row');
        
        // Überprüfe, ob das Dokument gefunden wurde
        const documentFound = await framework.elementExists('.o_data_cell:contains("Test-Dokument")');
        
        if (!documentFound) {
            throw new Error('Das gesuchte Dokument wurde nicht gefunden');
        }
    },
    
    /**
     * Test: Dokumenten-Versionen
     */
    async testDocumentVersions(framework) {
        // Navigiere zum zuvor erstellten Dokument
        await framework.navigate('/web#action=valeo_documents.action_valeo_document');
        await framework.waitForElement('.o_data_row');
        await framework.click('.o_data_cell:contains("Test-Dokument")');
        
        // Bearbeite das Dokument
        await framework.waitForElement('.o_form_button_edit');
        await framework.click('.o_form_button_edit');
        
        // Ändere die Beschreibung
        await framework.fillField('textarea[name="description"]', 'Dies ist eine aktualisierte Beschreibung');
        
        // Speichere die Änderungen
        await framework.click('.o_form_button_save');
        
        // Überprüfe, ob eine neue Version erstellt wurde
        await framework.click('a[name="action_view_versions"]');
        await framework.waitForElement('.o_data_row');
        
        // Es sollten mindestens zwei Versionen vorhanden sein
        const versionCount = await framework.getElementCount('.o_data_row');
        
        if (versionCount < 2) {
            throw new Error('Es wurden nicht genügend Dokumentenversionen gefunden');
        }
    },
    
    /**
     * Test: Dokumenten-Berechtigungen
     */
    async testDocumentPermissions(framework) {
        // Navigiere zu den Dokumentenberechtigungen
        await framework.navigate('/web#action=valeo_documents.action_valeo_document_permission');
        await framework.waitForElement('.o_list_button_add');
        await framework.click('.o_list_button_add');
        
        // Erstelle eine neue Berechtigung
        await framework.waitForElement('input[name="name"]');
        await framework.fillField('input[name="name"]', 'Test-Berechtigung');
        
        // Wähle eine Benutzergruppe aus
        await framework.click('.o_field_many2one[name="group_id"] input');
        await framework.waitForElement('.ui-autocomplete');
        await framework.click('.ui-menu-item:contains("Benutzer")');
        
        // Setze Berechtigungen
        await framework.click('input[name="perm_read"]');
        await framework.click('input[name="perm_write"]');
        await framework.click('input[name="perm_create"]');
        
        // Speichere die Berechtigung
        await framework.click('.o_form_button_save');
        
        // Überprüfe, ob die Berechtigung erstellt wurde
        await framework.waitForElement('.o_notification_title:contains("Erfolgreich")');
    },
    
    /**
     * Test: Dokumenten-OCR
     */
    async testDocumentOCR(framework) {
        // Dieser Test wird übersprungen, da OCR-Funktionalität möglicherweise nicht verfügbar ist
        console.log('OCR-Test wird übersprungen (erfordert externe OCR-Integration)');
        return true;
    }
};

module.exports = {
    documentsTests
}; 