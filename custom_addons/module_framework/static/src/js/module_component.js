/**
 * @module module_framework
 * @description Basis-Komponenten für das Modulframework mit Owl 2.7.0
 */
odoo.define('module_framework.ModuleComponent', function (require) {
    'use strict';

    const { Component, useState, useRef, onWillStart, onMounted } = owl;
    
    /**
     * @class ModuleComponent
     * @extends Component
     * @description Basis-Komponente für alle Modulframework-Komponenten
     */
    class ModuleComponent extends Component {
        /**
         * @constructor
         */
        setup() {
            // Services einrichten
            this.orm = this.env.services.orm;
            this.notification = this.env.services.notification;
            this.rpc = this.env.services.rpc;
            
            // Reaktiver Zustand
            this.state = useState({
                loading: false,
                data: null,
                error: null
            });
            
            // Refs
            this.rootRef = useRef('root');
            
            // Lifecycle Hooks
            onWillStart(async () => {
                await this.loadInitialData();
            });
            
            onMounted(() => {
                this.initializeComponent();
            });
        }
        
        /**
         * @method loadInitialData
         * @description Lädt Anfangsdaten für die Komponente
         */
        async loadInitialData() {
            try {
                this.state.loading = true;
                // Implementierung in abgeleiteten Klassen
                this.state.loading = false;
            } catch (error) {
                this.state.error = error.message || 'Fehler beim Laden der Daten';
                this.state.loading = false;
                this.notification.add(this.state.error, { type: 'danger' });
            }
        }
        
        /**
         * @method initializeComponent
         * @description Initialisiert die Komponente nach dem Mounting
         */
        initializeComponent() {
            // Implementierung in abgeleiteten Klassen
        }
        
        /**
         * @method callAction
         * @param {String} method - Die Methode, die aufgerufen werden soll
         * @param {Object} params - Parameter für die Methode
         * @description Führt eine Server-Aktion aus
         */
        async callAction(method, params = {}) {
            try {
                this.state.loading = true;
                const result = await this.rpc({
                    model: this.props.model,
                    method: method,
                    args: [[this.props.recordId]],
                    kwargs: params,
                });
                this.state.loading = false;
                return result;
            } catch (error) {
                this.state.error = error.message || 'Fehler bei der Ausführung';
                this.state.loading = false;
                this.notification.add(this.state.error, { type: 'danger' });
                return null;
            }
        }
        
        /**
         * @method showNotification
         * @param {String} message - Die anzuzeigende Nachricht
         * @param {String} type - Typ der Benachrichtigung (success, warning, danger, info)
         * @description Zeigt eine Benachrichtigung an
         */
        showNotification(message, type = 'info') {
            this.notification.add(message, { type });
        }
    }

    // Template wird in XML-Datei definiert
    ModuleComponent.template = 'module_framework.ModuleComponent';

    return ModuleComponent;
}); 