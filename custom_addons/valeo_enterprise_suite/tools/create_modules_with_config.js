// Odoo Studio App Creator - Konfigurierbarer Modul-Generator
// Dieses Skript erstellt automatisch Module im Odoo Studio App Creator basierend auf einer Konfiguration
// Kopieren Sie diesen Code in die Browser-Konsole (F12 drücken, dann zur Konsole wechseln)

(function() {
    console.log('Starte konfigurierbaren Modul-Generator...');

    // Konfiguration für die zu erstellenden Module
    const moduleConfigs = [
        {
            name: 'Dashboard',
            menuName: 'Dashboard',
            description: 'Zentrales Dashboard für die Überwachung und Analyse von Geschäftsprozessen',
            fields: [
                { name: 'name', label: 'Name', type: 'char' },
                { name: 'date_range', label: 'Datumsbereich', type: 'selection' },
                { name: 'chart_type', label: 'Diagrammtyp', type: 'selection' },
                { name: 'data_source', label: 'Datenquelle', type: 'many2one' },
                { name: 'is_favorite', label: 'Favorit', type: 'boolean' }
            ]
        },
        {
            name: 'Dokumentenmanagement',
            menuName: 'Dokumente',
            description: 'Verwaltung und Organisation von Dokumenten und Dateien',
            fields: [
                { name: 'name', label: 'Name', type: 'char' },
                { name: 'file_type', label: 'Dateityp', type: 'selection' },
                { name: 'upload_date', label: 'Hochladedatum', type: 'datetime' },
                { name: 'owner_id', label: 'Besitzer', type: 'many2one' },
                { name: 'tags', label: 'Tags', type: 'many2many' },
                { name: 'is_archived', label: 'Archiviert', type: 'boolean' }
            ]
        },
        {
            name: 'E-Signatur',
            menuName: 'Signaturen',
            description: 'Elektronische Signaturen für Dokumente und Verträge',
            fields: [
                { name: 'name', label: 'Name', type: 'char' },
                { name: 'document_id', label: 'Dokument', type: 'many2one' },
                { name: 'signer_id', label: 'Unterzeichner', type: 'many2one' },
                { name: 'signature_date', label: 'Datum der Unterschrift', type: 'datetime' },
                { name: 'status', label: 'Status', type: 'selection' },
                { name: 'signature_image', label: 'Unterschriftsbild', type: 'binary' }
            ]
        },
        {
            name: 'Analytik',
            menuName: 'Analysen',
            description: 'Geschäftsanalysen und Berichte für datengestützte Entscheidungen',
            fields: [
                { name: 'name', label: 'Name', type: 'char' },
                { name: 'analysis_type', label: 'Analysetyp', type: 'selection' },
                { name: 'date_range', label: 'Datumsbereich', type: 'selection' },
                { name: 'data_source', label: 'Datenquelle', type: 'many2one' },
                { name: 'metrics', label: 'Metriken', type: 'many2many' },
                { name: 'is_scheduled', label: 'Geplant', type: 'boolean' },
                { name: 'schedule_frequency', label: 'Planungshäufigkeit', type: 'selection' }
            ]
        }
    ];

    // Funktion zum Warten auf ein Element
    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            // Prüfen, ob das Element bereits existiert
            const element = document.querySelector(selector);
            if (element) {
                return resolve(element);
            }
            
            // Beobachter für DOM-Änderungen einrichten
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            
            // Beobachter starten
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Timeout setzen
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} nicht gefunden innerhalb von ${timeout}ms`));
            }, timeout);
        });
    }

    // Funktion zum Klicken auf ein Element
    async function clickElement(selector, timeout = 10000) {
        try {
            const element = await waitForElement(selector, timeout);
            element.click();
            console.log(`Element ${selector} geklickt`);
            return true;
        } catch (error) {
            console.error(`Fehler beim Klicken auf ${selector}:`, error);
            return false;
        }
    }

    // Funktion zum Ausfüllen eines Textfelds
    async function fillTextField(selector, text, timeout = 10000) {
        try {
            const element = await waitForElement(selector, timeout);
            element.value = text;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            console.log(`Text "${text}" in ${selector} eingegeben`);
            return true;
        } catch (error) {
            console.error(`Fehler beim Ausfüllen von ${selector}:`, error);
            return false;
        }
    }

    // Funktion zum Auswählen eines Werts in einem Dropdown
    async function selectOption(selector, value, timeout = 10000) {
        try {
            const element = await waitForElement(selector, timeout);
            element.value = value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`Option "${value}" in ${selector} ausgewählt`);
            return true;
        } catch (error) {
            console.error(`Fehler beim Auswählen von ${value} in ${selector}:`, error);
            return false;
        }
    }

    // Funktion zum Erstellen eines Moduls
    async function createModule(config) {
        try {
            console.log(`Erstelle Modul: ${config.name}`);
            
            // Auf "Neue App" Button klicken
            await clickElement('.o_web_studio_new_app');
            
            // Warten auf den Dialog
            await waitForElement('.o_web_studio_add_app_dialog');
            
            // Modulname eingeben
            await fillTextField('.o_web_studio_add_app_dialog input[name="name"]', config.name);
            
            // Menüname eingeben
            await fillTextField('.o_web_studio_add_app_dialog input[name="menu_name"]', config.menuName);
            
            // Beschreibung eingeben
            if (config.description) {
                await fillTextField('.o_web_studio_add_app_dialog textarea[name="description"]', config.description);
            }
            
            // Auf "Bestätigen" Button klicken
            await clickElement('.o_web_studio_add_app_dialog .btn-primary');
            
            console.log(`Modul ${config.name} erfolgreich erstellt`);
            
            // Warten, bis das Modul geladen ist
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Felder hinzufügen
            if (config.fields && config.fields.length > 0) {
                await addFields(config.fields);
            }
            
            return true;
        } catch (error) {
            console.error(`Fehler beim Erstellen des Moduls ${config.name}:`, error);
            return false;
        }
    }

    // Funktion zum Hinzufügen von Feldern zu einem Modell
    async function addFields(fields) {
        try {
            console.log('Füge Felder hinzu...');
            
            for (const field of fields) {
                // Auf "Feld hinzufügen" Button klicken
                await clickElement('.o_web_studio_sidebar_add_field');
                
                // Warten auf den Dialog
                await waitForElement('.o_web_studio_field_modal');
                
                // Feldname eingeben
                await fillTextField('.o_web_studio_field_modal input[name="name"]', field.name);
                
                // Feldlabel eingeben
                await fillTextField('.o_web_studio_field_modal input[name="string"]', field.label);
                
                // Feldtyp auswählen
                await selectOption('.o_web_studio_field_modal select[name="type"]', field.type);
                
                // Auf "Bestätigen" Button klicken
                await clickElement('.o_web_studio_field_modal .btn-primary');
                
                console.log(`Feld ${field.name} vom Typ ${field.type} hinzugefügt`);
                
                // Warten, bis das Feld hinzugefügt wurde
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            
            console.log('Alle Felder wurden erfolgreich hinzugefügt!');
            return true;
        } catch (error) {
            console.error('Fehler beim Hinzufügen von Feldern:', error);
            return false;
        }
    }

    // Funktion zum Zurückkehren zur App-Creator-Ansicht
    async function returnToAppCreator() {
        try {
            console.log('Kehre zur App-Creator-Ansicht zurück...');
            
            // Auf den Zurück-Button in der Breadcrumb-Navigation klicken
            await clickElement('.o_web_studio_breadcrumb .o_back_button');
            
            // Warten, bis die App-Creator-Ansicht geladen ist
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log('Erfolgreich zur App-Creator-Ansicht zurückgekehrt');
            return true;
        } catch (error) {
            console.error('Fehler beim Zurückkehren zur App-Creator-Ansicht:', error);
            return false;
        }
    }

    // Hauptfunktion zum Erstellen aller Module
    async function createAllModules() {
        try {
            console.log('Starte Erstellung aller Module...');
            
            for (let i = 0; i < moduleConfigs.length; i++) {
                const config = moduleConfigs[i];
                
                // Modul erstellen
                await createModule(config);
                console.log(`Modul ${i + 1}/${moduleConfigs.length} (${config.name}) erstellt`);
                
                // Zurück zur App-Creator-Ansicht, außer beim letzten Modul
                if (i < moduleConfigs.length - 1) {
                    await returnToAppCreator();
                }
            }
            
            console.log('Alle Module wurden erfolgreich erstellt!');
        } catch (error) {
            console.error('Fehler bei der Erstellung der Module:', error);
        }
    }

    // Starte die Erstellung aller Module
    createAllModules();
})(); 