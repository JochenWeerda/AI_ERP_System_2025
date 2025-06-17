/**
 * @module module_framework
 * @description Listenansicht-Komponente für das Modulframework mit Owl 2.7.0
 */
odoo.define('module_framework.ModuleListComponent', function (require) {
    'use strict';

    const ModuleComponent = require('module_framework.ModuleComponent');
    const { useState, useSubEnv } = owl;

    /**
     * @class ModuleListComponent
     * @extends ModuleComponent
     * @description Komponente zur Anzeige von Datensätzen in einer Liste
     */
    class ModuleListComponent extends ModuleComponent {
        /**
         * @constructor
         */
        setup() {
            super.setup();
            
            // Erweiterte Zustandsverwaltung für Listen
            this.state = useState({
                ...this.state,
                records: [],
                selectedId: false,
                page: 1,
                limit: this.props.limit || 20,
                total: 0,
                sortBy: this.props.sortBy || 'id',
                sortOrder: this.props.sortOrder || 'desc',
                filters: this.props.filters || {},
            });
            
            // Sub-Environment einrichten
            useSubEnv({
                listComponent: this,
            });
        }
        
        /**
         * @method loadInitialData
         * @override
         * @description Lädt Anfangsdaten für die Listenansicht
         */
        async loadInitialData() {
            await this.loadRecords();
        }
        
        /**
         * @method loadRecords
         * @description Lädt Datensätze basierend auf den aktuellen Filtern und der Sortierung
         */
        async loadRecords() {
            try {
                this.state.loading = true;
                
                // Domain basierend auf Filtern erstellen
                const domain = this.buildDomain();
                
                // Felder zum Lesen
                const fields = this.props.fields || ['id', 'name', 'display_name'];
                
                // Anzahl der Datensätze ermitteln
                this.state.total = await this.orm.searchCount(
                    this.props.model,
                    domain
                );
                
                // Datensätze laden
                const records = await this.orm.searchRead(
                    this.props.model,
                    domain,
                    fields,
                    {
                        limit: this.state.limit,
                        offset: (this.state.page - 1) * this.state.limit,
                        order: `${this.state.sortBy} ${this.state.sortOrder}`,
                    }
                );
                
                this.state.records = records;
                this.state.loading = false;
            } catch (error) {
                this.state.error = error.message || 'Fehler beim Laden der Datensätze';
                this.state.loading = false;
                this.notification.add(this.state.error, { type: 'danger' });
            }
        }
        
        /**
         * @method buildDomain
         * @returns {Array} Domain-Array für ORM-Abfragen
         * @description Erstellt ein Domain-Array basierend auf den Filtern
         */
        buildDomain() {
            const domain = this.props.domain || [];
            
            // Filter hinzufügen
            Object.entries(this.state.filters).forEach(([field, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    domain.push([field, '=', value]);
                }
            });
            
            return domain;
        }
        
        /**
         * @method selectRecord
         * @param {Number} recordId - ID des auszuwählenden Datensatzes
         * @description Wählt einen Datensatz aus
         */
        selectRecord(recordId) {
            this.state.selectedId = recordId;
            this.trigger('record-selected', { recordId });
        }
        
        /**
         * @method nextPage
         * @description Wechselt zur nächsten Seite
         */
        nextPage() {
            const maxPage = Math.ceil(this.state.total / this.state.limit);
            if (this.state.page < maxPage) {
                this.state.page++;
                this.loadRecords();
            }
        }
        
        /**
         * @method prevPage
         * @description Wechselt zur vorherigen Seite
         */
        prevPage() {
            if (this.state.page > 1) {
                this.state.page--;
                this.loadRecords();
            }
        }
        
        /**
         * @method sort
         * @param {String} field - Feld, nach dem sortiert werden soll
         * @description Ändert die Sortierung
         */
        sort(field) {
            if (this.state.sortBy === field) {
                // Umkehren der Sortierreihenfolge
                this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                this.state.sortBy = field;
                this.state.sortOrder = 'asc';
            }
            this.loadRecords();
        }
        
        /**
         * @method setFilter
         * @param {String} field - Feld, nach dem gefiltert werden soll
         * @param {*} value - Filterwert
         * @description Setzt einen Filter und lädt die Datensätze neu
         */
        setFilter(field, value) {
            this.state.filters[field] = value;
            this.state.page = 1; // Zurück zur ersten Seite
            this.loadRecords();
        }
        
        /**
         * @method clearFilters
         * @description Löscht alle Filter und lädt die Datensätze neu
         */
        clearFilters() {
            this.state.filters = {};
            this.state.page = 1;
            this.loadRecords();
        }
        
        /**
         * @method refresh
         * @description Aktualisiert die Liste
         */
        refresh() {
            this.loadRecords();
        }
    }

    // Template wird in XML-Datei definiert
    ModuleListComponent.template = 'module_framework.ModuleListComponent';

    return ModuleListComponent;
}); 