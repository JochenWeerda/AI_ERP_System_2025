/**
 * Odoo Studio Bookmarklet
 * 
 * Dieses Skript kann als Bookmarklet verwendet werden, um die Odoo Studio
 * Automatisierungsskripte direkt in der Odoo Studio-Oberfläche auszuführen.
 * 
 * Bookmarklet-Version:
 * javascript:(function(){var s=document.createElement('script');s.src='https://'+window.location.hostname+'/custom_addons/valeo_enterprise_suite/tools/odoo_studio_bookmarklet.js';document.body.appendChild(s);})();
 */

(function() {
    // Konfiguration
    const CONFIG = {
        debugMode: true,
        scriptPaths: {
            explorer: '/custom_addons/valeo_enterprise_suite/tools/odoo_studio_explorer.js',
            dashboard: '/custom_addons/valeo_enterprise_suite/tools/create_dashboard_module.js',
            allModules: '/custom_addons/valeo_enterprise_suite/tools/create_odoo_modules.js',
            analyzer: '/custom_addons/valeo_enterprise_suite/tools/analyze_odoo_studio.js',
            prototypes: '/custom_addons/valeo_enterprise_suite/tools/create_module_prototypes_in_studio.js'
        }
    };
    
    // Logger-Funktion
    const logger = {
        log: function(message) {
            if (CONFIG.debugMode) {
                console.log(`[Odoo Studio Bookmarklet] ${message}`);
            }
        },
        error: function(message, error) {
            console.error(`[Odoo Studio Bookmarklet] FEHLER: ${message}`, error);
        },
        success: function(message) {
            console.log(`[Odoo Studio Bookmarklet] ✓ ${message}`);
        }
    };
    
    /**
     * Lädt ein Skript dynamisch
     * @param {string} scriptPath - Pfad zum Skript
     * @returns {Promise<void>}
     */
    function loadScript(scriptPath) {
        return new Promise((resolve, reject) => {
            const fullPath = 'https://' + window.location.hostname + scriptPath;
            logger.log(`Lade Skript: ${fullPath}`);
            
            fetch(fullPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(code => {
                    logger.success(`Skript geladen: ${scriptPath}`);
                    eval(code);
                    resolve();
                })
                .catch(error => {
                    logger.error(`Fehler beim Laden des Skripts: ${scriptPath}`, error);
                    reject(error);
                });
        });
    }
    
    /**
     * Erstellt die UI für das Bookmarklet
     */
    function createUI() {
        logger.log('Erstelle UI für das Bookmarklet');
        
        // Prüfen, ob die UI bereits existiert
        if (document.getElementById('odoo-studio-bookmarklet')) {
            logger.log('UI existiert bereits');
            return;
        }
        
        // Container erstellen
        const container = document.createElement('div');
        container.id = 'odoo-studio-bookmarklet';
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.backgroundColor = '#ffffff';
        container.style.border = '1px solid #cccccc';
        container.style.borderRadius = '5px';
        container.style.padding = '10px';
        container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        container.style.zIndex = '9999';
        container.style.maxWidth = '300px';
        
        // Header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '10px';
        
        const title = document.createElement('h3');
        title.textContent = 'Odoo Studio Tools';
        title.style.margin = '0';
        title.style.fontSize = '16px';
        
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => {
            document.body.removeChild(container);
        };
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Buttons
        const buttons = [
            { id: 'explorer', text: 'Odoo Studio Explorer', script: CONFIG.scriptPaths.explorer },
            { id: 'analyzer', text: 'Odoo Studio Analyzer', script: CONFIG.scriptPaths.analyzer },
            { id: 'dashboard', text: 'Dashboard-Modul erstellen', script: CONFIG.scriptPaths.dashboard },
            { id: 'allModules', text: 'Alle Module erstellen', script: CONFIG.scriptPaths.allModules },
            { id: 'prototypes', text: 'Modul-Prototypen erstellen', script: CONFIG.scriptPaths.prototypes }
        ];
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'column';
        buttonContainer.style.gap = '5px';
        
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.id = `odoo-studio-${button.id}`;
            btn.textContent = button.text;
            btn.style.padding = '8px 12px';
            btn.style.backgroundColor = '#0d6efd';
            btn.style.color = '#ffffff';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '14px';
            
            btn.onmouseover = () => {
                btn.style.backgroundColor = '#0b5ed7';
            };
            
            btn.onmouseout = () => {
                btn.style.backgroundColor = '#0d6efd';
            };
            
            btn.onclick = () => {
                loadScript(button.script)
                    .then(() => {
                        logger.success(`Skript ${button.text} erfolgreich ausgeführt`);
                    })
                    .catch(error => {
                        logger.error(`Fehler beim Ausführen des Skripts ${button.text}`, error);
                    });
            };
            
            buttonContainer.appendChild(btn);
        });
        
        // Status-Anzeige
        const statusContainer = document.createElement('div');
        statusContainer.id = 'odoo-studio-status';
        statusContainer.style.marginTop = '10px';
        statusContainer.style.fontSize = '12px';
        statusContainer.style.color = '#666666';
        statusContainer.textContent = 'Bereit';
        
        // Alles zusammenfügen
        container.appendChild(header);
        container.appendChild(buttonContainer);
        container.appendChild(statusContainer);
        
        // Container zur Seite hinzufügen
        document.body.appendChild(container);
        
        logger.success('UI erfolgreich erstellt');
    }
    
    /**
     * Prüft, ob wir uns auf einer Odoo Studio-Seite befinden
     * @returns {boolean}
     */
    function isOdooStudioPage() {
        const url = window.location.href;
        return url.includes('studio') || url.includes('odoo');
    }
    
    /**
     * Hauptfunktion zum Starten des Bookmarklets
     */
    function init() {
        logger.log('Starte Odoo Studio Bookmarklet');
        
        if (!isOdooStudioPage()) {
            logger.error('Diese Seite scheint keine Odoo Studio-Seite zu sein');
            if (confirm('Diese Seite scheint keine Odoo Studio-Seite zu sein. Trotzdem fortfahren?')) {
                createUI();
            }
        } else {
            createUI();
        }
    }
    
    // Skript starten
    init();
})();
