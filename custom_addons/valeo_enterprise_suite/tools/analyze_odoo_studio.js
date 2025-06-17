/**
 * Odoo Studio Analyzer
 * 
 * Dieses Skript analysiert dynamisch die Odoo Studio-Oberfläche und ermittelt
 * die relevanten Selektoren für die Automatisierung.
 */

// Konfiguration
const CONFIG = {
    debugMode: true,
    waitTimeout: 10000
};

// Logger-Funktion
const logger = {
    log: function(message) {
        if (CONFIG.debugMode) {
            console.log(`[Odoo Studio Analyzer] ${message}`);
        }
    },
    error: function(message, error) {
        console.error(`[Odoo Studio Analyzer] FEHLER: ${message}`, error);
    },
    success: function(message) {
        console.log(`[Odoo Studio Analyzer] ✓ ${message}`);
    },
    info: function(message) {
        console.info(`[Odoo Studio Analyzer] ℹ ${message}`);
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
 * Extrahiert alle Formularfelder aus einem Container-Element
 * @param {Element} container - Das Container-Element
 * @returns {Object} - Die gefundenen Formularfelder
 */
function extractFormFields(container) {
    const fields = {};
    const inputElements = container.querySelectorAll('input, select, textarea');
    
    inputElements.forEach(element => {
        const fieldName = element.name || element.id || 'unbekannt';
        const fieldType = element.tagName.toLowerCase();
        const fieldValue = element.value;
        const fieldPlaceholder = element.placeholder || '';
        const fieldRequired = element.required;
        const fieldClasses = Array.from(element.classList);
        
        fields[fieldName] = {
            type: fieldType,
            value: fieldValue,
            placeholder: fieldPlaceholder,
            required: fieldRequired,
            classes: fieldClasses,
            selector: getUniqueSelector(element)
        };
    });
    
    return fields;
}

/**
 * Extrahiert alle Buttons aus einem Container-Element
 * @param {Element} container - Das Container-Element
 * @returns {Array} - Die gefundenen Buttons
 */
function extractButtons(container) {
    const buttons = [];
    const buttonElements = container.querySelectorAll('button, .btn, [role="button"]');
    
    buttonElements.forEach(element => {
        if (isElementVisible(element)) {
            buttons.push({
                text: element.textContent.trim(),
                classes: Array.from(element.classList),
                disabled: element.disabled,
                selector: getUniqueSelector(element)
            });
        }
    });
    
    return buttons;
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
 * Versucht, einen eindeutigen CSS-Selektor für ein Element zu erstellen
 * @param {Element} element - Das Element
 * @returns {string} - Der CSS-Selektor
 */
function getUniqueSelector(element) {
    if (!element) return '';
    
    // ID-Selektor, wenn vorhanden
    if (element.id) {
        return `#${element.id}`;
    }
    
    // Klassen-Selektor mit Odoo-spezifischen Klassen
    const odooClasses = Array.from(element.classList).filter(cls => 
        cls.startsWith('o_') || 
        cls.startsWith('oe_') || 
        cls.startsWith('btn-')
    );
    
    if (odooClasses.length > 0) {
        return `${element.tagName.toLowerCase()}.${odooClasses.join('.')}`;
    }
    
    // Name-Attribut, wenn vorhanden
    if (element.name) {
        return `${element.tagName.toLowerCase()}[name="${element.name}"]`;
    }
    
    // Platzhalter, wenn vorhanden
    if (element.placeholder) {
        return `${element.tagName.toLowerCase()}[placeholder="${element.placeholder}"]`;
    }
    
    // Fallback: Tag-Name mit Klassen
    if (element.classList.length > 0) {
        return `${element.tagName.toLowerCase()}.${Array.from(element.classList).join('.')}`;
    }
    
    // Einfacher Tag-Name als letzter Ausweg
    return element.tagName.toLowerCase();
}

/**
 * Analysiert die App Creator Seite
 * @returns {Promise<Object>} - Die Analyseergebnisse
 */
async function analyzeAppCreatorPage() {
    logger.info('Analysiere Odoo Studio App Creator Seite...');
    
    try {
        // Warten auf das Hauptformular
        const appCreatorForm = await waitForElement('.o_studio_app_creator, .o_web_studio_new_app');
        logger.success('App Creator Formular gefunden');
        
        // Extrahieren der Formularfelder
        const formFields = extractFormFields(document);
        logger.success(`${Object.keys(formFields).length} Formularfelder gefunden`);
        
        // Extrahieren der Buttons
        const buttons = extractButtons(document);
        logger.success(`${buttons.length} Buttons gefunden`);
        
        // Extrahieren der vordefinierten Modultypen/Vorlagen (falls vorhanden)
        const moduleTemplates = [];
        const templateElements = document.querySelectorAll('.o_studio_app_creator_template, .o_app_type, .o_web_studio_app_creator_template');
        
        templateElements.forEach(element => {
            moduleTemplates.push({
                name: element.textContent.trim(),
                classes: Array.from(element.classList),
                selector: getUniqueSelector(element)
            });
        });
        
        logger.success(`${moduleTemplates.length} Modulvorlagen gefunden`);
        
        // Analyseergebnisse zusammenfassen
        const analysis = {
            url: window.location.href,
            title: document.title,
            formFields,
            buttons,
            moduleTemplates,
            timestamp: new Date().toISOString()
        };
        
        // Ergebnisse in der Konsole ausgeben und zurückgeben
        logger.info('Analyse abgeschlossen');
        console.log('Analyseergebnisse:', analysis);
        
        // Ergebnisse im localStorage speichern
        try {
            localStorage.setItem('odooStudioAnalysis', JSON.stringify(analysis));
            logger.success('Analyseergebnisse im localStorage gespeichert');
        } catch (e) {
            logger.error('Fehler beim Speichern der Analyseergebnisse im localStorage', e);
        }
        
        return analysis;
    } catch (error) {
        logger.error('Fehler bei der Analyse der App Creator Seite', error);
        return null;
    }
}

/**
 * Hauptfunktion zum Starten der Analyse
 */
async function startAnalysis() {
    logger.info('Starte Odoo Studio Analyzer...');
    
    try {
        // URL prüfen
        const currentUrl = window.location.href;
        logger.info(`Aktuelle URL: ${currentUrl}`);
        
        if (currentUrl.includes('studio') && currentUrl.includes('app_creator')) {
            // App Creator Seite analysieren
            await analyzeAppCreatorPage();
        } else {
            logger.info('Keine bekannte Odoo Studio Seite erkannt');
            
            // Allgemeine Seitenanalyse durchführen
            const pageAnalysis = {
                url: currentUrl,
                title: document.title,
                formFields: extractFormFields(document),
                buttons: extractButtons(document),
                timestamp: new Date().toISOString()
            };
            
            console.log('Allgemeine Seitenanalyse:', pageAnalysis);
        }
        
        logger.success('Analyse abgeschlossen');
    } catch (error) {
        logger.error('Fehler bei der Analyse', error);
    }
}

// Skript starten, wenn das Dokument geladen ist
if (document.readyState === 'complete') {
    startAnalysis();
} else {
    window.addEventListener('load', startAnalysis);
} 