/**
 * VALEO NeuroERP - Dashboard-Modul Tests
 * 
 * Diese Tests überprüfen die Funktionalität des VALEO Dashboard-Moduls.
 */

const { 
  TestSuite, 
  loginToOdoo, 
  navigateToModule, 
  assertElementExists, 
  assertElementVisible, 
  assertElementContainsText,
  clickElement,
  waitForElement,
  executeJavaScript,
  config
} = require('../tools/browser_test_framework');

// Erstelle Test-Suite
const dashboardTests = new TestSuite(
  'VALEO Dashboard Tests',
  'Tests für das VALEO Dashboard-Modul der VALEO Enterprise Suite'
);

// Vor allen Tests bei Odoo anmelden
dashboardTests.setBeforeAll(async () => {
  await loginToOdoo();
});

// Nach jedem Test zur Dashboard-Übersicht zurückkehren
dashboardTests.setAfterEach(async () => {
  // Navigiere zur Dashboard-Übersicht
  await navigateToModule('valeo_enterprise_suite.dashboard_menu');
});

// Test 1: Dashboard-Modul laden
dashboardTests.addTest('Dashboard-Modul laden', async () => {
  // Navigiere zum Dashboard-Modul
  await navigateToModule('valeo_enterprise_suite.dashboard_menu');
  
  // Überprüfe, ob die Dashboard-Übersicht angezeigt wird
  await assertElementExists('.o_valeo_dashboard_view', 'Dashboard-Übersicht wird nicht angezeigt');
  await assertElementVisible('.o_valeo_dashboard_header', 'Dashboard-Header ist nicht sichtbar');
  await assertElementContainsText('.o_valeo_dashboard_title', 'Dashboard', 'Dashboard-Titel ist nicht korrekt');
});

// Test 2: Dashboard erstellen
dashboardTests.addTest('Dashboard erstellen', async () => {
  // Navigiere zum Dashboard-Modul
  await navigateToModule('valeo_enterprise_suite.dashboard_menu');
  
  // Klicke auf "Neues Dashboard"
  await clickElement('.o_valeo_new_dashboard');
  
  // Warte auf das Dashboard-Formular
  await waitForElement('.o_form_view', 'Dashboard-Formular wird nicht angezeigt');
  
  // Gebe einen Namen für das Dashboard ein
  await executeJavaScript(`
    document.querySelector('input[name="name"]').value = 'Test Dashboard';
    document.querySelector('input[name="name"]').dispatchEvent(new Event('change'));
  `);
  
  // Wähle ein Layout
  await clickElement('select[name="layout"]');
  await clickElement('option[value="2_columns"]');
  
  // Speichere das Dashboard
  await clickElement('.o_form_button_save');
  
  // Überprüfe, ob das Dashboard gespeichert wurde
  await assertElementVisible('.o_form_saved', 'Dashboard wurde nicht gespeichert');
  await assertElementContainsText('.breadcrumb', 'Test Dashboard', 'Dashboard-Name wird nicht angezeigt');
});

// Test 3: KPI-Widget hinzufügen
dashboardTests.addTest('KPI-Widget hinzufügen', async () => {
  // Navigiere zum Dashboard-Modul
  await navigateToModule('valeo_enterprise_suite.dashboard_menu');
  
  // Öffne das Test-Dashboard
  await executeJavaScript(`
    const dashboardLink = Array.from(document.querySelectorAll('.o_data_row')).find(row => 
      row.textContent.includes('Test Dashboard')
    );
    if (dashboardLink) dashboardLink.click();
  `);
  
  // Warte auf das Dashboard
  await waitForElement('.o_form_view', 'Dashboard wird nicht angezeigt');
  
  // Klicke auf "Widget hinzufügen"
  await clickElement('.o_valeo_add_widget');
  
  // Warte auf den Widget-Dialog
  await waitForElement('.o_valeo_widget_dialog', 'Widget-Dialog wird nicht angezeigt');
  
  // Wähle KPI-Widget
  await clickElement('.o_valeo_widget_type[data-type="kpi"]');
  
  // Gebe einen Namen für das Widget ein
  await executeJavaScript(`
    document.querySelector('.o_valeo_widget_dialog input[name="name"]').value = 'Test KPI';
    document.querySelector('.o_valeo_widget_dialog input[name="name"]').dispatchEvent(new Event('change'));
  `);
  
  // Gebe einen Wert ein
  await executeJavaScript(`
    document.querySelector('.o_valeo_widget_dialog input[name="kpi_value"]').value = '1000';
    document.querySelector('.o_valeo_widget_dialog input[name="kpi_value"]').dispatchEvent(new Event('change'));
  `);
  
  // Gebe ein Ziel ein
  await executeJavaScript(`
    document.querySelector('.o_valeo_widget_dialog input[name="kpi_target"]').value = '1200';
    document.querySelector('.o_valeo_widget_dialog input[name="kpi_target"]').dispatchEvent(new Event('change'));
  `);
  
  // Wähle ein Format
  await clickElement('.o_valeo_widget_dialog select[name="kpi_format"]');
  await clickElement('.o_valeo_widget_dialog option[value="number"]');
  
  // Speichere das Widget
  await clickElement('.o_valeo_widget_dialog .btn-primary');
  
  // Überprüfe, ob das Widget hinzugefügt wurde
  await assertElementExists('.o_valeo_dashboard_widget[data-type="kpi"]', 'KPI-Widget wurde nicht hinzugefügt');
  await assertElementContainsText('.o_valeo_dashboard_widget[data-type="kpi"] .o_valeo_widget_title', 'Test KPI', 'Widget-Titel ist nicht korrekt');
  await assertElementContainsText('.o_valeo_dashboard_widget[data-type="kpi"] .o_valeo_kpi_value', '1000', 'KPI-Wert ist nicht korrekt');
});

// Test 4: Chart-Widget hinzufügen
dashboardTests.addTest('Chart-Widget hinzufügen', async () => {
  // Navigiere zum Dashboard-Modul
  await navigateToModule('valeo_enterprise_suite.dashboard_menu');
  
  // Öffne das Test-Dashboard
  await executeJavaScript(`
    const dashboardLink = Array.from(document.querySelectorAll('.o_data_row')).find(row => 
      row.textContent.includes('Test Dashboard')
    );
    if (dashboardLink) dashboardLink.click();
  `);
  
  // Warte auf das Dashboard
  await waitForElement('.o_form_view', 'Dashboard wird nicht angezeigt');
  
  // Klicke auf "Widget hinzufügen"
  await clickElement('.o_valeo_add_widget');
  
  // Warte auf den Widget-Dialog
  await waitForElement('.o_valeo_widget_dialog', 'Widget-Dialog wird nicht angezeigt');
  
  // Wähle Chart-Widget
  await clickElement('.o_valeo_widget_type[data-type="chart"]');
  
  // Gebe einen Namen für das Widget ein
  await executeJavaScript(`
    document.querySelector('.o_valeo_widget_dialog input[name="name"]').value = 'Test Chart';
    document.querySelector('.o_valeo_widget_dialog input[name="name"]').dispatchEvent(new Event('change'));
  `);
  
  // Wähle einen Diagrammtyp
  await clickElement('.o_valeo_widget_dialog select[name="chart_type"]');
  await clickElement('.o_valeo_widget_dialog option[value="bar"]');
  
  // Gebe Beispieldaten ein
  const sampleData = JSON.stringify({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Verkäufe',
      data: [12, 19, 3, 5, 2]
    }]
  });
  
  await executeJavaScript(`
    document.querySelector('.o_valeo_widget_dialog textarea[name="data_source"]').value = '${sampleData.replace(/'/g, "\\'")}';
    document.querySelector('.o_valeo_widget_dialog textarea[name="data_source"]').dispatchEvent(new Event('change'));
  `);
  
  // Aktiviere Legende
  await executeJavaScript(`
    document.querySelector('.o_valeo_widget_dialog input[name="show_legend"]').checked = true;
    document.querySelector('.o_valeo_widget_dialog input[name="show_legend"]').dispatchEvent(new Event('change'));
  `);
  
  // Speichere das Widget
  await clickElement('.o_valeo_widget_dialog .btn-primary');
  
  // Überprüfe, ob das Widget hinzugefügt wurde
  await assertElementExists('.o_valeo_dashboard_widget[data-type="chart"]', 'Chart-Widget wurde nicht hinzugefügt');
  await assertElementContainsText('.o_valeo_dashboard_widget[data-type="chart"] .o_valeo_widget_title', 'Test Chart', 'Widget-Titel ist nicht korrekt');
});

// Test 5: Dashboard-Layout ändern
dashboardTests.addTest('Dashboard-Layout ändern', async () => {
  // Navigiere zum Dashboard-Modul
  await navigateToModule('valeo_enterprise_suite.dashboard_menu');
  
  // Öffne das Test-Dashboard
  await executeJavaScript(`
    const dashboardLink = Array.from(document.querySelectorAll('.o_data_row')).find(row => 
      row.textContent.includes('Test Dashboard')
    );
    if (dashboardLink) dashboardLink.click();
  `);
  
  // Warte auf das Dashboard
  await waitForElement('.o_form_view', 'Dashboard wird nicht angezeigt');
  
  // Klicke auf "Bearbeiten"
  await clickElement('.o_form_button_edit');
  
  // Ändere das Layout
  await clickElement('select[name="layout"]');
  await clickElement('option[value="3_columns"]');
  
  // Speichere das Dashboard
  await clickElement('.o_form_button_save');
  
  // Überprüfe, ob das Layout geändert wurde
  await assertElementExists('.o_valeo_dashboard_layout_3_columns', 'Dashboard-Layout wurde nicht geändert');
});

// Führe alle Tests aus
async function runTests() {
  try {
    await dashboardTests.run();
  } catch (error) {
    console.error('Fehler beim Ausführen der Tests:', error);
  }
}

// Exportiere die Test-Suite und die Run-Funktion
module.exports = {
  dashboardTests,
  runTests
};

// Führe Tests aus, wenn direkt aufgerufen
if (require.main === module) {
  runTests();
} 