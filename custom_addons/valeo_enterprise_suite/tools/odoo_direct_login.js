// Einfaches Odoo Login-Skript
// Dieses Skript kann direkt in die URL-Leiste eingefügt werden (mit "javascript:" davor)

javascript:(function(){
    // Anmeldedaten
    const username = 'jochen.weerda@gmail.com';
    const password = 'Passwortist2Bad4Dad';
    
    // URL zum Odoo Studio App Creator
    const studioUrl = '/odoo/action-182/studio?mode=app_creator';
    
    // Funktion zum Ausfüllen und Absenden des Formulars
    function fillAndSubmitForm() {
        // Formularelemente finden
        const emailInput = document.querySelector('input[name="login"]');
        const passwordInput = document.querySelector('input[name="password"]');
        const loginButton = document.querySelector('button[type="submit"]');
        
        // Prüfen, ob alle Elemente gefunden wurden
        if (!emailInput || !passwordInput || !loginButton) {
            alert('Anmeldeformular nicht gefunden. Bitte stellen Sie sicher, dass Sie auf der Anmeldeseite sind.');
            return;
        }
        
        // Felder ausfüllen
        emailInput.value = username;
        passwordInput.value = password;
        
        // Event auslösen, damit Odoo weiß, dass die Felder ausgefüllt wurden
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Formular absenden
        loginButton.click();
        
        // Nach erfolgreicher Anmeldung zum Studio navigieren
        setTimeout(() => {
            if (document.querySelector('.o_user_menu') || document.querySelector('.o_main_navbar')) {
                window.location.href = studioUrl;
            }
        }, 3000);
    }
    
    // Prüfen, ob wir bereits angemeldet sind
    if (document.querySelector('.o_user_menu') || document.querySelector('.o_main_navbar')) {
        window.location.href = studioUrl;
    } else {
        fillAndSubmitForm();
    }
})(); 