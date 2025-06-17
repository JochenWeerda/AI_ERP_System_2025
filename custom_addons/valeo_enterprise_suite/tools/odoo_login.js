// Odoo Login Helper Script
// Kopieren Sie diesen Code in die Browser-Konsole (F12 drücken, dann zur Konsole wechseln)
// und führen Sie ihn aus, um sich automatisch anzumelden

(function() {
    // Anmeldedaten
    const username = 'jochen.weerda@gmail.com';
    const password = 'Passwortist2Bad4Dad';
    
    // Warten auf DOM-Elemente
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }
            
            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} nicht gefunden innerhalb von ${timeout}ms`));
            }, timeout);
        });
    }
    
    // Anmeldung durchführen
    async function performLogin() {
        try {
            console.log('Suche Anmeldeformular...');
            
            // Auf Anmeldeformular-Elemente warten
            const emailInput = await waitForElement('input[name="login"]');
            const passwordInput = await waitForElement('input[name="password"]');
            const loginButton = await waitForElement('button[type="submit"]');
            
            console.log('Anmeldeformular gefunden, fülle Felder aus...');
            
            // Felder ausfüllen
            emailInput.value = username;
            passwordInput.value = password;
            
            // Event auslösen, damit Odoo weiß, dass die Felder ausgefüllt wurden
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            console.log('Klicke auf Anmelden...');
            loginButton.click();
            
            console.log('Anmeldung gesendet!');
        } catch (error) {
            console.error('Fehler bei der Anmeldung:', error);
        }
    }
    
    // Führe die Anmeldung aus
    performLogin();
})(); 