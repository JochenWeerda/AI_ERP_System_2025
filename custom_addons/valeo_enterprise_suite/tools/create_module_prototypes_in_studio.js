/**
 * Odoo Studio Modul-Prototyp-Generator
 * 
 * Dieses Skript erstellt automatisch Prototypen für Module in Odoo Studio
 * mit detaillierten Funktionen zum Warten auf DOM-Elemente, Klicken und
 * Ausfüllen von Formularen.
 */

// Konfiguration
const CONFIG = {
    waitTimeout: 15000,      // Timeout für das Warten auf Elemente (ms)
    actionDelay: 500,        // Verzögerung zwischen Aktionen (ms)
    debugMode: true          // Debug-Modus aktivieren/deaktivieren
};

// Logger-Funktion
const logger = {
    log: function(message) {
        if (CONFIG.debugMode) {
            console.log(`[Odoo Studio] ${message}`);
        }
    },
    error: function(message, error) {
        console.error(`[Odoo Studio] FEHLER: ${message}`, error);
    },
    success: function(message) {
        console.log(`[Odoo Studio] ✓ ${message}`);
    },
    info: function(message) {
        console.info(`[Odoo Studio] ℹ ${message}`);
    }
};

/**
 * Wartet auf ein DOM-Element
 * @param {string} selector - CSS-Selektor für das Element
 * @param {number} timeout - Timeout in Millisekunden
 * @returns {Promise<Element>} - Das gefundene Element
 */
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
                reject(new Error(`Element ${selector} wurde nicht innerhalb von ${timeout}ms gefunden`));
                return;
            }
            
            setTimeout(checkElement, 100);
        };
        
        checkElement();
    });
}

/**
 * Wartet auf mehrere DOM-Elemente
 * @param {string} selector - CSS-Selektor für die Elemente
 * @param {number} timeout - Timeout in Millisekunden
 * @returns {Promise<NodeList>} - Die gefundenen Elemente
 */
function waitForElements(selector, timeout = CONFIG.waitTimeout) {
    logger.log(`Warte auf Elemente: ${selector}`);
    
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElements = () => {
            const elements = document.querySelectorAll(selector);
            if (elements && elements.length > 0) {
                logger.log(`${elements.length} Elemente gefunden: ${selector}`);
                resolve(elements);
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                reject(new Error(`Keine Elemente für ${selector} innerhalb von ${timeout}ms gefunden`));
                return;
            }
            
            setTimeout(checkElements, 100);
        };
        
        checkElements();
    });
}

/**
 * Fügt eine Verzögerung ein
 * @param {number} ms - Verzögerung in Millisekunden
 * @returns {Promise<void>}
 */
function delay(ms = CONFIG.actionDelay) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Füllt ein Textfeld aus
 * @param {string|Element} selector - CSS-Selektor oder Element
 * @param {string} value - Einzugebender Wert
 * @returns {Promise<boolean>} - true bei Erfolg, false bei Fehler
 */
async function fillField(selector, value) {
    try {
        const field = typeof selector === 'string' ? await waitForElement(selector) : selector;
        field.value = value;
        
        // Ein Event auslösen, damit Odoo die Änderung erkennt
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
        
        logger.success(`Feld ${typeof selector === 'string' ? selector : 'Element'} mit Wert "${value}" ausgefüllt`);
        return true;
    } catch (error) {
        logger.error(`Fehler beim Ausfüllen des Feldes ${typeof selector === 'string' ? selector : 'Element'}`, error);
        return false;
    }
}

/**
 * Klickt auf ein Element
 * @param {string|Element} selector - CSS-Selektor oder Element
 * @returns {Promise<boolean>} - true bei Erfolg, false bei Fehler
 */
async function clickElement(selector) {
    try {
        const element = typeof selector === 'string' ? await waitForElement(selector) : selector;
        
        // Sicherstellen, dass das Element sichtbar ist
        if (!isElementVisible(element)) {
            logger.error(`Element ${typeof selector === 'string' ? selector : 'Element'} ist nicht sichtbar`);
            return false;
        }
        
        // Auf das Element klicken
        element.click();
        
        logger.success(`Auf Element ${typeof selector === 'string' ? selector : 'Element'} geklickt`);
        return true;
    } catch (error) {
        logger.error(`Fehler beim Klicken auf Element ${typeof selector === 'string' ? selector : 'Element'}`, error);
        return false;
    }
}

/**
 * Klickt auf einen Button anhand seines Textes
 * @param {string} buttonText - Der Text des Buttons
 * @returns {Promise<boolean>} - true bei Erfolg, false bei Fehler
 */
async function clickButtonByText(buttonText) {
    try {
        logger.log(`Suche Button mit Text: ${buttonText}`);
        
        // Alle Buttons auf der Seite durchsuchen
        const buttons = Array.from(document.querySelectorAll('button, .btn, [role="button"]'));
        const button = buttons.find(btn => {
            const text = btn.textContent.trim();
            return text.includes(buttonText) || text.toLowerCase().includes(buttonText.toLowerCase());
        });
        
        if (!button) {
            throw new Error(`Button mit Text "${buttonText}" nicht gefunden`);
        }
        
        // Auf den Button klicken
        return await clickElement(button);
    } catch (error) {
        logger.error(`Fehler beim Klicken auf Button mit Text "${buttonText}"`, error);
        return false;
    }
}

/**
 * Wählt eine Option aus einem Dropdown-Menü aus
 * @param {string|Element} selector - CSS-Selektor oder Element des Dropdown-Menüs
 * @param {string} value - Der Wert der auszuwählenden Option
 * @returns {Promise<boolean>} - true bei Erfolg, false bei Fehler
 */
async function selectOption(selector, value) {
    try {
        const select = typeof selector === 'string' ? await waitForElement(selector) : selector;
        
        // Option auswählen
        select.value = value;
        
        // Ein Event auslösen, damit Odoo die Änderung erkennt
        select.dispatchEvent(new Event('change', { bubbles: true }));
        
        logger.success(`Option mit Wert "${value}" aus Dropdown ${typeof selector === 'string' ? selector : 'Element'} ausgewählt`);
        return true;
    } catch (error) {
        logger.error(`Fehler beim Auswählen der Option "${value}" aus Dropdown ${typeof selector === 'string' ? selector : 'Element'}`, error);
        return false;
    }
}

/**
 * Prüft, ob ein Element sichtbar ist
 * @param {Element} element - Das zu prüfende Element
 * @returns {boolean} - true, wenn das Element sichtbar ist
 */
function isElementVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
}

/**
 * Erstellt ein Modul in Odoo Studio
 * @param {Object} moduleConfig - Konfiguration für das zu erstellende Modul
 * @returns {Promise<boolean>} - true bei Erfolg, false bei Fehler
 */
async function createModule(moduleConfig) {
    try {
        logger.info(`Starte Erstellung des Moduls "${moduleConfig.name}"...`);
        
        // Warten auf die App Creator Seite
        await waitForElement('.o_studio_app_creator, .o_web_studio_new_app');
        
        // Formular ausfüllen
        await fillField('input[name="name"], input#name', moduleConfig.name);
        await fillField('input[name="menu_name"], input#menu_name', moduleConfig.menuName || moduleConfig.name);
        
        // Beschreibung ausfüllen, falls vorhanden
        const descriptionField = document.querySelector('textarea[name="description"], textarea#description');
        if (descriptionField && moduleConfig.description) {
            await fillField(descriptionField, moduleConfig.description);
        }
        
        // Auf "Weiter" oder "Speichern" Button klicken
        const buttonTexts = ['Weiter', 'Erstellen', 'Speichern', 'Next', 'Create', 'Save'];
        
        let buttonClicked = false;
        for (const buttonText of buttonTexts) {
            const result = await clickButtonByText(buttonText);
            if (result) {
                buttonClicked = true;
                logger.success(`Button "${buttonText}" erfolgreich geklickt`);
                break;
            }
        }
        
        if (!buttonClicked) {
            throw new Error(`Kein passender Button zum Erstellen des Moduls gefunden`);
        }
        
        // Warten, bis das Modul geladen ist
        await delay(2000);
        
        // Felder hinzufügen, falls vorhanden
        if (moduleConfig.fields && moduleConfig.fields.length > 0) {
            await addFields(moduleConfig.fields);
        }
        
        logger.success(`Modul "${moduleConfig.name}" erfolgreich erstellt`);
        return true;
    } catch (error) {
        logger.error(`Fehler bei der Erstellung des Moduls "${moduleConfig.name}"`, error);
        return false;
    }
}

/**
 * Fügt Felder zu einem Modul hinzu
 * @param {Array} fields - Die hinzuzufügenden Felder
 * @returns {Promise<boolean>} - true bei Erfolg, false bei Fehler
 */
async function addFields(fields) {
    try {
        logger.info(`Füge ${fields.length} Felder hinzu...`);
        
        for (const field of fields) {
            logger.log(`Füge Feld "${field.name}" vom Typ "${field.type}" hinzu...`);
            
            // Auf "Feld hinzufügen" Button klicken
            await clickElement('.o_web_studio_sidebar_add_field, .o_studio_sidebar_add_field');
            await delay();
            
            // Warten auf den Dialog
            const dialog = await waitForElement('.o_web_studio_field_modal, .o_studio_field_modal');
            
            // Feldname eingeben
            await fillField('input[name="name"]', field.name);
            
            // Feldlabel eingeben
            await fillField('input[name="string"]', field.label || field.name);
            
            // Feldtyp auswählen
            await selectOption('select[name="type"]', field.type);
            
            // Zusätzliche Feldoptionen ausfüllen, falls vorhanden
            if (field.options) {
                for (const [key, value] of Object.entries(field.options)) {
                    const optionField = dialog.querySelector(`[name="${key}"]`);
                    if (optionField) {
                        if (optionField.type === 'checkbox') {
                            // Checkbox-Felder
                            optionField.checked = value;
                            optionField.dispatchEvent(new Event('change', { bubbles: true }));
                        } else {
                            // Andere Felder
                            await fillField(optionField, value);
                        }
                    }
                }
            }
            
            // Auf "Bestätigen" Button klicken
            await clickElement('.modal-footer .btn-primary, .modal-footer .o_btn_primary');
            
            // Warten, bis das Feld hinzugefügt wurde
            await delay(1500);
            
            logger.success(`Feld "${field.name}" erfolgreich hinzugefügt`);
        }
        
        logger.success(`Alle ${fields.length} Felder erfolgreich hinzugefügt`);
        return true;
    } catch (error) {
        logger.error(`Fehler beim Hinzufügen von Feldern`, error);
        return false;
    }
}

// Modul-Konfigurationen
const MODULE_CONFIGS = [
    {
        name: "Dashboard",
        menuName: "Dashboard",
        description: "Zentrales Dashboard für die Überwachung und Analyse von Geschäftsprozessen",
        fields: [
            { name: "name", label: "Name", type: "char" },
            { name: "date_range", label: "Datumsbereich", type: "selection" },
            { name: "chart_type", label: "Diagrammtyp", type: "selection" },
            { name: "data_source", label: "Datenquelle", type: "many2one" },
            { name: "is_favorite", label: "Favorit", type: "boolean" }
        ]
    },
    {
        name: "Dokumentenmanagement",
        menuName: "Dokumente",
        description: "Verwaltung und Organisation von Dokumenten und Dateien",
        fields: [
            { name: "name", label: "Dokumentname", type: "char" },
            { name: "document_type", label: "Dokumenttyp", type: "selection" },
            { name: "file", label: "Datei", type: "binary" },
            { name: "tags", label: "Tags", type: "many2many" },
            { name: "owner", label: "Eigentümer", type: "many2one" },
            { name: "expiry_date", label: "Ablaufdatum", type: "date" }
        ]
    },
    {
        name: "E-Signatur",
        menuName: "E-Signatur",
        description: "Elektronische Signatur von Dokumenten und Verträgen",
        fields: [
            { name: "name", label: "Bezeichnung", type: "char" },
            { name: "document", label: "Dokument", type: "many2one" },
            { name: "signatories", label: "Unterzeichner", type: "many2many" },
            { name: "status", label: "Status", type: "selection" },
            { name: "signed_date", label: "Unterzeichnungsdatum", type: "datetime" },
            { name: "expiry_date", label: "Gültig bis", type: "date" }
        ]
    },
    {
        name: "Analytik",
        menuName: "Analytik",
        description: "Analyse und Auswertung von Geschäftsdaten",
        fields: [
            { name: "name", label: "Bezeichnung", type: "char" },
            { name: "analysis_type", label: "Analysetyp", type: "selection" },
            { name: "data_source", label: "Datenquelle", type: "many2one" },
            { name: "period_start", label: "Zeitraum von", type: "date" },
            { name: "period_end", label: "Zeitraum bis", type: "date" },
            { name: "metrics", label: "Kennzahlen", type: "many2many" }
        ]
    }
];

/**
 * Hauptfunktion zum Erstellen der Module
 * @param {number} moduleIndex - Index des zu erstellenden Moduls (optional)
 * @returns {Promise<void>}
 */
async function createModules(moduleIndex = null) {
    try {
        logger.info("Starte Erstellung der Module...");
        
        if (moduleIndex !== null && moduleIndex >= 0 && moduleIndex < MODULE_CONFIGS.length) {
            // Einzelnes Modul erstellen
            await createModule(MODULE_CONFIGS[moduleIndex]);
        } else {
            // Alle Module erstellen
            for (const moduleConfig of MODULE_CONFIGS) {
                await createModule(moduleConfig);
                
                // Zurück zur App Creator Seite navigieren
                // TODO: Implementieren, falls nötig
            }
        }
        
        logger.success("Alle Module erfolgreich erstellt");
    } catch (error) {
        logger.error("Fehler bei der Erstellung der Module", error);
    }
}

// Skript starten, wenn das Dokument geladen ist
if (document.readyState === 'complete') {
    createModules();
} else {
    window.addEventListener('load', createModules);
} 