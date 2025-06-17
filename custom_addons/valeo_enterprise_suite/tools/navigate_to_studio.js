// Odoo Studio Navigation Helper
// Nach erfolgreicher Anmeldung dieses Skript in der Browser-Konsole ausführen,
// um zum Odoo Studio App Creator zu navigieren

(function() {
    // URL zum Odoo Studio App Creator
    const studioUrl = '/odoo/action-182/studio?mode=app_creator';
    
    function navigateToStudio() {
        console.log('Navigiere zum Odoo Studio App Creator...');
        
        // Prüfen, ob wir bereits angemeldet sind
        if (document.querySelector('.o_user_menu') || document.querySelector('.o_main_navbar')) {
            console.log('Benutzer ist angemeldet, navigiere zu Studio...');
            window.location.href = studioUrl;
        } else {
            console.error('Benutzer scheint nicht angemeldet zu sein. Bitte zuerst anmelden.');
        }
    }
    
    // Kurze Verzögerung, um sicherzustellen, dass die Seite vollständig geladen ist
    setTimeout(navigateToStudio, 1000);
})(); 