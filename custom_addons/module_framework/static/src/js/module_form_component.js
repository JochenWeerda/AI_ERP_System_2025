/**
 * @module module_framework
 * @description Formularansicht-Komponente für das Modulframework mit Owl 2.7.0
 */
odoo.define('module_framework.ModuleFormComponent', function (require) {
    'use strict';

    const ModuleComponent = require('module_framework.ModuleComponent');
    const { useState, useRef, onMounted } = owl;

    /**
     * @class ModuleFormComponent
     * @extends ModuleComponent
     * @description Komponente zur Anzeige und Bearbeitung von Datensätzen in einer Formularansicht
     */
    class ModuleFormComponent extends ModuleComponent {
        /**
         * @constructor
         */
        setup() {
            super.setup();
            
            // Erweiterte Zustandsverwaltung für Formulare
            this.state = useState({
                ...this.state,
                record: null,
                mode: this.props.mode || 'readonly', // 'readonly' oder 'edit'
                dirtyFields: {},
                isValid: true,
                validationErrors: {},
                saveInProgress: false,
            });
            
            // Refs für Formularfelder
            this.formRef = useRef('form');
            this.fieldsRefs = {};
        }
        
        /**
         * @method loadInitialData
         * @override
         * @description Lädt den Datensatz für die Formularansicht
         */
        async loadInitialData() {
            if (this.props.recordId) {
                await this.loadRecord(this.props.recordId);
            } else if (this.props.mode === 'edit' || this.props.mode === 'create') {
                // Neuen Datensatz initialisieren
                this.initNewRecord();
            }
        }
        
        /**
         * @method loadRecord
         * @param {Number} recordId - ID des zu ladenden Datensatzes
         * @description Lädt einen Datensatz
         */
        async loadRecord(recordId) {
            try {
                this.state.loading = true;
                
                // Zu lesende Felder
                const fields = this.props.fields || [];
                
                // Datensatz laden
                const [record] = await this.orm.read(
                    this.props.model,
                    [recordId],
                    fields
                );
                
                this.state.record = record;
                this.resetDirtyState();
                this.state.loading = false;
            } catch (error) {
                this.state.error = error.message || 'Fehler beim Laden des Datensatzes';
                this.state.loading = false;
                this.notification.add(this.state.error, { type: 'danger' });
            }
        }
        
        /**
         * @method initNewRecord
         * @description Initialisiert einen neuen leeren Datensatz
         */
        initNewRecord() {
            const defaultValues = this.props.defaultValues || {};
            
            // Standard-Werte für alle Felder setzen
            const record = {
                id: false,
                ...defaultValues,
            };
            
            this.state.record = record;
            this.resetDirtyState();
        }
        
        /**
         * @method resetDirtyState
         * @description Setzt den Status für geänderte Felder zurück
         */
        resetDirtyState() {
            this.state.dirtyFields = {};
            this.state.isValid = true;
            this.state.validationErrors = {};
        }
        
        /**
         * @method setFieldValue
         * @param {String} fieldName - Name des Feldes
         * @param {*} value - Neuer Wert des Feldes
         * @description Aktualisiert den Wert eines Feldes
         */
        setFieldValue(fieldName, value) {
            if (!this.state.record) return;
            
            // Wert aktualisieren
            this.state.record[fieldName] = value;
            
            // Feld als geändert markieren
            this.state.dirtyFields[fieldName] = true;
            
            // Validierung durchführen
            this.validateField(fieldName, value);
        }
        
        /**
         * @method validateField
         * @param {String} fieldName - Name des zu validierenden Feldes
         * @param {*} value - Zu validierender Wert
         * @description Validiert ein Feld
         */
        validateField(fieldName, value) {
            const validationRules = this.props.validationRules || {};
            const fieldRules = validationRules[fieldName] || [];
            
            // Validierungsregel anwenden
            let isValid = true;
            let errorMessage = '';
            
            for (const rule of fieldRules) {
                if (typeof rule === 'function') {
                    const result = rule(value, this.state.record);
                    if (result !== true) {
                        isValid = false;
                        errorMessage = result;
                        break;
                    }
                }
            }
            
            // Validierungsstatus aktualisieren
            if (isValid) {
                delete this.state.validationErrors[fieldName];
            } else {
                this.state.validationErrors[fieldName] = errorMessage;
            }
            
            // Gesamtstatus aktualisieren
            this.state.isValid = Object.keys(this.state.validationErrors).length === 0;
        }
        
        /**
         * @method validateForm
         * @returns {Boolean} Gibt an, ob das Formular gültig ist
         * @description Validiert das gesamte Formular
         */
        validateForm() {
            if (!this.state.record) return false;
            
            const validationRules = this.props.validationRules || {};
            
            // Alle Felder validieren
            for (const fieldName in validationRules) {
                this.validateField(fieldName, this.state.record[fieldName]);
            }
            
            return this.state.isValid;
        }
        
        /**
         * @method saveRecord
         * @description Speichert den aktuellen Datensatz
         */
        async saveRecord() {
            try {
                if (!this.validateForm()) {
                    this.notification.add('Bitte korrigieren Sie die Eingabefehler', { type: 'warning' });
                    return;
                }
                
                this.state.saveInProgress = true;
                
                // Nur geänderte Felder senden
                const values = {};
                for (const field in this.state.dirtyFields) {
                    if (this.state.dirtyFields[field]) {
                        values[field] = this.state.record[field];
                    }
                }
                
                let result;
                
                if (this.state.record.id) {
                    // Bestehenden Datensatz aktualisieren
                    result = await this.orm.write(
                        this.props.model,
                        [this.state.record.id],
                        values
                    );
                    
                    // Datensatz neu laden
                    await this.loadRecord(this.state.record.id);
                    
                    this.notification.add('Datensatz gespeichert', { type: 'success' });
                } else {
                    // Neuen Datensatz erstellen
                    const newId = await this.orm.create(
                        this.props.model,
                        [values]
                    );
                    
                    // Neuen Datensatz laden
                    await this.loadRecord(newId);
                    
                    this.notification.add('Datensatz erstellt', { type: 'success' });
                    
                    // Event auslösen
                    this.trigger('record-created', { recordId: newId });
                }
                
                // In Nur-Lese-Modus wechseln
                this.setMode('readonly');
                
                this.state.saveInProgress = false;
                return true;
            } catch (error) {
                this.state.error = error.message || 'Fehler beim Speichern des Datensatzes';
                this.notification.add(this.state.error, { type: 'danger' });
                this.state.saveInProgress = false;
                return false;
            }
        }
        
        /**
         * @method discardChanges
         * @description Verwirft Änderungen und lädt den Datensatz neu
         */
        async discardChanges() {
            if (this.state.record && this.state.record.id) {
                await this.loadRecord(this.state.record.id);
            } else {
                this.initNewRecord();
            }
            
            this.setMode('readonly');
        }
        
        /**
         * @method setMode
         * @param {String} mode - Anzeigemodus ('readonly' oder 'edit')
         * @description Setzt den Anzeigemodus
         */
        setMode(mode) {
            if (mode === 'edit' || mode === 'readonly') {
                this.state.mode = mode;
            }
        }
        
        /**
         * @method deleteRecord
         * @description Löscht den aktuellen Datensatz
         */
        async deleteRecord() {
            if (!this.state.record || !this.state.record.id) return;
            
            try {
                this.state.loading = true;
                
                await this.orm.unlink(
                    this.props.model,
                    [this.state.record.id]
                );
                
                this.notification.add('Datensatz gelöscht', { type: 'success' });
                this.trigger('record-deleted', { recordId: this.state.record.id });
                
                // Formular zurücksetzen
                this.state.record = null;
                this.resetDirtyState();
                
                this.state.loading = false;
                
                // Bei Bedarf einen neuen Datensatz initialisieren
                if (this.props.createNewAfterDelete) {
                    this.initNewRecord();
                    this.setMode('edit');
                }
            } catch (error) {
                this.state.error = error.message || 'Fehler beim Löschen des Datensatzes';
                this.notification.add(this.state.error, { type: 'danger' });
                this.state.loading = false;
            }
        }
    }

    // Template wird in XML-Datei definiert
    ModuleFormComponent.template = 'module_framework.ModuleFormComponent';

    return ModuleFormComponent;
}); 