/**
 * Odoo Studio Dashboard-Modul-Generator
 * 
 * Dieses Skript erstellt automatisch ein Dashboard-Modul in Odoo Studio.
 * Es füllt die erforderlichen Felder aus und klickt auf den "Weiter" oder "Speichern" Button.
 */

// Funktion zum Warten auf ein DOM-Element
function waitForElement(selector, timeout = 10000) {
    console.log(`Warte auf Element: ${selector}`);
    
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`Element gefunden: ${selector}`);
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

// Funktion zum Ausfüllen eines Textfelds
async function fillField(selector, value) {
    try {
        const field = await waitForElement(selector);
        field.value = value;
        
        // Ein Event auslösen, damit Odoo die Änderung erkennt
        field.dispatchEvent(new Event('input', { bubbles: true }));
        
        console.log(`Feld ${selector} mit Wert "${value}" ausgefüllt`);
        return true;
    } catch (error) {
        console.error(`Fehler beim Ausfüllen des Feldes ${selector}:`, error);
        return false;
    }
}

// Funktion zum Klicken auf einen Button anhand seines Textes
async function clickButtonByText(buttonText) {
    try {
        console.log(`Suche Button mit Text: ${buttonText}`);
        
        // Alle Buttons auf der Seite durchsuchen
        const buttons = Array.from(document.querySelectorAll('button'));
        const button = buttons.find(btn => btn.textContent.trim().includes(buttonText));
        
        if (!button) {
            throw new Error(`Button mit Text "${buttonText}" nicht gefunden`);
        }
        
        console.log(`Klicke auf Button: ${buttonText}`);
        button.click();
        return true;
    } catch (error) {
        console.error(`Fehler beim Klicken auf Button ${buttonText}:`, error);
        return false;
    }
}

// Hauptfunktion zum Erstellen des Dashboard-Moduls
async function createDashboardModule() {
    try {
        console.log('Starte Erstellung des Dashboard-Moduls...');
        
        // Warten auf die App Creator Seite
        await waitForElement('.o_studio_app_creator');
        
        // Formular ausfüllen - Selektoren anpassen, falls nötig
        await fillField('input[name="name"], input#name', 'Dashboard');
        await fillField('input[name="menu_name"], input#menu_name', 'Dashboard');
        
        // Beschreibung ausfüllen, falls das Feld vorhanden ist
        const descriptionField = document.querySelector('textarea[name="description"], textarea#description');
        if (descriptionField) {
            await fillField('textarea[name="description"], textarea#description', 
                'Zentrales Dashboard für die Überwachung und Analyse von Geschäftsprozessen');
        }
        
        // Auf "Weiter" oder "Speichern" Button klicken
        // Verschiedene mögliche Button-Texte probieren
        const buttonTexts = ['Weiter', 'Erstellen', 'Speichern', 'Next', 'Create', 'Save'];
        
        for (const buttonText of buttonTexts) {
            const result = await clickButtonByText(buttonText);
            if (result) {
                console.log(`Button "${buttonText}" erfolgreich geklickt`);
                break;
            }
        }
        
        console.log('Dashboard-Modul erfolgreich erstellt');
        return true;
    } catch (error) {
        console.error('Fehler bei der Erstellung des Dashboard-Moduls:', error);
        return false;
    }
}

// Skript starten, wenn das Dokument geladen ist
if (document.readyState === 'complete') {
    createDashboardModule();
} else {
    window.addEventListener('load', createDashboardModule);
} 