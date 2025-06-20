/**
 * Odoo Studio Formularfelder-Ausfüller Bookmarklet
 * 
 * Dieses Skript kann als Bookmarklet verwendet werden, um die Formularfelder in Odoo Studio auszufüllen.
 * 
 * Bookmarklet-Version (kopieren und als Lesezeichen speichern):
 * javascript:(function(){var s=document.createElement('script');s.textContent=`
 * 
 * // Konfiguration
 * const CONFIG={waitTimeout:10000,actionDelay:500,debugMode:true};
 * 
 * // Logger-Funktion
 * const logger={log:function(e){CONFIG.debugMode&&console.log("[Odoo Form Filler] "+e)},error:function(e,t){console.error("[Odoo Form Filler] FEHLER: "+e,t)},success:function(e){console.log("[Odoo Form Filler] ✓ "+e)}};
 * 
 * // Funktion zum Warten auf ein DOM-Element
 * function waitForElement(e,t=CONFIG.waitTimeout){return logger.log("Warte auf Element: "+e),new Promise((n,o)=>{const r=Date.now(),i=()=>{const l=document.querySelector(e);l?(logger.log("Element gefunden: "+e),n(l)):Date.now()-r>t?o(new Error("Timeout beim Warten auf Element: "+e)):setTimeout(i,100)};i()})}
 * 
 * // Funktion zum Verzögern der Ausführung
 * function delay(e=CONFIG.actionDelay){return new Promise(t=>setTimeout(t,e))}
 * 
 * // Funktion zum Klicken auf ein Element
 * async function clickElement(e){try{const t=await waitForElement(e);return t.click(),logger.success("Auf Element geklickt: "+e),await delay(),!0}catch(t){return logger.error("Fehler beim Klicken auf Element: "+e,t),!1}}
 * 
 * // Funktion zum Ziehen eines Elements per Drag & Drop
 * async function dragAndDrop(e,t){try{const n=await waitForElement(e),o=await waitForElement(t),r=new MouseEvent("mousedown",{bubbles:!0,cancelable:!0,view:window});n.dispatchEvent(r),await delay(300);const i=new MouseEvent("mouseup",{bubbles:!0,cancelable:!0,view:window});return o.dispatchEvent(i),logger.success("Drag & Drop durchgeführt: "+e+" -> "+t),await delay(),!0}catch(n){return logger.error("Fehler beim Drag & Drop: "+e+" -> "+t,n),!1}}
 * 
 * // Funktion zum Hinzufügen eines neuen Feldes durch Drag & Drop
 * async function addFieldByDragDrop(e,t=".o_web_studio_form_view_editor"){try{const n=".o_web_studio_field_type[data-type='"+e+"']";return await dragAndDrop(n,t),logger.success("Feld per Drag & Drop hinzugefügt: "+e),await delay(1e3),!0}catch(n){return logger.error("Fehler beim Hinzufügen des Feldes per Drag & Drop: "+e,n),!1}}
 * 
 * // Funktion zum Ausfüllen der Feldeigenschaften
 * async function fillFieldProperties(e,t){try{await delay(500);try{const n=await waitForElement("input[name='name']");n.value=e,n.dispatchEvent(new Event("input",{bubbles:!0})),n.dispatchEvent(new Event("change",{bubbles:!0}))}catch(n){logger.log("Kein Namensfeld gefunden, überspringe...")}try{const n=await waitForElement("input[name='string']");n.value=t,n.dispatchEvent(new Event("input",{bubbles:!0})),n.dispatchEvent(new Event("change",{bubbles:!0}))}catch(n){logger.log("Kein Labelfeld gefunden, überspringe...")}return await clickElement(".modal-footer .btn-primary"),logger.success("Feldeigenschaften ausgefüllt: "+e+" ("+t+")"),!0}catch(n){return logger.error("Fehler beim Ausfüllen der Feldeigenschaften: "+e,n),!1}}
 * 
 * // Funktion zum Hinzufügen eines neuen Tabs
 * async function addNewTab(e){try{await clickElement(".o_web_studio_add_tab"),await delay(500);const t=await waitForElement("input[name='string']");return t.value=e,t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0})),await clickElement(".modal-footer .btn-primary"),logger.success("Neuer Tab hinzugefügt: "+e),!0}catch(t){return logger.error("Fehler beim Hinzufügen eines neuen Tabs: "+e,t),!1}}
 * 
 * // Funktion zum Hinzufügen des Chatter-Widgets
 * async function addChatterWidget(){try{return await clickElement(".o_web_studio_add_chatter"),logger.success("Chatter-Widget hinzugefügt"),!0}catch(e){return logger.error("Fehler beim Hinzufügen des Chatter-Widgets",e),!1}}
 * 
 * // Hauptfunktion zum Ausfüllen des Formulars mit den angegebenen Feldern
 * async function fillFormWithRequestedFields(){try{logger.log("Starte das Ausfüllen des Formulars mit den angeforderten Feldern..."),await addNewTab("Allgemeine Informationen"),await delay(1e3),await addFieldByDragDrop("text"),await fillFieldProperties("x_description","Beschreibung"),await delay(1e3),await addFieldByDragDrop("text_long"),await fillFieldProperties("x_long_text","Mehrtext"),await delay(1e3),await addFieldByDragDrop("html"),await fillFieldProperties("x_html_content","HTML"),await delay(1e3),await addFieldByDragDrop("float"),await fillFieldProperties("x_decimal","Dezimal"),await delay(1e3),await addFieldByDragDrop("monetary"),await fillFieldProperties("x_money","Geld"),await delay(1e3),await addFieldByDragDrop("date"),await fillFieldProperties("x_date","Datum"),await delay(1e3),await addFieldByDragDrop("datetime"),await fillFieldProperties("x_datetime","Datum/Uhrzeit"),await delay(1e3),await addFieldByDragDrop("boolean"),await fillFieldProperties("x_checkbox","Steuerkästen"),await delay(1e3),await addFieldByDragDrop("selection"),await fillFieldProperties("x_selection","Auswahl"),await delay(1e3),await addFieldByDragDrop("priority"),await fillFieldProperties("x_priority","Priorität"),await delay(1e3),await addFieldByDragDrop("signature"),await fillFieldProperties("x_signature","Unterschrift"),await delay(1e3),await addFieldByDragDrop("image"),await fillFieldProperties("x_image","Bild"),await delay(1e3),await addFieldByDragDrop("tags"),await fillFieldProperties("x_tags","Stichwörter"),await delay(1e3),await addChatterWidget(),logger.success("Formular erfolgreich mit allen angeforderten Feldern ausgefüllt!")}catch(e){logger.error("Fehler beim Ausfüllen des Formulars",e)}}
 * 
 * // Hauptfunktion ausführen
 * (async function(){logger.log("Odoo Studio Formularfelder-Ausfüller gestartet");try{await waitForElement(".o_web_studio_editor"),logger.log("Odoo Studio Editor gefunden"),await fillFormWithRequestedFields()}catch(e){logger.error("Fehler im Hauptprogramm",e)}})();
 * 
 * `;document.head.appendChild(s);})();
 */

// Vollständige Version des Skripts (nicht minifiziert)
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

// Funktion zum Ziehen eines Elements per Drag & Drop
async function dragAndDrop(sourceSelector, targetSelector) {
    try {
        const sourceElement = await waitForElement(sourceSelector);
        const targetElement = await waitForElement(targetSelector);
        
        // Simuliere Drag & Drop
        const dragStartEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        sourceElement.dispatchEvent(dragStartEvent);
        
        await delay(300);
        
        const dropEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        targetElement.dispatchEvent(dropEvent);
        
        logger.success(`Drag & Drop durchgeführt: ${sourceSelector} -> ${targetSelector}`);
        await delay();
        return true;
    } catch (error) {
        logger.error(`Fehler beim Drag & Drop: ${sourceSelector} -> ${targetSelector}`, error);
        return false;
    }
}

// Funktion zum Hinzufügen eines neuen Feldes durch Drag & Drop
async function addFieldByDragDrop(fieldType, targetSelector = '.o_web_studio_form_view_editor') {
    try {
        // Feldtyp im Seitenmenü finden
        const fieldTypeSelector = `.o_web_studio_field_type[data-type="${fieldType}"]`;
        
        // Drag & Drop durchführen
        await dragAndDrop(fieldTypeSelector, targetSelector);
        
        logger.success(`Feld per Drag & Drop hinzugefügt: ${fieldType}`);
        await delay(1000); // Etwas länger warten nach dem Hinzufügen
        return true;
    } catch (error) {
        logger.error(`Fehler beim Hinzufügen des Feldes per Drag & Drop: ${fieldType}`, error);
        return false;
    }
}

// Funktion zum Ausfüllen der Feldeigenschaften
async function fillFieldProperties(fieldName, fieldLabel) {
    try {
        // Warten auf das Eigenschaftenformular
        await delay(500);
        
        // Feldname ausfüllen, falls vorhanden
        try {
            const nameInput = await waitForElement('input[name="name"]');
            nameInput.value = fieldName;
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            nameInput.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (e) {
            logger.log('Kein Namensfeld gefunden, überspringe...');
        }
        
        // Feldlabel ausfüllen, falls vorhanden
        try {
            const labelInput = await waitForElement('input[name="string"]');
            labelInput.value = fieldLabel;
            labelInput.dispatchEvent(new Event('input', { bubbles: true }));
            labelInput.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (e) {
            logger.log('Kein Labelfeld gefunden, überspringe...');
        }
        
        // Auf "Speichern" oder "Hinzufügen" klicken
        await clickElement('.modal-footer .btn-primary');
        
        logger.success(`Feldeigenschaften ausgefüllt: ${fieldName} (${fieldLabel})`);
        return true;
    } catch (error) {
        logger.error(`Fehler beim Ausfüllen der Feldeigenschaften: ${fieldName}`, error);
        return false;
    }
}

// Funktion zum Hinzufügen eines neuen Tabs
async function addNewTab(tabName) {
    try {
        // Auf "Tab hinzufügen" klicken
        await clickElement('.o_web_studio_add_tab');
        
        // Tab-Namen eingeben
        await delay(500);
        const tabInput = await waitForElement('input[name="string"]');
        tabInput.value = tabName;
        tabInput.dispatchEvent(new Event('input', { bubbles: true }));
        tabInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Auf "Hinzufügen" klicken
        await clickElement('.modal-footer .btn-primary');
        
        logger.success(`Neuer Tab hinzugefügt: ${tabName}`);
        return true;
    } catch (error) {
        logger.error(`Fehler beim Hinzufügen eines neuen Tabs: ${tabName}`, error);
        return false;
    }
}

// Funktion zum Hinzufügen des Chatter-Widgets
async function addChatterWidget() {
    try {
        // Auf "Chatter-Widget hinzufügen" klicken
        await clickElement('.o_web_studio_add_chatter');
        
        logger.success('Chatter-Widget hinzugefügt');
        return true;
    } catch (error) {
        logger.error('Fehler beim Hinzufügen des Chatter-Widgets', error);
        return false;
    }
}

// Hauptfunktion zum Ausfüllen des Formulars mit den angegebenen Feldern
async function fillFormWithRequestedFields() {
    try {
        logger.log('Starte das Ausfüllen des Formulars mit den angeforderten Feldern...');
        
        // Tab "Allgemeine Informationen" hinzufügen
        await addNewTab('Allgemeine Informationen');
        await delay(1000);
        
        // Textfeld "Beschreibung" hinzufügen
        await addFieldByDragDrop('text');
        await fillFieldProperties('x_description', 'Beschreibung');
        await delay(1000);
        
        // Mehrzeilentext hinzufügen
        await addFieldByDragDrop('text_long');
        await fillFieldProperties('x_long_text', 'Mehrtext');
        await delay(1000);
        
        // HTML-Feld hinzufügen
        await addFieldByDragDrop('html');
        await fillFieldProperties('x_html_content', 'HTML');
        await delay(1000);
        
        // Dezimalfeld hinzufügen
        await addFieldByDragDrop('float');
        await fillFieldProperties('x_decimal', 'Dezimal');
        await delay(1000);
        
        // Geldfeld hinzufügen
        await addFieldByDragDrop('monetary');
        await fillFieldProperties('x_money', 'Geld');
        await delay(1000);
        
        // Datumsfeld hinzufügen
        await addFieldByDragDrop('date');
        await fillFieldProperties('x_date', 'Datum');
        await delay(1000);
        
        // Datum/Uhrzeit-Feld hinzufügen
        await addFieldByDragDrop('datetime');
        await fillFieldProperties('x_datetime', 'Datum/Uhrzeit');
        await delay(1000);
        
        // Checkbox hinzufügen
        await addFieldByDragDrop('boolean');
        await fillFieldProperties('x_checkbox', 'Steuerkästen');
        await delay(1000);
        
        // Auswahlfeld hinzufügen
        await addFieldByDragDrop('selection');
        await fillFieldProperties('x_selection', 'Auswahl');
        await delay(1000);
        
        // Prioritätsfeld hinzufügen
        await addFieldByDragDrop('priority');
        await fillFieldProperties('x_priority', 'Priorität');
        await delay(1000);
        
        // Unterschriftsfeld hinzufügen
        await addFieldByDragDrop('signature');
        await fillFieldProperties('x_signature', 'Unterschrift');
        await delay(1000);
        
        // Bildfeld hinzufügen
        await addFieldByDragDrop('image');
        await fillFieldProperties('x_image', 'Bild');
        await delay(1000);
        
        // Stichwörter hinzufügen
        await addFieldByDragDrop('tags');
        await fillFieldProperties('x_tags', 'Stichwörter');
        await delay(1000);
        
        // Chatter-Widget hinzufügen
        await addChatterWidget();
        
        logger.success('Formular erfolgreich mit allen angeforderten Feldern ausgefüllt!');
    } catch (error) {
        logger.error('Fehler beim Ausfüllen des Formulars', error);
    }
}

// Hauptfunktion ausführen
(async function main() {
    logger.log('Odoo Studio Formularfelder-Ausfüller gestartet');
    
    try {
        // Warten, bis die Seite vollständig geladen ist
        await waitForElement('.o_web_studio_editor');
        logger.log('Odoo Studio Editor gefunden');
        
        // Formular mit den angeforderten Feldern ausfüllen
        await fillFormWithRequestedFields();
    } catch (error) {
        logger.error('Fehler im Hauptprogramm', error);
    }
})();
