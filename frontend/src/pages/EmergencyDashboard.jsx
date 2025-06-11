import React from 'react';

/**
 * EmergencyDashboard-Komponente - Zeigt wichtige Notfallinformationen und Kontakte an
 */
const EmergencyDashboard = () => {
  return (
    <div className="emergency-dashboard">
      <h1>Notfallplan</h1>
      <p>Diese Seite enthält wichtige Informationen und Kontakte für Notfälle.</p>
      
      <div className="emergency-contacts">
        <h2>Notfallkontakte</h2>
        <p>IT-Support: +49 123 456789</p>
        <p>Systemadministrator: admin@beispiel.de</p>
      </div>
    </div>
  );
};

export default EmergencyDashboard; 