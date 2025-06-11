import React from 'react';

/**
 * FinanzbuchhaltungExportPage-Komponente - Ermöglicht den Export von Finanzdaten
 */
const FinanzbuchhaltungExportPage = () => {
  return (
    <div className="fibu-export-page">
      <h1>Finanzbuchhaltung - Export</h1>
      <p>Hier können Sie Finanzdaten in verschiedenen Formaten exportieren.</p>
      
      <div className="export-options">
        <h2>Exportformate</h2>
        <ul>
          <li>DATEV-Format</li>
          <li>Excel (XLSX)</li>
          <li>CSV</li>
          <li>PDF</li>
        </ul>
      </div>
    </div>
  );
};

export default FinanzbuchhaltungExportPage; 