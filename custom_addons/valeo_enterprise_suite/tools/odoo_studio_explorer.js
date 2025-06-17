/**
 * Odoo Studio Explorer - Analysiert die Odoo Studio App Creator Oberfläche
 * 
 * Dieses Skript hilft bei der Analyse der Odoo Studio-Oberfläche und dokumentiert
 * die Struktur und verfügbaren Elemente für die automatisierte Erstellung von Modulen.
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

// Funktion zum Extrahieren der Struktur der App Creator-Seite
async function analyzeAppCreatorPage() {
    console.log('Analysiere Odoo Studio App Creator Seite...');
    
    try {
        // Warten auf das Hauptformular
        const appCreatorForm = await waitForElement('.o_studio_app_creator');
        console.log('App Creator Formular gefunden');
        
        // Extrahieren der Formularfelder
        const formFields = {};
        const inputElements = appCreatorForm.querySelectorAll('input, select, textarea');
        
        inputElements.forEach(element => {
            const fieldName = element.name || element.id || 'Unbekanntes Feld';
            const fieldType = element.tagName.toLowerCase();
            const fieldValue = element.value;
            const fieldPlaceholder = element.placeholder || '';
            const fieldRequired = element.required;
            
            formFields[fieldName] = {
                type: fieldType,
                value: fieldValue,
                placeholder: fieldPlaceholder,
                required: fieldRequired
            };
        });
        
        console.log('Gefundene Formularfelder:', formFields);
        
        // Extrahieren der Buttons
        const buttons = Array.from(appCreatorForm.querySelectorAll('button')).map(button => {
            return {
                text: button.textContent.trim(),
                class: button.className,
                disabled: button.disabled
            };
        });
        
        console.log('Gefundene Buttons:', buttons);
        
        // Extrahieren der vordefinierten Modultypen/Vorlagen (falls vorhanden)
        const moduleTemplates = Array.from(document.querySelectorAll('.o_studio_app_creator_template, .o_app_type')).map(template => {
            return {
                name: template.textContent.trim(),
                class: template.className
            };
        });
        
        console.log('Gefundene Modulvorlagen:', moduleTemplates);
        
        return {
            formFields,
            buttons,
            moduleTemplates
        };
        
    } catch (error) {
        console.error('Fehler bei der Analyse der App Creator Seite:', error);
        return null;
    }
}

// Funktion zum Klicken auf einen Button
async function clickButton(buttonText) {
    try {
        const buttons = Array.from(document.querySelectorAll('button'));
        const button = buttons.find(btn => btn.textContent.trim().includes(buttonText));
        
        if (button) {
            console.log(`Klicke auf Button: ${buttonText}`);
            button.click();
            return true;
        } else {
            console.error(`Button mit Text "${buttonText}" nicht gefunden`);
            return false;
        }
    } catch (error) {
        console.error(`Fehler beim Klicken auf Button ${buttonText}:`, error);
        return false;
    }
}

// Funktion zum Ausfüllen eines Textfelds
async function fillTextField(selector, value) {
    try {
        const field = await waitForElement(selector);
        field.value = value;
        
        // Ein Event auslösen, damit Odoo die Änderung erkennt
        const event = new Event('input', { bubbles: true });
        field.dispatchEvent(event);
        
        console.log(`Feld ${selector} mit Wert "${value}" ausgefüllt`);
        return true;
    } catch (error) {
        console.error(`Fehler beim Ausfüllen des Feldes ${selector}:`, error);
        return false;
    }
}

// Hauptfunktion zum Starten der Analyse
async function startExploration() {
    console.log('Starte Exploration der Odoo Studio App Creator Oberfläche...');
    
    // Analysiere die App Creator Seite
    const appCreatorStructure = await analyzeAppCreatorPage();
    
    if (appCreatorStructure) {
        console.log('Exploration abgeschlossen. Struktur der App Creator Seite:', appCreatorStructure);
    } else {
        console.log('Exploration konnte nicht abgeschlossen werden.');
    }
}

// Funktion ausführen, wenn das Dokument geladen ist
if (document.readyState === 'complete') {
    startExploration();
} else {
    window.addEventListener('load', startExploration);
} 