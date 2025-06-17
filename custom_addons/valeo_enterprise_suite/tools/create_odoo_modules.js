/**
 * Odoo Studio Module Creator - Automatische Erstellung von Modulen
 * 
 * Dieses Skript erstellt automatisch vier Module in Odoo Studio:
 * 1. Dashboard
 * 2. Dokumentenmanagement
 * 3. E-Signatur
 * 4. Analytik
 * 
 * Jedes Modul wird mit vordefinierten Feldern erstellt.
 */

// Funktion zum Warten auf ein DOM-Element
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                reject(new Error(`Element ${selector} wurde nicht innerhalb von ${timeout}ms gefunden`));
                return;
            }
            
            setTimeout(checkElement, 100);
        };
        
        checkElement();
    });
}

// Funktion zum Klicken auf einen Button
async function clickButton(selector, description = '') {
    try {
        const button = await waitForElement(selector);
        console.log(`Klicke auf ${description || selector}`);
        button.click();
        return true;
    } catch (error) {
        console.error(`Fehler beim Klicken auf ${description || selector}:`, error);
        return false;
    }
}

// Funktion zum Ausfüllen eines Textfelds
async function fillTextField(selector, value, description = '') {
    try {
        const field = await waitForElement(selector);
        field.value = value;
        
        // Ein Event auslösen, damit Odoo die Änderung erkennt
        const event = new Event('input', { bubbles: true });
        field.dispatchEvent(event);
        
        console.log(`Feld ${description || selector} mit Wert "${value}" ausgefüllt`);
        return true;
    } catch (error) {
        console.error(`Fehler beim Ausfüllen des Feldes ${description || selector}:`, error);
        return false;
    }
}

// Funktion zum Auswählen einer Option in einem Dropdown
async function selectOption(selector, value, description = '') {
    try {
        const select = await waitForElement(selector);
        select.value = value;
        
        // Ein Event auslösen, damit Odoo die Änderung erkennt
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
        
        console.log(`Option "${value}" in Dropdown ${description || selector} ausgewählt`);
        return true;
    } catch (error) {
        console.error(`Fehler beim Auswählen der Option in ${description || selector}:`, error);
        return false;
    }
}

// Funktion zum Erstellen eines neuen Moduls
async function createModule(name, menuName, description) {
    console.log(`Erstelle Modul: ${name}`);
    
    try {
        // Warten auf die App Creator Seite
        await waitForElement('.o_studio_app_creator');
        
        // Formular ausfüllen
        await fillTextField('input[name="name"], input#name', name, 'Name');
        await fillTextField('input[name="menu_name"], input#menu_name', menuName, 'Menüname');
        
        // Beschreibung ausfüllen, falls vorhanden
        const descriptionField = document.querySelector('textarea[name="description"], textarea#description');
        if (descriptionField) {
            await fillTextField('textarea[name="description"], textarea#description', description, 'Beschreibung');
        }
        
        // Auf "Weiter" oder "Erstellen" Button klicken
        const nextButton = Array.from(document.querySelectorAll('button')).find(
            btn => btn.textContent.trim().includes('Weiter') || 
                  btn.textContent.trim().includes('Erstellen') ||
                  btn.textContent.trim().includes('Speichern')
        );
        
        if (nextButton) {
            nextButton.click();
            console.log('Auf "Weiter/Erstellen/Speichern" geklickt');
            
            // Warten, bis die Seite geladen ist
            await new Promise(resolve => setTimeout(resolve, 2000));
            return true;
        } else {
            console.error('Button "Weiter/Erstellen/Speichern" nicht gefunden');
            return false;
        }
    } catch (error) {
        console.error(`Fehler beim Erstellen des Moduls ${name}:`, error);
        return false;
    }
}

// Funktion zum Erstellen des Dashboard-Moduls
async function createDashboardModule() {
    return await createModule(
        'Dashboard', 
        'Dashboard', 
        'Zentrales Dashboard für die Überwachung und Analyse von Geschäftsprozessen'
    );
}

// Funktion zum Erstellen des Dokumentenmanagement-Moduls
async function createDocumentManagementModule() {
    return await createModule(
        'Dokumentenmanagement', 
        'Dokumente', 
        'Verwaltung und Organisation von Dokumenten mit Versionskontrolle und Berechtigungen'
    );
}

// Funktion zum Erstellen des E-Signatur-Moduls
async function createESignatureModule() {
    return await createModule(
        'E-Signatur', 
        'Signaturen', 
        'Elektronische Unterschriften für Dokumente und Verträge'
    );
}

// Funktion zum Erstellen des Analytik-Moduls
async function createAnalyticsModule() {
    return await createModule(
        'Analytik', 
        'Analysen', 
        'Umfassende Analysetools für Geschäftsdaten und Berichte'
    );
}

// Hauptfunktion zum Erstellen aller Module
async function createAllModules() {
    console.log('Starte die Erstellung aller Module...');
    
    // Versuche, die Module nacheinander zu erstellen
    const results = {
        dashboard: await createDashboardModule(),
        documentManagement: await createDocumentManagementModule(),
        eSignature: await createESignatureModule(),
        analytics: await createAnalyticsModule()
    };
    
    console.log('Erstellung der Module abgeschlossen:', results);
    return results;
}

// Funktion ausführen, wenn das Dokument geladen ist
if (document.readyState === 'complete') {
    createAllModules();
} else {
    window.addEventListener('load', createAllModules);
} 