/**
 * Odoo Studio Form-Ausfüller
 * 
 * Dieses Skript füllt automatisch Formularfelder in der Odoo Studio Oberfläche aus.
 * Es kann in der Browser-Konsole ausgeführt werden, wenn die Formularansicht geöffnet ist.
 */

// Konfiguration
const CONFIG = {
    waitTimeout: 10000,      // Timeout für das Warten auf Elemente (ms)
    actionDelay: 500,        // Verzögerung zwischen Aktionen (ms)
    debugMode: true          // Debug-Modus aktivieren/deaktivieren
};

// Logger-Funktion
const logger = {
    log: function(message) {
        if (CONFIG.debugMode) {
            console.log(`[Odoo Form Filler] ${message}`);
        }
    },
    error: function(message, error) {
        console.error(`[Odoo Form Filler] FEHLER: ${message}`, error);
    },
    success: function(message) {
        console.log(`[Odoo Form Filler] ✓ ${message}`);
    }
};

// Funktion zum Warten auf ein DOM-Element
function waitForElement(selector, timeout = CONFIG.waitTimeout) {
    logger.log(`Warte auf Element: ${selector}`);
    
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                logger.log(`Element gefunden: ${selector}`);
                resolve(element);
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                reject(new Error(`Timeout beim Warten auf Element: ${selector}`));
                return;
            }
            
            setTimeout(checkElement, 100);
        };
        
        checkElement();
    });
}

// Funktion zum Verzögern der Ausführung
function delay(ms = CONFIG.actionDelay) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Funktion zum Klicken auf ein Element
async function clickElement(selector) {
    try {
        const element = await waitForElement(selector);
        element.click();
        logger.success(`Auf Element geklickt: ${selector}`);
        await delay();
        return true;
    } catch (error) {
        logger.error(`Fehler beim Klicken auf Element: ${selector}`, error);
        return false;
    }
}

// Funktion zum Ausfüllen eines Textfeldes
async function fillTextField(selector, value) {
    try {
        const element = await waitForElement(selector);
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        logger.success(`Textfeld ausgefüllt: ${selector} mit Wert: ${value}`);
        await delay();
        return true;
    } catch (error) {
        logger.error(`Fehler beim Ausfüllen des Textfeldes: ${selector}`, error);
        return false;
    }
}

// Funktion zum Auswählen einer Option in einem Dropdown
async function selectDropdownOption(selector, optionText) {
    try {
        // Auf das Dropdown klicken, um es zu öffnen
        await clickElement(selector);
        
        // Warten auf die Dropdown-Optionen
        const optionSelector = `.dropdown-item:contains("${optionText}")`;
        await delay(1000); // Etwas länger warten, bis die Dropdown-Liste geladen ist
        
        // Auf die Option klicken
        await clickElement(optionSelector);
        
        logger.success(`Dropdown-Option ausgewählt: ${optionText}`);
        return true;
    } catch (error) {
        logger.error(`Fehler beim Auswählen der Dropdown-Option: ${optionText}`, error);
        return false;
    }
}

// Funktion zum Hinzufügen eines neuen Feldes
async function addNewField(fieldType, fieldName, fieldLabel) {
    try {
        // Auf den Feldtyp im Seitenmenü klicken
        await clickElement(`.o_web_studio_field_type[data-type="${fieldType}"]`);
        
        // Warten auf das Formular zum Hinzufügen des Feldes
        await delay(1000);
        
        // Feldname ausfüllen
        await fillTextField('input[name="name"]', fieldName);
        
        // Feldlabel ausfüllen
        await fillTextField('input[name="string"]', fieldLabel);
        
        // Auf "Hinzufügen" klicken
        await clickElement('.modal-footer .btn-primary');
        
        logger.success(`Neues Feld hinzugefügt: ${fieldType} - ${fieldName} (${fieldLabel})`);
        return true;
    } catch (error) {
        logger.error(`Fehler beim Hinzufügen des neuen Feldes: ${fieldType}`, error);
        return false;
    }
}

// Funktion zum Ausfüllen des Formulars
async function fillForm() {
    try {
        logger.log('Starte das Ausfüllen des Formulars...');
        
        // Beschreibung hinzufügen
        await addNewField('text', 'x_description', 'Beschreibung');
        await delay(1000);
        
        // Datum hinzufügen
        await addNewField('date', 'x_date', 'Datum');
        await delay(1000);
        
        // Priorität hinzufügen
        await addNewField('priority', 'x_priority', 'Priorität');
        await delay(1000);
        
        // Dezimalfeld hinzufügen
        await addNewField('float', 'x_amount', 'Betrag');
        await delay(1000);
        
        // Chatter-Widget hinzufügen
        await clickElement('.o_web_studio_add_chatter');
        
        logger.success('Formular erfolgreich ausgefüllt!');
    } catch (error) {
        logger.error('Fehler beim Ausfüllen des Formulars', error);
    }
}

// Hauptfunktion ausführen
(async function main() {
    logger.log('Odoo Studio Form-Ausfüller gestartet');
    
    try {
        // Warten, bis die Seite vollständig geladen ist
        await waitForElement('.o_web_studio_editor');
        logger.log('Odoo Studio Editor gefunden');
        
        // Formular ausfüllen
        await fillForm();
    } catch (error) {
        logger.error('Fehler im Hauptprogramm', error);
    }
})(); 