import React from 'react';

/**
 * SettingsPage-Komponente - Ermöglicht das Anpassen der Systemeinstellungen
 */
const SettingsPage = () => {
  return (
    <div className="settings-page">
      <h1>Systemeinstellungen</h1>
      <p>Hier können Sie die Einstellungen des Systems anpassen.</p>
      
      <div className="settings-sections">
        <div className="settings-section">
          <h2>Allgemeine Einstellungen</h2>
          <p>Sprache, Zeitzone, Format</p>
        </div>
        
        <div className="settings-section">
          <h2>Benutzereinstellungen</h2>
          <p>Kontoeinstellungen, Benachrichtigungen</p>
        </div>
        
        <div className="settings-section">
          <h2>Sicherheit</h2>
          <p>Passwort, Zwei-Faktor-Authentifizierung</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 